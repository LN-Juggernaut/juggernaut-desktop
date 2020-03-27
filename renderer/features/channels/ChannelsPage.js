import React from 'react';
import { Button } from 'rmwc';
import { useDispatch } from 'react-redux';
import { showNodeListPageModal } from '../nodes/nodesSlice';
import FilteredChannelList from './FilteredChannelList';
import { Page, FixedHeader, FixedContent, ScrollableContent } from '../common';

const ChannelsPage = () => {
  const dispatch = useDispatch();
  return (
    <Page>
      <FixedHeader
        title="Manage Channels"
        details="A channel lets you open a direct connection to a node for a one time fee. Once the channel is open you will be able to send unlimited messages to that node without any additional routing fees. You will also be able to use this channel as a new path to route messages to other nodes through."
      />
      <FixedContent>
        <div className="open-channel-btn-wrapper">
          <Button
            icon="add"
            label="Open Channel"
            outlined
            onClick={() => {
              dispatch(showNodeListPageModal());
            }}
          />
        </div>
      </FixedContent>
      <ScrollableContent>
        <FilteredChannelList />
      </ScrollableContent>
    </Page>
  );
};

ChannelsPage.propTypes = {};
ChannelsPage.defaultProps = {};

export default ChannelsPage;
