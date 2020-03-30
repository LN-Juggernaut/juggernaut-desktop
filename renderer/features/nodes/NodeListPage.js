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
        details="Before you can start using the lightning network you need to open your first channel. A channel allows you to send and receive payments and messages using the lightning Network. You want to connect to someone who will not charge you a lot to route payments and has enough capacity to support the payments you will make in the future."
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

export default NodeListPage;
