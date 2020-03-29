import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Switch, Route, useParams, useRouteMatch } from 'react-router-dom';
import { walletInfoType } from '../../types';
import Wallet from './Wallet';
import Fund from '../onboarding/Fund';
import Connect from '../onboarding/Connect';
import { fetchWallet } from './walletSlice';
import Loader from '../common/Loader';
import LoadingPage from '../common/LoadingPage';
import ChatPage from '../chat/ChatPage';

const WalletPage = props => {
  const {
    error,
    loading,
    info,
    availableBalance,
    pendingBalance,
    fetchWallet,
    totalBalance,
    totalChannels,
    fundingAddress
  } = props;
  const { id } = useParams();
  const { path } = useRouteMatch();

  useEffect(() => {
    fetchWallet(parseInt(id, 10));
  }, [id]);

  if (error) {
    return <p>{error}</p>;
  }

  if (loading || !info) {
    return <LoadingPage />;
  }

  if (totalBalance === 0) {
    return <Fund fundingAddress={fundingAddress} />;
  }

  if (totalChannels === 0) {
    return <Connect walletId={parseInt(id, 10)} />;
  }

  return (
    <Switch>
      <Route exact path={path}>
        <Wallet id={parseInt(id, 10)} info={info} />
      </Route>
      <Route path={`${path}/chat`}>
        <ChatPage
          walletPubkey={info.identity_pubkey}
          walletId={parseInt(id, 10)}
          availableBalance={availableBalance}
          pendingBalance={pendingBalance}
        />
      </Route>
    </Switch>
  );
};

WalletPage.propTypes = {
  fetchWallet: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  error: PropTypes.string,
  info: walletInfoType,
  availableBalance: PropTypes.number,
  pendingBalance: PropTypes.number,
  totalBalance: PropTypes.number,
  totalChannels: PropTypes.number,
  fundingAddress: PropTypes.string
};

WalletPage.defaultProps = {
  info: null,
  error: null,
  availableBalance: null,
  pendingBalance: null,
  totalBalance: null,
  totalChannels: null,
  fundingAddress: null
};

const mapDispatchToProps = { fetchWallet };

const mapStateToProps = state => {
  const {
    loading,
    info,
    availableBalance,
    pendingBalance,
    error,
    connected,
    fundingAddress
  } = state.wallet;

  const { channels, pendingChannels } = state.channels;

  const totalChannels = channels.length + pendingChannels.length;
  const totalBalance = availableBalance + pendingBalance;
  return {
    loading,
    info,
    availableBalance,
    pendingBalance,
    error,
    connected,
    totalChannels,
    totalBalance,
    fundingAddress
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(WalletPage);
