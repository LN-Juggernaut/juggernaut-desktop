import { send } from 'redux-electron-ipc';
import { createSlice } from '@reduxjs/toolkit';
import { disconnectWallet } from '../wallets/WalletAPI';

const breakpoint = 600;

const appSlice = createSlice({
  name: 'app',
  initialState: {
    narrow: window.innerWidth < breakpoint
  },
  reducers: {
    screenResize: state => {
      state.narrow = window.innerWidth < breakpoint;
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
