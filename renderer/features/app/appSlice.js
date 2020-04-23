import { send } from 'redux-electron-ipc';
import { disconnectWallet } from '../wallets/WalletAPI';

export const terminateApp = () => {
  return async dispatch => {
    try {
      await disconnectWallet();
      dispatch(send('terminateAppSuccess'));
    } catch (e) {
      dispatch(send('terminateAppFailure'));
    }
  };
};
