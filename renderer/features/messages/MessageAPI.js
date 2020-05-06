import {
  findConversation,
  createConversation,
  createMessage,
  createMessageResponse
} from '../../../utils/db';
import getNodeInterface from '../../../utils/getNodeInterface';

export const saveMessagesToDatabase = async (messages, walletId) => {
  for (let i = 0; i < messages.length; i += 1) {
    await saveMessageToDatabase({
      ...messages[i],
      walletId
    });
  }
};

export const saveMessageToDatabase = async ({
  senderPubkey,
  receiverPubkey,
  createdAt,
  content,
  contentType,
  preimage,
  settleIndex,
  amountMSats,
  feeAmountMSats,
  unread,
  valid,
  requestIdentifier,
  walletId
}) => {
  const lnNode = getNodeInterface();
  const walletPubkey = await lnNode.getPubkey();

  const withPubkey =
    walletPubkey === senderPubkey ? receiverPubkey : senderPubkey;

  let conversation = await findConversation(withPubkey, walletId);
  if (!conversation) {
    const { alias, color } = await lnNode.getNodeInfo(withPubkey);
    conversation = await createConversation(withPubkey, walletId, alias, color);
  }

  const messageParams = {
    conversationId: conversation.id,
    senderPubkey,
    receiverPubkey,
    content,
    contentType,
    createdAt,
    unread,
    valid,
    preimage,
    settleIndex,
    amountMSats,
    requestIdentifier,
    feeAmountMSats
  };

  try {
    if (requestIdentifier && requestIdentifier !== '') {
      const { requestMessage, response } = await createMessageResponse(
        messageParams,
        walletId
      );

      return {
        conversation,
        requestMessage,
        response
      };
    }

    const message = await createMessage(messageParams, walletId);
    if (message) {
      return { conversation, message };
    }
  } catch (e) {
    console.log(e);
  }
};
