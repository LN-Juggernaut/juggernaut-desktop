import React from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { Button } from 'rmwc';
import { nodeDetailsType } from '../../types';
import { showOpenChannelModal } from '../channels/channelsSlice';
import FilteredChannelList from '../channels/FilteredChannelList';

const ConversationDetail = props => {
  const { conversationId, conversationDetails } = props;
  const dispatch = useDispatch();

  const { pubKey, alias } = conversationDetails;
  return (
    <div data-id={conversationId} className="conversation-detail">
      <div className="channel-list">
        <div className="channel-list-header">
          {pubKey === '' && <h2>Channels</h2>}
          {pubKey !== '' && <h2>Channels with {alias}</h2>}
          <Button
            icon="add"
            label="Open Channel"
            outlined
            onClick={() => {
              dispatch(showOpenChannelModal({ node: conversationDetails }));
            }}
          />
        </div>
        <FilteredChannelList pubkey={pubKey} />
      </div>
    </div>
  );
};

ConversationDetail.propTypes = {
  conversationId: PropTypes.number.isRequired,
  conversationDetails: nodeDetailsType.isRequired
};

export default ConversationDetail;
