const getSignedDataFromMessage = (message, receiverPubkey) => {
  const receiverPubkeyBytes = Buffer.from(receiverPubkey, 'hex');

  const {
    senderBytes,
    timestampBytes,
    messageBytes,
    contentTypeBytes
  } = message;

  const data = [
    senderBytes,
    receiverPubkeyBytes,
    timestampBytes,
    messageBytes,
    contentTypeBytes
  ];

  return Buffer.concat(data);
};

export default getSignedDataFromMessage;
