import {
  decodeCustomRecords,
  validCustomRecords,
  parseCustomRecords
} from './customRecords';

const extractMessageFromInvoice = invoice => {
  const htlcs = invoice.htlcs || [];
  const settledHtlcWithCustomRecords = htlcs.find(htlc => {
    htlc.custom_records = decodeCustomRecords(htlc.custom_records);
    return htlc.state === 'SETTLED' && validCustomRecords(htlc.custom_records);
  });

  if (!settledHtlcWithCustomRecords) {
    return null;
  }

  const { custom_records: customRecords } = settledHtlcWithCustomRecords;

  const {
    messageBytes,
    signatureBytes,
    timestampBytes,
    senderBytes,
    contentTypeBytes,
    requestIdentifierBytes
  } = parseCustomRecords(customRecords);

  const requestIdentifier = requestIdentifierBytes
    ? requestIdentifierBytes.toString('hex')
    : null;

  const contentType = contentTypeBytes
    ? contentTypeBytes.toString('utf8')
    : null;

  const senderPubkey = senderBytes ? senderBytes.toString('hex') : null;

  let createdAt = parseInt(invoice.creation_date, 10);
  if (isNaN(createdAt)) {
    createdAt = null;
  } else {
    createdAt *= 1000;
  }

  const content = messageBytes ? messageBytes.toString('utf8') : null;

  const preimage = invoice.r_preimage
    ? invoice.r_preimage.toString('hex')
    : null;

  const settleIndex = invoice.settle_index;
  const amountMSats = invoice.amt_paid_msat || 0;
  const feeAmountMSats = 0;

  return {
    senderBytes,
    signatureBytes,
    timestampBytes,
    messageBytes,
    contentTypeBytes,
    requestIdentifierBytes,
    requestIdentifier,
    contentType,
    senderPubkey,
    createdAt,
    content,
    preimage,
    settleIndex,
    amountMSats,
    feeAmountMSats
  };
};

export default extractMessageFromInvoice;
