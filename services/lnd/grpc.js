import EventEmitter from 'events';
import intersection from 'lodash/intersection';
import { proxyValue } from 'comlinkjs';
import crypto from 'crypto';
import { status } from '@grpc/grpc-js';
import LndGrpc from '@ln-juggernaut/lnd-grpc';
import { grpcLog } from '../../utils/log';
import errors from '../../renderer/constants/errors.json';
import delay from '../../utils/delay';
import promiseTimeout from '../../utils/promiseTimeout';
import isObject from '../../utils/isObject';
import { forwardAll, unforwardAll } from '../../utils/events/events';
import lightningMethods from './lightning.methods';
import lightningSubscriptions from './lightning.subscriptions';
import { getCustomRecords } from '../../utils/customRecords';
import extractMessageFromInvoice from '../../utils/extractMessageFromInvoice';
import extractMessageFromPayment from '../../utils/extractMessageFromPayment';
import getSignedDataFromMessage from '../../utils/getSignedDataFromMessage';
import mapNode from '../../utils/mappings/lnd/node';
import mapEdge from '../../utils/mappings/lnd/edge';
import enhanceNodesFromEdges from '../../utils/enhanceNodesFromEdges';

const GRPC_WALLET_UNLOCKER_SERVICE_ACTIVE = 'WALLET_LOCKED';
const GRPC_LIGHTNING_SERVICE_ACTIVE = 'WALLET_ACTIVE';
// Timeout for WalletUnlocker actions.
const WALLET_UNLOCKER_TIMEOUT = 1000 * 60;

/**
 * LND gRPC wrapper.
 *
 * @augments EventEmitter
 */
class LndGrpcWrapper extends EventEmitter {
  /**
   * State properties that should be reset after a disconnect.
   *
   * @type {object}
   */
  static VOLATILE_STATE = {
    options: {},
    services: {},
    activeSubscriptions: {}
  };

  constructor() {
    super();

    this.availableSubscriptions = {};
    this.registerSubscription('invoices', 'Lightning', 'subscribeInvoices');
    this.registerSubscription(
      'transactions',
      'Lightning',
      'subscribeTransactions'
    );
    this.registerSubscription(
      'channelgraph',
      'Lightning',
      'subscribeChannelGraph'
    );
    this.registerSubscription('info', 'Lightning', 'subscribeGetInfo');
    this.registerSubscription(
      'backups',
      'Lightning',
      'subscribeChannelBackups'
    );
    this.registerSubscription(
      'channelevents',
      'Lightning',
      'subscribeChannelEvents'
    );
    this.registerSubscription('peerevents', 'Lightning', 'subscribePeerEvents');

    Object.assign(this, LndGrpcWrapper.VOLATILE_STATE);
  }

  /**
   * connect - Initiate gRPC connection.
   *
   * @param {object} options Connection options
   * @returns {LndGrpc} LndGrpc connection
   */
  async connect(options) {
    if (this.grpc && this.grpc.state !== 'ready') {
      throw new Error('Can not connect (already connected)');
    }
    this.options = options;

    // Create a new grpc instance using settings from init options.
    const grpcOptions = this.getConnectionSettings();
    this.grpc = new LndGrpc(grpcOptions);

    // Set up service accessors.
    this.services = this.grpc.services;

    // Inject helper methods.
    Object.assign(this.services.Lightning, lightningMethods);
    Object.assign(this.services.Lightning, lightningSubscriptions);
    // Setup gRPC event handlers.
    this.grpc.on('locked', () => {
      this.emit(GRPC_WALLET_UNLOCKER_SERVICE_ACTIVE);
    });
    this.grpc.on('active', async () => {
      await this.initializePubkey();
      this.emit(GRPC_LIGHTNING_SERVICE_ACTIVE);
      this.subscribeAll();
    });

    await this.grpc.connect(options);
    // Connect the service.
    return this.wallet;
  }

  async;

  /* eslint-disable no-await-in-loop */
  async getValidMessageFromPayment(payment) {
    if (payment.status !== 'SUCCEEDED') {
      return null;
    }
    const senderPubkey = await this.getPubkey();
    const message = await extractMessageFromPayment(payment);
    if (!message) {
      return null;
    }

    const {
      createdAt,
      content,
      contentType,
      requestIdentifier,
      preimage,
      amountMSats,
      feeAmountMSats,
      receiverPubkey
    } = message;

    return {
      createdAt,
      content,
      contentType,
      requestIdentifier,
      preimage,
      amountMSats,
      feeAmountMSats,
      receiverPubkey,
      senderPubkey,
      unread: false
    };
  }

  async getAllSentMessages() {
    const messages = [];
    const payments = await this.listPayments();

    for (let i = 0; i < payments.length; i += 1) {
      const message = await this.getValidMessageFromPayment(payments[i]);
      if (message) {
        messages.push(message);
      }
    }

    return messages;
  }

  async getMessagesSinceSettleIndex(settleIndex) {
    const messages = [];
    let { invoices, lastIndexOffset } = await this.listInvoices(settleIndex);

    while (invoices.length > 0) {
      for (let i = 0; i < invoices.length; i += 1) {
        const message = await this.getValidMessageFromInvoice(invoices[i]);
        if (message) {
          messages.push(message);
        }
      }

      ({ invoices, lastIndexOffset } = await this.listInvoices(
        lastIndexOffset
      ));
    }

    return messages;
  }
  /* eslint-enable no-await-in-loop */

  async getValidMessageFromInvoice(invoice) {
    if (!invoice.settled) {
      return null;
    }

    const message = extractMessageFromInvoice(invoice);
    if (!message) {
      return null;
    }
    const receiverPubkey = await this.getPubkey();
    const signData = getSignedDataFromMessage(message, receiverPubkey);

    const { signatureBytes: signature } = message;
    const validMessage = await this.isValidMessage(signData, signature);
    if (!validMessage) {
      return null;
    }

    const {
      senderPubkey,
      createdAt,
      content,
      contentType,
      requestIdentifier,
      preimage,
      settleIndex,
      amountMSats,
      feeAmountMSats
    } = message;

    return {
      senderPubkey,
      receiverPubkey,
      createdAt,
      content,
      contentType,
      requestIdentifier,
      preimage,
      settleIndex,
      amountMSats,
      feeAmountMSats,
      unread: true
    };
  }

  async subscribeToMessages() {
    this.on('subscribeInvoices.data', async invoice => {
      const validMessage = await this.getValidMessageFromInvoice(invoice);
      if (validMessage) {
        this.emit('subscribeMessages.data', validMessage);
      }
    });
  }

  async getAllNodes() {
    const { nodes, edges } = await this.services.Lightning.describeGraph({
      include_unannounced: false
    });
    const mappedNodes = nodes.map(mapNode);
    const mappedEdges = edges.map(mapEdge);
    enhanceNodesFromEdges(mappedNodes, mappedEdges);
    const otherNodes = mappedNodes.filter(node => {
      return node.pubKey !== this.pubkey;
    });
    return otherNodes;
  }

  async newAddress(type) {
    const { address } = await this.services.Lightning.newAddress({ type });
    return address;
  }

  async isValidMessage(msg, signature) {
    try {
      const verifyResponse = await this.verifyMessage({ msg, signature });
      return verifyResponse.valid;
    } catch (e) {
      return false;
    }
  }

  async validConnectionDetails(options) {
    const grpcOptions = this.getConnectionSettings(options);
    try {
      const grpc = new LndGrpc(grpcOptions);
      await grpc.connect();
    } catch (e) {
      return false;
    }
    return true;
  }

  get state() {
    return this.grpc.state;
  }

  /**
   * unlock - Unlock gRPC service.
   *
   * @param {string} password Password
   * @returns {Promise} Promise that resolves after unlocking a wallet and connecting to the Lightning interface.
   */
  async unlock(password) {
    try {
      const { grpc } = this;
      await promiseTimeout(
        WALLET_UNLOCKER_TIMEOUT,
        grpc.services.WalletUnlocker.unlockWallet({
          wallet_password: Buffer.from(password)
        })
      );
      return await promiseTimeout(
        WALLET_UNLOCKER_TIMEOUT,
        grpc.activateLightning()
      );
    } catch (e) {
      grpcLog.error(`Error when trying to connect to LND grpc: %o`, e);
      throw e;
    }
  }

  /**
   * initWallet - Create / Restore wallet.
   *
   * @param {object} payload Payload
   * @returns {Promise} Promise that resolves after creating wallet and connecting to the Lightning interface.
   */
  async initWallet(payload) {
    try {
      const { grpc } = this;
      await promiseTimeout(
        WALLET_UNLOCKER_TIMEOUT,
        grpc.services.WalletUnlocker.initWallet(payload)
      );
      return await promiseTimeout(
        WALLET_UNLOCKER_TIMEOUT,
        grpc.activateLightning()
      );
    } catch (e) {
      grpcLog.error(`Error when trying to create wallet: %o`, e);
      throw e;
    }
  }

  /**
   * disconnect - Disconnect gRPC service.
   *
   * @param {...object} args Disconnect args
   */
  async disconnect(...args) {
    await this.unsubscribe();
    this.removeAllListeners('subscribeInvoices.data');

    if (this.grpc) {
      if (this.grpc.can('disconnect')) {
        await this.grpc.disconnect(args);
      }
      // Remove gRPC event handlers.
      this.grpc.removeAllListeners('locked');
      this.grpc.removeAllListeners('active');
    }

    // Reset the state.
    Object.assign(this, LndGrpcWrapper.VOLATILE_STATE);
  }

  /**
   * waitForState - Wait for grpc service to enter specific sate (proxy method).
   *
   * @param {...object} args WaitForState args
   * @returns {object} LndGrpc.waitForState
   */
  waitForState(...args) {
    return proxyValue(this.grpc.waitForState(args));
  }

  isSubscribed(subscription) {
    return Boolean(this.activeSubscriptions[subscription]);
  }

  /**
   * subscribeAll - Subscribe to all gRPC streams.
   */
  async subscribeAll() {
    this.subscribe(
      'invoices',
      'transactions',
      'backups',
      'channelevents',
      'peerevents'
    );
    this.subscribeToMessages();

    // Finalize subscriptions if `data.synced_to_chain` is true.
    // Returns true if subscriptions were finalized and false otherwise
    const finalizeSubscriptions = async data => {
      if (data && data.synced_to_chain) {
        if (this.isSubscribed('info')) {
          await this.unsubscribe('info');
        }
        this.subscribe({ name: 'info', params: { pollInterval: 60000 } });
        this.subscribeChannelGraph();
        return true;
      }
      return false;
    };

    const data = await this.services.Lightning.getInfo();

    // If we are already fully synced set up finalize the subscriptions right away.
    if (!(await finalizeSubscriptions(data))) {
      // Otherwise, set up a fast poling subscription to the info stream and finalize once the chain sync has completed.
      // This is needed because LND chanRouter waits for chain sync to complete before accepting subscriptions.

      this.subscribe({ name: 'info', params: { pollImmediately: true } });
      this.on('subscribeGetInfo.data', finalizeSubscriptions);
    }
  }

  /**
   * subscribe - Subscribe Subscribe to gRPC streams (``@streams` must be a subset of `this.availableSubscriptions`).
   *
   * @param {...string|object} streams optional list of streams to subscribe to. if omitted, uses all available streams
   * if `stream` is to be called with params array element must be of {name, params} format
   */
  subscribe(...streams) {
    // some of the streams may have params
    // create a map <streamName, params> out of them
    const getSubscriptionParams = streams => {
      if (!(streams && streams.length)) {
        return {};
      }
      return streams.reduce((acc, next) => {
        if (isObject(next)) {
          acc[next.name] = next.params;
        }
        return acc;
      }, {});
    };
    // flattens @streams into an Array<string> of stream names to subscribe to
    const getSubscriptionsNames = streams =>
      streams && streams.map(entry => (isObject(entry) ? entry.name : entry));
    // make sure we are subscribing to known streams if a specific list is provided
    const allSubKeys = Object.keys(this.availableSubscriptions);

    const params = getSubscriptionParams(streams);
    const subNames = getSubscriptionsNames(streams);
    const activeSubKeys =
      subNames && subNames.length
        ? intersection(allSubKeys, subNames)
        : allSubKeys;

    if (!activeSubKeys.length) {
      return;
    }

    grpcLog.info(`Subscribing to gRPC streams: %o`, activeSubKeys);

    // Close and clear subscriptions when they emit an end event.
    activeSubKeys.forEach(key => {
      if (this.isSubscribed(key)) {
        grpcLog.warn(
          `Unable to subscribe to gRPC streams: %s (already active)`,
          key
        );
        return;
      }

      // Set up the subscription.
      const { serviceName, methodName } = this.availableSubscriptions[key];
      const service = this.services[serviceName];
      const subscriptionParams = params[key] || {};
      this.activeSubscriptions[key] = service[methodName](subscriptionParams);
      grpcLog.info(`gRPC subscription "${key}" started.`);

      // Setup subscription event forwarders.
      forwardAll(service, methodName, this);

      // Set up subscription event listeners to handle when streams close.
      if (this.activeSubscriptions[key]) {
        this.activeSubscriptions[key].on('end', () => {
          grpcLog.info(`gRPC subscription "${key}" ended.`);
          delete this.activeSubscriptions[key];
        });

        this.activeSubscriptions[key].on('status', callStatus => {
          if (callStatus.code === status.CANCELLED) {
            delete this.activeSubscriptions[key];
            grpcLog.info(`gRPC subscription "${key}" cancelled.`);
          }
        });
      }
    });
  }

  /**
   * unsubscribe - Unsubscribe from all streams. (@streams must be a subset of `this.availableSubscriptions`).
   *
   * @param {...string} streams optional list of streams to unsubscribe from. if omitted, uses all active streams.
   */
  async unsubscribe(...streams) {
    // make sure we are unsubscribing from active services if a specific list is provided
    const allSubKeys = Object.keys(this.activeSubscriptions);
    const activeSubKeys =
      streams && streams.length
        ? intersection(allSubKeys, streams)
        : allSubKeys;

    if (!activeSubKeys.length) {
      return;
    }

    grpcLog.info(`Unsubscribing from gRPC streams: %o`, activeSubKeys);

    const cancellations = activeSubKeys.map(key =>
      this.cancelSubscription(key)
    );
    await Promise.all(cancellations);
  }

  /**
   * registerSubscription - Register a stream.
   * Provide a mapping between a service and a subscription activation helper method.
   *
   * @param  {string} key         Key used to identify the subscription.
   * @param  {string} serviceName Name of service that provides the subscription.
   * @param  {string} methodName  Name of service methods that activates the subscription.
   */
  registerSubscription(key, serviceName, methodName) {
    this.availableSubscriptions[key] = { key, serviceName, methodName };
  }

  /**
   * cancelSubscription - Unsubscribe from a single stream.
   *
   * @param {string} key Name of stream subscription to cancel
   * @returns {Promise} Resolves once stream has been canceled
   */
  async cancelSubscription(key) {
    if (!this.activeSubscriptions[key]) {
      grpcLog.warn(
        `Unable to unsubscribe from gRPC stream: %s (not active)`,
        key
      );
      return null;
    }

    grpcLog.info(`Unsubscribing from ${key} gRPC stream`);

    // Remove subscription event forwarders.
    const { serviceName, methodName } = this.availableSubscriptions[key];
    const service = this.services[serviceName];
    unforwardAll(service, methodName);

    // Cancellation status callback handler.
    const result = new Promise(resolve => {
      this.activeSubscriptions[key].on('status', callStatus => {
        if (callStatus.code === status.CANCELLED) {
          delete this.activeSubscriptions[key];
          grpcLog.info(`Unsubscribed from ${key} gRPC stream`);
          resolve();
        }
      });

      this.activeSubscriptions[key].on('end', () => {
        delete this.activeSubscriptions[key];
        grpcLog.info(`Unsubscribed from ${key} gRPC stream`);
        resolve();
      });
    });

    // Initiate cancellation request.
    this.activeSubscriptions[key].cancel();

    // Resolve once we receive confirmation of the call's cancellation.
    return result;
  }

  /**
   * getConnectionSettings - Get connection details based on wallet config.
   *
   * @returns {object} Connection settings
   */
  getConnectionSettings(options) {
    const { id, type, host, cert, macaroon, lndconnectUri, protoDir } =
      options || this.options;
    // Don't use macaroons when connecting to the local tmp instance.
    const useMacaroon = this.useMacaroon && id !== 'tmp';
    // If connecting to a local instance, wait for the macaroon file to exist.
    const waitForMacaroon = type === 'local';
    const waitForCert = type === 'local';

    return {
      host,
      cert,
      macaroon,
      waitForMacaroon,
      waitForCert,
      useMacaroon,
      protoDir,
      lndconnectUri
    };
  }

  /**
   * subscribeChannelGraph - Set up subscription to the channel graph stream.
   *
   * There is no guarentee that it is ready yet as it can take time for lnd to start it once chain sync has finished
   * so set up a schedular to keep retrying until it works.
   *
   * @param {number} initialTimeout Length of time to wait until first retry (ms)
   * @param {number} backoff Backoff exponent
   * @param {number} maxTimeout Maximux Length of time to wait until a retry (ms)
   */
  subscribeChannelGraph(
    initialTimeout = 250,
    backoff = 2,
    maxTimeout = 1000 * 60
  ) {
    const initSubscription = async timeout => {
      if (this.grpc.state !== 'active') {
        return;
      }

      // If the channel graph subscription fails to start, try again in a bit.
      if (this.activeSubscriptions.channelgraph) {
        this.activeSubscriptions.channelgraph.once('error', async error => {
          if (error.message === 'router not started') {
            grpcLog.warn(
              'Unable to subscribe to channelgraph. Will try again in %sms',
              timeout
            );
            await delay(timeout);
            const nextTimeout = Math.min(maxTimeout, timeout * backoff);
            initSubscription(nextTimeout);
          }
        });
      }

      // Set up the subscription.
      this.subscribe('channelgraph');
    };

    initSubscription(initialTimeout);
  }

  async getInfo() {
    const data = await this.services.Lightning.getInfo();
    return data;
  }

  async getNodeInfo(pubKey, includeChannels = false) {
    const nodeInfo = await this.services.Lightning.getNodeInfo({
      pub_key: pubKey,
      include_channels: includeChannels
    });

    return {
      lastUpdate: nodeInfo.node.last_update,
      pubKey: nodeInfo.node.pub_key,
      alias: nodeInfo.node.alias,
      addresses: nodeInfo.node.addresses,
      color: nodeInfo.node.color,
      numChannels: nodeInfo.num_channels,
      totalCapacity: nodeInfo.total_capacity,
      channels: nodeInfo.channels.map(channel => {
        return {
          channelId: channel.channel_id,
          chanPoint: channel.chan_point,
          lastUpdate: channel.last_update,
          node1Pub: channel.node1_pub,
          node2Pub: channel.node2_pub,
          capacity: channel.capacity,
          node1Policy: {
            timeLockDelta: channel.node1_policy.time_lock_delta,
            minHtlc: channel.node1_policy.min_htlc,
            feeBaseMsat: channel.node1_policy.fee_base_msat,
            feeRateMilliMsat: channel.node1_policy.fee_rate_milli_msat,
            disabled: channel.node1_policy.disabled,
            maxHtlcMsat: channel.node1_policy.max_htlc_msat,
            lastUpdate: channel.node1_policy.last_update
          },
          node2Policy: {
            timeLockDelta: channel.node1_policy.time_lock_delta,
            minHtlc: channel.node1_policy.min_htlc,
            feeBaseMsat: channel.node1_policy.fee_base_msat,
            feeRateMilliMsat: channel.node1_policy.fee_rate_milli_msat,
            disabled: channel.node1_policy.disabled,
            maxHtlcMsat: channel.node1_policy.max_htlc_msat,
            lastUpdate: channel.node1_policy.last_update
          }
        };
      })
    };
  }

  async listPeers(pubKey) {
    const { peers } = await this.services.Lightning.listPeers({});

    const mappedPeers = peers.map(peer => {
      return {
        pubKey: peer.pub_key,
        address: peer.address,
        bytesSent: peer.bytes_sent,
        bytesRecv: peer.bytes_recv,
        satSent: peer.sat_sent,
        satRecv: peer.sat_recv,
        inbound: peer.inbound,
        pingTime: peer.ping_time,
        syncType: peer.sync_type,
        features: peer.features
      };
    });

    if (pubKey) {
      return mappedPeers.find(peer => peer.pubKey === pubKey);
    }
    return mappedPeers;
  }

  async getNodeDetails(pubKey) {
    const {
      lastUpdate,
      alias,
      color,
      addresses,
      features,
      numChannels,
      totalCapacity,
      channels: remoteChannels
    } = await this.getNodeInfo(pubKey, true);

    const peer = await this.listPeers(pubKey);

    const { active, pending } = await this.listChannels(pubKey);

    return {
      pubKey,
      color,
      alias,
      lastUpdate,
      addresses,
      features,
      numChannels,
      totalCapacity,
      remoteChannels,
      channels: active,
      pendingChannels: pending,
      peer
    };
  }

  async initializePubkey() {
    const info = await this.services.Lightning.getInfo({});
    this.pubkey = info.identity_pubkey;
    this.pubkeyBytes = Buffer.from(this.pubkey, 'hex');
  }

  async getPubkey() {
    if (this.pubkey) {
      return this.pubkey;
    }
    await this.initializePubkey();
    return this.pubkey;
  }

  /* eslint-disable compat/compat */
  async sendMessageToPubKey(
    message,
    contentType,
    requestIdentifier,
    destinationPubKey,
    amountMSats,
    feeLimitMSats
  ) {
    const preimageBytes = crypto.randomBytes(32);
    const hash = crypto.createHash('sha256');
    hash.update(preimageBytes);
    const preimageHash = hash.digest();

    const timestamp = new Date().getTime();
    const timeBytes = Buffer.allocUnsafe(8);
    timeBytes.writeBigInt64BE(BigInt(timestamp), 0);

    const destinationKeyBytes = Buffer.from(destinationPubKey, 'hex');
    const messageBytes = Buffer.from(message, 'utf8');
    const contentTypeBytes = Buffer.from(contentType, 'utf8');
    const requestIdentifierBytes = Buffer.from(requestIdentifier, 'hex');

    const signData = Buffer.concat([
      this.pubkeyBytes,
      destinationKeyBytes,
      timeBytes,
      messageBytes,
      contentTypeBytes
    ]);
    let signResponse = null;

    try {
      signResponse = await this.services.Lightning.signMessage({
        msg: signData
      });
    } catch (e) {
      grpcLog.info('failed to sign message: %O', e);
    }

    const { signature } = signResponse;
    const signatureBytes = Buffer.from(signature, 'utf8');

    const customRecords = getCustomRecords({
      message: messageBytes,
      sourcePubkey: this.pubkeyBytes,
      timestamp: timeBytes,
      preimage: preimageBytes,
      signature: signatureBytes,
      contentType: contentTypeBytes,
      requestIdentifier: requestIdentifierBytes
    });

    const amountToSend = Math.max(amountMSats, 1000);

    const sendPaymentRequest = {
      payment_hash: preimageHash,
      amt_msat: amountToSend,
      dest: destinationKeyBytes,
      dest_custom_records: customRecords,
      final_cltv_delta: 40,
      fee_limit_msat: feeLimitMSats,
      timeout_seconds: 30
    };

    grpcLog.info(sendPaymentRequest);
    const sentPayment = this.grpc.services.Router.sendPayment(
      sendPaymentRequest
    );

    return new Promise((resolve, reject) => {
      sentPayment.on('data', data => {
        grpcLog.info('received sendPayment data %O', data);

        if (data.state && data.state !== 'IN_FLIGHT') {
          if (data.state === 'SUCCEEDED') {
            this.emit('paymentSent', data);
            const feeAmountMSats = data.htlcs.reduce((totalFeesMSats, htlc) => {
              return totalFeesMSats + htlc.route.total_fees_msat;
            }, 0);

            resolve({
              amountMSats: amountToSend,
              preimage: preimageBytes.toString('hex'),
              feeAmountMSats
            });
          } else {
            const paymentState = data.state;
            reject(new Error(paymentState));
          }
        }
      });
      sentPayment.on('status', status => {
        grpcLog.info('received sendPayment status %O', status);
      });
      sentPayment.on('error', error => {
        if (error && error.message.includes('amount must be specified')) {
          reject(new Error(errors.OLD_LND_VERSION));
        }
        grpcLog.info('received sendPayment error %O', error);
      });
      sentPayment.on('end', () => {
        grpcLog.info('received sendPayment end');
      });
    });
  }

  async listPayments() {
    const { payments } = await this.services.Lightning.listPayments({
      include_incomplete: false
    });

    // todo: map payments

    return payments;
  }

  async listInvoices(lastSettleIndex) {
    const listInvoiceRequest = {};
    if (lastSettleIndex) {
      listInvoiceRequest.index_offset = lastSettleIndex;
    }
    const {
      invoices,
      last_index_offset: lastIndexOffset
    } = await this.services.Lightning.listInvoices(listInvoiceRequest);

    // todo map invoices

    return {
      invoices,
      lastIndexOffset
    };
  }

  async verifyMessage(message) {
    return this.services.Lightning.verifyMessage(message);
  }

  async signMessage(message) {
    return this.services.Lightning.signMessage(message);
  }

  async getBalanceInformation() {
    const [walletBalance, channelBalance] = await Promise.all([
      this.services.Lightning.walletBalance(),
      this.services.Lightning.channelBalance()
    ]);

    const availableBalance =
      walletBalance.confirmed_balance + channelBalance.balance;

    const pendingBalance =
      walletBalance.unconfirmed_balance + channelBalance.pending_open_balance;

    return {
      availableBalance,
      pendingBalance
    };
  }

  async openChannel({
    pubkey,
    localSatoshis,
    remoteSatoshis,
    targetConfirmations
  }) {
    try {
      await this.grpc.services.Lightning.openChannel({
        node_pubkey: Buffer.from(pubkey, 'hex'),
        local_funding_amount: localSatoshis + remoteSatoshis,
        push_sat: remoteSatoshis,
        target_conf: targetConfirmations
      });
    } catch (e) {
      grpcLog.info('failed to open channel');
      grpcLog.info(e.message);

      if (e.message === 'channel is too small') {
        throw new Error(errors.CHANNEL_TOO_SMALL);
      } else if (e.message.match(/dial.tcp(.*)connect(.*)no.route.to.host/i)) {
        throw new Error(errors.PEER_IS_OFFLINE);
      } else if (e.message.match(/received.funding.error.from/i)) {
        throw new Error(errors.PEER_IS_OFFLINE);
      } else {
        throw e;
      }
    }
  }

  async closeChannel({ channelPoint, chanId, force }) {
    const [fundingTxid, outputIndex] = channelPoint.split(':');
    return this.grpc.services.Lightning.closeChannel({
      channel_point: {
        funding_txid: fundingTxid,
        output_index: outputIndex
      },
      chan_id: chanId,
      force
    });
  }

  async listChannels(pubKey) {
    const { channels } = await this.grpc.services.Lightning.listChannels({
      active_only: true,
      inactive_only: false,
      public_only: false,
      private_only: false
    });

    const {
      pending_open_channels: pendingOpenChannels,
      pending_closing_channels: pendingClosingChannels,
      pending_force_closing_channels: pendingForceClosingChannels,
      waiting_close_channels: waitingCloseChannels
    } = await this.grpc.services.Lightning.pendingChannels({});

    const pendingCloseChannels = pendingClosingChannels
      .concat(pendingForceClosingChannels)
      .concat(waitingCloseChannels)
      .map(channel => channel.channel);
    const pendingChannels = pendingOpenChannels.map(channel => channel.channel);

    const filteredChannels = channels.filter(channel => {
      const pubkeyMatches = !pubKey || channel.remote_pubkey === pubKey;
      const isClosing = pendingCloseChannels.find(
        pendingCloseChannel =>
          pendingCloseChannel.channel_point === channel.channel_point
      );

      return pubkeyMatches && !isClosing;
    });

    const filteredPendingChannels = pendingChannels.filter(channel => {
      return !pubKey || channel.remote_node_pub === pubKey;
    });

    const filteredClosingChannels = pendingCloseChannels.filter(channel => {
      return !pubKey || channel.remote_node_pub === pubKey;
    });

    const mappedPendingChannels = filteredPendingChannels.map(channel => {
      return {
        active: false,
        closing: false,
        opening: true,
        remotePubkey: channel.remote_node_pub,
        channelPoint: channel.channel_point,
        capacity: channel.capacity,
        localBalance: channel.local_balance,
        remoteBalance: channel.remote_balance,
        localChanReserveSat: channel.local_chan_reserve_sat,
        remoteChanReserveSat: channel.remote_chan_reserve_sat
      };
    });

    const mappedClosingChannels = filteredClosingChannels.map(channel => {
      return {
        active: false,
        closing: true,
        opening: false,
        remotePubkey: channel.remote_node_pub,
        channelPoint: channel.channel_point,
        capacity: channel.capacity,
        localBalance: channel.local_balance,
        remoteBalance: channel.remote_balance,
        localChanReserveSat: channel.local_chan_reserve_sat,
        remoteChanReserveSat: channel.remote_chan_reserve_sat
      };
    });

    const mappedActiveChannels = filteredChannels.map(channel => {
      return {
        active: channel.active,
        closing: false,
        opening: false,
        remotePubkey: channel.remote_pubkey,
        channelPoint: channel.channel_point,
        chanId: channel.chan_id,
        capacity: channel.capacity,
        localBalance: channel.local_balance,
        remoteBalance: channel.remote_balance,
        commitFee: channel.commit_fee,
        commitWeight: channel.commit_weight,
        feePerKw: channel.fee_per_kw,
        unsettledBalance: channel.unsettled_balance,
        totalSatoshisSent: channel.total_satoshis_sent,
        totalSatoshisReceived: channel.total_satoshis_received,
        numUpdates: channel.num_updates,
        pendingHtlcs: channel.pending_htlcs.map(htlc => {
          return {
            incoming: htlc.incoming,
            amount: htlc.amount,
            hashLock: htlc.hash_lock,
            expirationHeight: htlc.expiration_height
          };
        }),
        csvDelay: channel.csv_delay,
        private: channel.private,
        initiator: channel.initiator,
        chanStatusFlags: channel.chan_status_flags,
        localChanReserveSat: channel.local_chan_reserve_sat,
        remoteChanReserveSat: channel.remote_chan_reserve_sat,
        staticRemoteKey: channel.static_remote_key,
        lifetime: channel.lifetime,
        uptime: channel.uptime,
        closeAddress: channel.close_address
      };
    });

    return {
      active: mappedActiveChannels,
      pending: mappedPendingChannels,
      closing: mappedClosingChannels
    };
  }
}

export default LndGrpcWrapper;
