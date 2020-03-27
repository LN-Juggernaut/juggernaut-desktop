import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ChannelList from './ChannelList';
import { channelType, pendingChannelType } from '../../types';
import graphIndex from '../../../utils/graphIndex';

const FilteredChannelList = props => {
  const { channels, pendingChannels, closingChannels, pubkey } = props;

  return (
    <ChannelList
      channels={channels}
      pendingChannels={pendingChannels}
      closingChannels={closingChannels}
      pubkey={pubkey}
    />
  );
};

FilteredChannelList.propTypes = {
  channels: PropTypes.arrayOf(channelType).isRequired,
  pendingChannels: PropTypes.arrayOf(pendingChannelType).isRequired,
  closingChannels: PropTypes.arrayOf(pendingChannelType).isRequired,
  pubkey: PropTypes.string
};

FilteredChannelList.defaultProps = {
  pubkey: ''
};
const mapStateToProps = (state, props) => {
  let { channels, pendingChannels, closingChannels } = state.channels;
  const { pubkey } = props;

  const mapNodeToChannel = channel => {
    return {
      ...channel,
      node: graphIndex.findByPubKey(channel.remotePubkey)
    };
  };

  channels = channels.map(mapNodeToChannel);
  pendingChannels = pendingChannels.map(mapNodeToChannel);
  closingChannels = closingChannels.map(mapNodeToChannel);

  const channelFilter = channel => {
    return pubkey === '' || !pubkey || channel.remotePubkey === pubkey;
  };

  return {
    channels: channels.filter(channelFilter),
    pendingChannels: pendingChannels.filter(channelFilter),
    closingChannels: closingChannels.filter(channelFilter)
  };
};

export default connect(mapStateToProps, {})(FilteredChannelList);
