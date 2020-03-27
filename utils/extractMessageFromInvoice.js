import {
  decodeCustomRecords,
  validCustomRecords,
  parseCustomRecords
} from './customRecords';

const extractMessageFromInvoice = invoice => {
  const settledHtlcWithCustomRecords = invoice.htlcs.find(htlc => {
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

  return {
    senderBytes,
    signatureBytes,
    timestampBytes,
    messageBytes,
    contentTypeBytes,
    requestIdentifierBytes,
    requestIdentifier: requestIdentifierBytes
      ? requestIdentifierBytes.toString('hex')
      : null,
    contentType: contentTypeBytes.toString('utf8'),
    senderPubkey: senderBytes.toString('hex'),
    createdAt: parseInt(invoice.creation_date, 10) * 1000,
    content: messageBytes.toString('utf8'),
    preimage: invoice.r_preimage.toString('hex'),
    settleIndex: invoice.settle_index,
    amountMSats: invoice.amt_paid_msat,
    feeAmountMSats: 0
  };
};

export default extractMessageFromInvoice;
