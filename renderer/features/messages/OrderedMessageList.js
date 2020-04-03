import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Loader from '../common/Loader';
import { messageType } from '../../types';
import MessageList from './MessageList';
import { markConversationMessagesAsRead } from '../conversations/conversationsSlice';
import { fetchMessages, fetchNextPageOfMessages } from './messagesSlice';

const OrderedMessageList = props => {
  const {
    loading,
    messages,
    fetchMessages,
    fetchNextPageOfMessages,
    loadingNextPage,
    hasMorePages,
    conversationId,
    oldestMessageCreatedAt,
    walletPubkey,
    displayName,
    markConversationMessagesAsRead,
    color,
    sendMessage
  } = props;

  useEffect(() => {
    fetchMessages(conversationId);
  }, [conversationId]);

  if (loading) {
    return <Loader />;
  }

  return (
    <MessageList
      key={conversationId}
      messages={messages}
      walletPubkey={walletPubkey}
      displayName={displayName}
      color={color}
      oldestMessageCreatedAt={oldestMessageCreatedAt}
      fetchNextPageOfMessages={fetchNextPageOfMessages}
      loadingNextPage={loadingNextPage}
      hasMorePages={hasMorePages}
      conversationId={conversationId}
      sendMessage={sendMessage}
      markConversationMessagesAsRead={markConversationMessagesAsRead}
    />
  );
};

OrderedMessageList.propTypes = {
  loading: PropTypes.bool.isRequired,
  loadingNextPage: PropTypes.bool.isRequired,
  hasMorePages: PropTypes.bool.isRequired,
  oldestMessageCreatedAt: PropTypes.number.isRequired,
  messages: PropTypes.arrayOf(messageType).isRequired,
  fetchMessages: PropTypes.func.isRequired,
  fetchNextPageOfMessages: PropTypes.func.isRequired,
  conversationId: PropTypes.number.isRequired,
  walletPubkey: PropTypes.string.isRequired,
  displayName: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  sendMessage: PropTypes.func.isRequired,
  markConversationMessagesAsRead: PropTypes.func.isRequired
};

const mapStateToProps = (state, { conversationId }) => {
  const { messagesById, messagesByConversationId } = state.messages;
  const conversationMessagesState = messagesByConversationId[
    conversationId
  ] || {
    loading: false,
    loadingNextPage: false,
    hasMorePages: true,
    oldestMessageCreatedAt: Number.POSITIVE_INFINITY,
    messages: [],
    error: false
  };
  const messageObjects = conversationMessagesState.messages.map(
    messageId => messagesById[messageId]
  );

  const loading =
    conversationMessagesState.loading || !conversationMessagesState.hasFetched;
  return {
    loading,
    loadingNextPage: conversationMessagesState.loadingNextPage,
    hasMorePages: conversationMessagesState.hasMorePages,
    oldestMessageCreatedAt: conversationMessagesState.oldestMessageCreatedAt,
    messages: messageObjects
  };
};

const mapDispatchToProps = {
  fetchMessages,
  fetchNextPageOfMessages,
  markConversationMessagesAsRead
};

export default connect(mapStateToProps, mapDispatchToProps)(OrderedMessageList);
