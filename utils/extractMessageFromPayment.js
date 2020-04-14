import {
  decodeCustomRecords,
  validCustomRecords,
  parseCustomRecords
} from './customRecords';

const extractMessageFromPayment = async payment => {
  const htlcs = payment.htlcs || [];
  const htlcWithCustomRecords = htlcs.find(htlc => {
    if (htlc.status === 'SUCCEEDED') {
      if (!htlc.route) {
        return false;
      }
      const hops = htlc.route.hops || [];
      if (hops.length === 0) {
        return false;
      }
      const lastHop = hops[hops.length - 1];
      if (!lastHop) {
        return false;
      }

      lastHop.custom_records = decodeCustomRecords(lastHop.custom_records);
      return validCustomRecords(lastHop.custom_records);
    }
    return false;
  });

  if (!htlcWithCustomRecords) {
    return null;
  }
  const {
    custom_records: customRecords,
    pub_key: receiverPubkey
  } = htlcWithCustomRecords.route.hops[
    htlcWithCustomRecords.route.hops.length - 1
  ];

  const {
    messageBytes,
    contentTypeBytes,
    requestIdentifierBytes
  } = await parseCustomRecords(customRecords);

  return {
    createdAt: parseInt(payment.creation_time_ns, 10) / 1000000,
    content: messageBytes.toString('utf8'),
    contentType: contentTypeBytes.toString('utf8'),
    requestIdentifier: requestIdentifierBytes
      ? requestIdentifierBytes.toString('hex')
      : null,
    preimage: payment.payment_preimage,
    amountMSats: payment.value_msat * -1,
    feeAmountMSats: payment.fee_msat,
    receiverPubkey
  };
};

export default extractMessageFromPayment;
