import React from 'react';
import { Switch, Route } from 'react-router';
import routes from './constants/routes.json';
import App from './containers/App';
import HomePage from './containers/HomePage';
import WalletListPage from './features/wallets/WalletListPage';
import WalletPage from './features/wallet/WalletPage';
import Locked from './features/wallet/Locked';
import OpenChannelModal from './features/channels/OpenChannelModal';
import ManageChannelsModal from './features/channels/ManageChannelsModal';
import NodeListPageModal from './features/nodes/NodeListPageModal';
import AddWalletModal from './features/wallets/AddWalletModal';

export default () => (
  <App>
    <ManageChannelsModal />
    <NodeListPageModal />
    <OpenChannelModal />
    <AddWalletModal />
    <Switch>
      <Route path={`${routes.WALLETS}/:id/locked`} component={Locked} />
      <Route path={`${routes.WALLETS}/:id`} component={WalletPage} />
      <Route path={routes.WALLETS} component={WalletListPage} />
      <Route path={routes.HOME} component={HomePage} />
    </Switch>
  </App>
);
