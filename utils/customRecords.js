const tlvMsgRecord = 34349334;
const tlvSigRecord = 34349337;
const tlvSenderRecord = 34349339;
const tlvTimeRecord = 34349343;
const tlvContentType = 34349345;
const tlvRequestIdentifier = 34349347;
const tlvKeySendRecord = 5482373484;

export function decodeCustomRecords(customRecords) {
  const records = {};
  if (!customRecords) {
    return records;
  }

  Object.keys(customRecords).forEach(key => {
    if (Buffer.byteLength(key, 'ascii') >= 8) {
      const intKey = Buffer.from(key, 'ascii').readBigUInt64LE();
      if (intKey) {
        const intKeyAsString = intKey.toString();
        records[intKeyAsString] = customRecords[key];
      }
    }
  });
  return records;
}

export function validCustomRecords(customRecords) {
  if (!customRecords) {
    return false;
  }
  const hasMessage = tlvMsgRecord in customRecords;
  const hasSender = tlvSenderRecord in customRecords;

  return hasMessage && hasSender;
}

export function parseCustomRecords(customRecords) {
  const messageBytes = customRecords[tlvMsgRecord] || Buffer.from('');
  const signatureBytes = customRecords[tlvSigRecord] || Buffer.from('');
  const timestampBytes = customRecords[tlvTimeRecord] || Buffer.from('');
  const senderBytes = customRecords[tlvSenderRecord] || Buffer.from('');
  const contentTypeBytes = customRecords[tlvContentType] || Buffer.from('text');
  const requestIdentifierBytes =
    customRecords[tlvRequestIdentifier] || Buffer.from('');

  return {
    messageBytes,
    signatureBytes,
    timestampBytes,
    senderBytes,
    contentTypeBytes,
    requestIdentifierBytes
  };
}

export function getCustomRecords({
  message,
  sourcePubkey,
  timestamp,
  preimage,
  signature,
  contentType,
  requestIdentifier
}) {
  return {
    [tlvMsgRecord]: message,
    [tlvSenderRecord]: sourcePubkey,
    [tlvTimeRecord]: timestamp,
    [tlvSigRecord]: signature,
    [tlvKeySendRecord]: preimage,
    [tlvContentType]: contentType,
    [tlvRequestIdentifier]: requestIdentifier
  };
}
