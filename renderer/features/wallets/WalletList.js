import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { List, SimpleListItem } from 'rmwc';
import Loader from '../common/Loader';
import routes from '../../constants/routes.json';
import { fetchWallets, removeWallet, showAddWalletModal } from './walletsSlice';
import WalletListItem from './WalletListItem';
import { queue } from '../../dialogQueue';

class WalletList extends Component {
  componentDidMount() {
    const { fetchWallets } = this.props;
    fetchWallets();
  }

  componentDidUpdate(prevProps) {
    const {
      connected: prevConnected,
      locked: prevLocked,
      error: prevError
    } = prevProps;
    const { connected, locked, history, walletId, error } = this.props;

    if (!prevConnected && connected) {
      history.push(`${routes.WALLETS}/${walletId}/chat`);
    }

    if (!prevLocked && locked) {
      history.push(`${routes.WALLETS}/${walletId}/locked`);
    }

    if (!prevError && error) {
      queue.alert({
        title: 'Failed to launch node',
        body:
          'Please make sure you are connected to the internet and your node is online'
      });
    }
  }

  render() {
    const {
      removeWallet,
      loading,
      wallets,
      walletId,
      showAddWalletModal,
      connecting
    } = this.props;

    if (loading) {
      return <Loader />;
    }

    return (
      <List twoLine>
        {wallets.map(wallet => (
          <WalletListItem
            key={wallet.id}
            name={wallet.name}
            host={wallet.host}
            id={wallet.id}
            removeWallet={removeWallet}
            connecting={connecting}
            activeWallet={walletId === wallet.id}
          />
        ))}
        <SimpleListItem
          graphic="add"
          text="Add Node"
          secondaryText="Connect a new lightning node to Juggernaut"
          metaIcon=""
          onClick={() => showAddWalletModal()}
        />
      </List>
    );
  }
}

WalletList.propTypes = {
  loading: PropTypes.bool.isRequired,
  walletId: PropTypes.number,
  error: PropTypes.string,
  connecting: PropTypes.bool.isRequired,
  connected: PropTypes.bool.isRequired,
  locked: PropTypes.bool.isRequired,
  wallets: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired
    })
  ).isRequired,
  fetchWallets: PropTypes.func.isRequired,
  showAddWalletModal: PropTypes.func.isRequired,
  removeWallet: PropTypes.func.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired
};

WalletList.defaultProps = {
  walletId: null,
  error: null
};

const mapDispatchToProps = {
  fetchWallets,
  removeWallet,
  showAddWalletModal
};

function mapStateToProps(state) {
  const { walletId, connected, locked, connecting, error } = state.wallet;
  return {
    wallets: state.wallets.wallets.map(
      walletId => state.wallets.walletsById[walletId]
    ),
    loading: state.wallets.loading,
    error,
    walletId,
    connected,
    connecting,
    locked
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(WalletList)
);
