import { createSlice } from '@reduxjs/toolkit';
import { logout } from '../common/actions';
import getNodeInterface from '../../../utils/getNodeInterface';
import graphIndex from '../../../utils/graphIndex';

const nodesSlice = createSlice({
  name: 'nodes',
  initialState: {
    lastFetch: null,
    nodeListPageModalVisible: false,
    loading: false,
    error: null
  },
  extraReducers: {
    [logout]: state => {
      state.loading = false;
      state.lastFetch = null;
      state.nodeListPageModalVisible = false;
      state.error = null;
      graphIndex.clear();
    }
  },
  reducers: {
    showNodeListPageModal: state => {
      state.nodeListPageModalVisible = true;
    },
    hideNodeListPageModal: state => {
      state.nodeListPageModalVisible = false;
    },
    fetchNodesStart(state) {
      state.loading = true;
    },
    fetchNodesSuccess(state, action) {
      const { nodes } = action.payload;
      state.loading = false;
      state.error = null;
      graphIndex.addNodes(nodes);
      state.lastFetch = new Date().getTime();
    },
    fetchNodesFailure(state, action) {
      const { error } = action.payload;
      state.loading = false;
      state.error = error;
    }
  }
});

export const {
  showNodeListPageModal,
  hideNodeListPageModal,
  fetchNodesStart,
  fetchNodesSuccess,
  fetchNodesFailure
} = nodesSlice.actions;

export const fetchNodes = () => {
  return async dispatch => {
    dispatch(fetchNodesStart());
    const lnNode = getNodeInterface();
    try {
      const nodes = await lnNode.getAllNodes();
      dispatch(fetchNodesSuccess({ nodes }));
    } catch (e) {
      dispatch(fetchNodesFailure({ error: e.message }));
    }
  };
};

export default nodesSlice.reducer;
