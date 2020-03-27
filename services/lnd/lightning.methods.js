import { decodePayReq as bolt11DecodePayReq, getTag } from '../../utils/crypto';
import { grpcLog } from '../../utils/log';
import { logGrpcCmd } from './helpers';
import promisifiedCall from '../../utils/promisifiedCall';

// ------------------------------------
// Wrappers / Overrides
// ------------------------------------

/**
 * getInfo - Call lnd grpc getInfo method.
 *
 * @param {object} payload Payload
 * @param {object} options Grpc call options
 * @returns {Promise} GetInfoResponse
 */
async function getInfo(payload = {}, options = {}) {
  logGrpcCmd('Lightning.getInfo', payload);
  const infoData = await promisifiedCall(
    this.service,
    this.service.getInfo,
    payload,
    options
  );

  // Add grpc proto version into info so that it can be used by the client.
  infoData.grpcProtoVersion = this.version;

  // In older versions `chain` was a simple string and there was a separate boolean to indicate the network.
  // Convert it to the current format for consistency.
  if (typeof infoData.chains[0] === 'string') {
    const chain = infoData.chains[0];
    const network = infoData.testnet ? 'testnet' : 'mainnet';
    delete infoData.testnet;
    infoData.chains = [{ chain, network }];
  }

  return infoData;
}

/**
 * hasMethod - Checks whether specified method is present in gRPC interface.
 *
 * @param {string} method Name of method to check for
 * @returns {boolean} True if specified method exists withing service
 */
function hasMethod(method) {
  return Boolean(this.service[method]);
}

/**
 * estimateFee - Estimates on-chain fee.
 *
 * @param {string} address Address
 * @param {number} amount Amount in satoshis
 * @param {number} targetConf Desired confirmation time
 * @returns {Promise} EstimateFeeResponse
 */
async function estimateFee(address, amount, targetConf) {
  const payload = {
    AddrToAmount: { [address]: amount },
    target_conf: targetConf
  };
  logGrpcCmd('Lightning.estimateFee', payload);
  return promisifiedCall(this.service, this.service.estimateFee, payload);
}

// ------------------------------------
// Helpers
// ------------------------------------

/**
 * getBalanceInformation - Call lnd grpc walletBalance and channelBalance method and combine result.
 *
 * @returns {Promise} Data about all balances
 */

/**
 * createInvoice - Call lnd grpc createInvoice method.
 *
 * @param {object} payload Payload
 * @returns {Promise} Invoice decorated with additional info
 */
async function createInvoice(payload = {}) {
  const invoice = await this.addInvoice(payload);
  const decodedInvoice = await this.decodePayReq({
    pay_req: invoice.payment_request
  });
  return {
    ...decodedInvoice,
    memo: payload.memo,
    value: payload.value,
    private: payload.private,
    r_hash: Buffer.from(invoice.r_hash, 'hex').toString('hex'),
    payment_request: invoice.payment_request,
    creation_date: Date.now() / 1000
  };
}

/**
 * ensurePeerConnected - Call lnd grpc connectPeer method if not already connected to the peer.
 *
 * @param {object} payload Payload
 * @returns {Promise} ConnectPeerResponse
 */
async function ensurePeerConnected(payload = {}) {
  const { peers } = await this.listPeers();
  const peer = peers.find(
    candidatePeer => candidatePeer.pub_key === payload.pubkey
  );
  if (peer) {
    return peer;
  }
  return this.connectPeer({ addr: payload });
}

/**
 * connectAndOpen - Connect to peer and open a channel.
 *
 * @param {object} payload Payload
 * @returns {Promise} OpenStatusUpdate
 */
async function connectAndOpen(payload = {}) {
  const {
    pubkey,
    host,
    localSatoshis,
    remoteSatoshis,
    targetConfirmations,
    isPrivate,
    spendUnconfirmed
  } = payload;
  const capacity = localSatoshis + remoteSatoshis;
  const req = {
    node_pubkey: Buffer.from(pubkey, 'hex'),
    local_funding_amount: capacity,
    push_sat: remoteSatoshis,
    target_conf: targetConfirmations,
    isPrivate,
    spend_unconfirmed: spendUnconfirmed
  };
  try {
    await this.ensurePeerConnected({ pubkey, host });
  } catch (e) {
    const error = new Error(e.message);
    error.payload = { ...req, node_pubkey: pubkey };
    return Promise.reject(error);
  }
  return this.openChannel(req);
}

/**
 * openChannel - Call lnd grpc openChannel method.
 *
 * @param {object} payload Payload
 * @returns {Promise} OpenStatusUpdate
 */
async function openChannel(payload = {}) {
  const parsePayload = () => ({
    ...payload,
    node_pubkey: Buffer.from(payload.node_pubkey).toString('hex')
  });
  return new Promise((resolve, reject) => {
    try {
      const call = this.service.openChannel(payload);

      call.on('data', data => {
        grpcLog.debug('OPEN_CHANNEL DATA', data);
        const response = { ...parsePayload(payload), data };
        resolve(response);
      });

      call.on('error', data => {
        grpcLog.error('OPEN_CHANNEL ERROR', data);
        const error = new Error(data.message);
        error.payload = parsePayload(payload);
        reject(error);
      });

      call.on('status', status => {
        grpcLog.debug('OPEN_CHANNEL STATUS', status);
      });

      call.on('end', () => {
        grpcLog.debug('OPEN_CHANNEL END');
      });
    } catch (e) {
      const error = new Error(e.message);
      error.payload = payload;
      throw error;
    }
  });
}

/**
 * closeChannel - Call lnd grpc closeChannel method.
 *
 * @param {object} payload Payload
 * @returns {Promise} CloseStatusUpdate
 */
async function closeChannel(payload = {}) {
  return new Promise((resolve, reject) => {
    try {
      const {
        channel_point: { funding_txid: fundingTxid, output_index: outputIndex },
        chan_id: chanId,
        force
      } = payload;
      const tx = fundingTxid
        .match(/.{2}/g)
        .reverse()
        .join('');

      const req = {
        channel_point: {
          funding_txid_bytes: Buffer.from(tx, 'hex'),
          output_index: Number(outputIndex)
        },
        force
      };
      const call = this.service.closeChannel(req);

      call.on('data', data => {
        grpcLog.debug('CLOSE_CHANNEL DATA', data);
        const response = { data, chanId };
        resolve(response);
      });

      call.on('error', data => {
        grpcLog.error('CLOSE_CHANNEL ERROR', data);
        const error = new Error(data.message);
        error.payload = { chanId };
        reject(error);
      });

      call.on('status', status => {
        grpcLog.debug('CLOSE_CHANNEL STATUS', status);
      });

      call.on('end', () => {
        grpcLog.debug('CLOSE_CHANNEL END');
      });
    } catch (e) {
      const error = new Error(e.message);
      error.payload = payload;
      throw error;
    }
  });
}

/**
 * sendPayment - Call lnd grpc sendPayment method.
 *
 * @param {object} payload Payload
 * @returns {Promise} Original payload augmented with lnd sendPayment response data.
 */
async function sendPayment(payload = {}) {
  // Our response will always include the original payload.
  const res = { ...payload };

  return new Promise((resolve, reject) => {
    try {
      const call = this.service.sendPayment(payload);

      call.on('data', data => {
        // Convert payment_hash to hex string.
        if (data.payment_hash) {
          data.payment_hash = data.payment_hash.toString('hex');
        }
        // In some cases lnd does not return the payment_hash. If this happens, retrieve it from the invoice.
        else {
          const invoice = bolt11DecodePayReq(payload.payment_request);
          data.payment_hash = getTag(invoice, 'payment_hash');
        }

        // Convert the preimage to a hex string.
        data.payment_preimage =
          data.payment_preimage && data.payment_preimage.toString('hex');

        // Add lnd return data, as well as payment preimage and hash as hex strings to the response.
        Object.assign(res, data);

        // Payment success is determined by the absense of a payment error.
        const isSuccess = !res.payment_error;
        if (isSuccess) {
          grpcLog.debug('PAYMENT SUCCESS', res);
          resolve(res);
        }

        // In case of an error, notify the client if there was a problem sending the payment.
        else {
          grpcLog.error('PAYMENT ERROR', res);
          const error = new Error(res.payment_error);
          error.details = res;
          reject(error);
        }
        call.end();
      });

      call.on('status', status => {
        grpcLog.debug('PAYMENT STATUS', status);
      });

      call.on('end', () => {
        grpcLog.debug('PAYMENT END');
      });

      call.write(payload);
    } catch (e) {
      const error = new Error(e.message);
      error.details = res;
      throw error;
    }
  });
}

export default {
  getInfo,
  createInvoice,
  ensurePeerConnected,
  connectAndOpen,
  openChannel,
  closeChannel,
  sendPayment,
  estimateFee,
  hasMethod
};
