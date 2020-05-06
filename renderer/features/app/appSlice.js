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
