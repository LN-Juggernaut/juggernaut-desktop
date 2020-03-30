import React from 'react';
import { useDispatch } from 'react-redux';
import { showOpenChannelModal } from '../channels/channelsSlice';
import FilteredNodeList from '../nodes/FilteredNodeList';
import { Page, FixedHeader } from '../common';
import { NodeListIcon } from '../images';

const Connect = () => {
  const dispatch = useDispatch();

  return (
    <Page>
      <FixedHeader
        title="Connect To The Lightning Network"
        details="Open your first channel with a node on the network.  A channel lets you send and receive messages and payments with anyone reachable through the node you choose.  You can connect and disconnect to nodes later if you change your mind."
        ImageComponent={NodeListIcon}
      />

      <FilteredNodeList
        ctaText="Connect"
        ctaClicked={node => {
          dispatch(showOpenChannelModal({ node }));
        }}
      />
    </Page>
  );
};

export default Connect;
