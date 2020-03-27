import db from '../renderer/db';
import extractMessagePreview from './extractMessagePreview';

export const findConversation = async (pubkey, walletId) => {
  return db.conversations.get({ pubkey, walletId });
};

export const createConversation = async (pubkey, walletId, alias, color) => {
  let displayName = alias;
  const balance = 0;

  if (alias !== '') {
    const aliasInUse = await db.conversations.get({ walletId, alias });
    if (aliasInUse) {
      displayName = `${alias}-${pubkey.substr(-6)}`;
    }
  } else {
    displayName = pubkey.substr(-6);
  }
  const id = await db.conversations.add({
    pubkey,
    walletId,
    alias,
    color,
    displayName,
    balance
  });
  return {
    pubkey,
    walletId,
    alias,
    displayName,
    color,
    balance,
    id
  };
};

export const readConversations = async walletId => {
  return db.conversations.where({ walletId }).toArray();
};

export const readConversation = async id => {
  return db.conversations.get(id);
};

export const deleteConversation = async id => {
  await db.conversations.delete(id);
  return db.messages.where({ conversationId: id }).delete();
};

export const updateConversationFeeLimit = async (id, feeLimitMSats) => {
  return db.conversations.update(id, { feeLimitMSats });
};
export const createWallet = async ({
  name,
  lndconnectUri,
  host,
  cert,
  macaroon
}) => {
  const id = await db.wallets.add({
    name,
    lndconnectUri,
    host,
    cert,
    macaroon
  });
  return {
    id,
    name,
    lndconnectUri,
    host,
    cert,
    macaroon
  };
};

export const readWallets = async () => {
  return db.wallets.toArray();
};

export const readWallet = async id => {
  return db.wallets.get(id);
};

/* eslint-disable no-await-in-loop */
export const deleteWallet = async id => {
  await db.wallets.delete(id);
  const conversations = await db.conversations
    .where({ walletId: id })
    .toArray();

  for (let i = 0; i < conversations.length; i += 1) {
    await deleteConversation(conversations[i].id);
  }
};
/* eslint-enable no-await-in-loop */

export const markConversationAsRead = async conversationId => {
  return db.transaction('rw', [db.messages, db.conversations], async () => {
    await db.messages
      .where({ conversationId })
      .and(message => {
        return message.unread === true;
      })
      .modify({ unread: false });

    await db.conversations.update(conversationId, { unreadMessages: 0 });
  });
};

export const readUnreadMessages = async conversationId => {
  const messages = await db.messages
    .where({ conversationId })
    .and(message => {
      return message.unread;
    })
    .sortBy('createdAt');

  return messages;
};

export const readMessages = async (
  conversationId,
  lastCreatedAt = Number.POSITIVE_INFINITY,
  pageSize = 25
) => {
  const messages = await db.messages
    .where('createdAt')
    .below(lastCreatedAt)
    .and(message => {
      return message.conversationId === conversationId && !message.unread;
    })
    .reverse()
    .limit(pageSize)
    .sortBy('createdAt');

  return messages.reverse();
};

export const readMessage = async id => {
  return db.messages.get(id);
};

export const deleteMessage = async id => {
  return db.messages.delete(id);
};

export const deleteMessages = async conversationId => {
  return db.messages.where({ conversationId }).delete();
};

export const createMessageResponse = async (messageParams, walletId) => {
  const { conversationId, settleIndex, requestIdentifier } = messageParams;

  const requestMessage = await db.messages
    .where({ conversationId })
    .and(message => {
      console.log(
        `${requestIdentifier} === ${message.preimage.substr(0, 8)}  ${
          message.contentType
        }   ${message.response}`
      );
      return (
        message.preimage.substr(0, 8) === requestIdentifier &&
        message.contentType === 'paymentrequest' &&
        !message.response
      );
    })
    .first();

  if (!requestMessage) {
    return null;
  }

  await db.transaction('rw', [db.messages, db.wallets], async () => {
    await db.messages.update(requestMessage.id, {
      response: messageParams
    });
    if (walletId && settleIndex) {
      await db.wallets.update(walletId, {
        lastSettleIndex: settleIndex
      });
    }
  });

  return {
    requestMessage,
    response: messageParams
  };
};

export const createMessage = async (messageParams, walletId) => {
  const {
    conversationId,
    content,
    contentType,
    createdAt,
    settleIndex,
    amountMSats,
    unread
  } = messageParams;

  let id;
  let balance;
  let unreadMessages;

  await db.transaction(
    'rw',
    [db.messages, db.conversations, db.wallets],
    async () => {
      id = await db.messages.add(messageParams);
      const conversation = await db.conversations.get(conversationId);

      if (contentType === 'payment') {
        balance = conversation.balance;
      } else {
        balance = conversation.balance + amountMSats;
      }

      const originalUnreadMessages = conversation.unreadMessages || 0;

      unreadMessages = unread
        ? originalUnreadMessages + 1
        : originalUnreadMessages;
      if (
        !conversation.mostRecentMessageAt ||
        createdAt >= conversation.mostRecentMessageAt
      ) {
        await db.conversations.update(conversationId, {
          mostRecentMessageAt: createdAt,
          mostRecentMessageContent: extractMessagePreview(content, contentType),
          balance,
          unreadMessages
        });
      }
      if (walletId && settleIndex) {
        await db.wallets.update(walletId, {
          lastSettleIndex: settleIndex
        });
      }
    }
  );

  return {
    id,
    balance,
    unreadMessages,
    ...messageParams
  };
};
