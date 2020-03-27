import { createSlice } from '@reduxjs/toolkit';
import { fetchChannels } from '../channels/channelsSlice';
import { logout } from '../common/actions';
import getNodeInterface from '../../../utils/getNodeInterface';

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState: {
    transactions: [],
    loading: false,
    error: null
  },
  extraReducers: {
    [logout]: state => {
      state.transactions = [];
      state.loading = false;
      state.error = null;
    }
  },
  reducers: {
    fetchTransactionsStart(state) {
      state.loading = true;
    },
    fetchTransactionsSuccess(state, action) {
      const { transactions } = action.payload;
      state.loading = false;
      state.transactions = transactions;
    },
    fetchTransactionsFailure(state, action) {
      const { error } = action.payload;
      state.loading = false;
      state.error = error;
    }
  }
});

export const {
  fetchTransactionsStart,
  fetchTransactionsSuccess,
  fetchTransactionsFailure
} = transactionsSlice.actions;

export const fetchTransactions = () => {
  return async dispatch => {
    dispatch(fetchTransactionsStart());
    try {
      const lnNode = getNodeInterface();
      const { transactions } = await lnNode.getTransactions();
      dispatch(fetchTransactionsSuccess({ transactions }));
    } catch (e) {
      dispatch(fetchTransactionsFailure({ error: e.message }));
    }
  };
};

export const receiveTransaction = () => dispatch => {
  dispatch(fetchChannels());
};

export default transactionsSlice.reducer;
