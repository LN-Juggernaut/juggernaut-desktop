import React from 'react';
import FilteredChannelList from './FilteredChannelList';
import { Page, FixedHeader, ScrollableContent } from '../common';
import { ChannelListIcon } from '../images';

const ChannelsPage = () => {
  return (
    <Page>
      <FixedHeader
        title="Manage Channels"
        details="A channel lets you send unlimited messages to a node for a one time fee. It also allows you to use them to route your messages into the network."
        ImageComponent={ChannelListIcon}
      />
      <ScrollableContent>
        <FilteredChannelList />
      </ScrollableContent>
    </Page>
  );
};

ChannelsPage.propTypes = {};
ChannelsPage.defaultProps = {};

export default ChannelsPage;
