import React, { Component } from 'react';
import { Card } from 'rmwc';
import { Page, FixedHeader } from '../common';
import WalletList from './WalletList';

class WalletListPage extends Component {
  render() {
    return (
      <Page>
        <FixedHeader
          title="Your Nodes"
          details="A node is how you connect and communicate with the lightning network.  Choose which node you would like to use for this session."
        />
        <Card
          style={{
            marginTop: '25px',
            borderRadius: '10px',
            marginBottom: '15px',
            overflow: 'auto'
          }}
        >
          <WalletList />
        </Card>
      </Page>
    );
  }
}

export default WalletListPage;
