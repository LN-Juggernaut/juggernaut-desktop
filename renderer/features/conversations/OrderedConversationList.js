import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Loader from '../common/Loader';
import { conversationType } from '../../types';
import ConversationList from './ConversationList';
import { fetchConversations, selectConversation } from './conversationsSlice';

const OrderedConversationList = props => {
  const {
    loading,
    selectedConversationId,
    conversations,
    fetchConversations,
    selectConversation,
    walletId,
    searchQuery
  } = props;

  useEffect(() => {
    fetchConversations(walletId);
  }, [walletId]);

  if (loading) {
    return <Loader />;
  }

  return (
    <ConversationList
      conversations={conversations}
      selectedConversationId={selectedConversationId}
      selectConversation={selectConversation}
      searchQuery={searchQuery}
    />
  );
};

OrderedConversationList.propTypes = {
  loading: PropTypes.bool.isRequired,
  selectedConversationId: PropTypes.number,
  conversations: PropTypes.arrayOf(conversationType).isRequired,
  fetchConversations: PropTypes.func.isRequired,
  selectConversation: PropTypes.func.isRequired,
  walletId: PropTypes.number.isRequired,
  searchQuery: PropTypes.string.isRequired
};

OrderedConversationList.defaultProps = {
  selectedConversationId: null
};

const orderConversations = conversations => {
  return conversations.sort((a, b) => {
    if (!a.mostRecentMessageAt) {
      return 1;
    }
    if (!b.mostRecentMessageAt) {
      return -1;
    }
    return b.mostRecentMessageAt - a.mostRecentMessageAt;
  });
};

const mapStateToProps = (state, props) => {
  const {
    loading,
    selectedConversationId,
    conversations,
    conversationsById
  } = state.conversations;

  const { searchQuery } = props;
  const conversationObjects = conversations
    .map(conversationId => conversationsById[conversationId])
    .filter(conversation => {
      return conversation.displayName.indexOf(searchQuery) >= 0;
    });

  const orderedConversations = orderConversations(conversationObjects);

  return {
    loading,
    selectedConversationId,
    conversations: orderedConversations
  };
};

const mapDispatchToProps = {
  fetchConversations,
  selectConversation
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OrderedConversationList);
