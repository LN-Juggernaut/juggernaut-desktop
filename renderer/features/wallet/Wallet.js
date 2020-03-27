import React from 'react';
import PropTypes from 'prop-types';
import { useRouteMatch, Link } from 'react-router-dom';
import routes from '../../constants/routes.json';
import { walletInfoType } from '../../types';

const Wallet = props => {
  const { id, info } = props;
  const { url } = useRouteMatch();

  return (
    <div>
      <div>WalletID: {id}</div>
      <div>Pubkey: {info.identity_pubkey}</div>
      <div>Version: {info.version}</div>
      <div>Alias: {info.alias}</div>
      <div>Color: {info.color}</div>
      <div>Active Channels: {info.num_active_channels}</div>
      <div>Synced: {info.synced_to_chain.toString()}</div>
      <div>Testnet: {info.testnet.toString()}</div>
      <Link to={`${url}/chat`}>Open Chat</Link>
      <Link to={routes.WALLETS}>Back to Wallets</Link>
    </div>
  );
};

Wallet.propTypes = {
  id: PropTypes.number.isRequired,
  info: walletInfoType.isRequired
};

export default Wallet;
