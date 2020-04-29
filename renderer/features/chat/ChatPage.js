import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ConversationListHeader from '../conversations/ConversationListHeader';
import OrderedConversationList from '../conversations/OrderedConversationList';
import SelectedConversation from '../conversations/SelectedConversation';
import SearchableAddConversation from '../conversations/SearchableAddConversation';
import NoConversationSelected from '../conversations/NoConversationSelected';
import Modal from '../common/Modal';
import {
  showNewConversationForm,
  hideNewConversationForm,
  updateSearchQuery
} from '../conversations/conversationsSlice';
import './ChatPage.scss';

const ChatPage = props => {
  const {
    showNewConversationForm,
    hideNewConversationForm,
    newConversationModalVisible,
    updateSearchQuery,
    walletId,
    availableBalance,
    pendingBalance,
    searchQuery,
    selectedConversationId,
    narrow,
    selectedSide
  } = props;

  const showLeft = !narrow || selectedSide === 'left';
  const showRight = !narrow || selectedSide === 'right';

  let leftStyle = showLeft ? {} : { display: 'none' };
  const rightStyle = showRight ? {} : { display: 'none' };
  if (narrow && showLeft) {
    leftStyle = {
      width: '100%',
      minWidth: '100%',
      maxWidth: '100%'
    };
  }

  return (
    <div>
      <Modal
        isOpen={newConversationModalVisible}
        onClose={hideNewConversationForm}
      >
        <SearchableAddConversation walletId={walletId} />
      </Modal>

      <div className="chat">
        <div className="chat-left" style={leftStyle}>
          <ConversationListHeader
            showNewConversationForm={showNewConversationForm}
            walletId={walletId}
            availableBalance={availableBalance}
            pendingBalance={pendingBalance}
            updateSearchQuery={updateSearchQuery}
            searchQuery={searchQuery}
          />
          <OrderedConversationList
            walletId={walletId}
            searchQuery={searchQuery}
          />
        </div>

        <div className="chat-right" style={rightStyle}>
          {selectedConversationId && (
            <SelectedConversation id={selectedConversationId} />
          )}
          {!selectedConversationId && <NoConversationSelected />}
        </div>
      </div>
    </div>
  );
};

ChatPage.propTypes = {
  walletId: PropTypes.number.isRequired,
  newConversationModalVisible: PropTypes.bool.isRequired,
  showNewConversationForm: PropTypes.func.isRequired,
  hideNewConversationForm: PropTypes.func.isRequired,
  updateSearchQuery: PropTypes.func.isRequired,
  availableBalance: PropTypes.number.isRequired,
  pendingBalance: PropTypes.number.isRequired,
  searchQuery: PropTypes.string.isRequired,
  selectedConversationId: PropTypes.number,
  narrow: PropTypes.bool,
  selectedSide: PropTypes.string.isRequired
};

ChatPage.defaultProps = {
  selectedConversationId: null,
  narrow: null
};

const mapStateToProps = state => {
  const {
    newConversationModalVisible,
    searchQuery,
    selectedConversationId
  } = state.conversations;
  const { selectedSide } = state.chat;
  const { narrow } = state.app;
  return {
    newConversationModalVisible,
    searchQuery,
    selectedConversationId,
    narrow,
    selectedSide
  };
};

const mapDispatchToProps = {
  showNewConversationForm,
  hideNewConversationForm,
  updateSearchQuery
};

export default connect(mapStateToProps, mapDispatchToProps)(ChatPage);
