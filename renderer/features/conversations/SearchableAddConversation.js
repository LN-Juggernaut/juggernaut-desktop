import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { Page, FixedHeader } from '../common';
import FilteredNodeList from '../nodes/FilteredNodeList';
import {
  addConversation,
  hideNewConversationForm,
  selectConversation
} from './conversationsSlice';
import { createConversation } from '../../../utils/db';
import { NewConversationIcon } from '../images';

const SearchableAddConversation = ({ walletId }) => {
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
        details="Search for someone to chat with using their alias or public key."
        ImageComponent={NewConversationIcon}
      />

      <FilteredNodeList
        ctaText="Start Conversation"
        ctaClicked={handleNewConversation}
        viewType="simple"
        filterConversations
      />
    </Page>
  );
};

SearchableAddConversation.propTypes = {
  walletId: PropTypes.number.isRequired
};

export default SearchableAddConversation;
