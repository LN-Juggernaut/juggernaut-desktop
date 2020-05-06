import { createSlice } from '@reduxjs/toolkit';
import { readMessages, readUnreadMessages } from '../../../utils/db';
import extractMessagePreview from '../../../utils/extractMessagePreview';
import {
  removeConversationSuccess,
  addConversation,
  newConversationMessage
} from '../conversations/conversationsSlice';
import { logout, newMessage } from '../common/actions';
import { saveMessageToDatabase } from './MessageAPI';

const messagesSlice = createSlice({
  name: 'messages',
  initialState: {
    messagesPerPage: 25,
    messagesById: {},
    messagesByConversationId: {}
  },
  reducers: {
    addMessage(state, action) {
      const {
        id,
        conversationId,
        content,
        contentType,
        senderPubkey,
        receiverPubkey,
        preimage,
        unread,
        valid,
        createdAt,
        amountMSats,
        feeAmountMSats
      } = action.payload;
      if (!state.messagesByConversationId[conversationId]) {
        state.messagesByConversationId[conversationId] = {
          messages: [],
          oldestMessageCreatedAt: Number.POSITIVE_INFINITY,
          loading: false,
          loadingNextPage: false,
          hasFetched: false,
          hasMorePages: true,
          error: null,
          lastFetchedAt: null
        };
      }
      state.messagesByConversationId[conversationId].messages.push(id);
      state.messagesById[id] = {
        id,
        conversationId,
        content,
        contentType,
        senderPubkey,
        receiverPubkey,
        preimage,
        unread,
        valid,
        createdAt,
        amountMSats,
        feeAmountMSats
      };
    },
    updateMessage(state, action) {
      const { id, response } = action.payload;
      const requestMessage = state.messagesById[id];
      if (requestMessage) {
        requestMessage.response = response;
      }
    },
    fetchMessagesStart(state, action) {
      const { conversationId } = action.payload;
      if (!state.messagesByConversationId[conversationId]) {
        state.messagesByConversationId[conversationId] = {
          loading: false,
          loadingNextPage: false,
          hasMorePages: true,
          hasFetched: false,
          oldestMessageCreatedAt: Number.POSITIVE_INFINITY,
          messages: [],
          error: null,
          lastFetchedAt: null
        };
      }
      state.messagesByConversationId[conversationId].loading = true;
    },
    fetchMessagesSuccess(state, action) {
      const { messages, conversationId } = action.payload;
      const conversationMessagesState =
        state.messagesByConversationId[conversationId];
      conversationMessagesState.loading = false;
      conversationMessagesState.error = null;
      conversationMessagesState.hasFetched = true;
      conversationMessagesState.lastFetchedAt = new Date().getTime();
      conversationMessagesState.messages = messages.map(message => {
        state.messagesById[message.id] = message;
        return message.id;
      });
    },
    fetchMessagesFailure(state, action) {
      const { conversationId, error } = action.payload;
      const conversationMessagesState =
        state.messagesByConversationId[conversationId];
      conversationMessagesState.loading = false;
      conversationMessagesState.error = error;
    },
    fetchNextPageStart(state, action) {
      const { conversationId } = action.payload;
      state.messagesByConversationId[conversationId].loadingNextPage = true;
    },
    fetchNextPageSuccess(state, action) {
      const { messages, conversationId } = action.payload;
      const conversationMessagesState =
        state.messagesByConversationId[conversationId];
      conversationMessagesState.loadingNextPage = false;
      conversationMessagesState.error = null;

      if (messages.length > 0) {
        conversationMessagesState.oldestMessageCreatedAt =
          messages[0].createdAt;

        const newMessages = messages.map(message => {
          state.messagesById[message.id] = message;
          return message.id;
        });
        conversationMessagesState.messages = newMessages.concat(
          conversationMessagesState.messages
        );
      } else {
        conversationMessagesState.hasMorePages = false;
      }
    },
    fetchNextPageFailure(state, action) {
      const { conversationId, error } = action.payload;
      const conversationMessagesState =
        state.messagesByConversationId[conversationId];
      conversationMessagesState.loadingNextPage = false;
      conversationMessagesState.error = error;
    }
  },
  extraReducers: {
    [logout]: state => {
      state.messagesById = {};
      state.messagesByConversationId = {};
    },
    [removeConversationSuccess]: (state, action) => {
      const { id: conversationId } = action.payload;
      const conversationMessagesState =
        state.messagesByConversationId[conversationId];
      if (conversationMessagesState) {
        conversationMessagesState.messages.forEach(messageId => {
          delete state.messagesById[messageId];
        });
        delete state.messagesByConversationId[conversationId];
      }
    }
  }
});

const {
  fetchMessagesStart,
  fetchMessagesSuccess,
  fetchMessagesFailure,
  fetchNextPageStart,
  fetchNextPageSuccess,
  fetchNextPageFailure
} = messagesSlice.actions;

export const receiveMessage = messageData => {
  return async (dispatch, getState) => {
    const state = getState();
    const { walletId } = state.wallet;

    const saveMessageResponse = await saveMessageToDatabase({
      ...messageData,
      walletId
    });

    if (saveMessageResponse) {
      if (
        messageData.requestIdentifier &&
        messageData.requestIdentifier !== ''
      ) {
        const { requestMessage, response } = saveMessageResponse;
        dispatch(updateMessage({ id: requestMessage.id, response }));
      } else {
        const { message, conversation } = saveMessageResponse;
        dispatch(addConversation(conversation));
        dispatch(
          newConversationMessage({
            mostRecentMessageContent: extractMessagePreview(
              message.content,
              message.contentType
            ),
            mostRecentMessageAt: message.createdAt,
            balance: message.balance,
            unreadMessages: message.unreadMessages,
            conversationId: conversation.id
          })
        );
        dispatch(newMessage({ message }));
        dispatch(addMessage(message));
      }
    }
  };
};

export const fetchMessages = conversationId => {
  return async (dispatch, getState) => {
    const state = getState();
    const conversationState =
      state.messages.messagesByConversationId[conversationId];
    if (conversationState && conversationState.lastFetchedAt) {
      return;
    }
    dispatch(fetchMessagesStart({ conversationId }));
    try {
      const unreadMessages = await readUnreadMessages(conversationId);
      const firstPageReadMessages = await readMessages(conversationId);
      const messages = unreadMessages.concat(firstPageReadMessages);
      messages.sort((a, b) => a.createdAt - b.createdAt);

      dispatch(
        fetchMessagesSuccess({
          conversationId,
          messages
        })
      );
    } catch (e) {
      dispatch(fetchMessagesFailure({ conversationId, error: e.message }));
    }
  };
};

export const fetchNextPageOfMessages = conversationId => {
  return async (dispatch, getState) => {
    const state = getState();
    const conversationState =
      state.messages.messagesByConversationId[conversationId];
    if (!conversationState || conversationState.loadingNextPage) {
      return;
    }
    const oldestMessage =
      state.messages.messagesById[conversationState.messages[0]];
    dispatch(fetchNextPageStart({ conversationId }));
    try {
      const messages = await readMessages(
        conversationId,
        oldestMessage.createdAt,
        state.messages.messagesPerPage
      );
      dispatch(fetchNextPageSuccess({ conversationId, messages }));
    } catch (e) {
      dispatch(fetchNextPageFailure({ conversationId, error: e.message }));
    }
  };
};

export const { addMessage, updateMessage } = messagesSlice.actions;
export default messagesSlice.reducer;
