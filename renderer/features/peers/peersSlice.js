import { createSlice } from '@reduxjs/toolkit';
import { logout } from '../common/actions';
import getNodeInterface from '../../../utils/getNodeInterface';

const peersSlice = createSlice({
  name: 'peers',
  initialState: {
    peers: [],
    loading: false,
    error: null
  },
  extraReducers: {
    [logout]: state => {
      state.peers = [];
      state.loading = false;
      state.error = null;
    }
  },
  reducers: {
    peerOnline(state, action) {
      const { pubKey } = action.payload;
      if (state.peers.indexOf(pubKey) === -1) {
        state.peers.push(pubKey);
      }
    },
    peerOffline(state, action) {
      const { pubKey } = action.payload;
      const peerIndex = state.peers.indexOf(pubKey);
      if (peerIndex >= 0) {
        state.peers.splice(peerIndex, 1);
      }
    },
    fetchPeersStart(state) {
      state.loading = true;
    },
    fetchPeersSuccess(state, action) {
      const { peers } = action.payload;
      state.loading = false;
      state.peers = peers.map(peer => peer.pubKey);
    },
    fetchPeersFailure(state, action) {
      const { error } = action.payload;
      state.loading = false;
      state.error = error;
    }
  }
});

export const {
  peerOnline,
  peerOffline,
  fetchPeersStart,
  fetchPeersSuccess,
  fetchPeersFailure
} = peersSlice.actions;

export const fetchPeers = () => {
  return async dispatch => {
    dispatch(fetchPeersStart());
    try {
      const lnNode = getNodeInterface();
      const { peers } = await lnNode.listPeers();
      dispatch(fetchPeersSuccess({ peers }));
    } catch (e) {
      dispatch(fetchPeersFailure({ error: e.message }));
    }
  };
};

export const receivePeerEvent = ({ type, pub_key: pubKey }) => dispatch => {
  if (type === 'PEER_ONLINE') {
    dispatch(peerOnline({ pubKey }));
  } else if (type === 'PEER_OFFLINE') {
    dispatch(peerOffline({ pubKey }));
  }
};

export default peersSlice.reducer;
