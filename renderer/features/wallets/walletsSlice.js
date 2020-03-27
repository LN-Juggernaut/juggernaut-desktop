import { createSlice } from '@reduxjs/toolkit';
import { readWallets, deleteWallet } from '../../../utils/db';

const walletsSlice = createSlice({
  name: 'wallets',
  initialState: {
    walletsById: {},
    wallets: [],
    loading: false,
    removing: false,
    addWalletModalVisible: false,
    error: null,
    connectingToWalletId: null,
    connectedToWalletId: null
  },
  reducers: {
    addWallet(state, action) {
      const {
        id,
        name,
        host,
        port,
        macaroonPath,
        tlsCertPath
      } = action.payload;
      state.wallets.push(id);
      state.walletsById[id] = {
        id,
        name,
        host,
        port,
        macaroonPath,
        tlsCertPath
      };
    },
    editWallet(state, action) {
      const {
        id,
        name,
        host,
        port,
        macaroonPath,
        tlsCertPath
      } = action.payload;
      state.walletsById[id] = {
        id,
        name,
        host,
        port,
        macaroonPath,
        tlsCertPath
      };
    },
    removeWalletStart(state) {
      state.removing = true;
    },
    removeWalletFailure(state, action) {
      state.removing = false;
      state.error = action.payload;
    },
    removeWalletSuccess(state, action) {
      state.removing = false;
      const { id } = action.payload;
      const index = state.wallets.indexOf(id);
      if (index !== -1) {
        state.wallets.splice(index, 1);
      }
      delete state.walletsById[id];
    },
    fetchWalletsStart(state) {
      state.loading = true;
    },
    fetchWalletsSuccess(state, action) {
      state.loading = false;
      state.walletsById = {};
      state.wallets = action.payload.map(wallet => {
        state.walletsById[wallet.id] = wallet;
        return wallet.id;
      });
    },
    fetchWalletsFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    showAddWalletModal: state => {
      state.addWalletModalVisible = true;
    },
    hideAddWalletModal: state => {
      state.addWalletModalVisible = false;
    }
  }
});

const {
  fetchWalletsStart,
  fetchWalletsSuccess,
  fetchWalletsFailure,
  removeWalletStart,
  removeWalletSuccess,
  removeWalletFailure
} = walletsSlice.actions;

export const removeWallet = walletId => {
  return async dispatch => {
    dispatch(removeWalletStart());

    try {
      await deleteWallet(walletId);
      dispatch(removeWalletSuccess({ id: walletId }));
    } catch (e) {
      dispatch(removeWalletFailure(e.message));
    }
  };
};

export const fetchWallets = () => {
  return async dispatch => {
    dispatch(fetchWalletsStart());
    try {
      const wallets = await readWallets();
      dispatch(fetchWalletsSuccess(wallets));
    } catch (e) {
      dispatch(fetchWalletsFailure(e.message));
    }
  };
};

export const {
  addWallet,
  editWallet,
  showAddWalletModal,
  hideAddWalletModal
} = walletsSlice.actions;
export default walletsSlice.reducer;
