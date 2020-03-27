import { createSlice } from '@reduxjs/toolkit';
import {
  readConversations,
  deleteConversation,
  markConversationAsRead
} from '../../../utils/db';
import { logout } from '../common/actions';
import getNodeInterface from '../../../utils/getNodeInterface';

const conversationsSlice = createSlice({
  name: 'conversations',
  initialState: {
    conversationsById: {},
    conversations: [],
    selectedConversationId: null,
    newConversationModalVisible: false,
    newChannelModalVisible: false,
    conversationDetailsVisible: false,
    conversationDetailsLoading: false,
    conversationDetails: null,
    searchQuery: '',
    loading: false,
    removing: false,
    error: null,
    loadingNodes: false,
    nodes: []
  },
  extraReducers: {
    [logout]: state => {
      state.conversationsById = {};
      state.conversations = [];
      state.selectedConversationId = null;
      state.newConversationModalVisible = false;
      state.loading = false;
      state.removing = false;
      state.error = null;
      state.conversationDetailsVisible = false;
      state.conversationDetailsLoading = false;
      state.conversationDetails = null;
      state.searchQuery = '';
    }
  },
  reducers: {
    updateSearchQuery(state, action) {
      state.searchQuery = action.payload;
    },
    newConversationMessage(state, action) {
      const {
        conversationId,
        mostRecentMessageAt,
        mostRecentMessageContent,
        balance,
        unreadMessages
      } = action.payload;

      const conversation = state.conversationsById[conversationId];
      if (conversation) {
        conversation.mostRecentMessageAt = mostRecentMessageAt;
        conversation.mostRecentMessageContent = mostRecentMessageContent;
        conversation.balance = balance;
        conversation.unreadMessages = unreadMessages;
      }
    },
    showNewConversationForm(state) {
      state.newConversationModalVisible = true;
    },
    hideNewConversationForm(state) {
      state.newConversationModalVisible = false;
    },
    showConversationDetails(state) {
      state.conversationDetailsVisible = true;
    },
    hideConversationDetails(state) {
      state.conversationDetailsVisible = false;
    },
    addConversation(state, action) {
      const conversation = action.payload;
      const { id } = conversation;
      const index = state.conversations.indexOf(id);
      if (index === -1) {
        state.conversations.push(id);
      }
      state.conversationsById[id] = conversation;
    },
    removeConversationStart(state) {
      state.removing = true;
    },
    removeConversationFailure(state, action) {
      const { error } = action.payload;
      state.removing = false;
      state.error = error;
    },
    removeConversationSuccess(state, action) {
      const { id } = action.payload;
      const index = state.conversations.indexOf(id);
      if (index !== -1) {
        state.conversations.splice(index, 1);
      }
      if (state.selectedConversationId === id) {
        [state.selectedConversationId] = state.conversations;
      }
      delete state.conversationsById[id];
      state.removing = false;
    },
    fetchConversationsStart(state) {
      state.loading = true;
      state.selectedConversationId = null;
      state.conversationsById = {};
      state.conversations = [];
    },
    fetchConversationsSuccess(state, action) {
      const { conversations } = action.payload;
      state.loading = false;
      state.conversationsById = {};
      state.conversations = conversations.map(conversation => {
        state.conversationsById[conversation.id] = conversation;
        return conversation.id;
      });
      [state.selectedConversationId] = state.conversations;
    },
    fetchConversationsFailure(state, action) {
      const { error } = action.payload;
      state.loading = false;
      state.error = error;
    },
    selectConversation(state, action) {
      const { id } = action.payload;
      state.selectedConversationId = id;
      state.conversationDetailsVisible = false;
    },
    fetchConversationDetailsStart(state) {
      state.conversationDetailsLoading = true;
      state.conversationDetails = null;
    },
    fetchConversationDetailsSuccess(state, action) {
      const { conversationDetails } = action.payload;
      state.conversationDetailsLoading = false;
      state.conversationDetails = conversationDetails;
    },
    fetchConversationDetailsFailure(state, action) {
      const { error } = action.payload;
      state.conversationDetailsLoading = false;
      state.error = error;
    },
    markConversationMessagesAsReadSuccess(state, action) {
      const { conversationId } = action.payload;
      const conversation = state.conversationsById[conversationId];
      if (conversation) {
        conversation.unreadMessages = 0;
      }
    },
    updateConversationFeeLimitMSats(state, action) {
      const { conversationId, feeLimitMSats } = action.payload;
      const conversation = state.conversationsById[conversationId];
      if (conversation) {
        conversation.feeLimitMSats = feeLimitMSats;
      }
    }
  }
});

export const {
  fetchConversationsStart,
  fetchConversationsSuccess,
  fetchConversationsFailure,
  removeConversationStart,
  removeConversationSuccess,
  removeConversationFailure,
  fetchConversationDetailsStart,
  fetchConversationDetailsSuccess,
  fetchConversationDetailsFailure,
  markConversationMessagesAsReadSuccess,
  updateSearchQuery,
  updateConversationFeeLimitMSats
} = conversationsSlice.actions;

export const removeConversation = conversationId => {
  return async dispatch => {
    dispatch(removeConversationStart());

    try {
      await deleteConversation(conversationId);
      dispatch(removeConversationSuccess({ id: conversationId }));
    } catch (e) {
      dispatch(removeConversationFailure({ error: e.message }));
    }
  };
};

export const fetchConversations = walletId => {
  return async dispatch => {
    dispatch(fetchConversationsStart());
    try {
      const conversations = await readConversations(walletId);
      dispatch(fetchConversationsSuccess({ conversations }));
    } catch (e) {
      dispatch(fetchConversationsFailure({ error: e.message }));
    }
  };
};

export const fetchConversationDetails = pubkey => {
  return async dispatch => {
    dispatch(fetchConversationDetailsStart());
    const lnNode = getNodeInterface();
    try {
      const conversationDetails = await lnNode.getNodeDetails(pubkey);
      dispatch(fetchConversationDetailsSuccess({ conversationDetails }));
    } catch (e) {
      dispatch(fetchConversationDetailsFailure({ error: e.message }));
    }
  };
};

export const markConversationMessagesAsRead = conversationId => {
  return async dispatch => {
    await markConversationAsRead(conversationId);
    dispatch(markConversationMessagesAsReadSuccess({ conversationId }));
  };
};

export const {
  addConversation,
  addConversationFromMessage,
  selectConversation,
  showNewConversationForm,
  hideNewConversationForm,
  newConversationMessage,
  showConversationDetails,
  hideConversationDetails
} = conversationsSlice.actions;

export default conversationsSlice.reducer;
