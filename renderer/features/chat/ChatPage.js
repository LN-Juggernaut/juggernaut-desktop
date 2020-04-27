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
    selectedConversationId
  } = props;

  return (
    <div>
      <Modal
        isOpen={newConversationModalVisible}
        onClose={hideNewConversationForm}
      >
        <SearchableAddConversation walletId={walletId} />
      </Modal>

      <div className="chat">
        <div className="chatLeft">
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
        <div className="chatRight">
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
  selectedConversationId: PropTypes.number
};

ChatPage.defaultProps = {
  selectedConversationId: null
};

const mapStateToProps = state => {
  const {
    newConversationModalVisible,
    searchQuery,
    selectedConversationId
  } = state.conversations;
  return {
    newConversationModalVisible,
    searchQuery,
    selectedConversationId
  };
};

const mapDispatchToProps = {
  showNewConversationForm,
  hideNewConversationForm,
  updateSearchQuery
};

export default connect(mapStateToProps, mapDispatchToProps)(ChatPage);
