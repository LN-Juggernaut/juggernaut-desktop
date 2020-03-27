import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { TabBar, Tab, Card } from 'rmwc';
import AddConversationForm from './AddConversationForm';
import { Page, FixedHeader } from '../common';
import FilteredNodeList from '../nodes/FilteredNodeList';
import {
  addConversation,
  hideNewConversationForm,
  selectConversation
} from './conversationsSlice';
import { createConversation } from '../../../utils/db';

const SearchableAddConversation = ({ walletId }) => {
  const [activeTab, setActiveTab] = useState(0);
  const dispatch = useDispatch();

  const handleNewConversation = async ({ pubKey, alias, color }) => {
    const conversation = await createConversation(
      pubKey,
      walletId,
      alias,
      color
    );
    dispatch(addConversation(conversation));
    dispatch(hideNewConversationForm());
    dispatch(selectConversation(conversation));
  };

  return (
    <Page>
      <FixedHeader
        title="Start New Conversation"
        details="Search for someone to chat with using their alias or public key. Starting a conversation does not require opening a new channel but inorder to send a message to a node a valid route will need to exist."
      />
      <Card style={{ marginTop: '25px' }}>
        <TabBar
          activeTabIndex={activeTab}
          onActivate={evt => setActiveTab(evt.detail.index)}
        >
          <Tab>Search</Tab>
          <Tab>Pubkey</Tab>
        </TabBar>
      </Card>

      {activeTab === 1 && (
        <AddConversationForm handleNewConversation={handleNewConversation} />
      )}
      {activeTab === 0 && (
        <FilteredNodeList
          ctaText="Start Conversation"
          ctaClicked={handleNewConversation}
          viewType="simple"
        />
      )}
    </Page>
  );
};

SearchableAddConversation.propTypes = {
  walletId: PropTypes.number.isRequired
};

export default SearchableAddConversation;
