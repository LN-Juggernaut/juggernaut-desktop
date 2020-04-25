import React from 'react';
import { useDispatch } from 'react-redux';
import { showOpenChannelModal } from '../channels/channelsSlice';
import FilteredNodeList from './FilteredNodeList';
import { Page, FixedHeader } from '../common';
import { NodeListIcon } from '../images';

const NodeListPage = () => {
  const dispatch = useDispatch();

  return (
    <Page>
      <FixedHeader
        title="Open a Channel"
        details="A channel allows you to send and receive payments and messages on the lightning network with that node and anyone they are connected to."
        ImageComponent={NodeListIcon}
      />
      <FilteredNodeList
        ctaText="Open"
        ctaClicked={node => {
          dispatch(showOpenChannelModal({ pubkey: node.pubKey }));
        }}
      />
    </Page>
  );
};

export default NodeListPage;
