import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Conversation from './Conversation';
import ConversationDetailPage from './ConversationDetailPage';

const SelectedConversation = props => {
  const {
    id,
    alias,
    color,
    pubkey,
    displayName,
    balance,
    feeLimitMSats,
    walletPubkey,
    conversationDetailsVisible
  } = props;

  if (conversationDetailsVisible) {
    return (
      <ConversationDetailPage
        id={id}
        alias={alias}
        color={color}
        displayName={displayName}
        withPubkey={pubkey}
        walletPubkey={walletPubkey}
        balance={balance}
      />
    );
  }
  return (
    <Conversation
      id={id}
      alias={alias}
      color={color}
      displayName={displayName}
      withPubkey={pubkey}
      walletPubkey={walletPubkey}
      balance={balance}
      feeLimitMSats={feeLimitMSats}
    />
  );
};

SelectedConversation.propTypes = {
  id: PropTypes.number.isRequired,
  pubkey: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  alias: PropTypes.string.isRequired,
  displayName: PropTypes.string.isRequired,
  balance: PropTypes.number.isRequired,
  feeLimitMSats: PropTypes.number,
  walletPubkey: PropTypes.string.isRequired,
  conversationDetailsVisible: PropTypes.bool.isRequired
};

SelectedConversation.defaultProps = {
  feeLimitMSats: 10000
};

const mapStateToProps = (state, props) => {
  const { conversationsById, conversationDetailsVisible } = state.conversations;
  const { id } = props;
  const {
    alias,
    color,
    pubkey,
    displayName,
    balance,
    feeLimitMSats
  } = conversationsById[id];

  return {
    id,
    alias,
    color,
    pubkey,
    displayName,
    balance,
    feeLimitMSats,
    walletPubkey: state.wallet.info.identity_pubkey,
    conversationDetailsVisible
  };
};

export default connect(mapStateToProps)(SelectedConversation);
