import { send } from 'redux-electron-ipc';
import { createSlice } from '@reduxjs/toolkit';
import { disconnectWallet } from '../wallets/WalletAPI';

const appSlice = createSlice({
  name: 'app',
  initialState: {
    screenWidth: window.innerWidth
  },
  reducers: {
    screenResize: state => {
      state.screenWidth = window.innerWidth;
    }
  }
});

export const { screenResize } = appSlice.actions;

export default appSlice.reducer;

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

export const bitcoinLinkClicked = (event, { address, options = {} }) => {
  return async dispatch => {
    const { lightning } = options;
    if (lightning) {
      dispatch(lightningLinkClicked(event, { paymentRequest: lightning }));
    } else {
      const { amount } = options;
      console.log(`user wants to send ${amount} BTC to ${address}`);
    }
  };
};

export const lightningLinkClicked = (event, { paymentRequest }) => {
  return async () => {
    console.log(
      `user wants to pay a lightning payment request ${paymentRequest}`
    );
  };
};
