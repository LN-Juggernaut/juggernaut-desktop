import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Modal from '../common/Modal';
import NodeListPage from './NodeListPage';
import { hideNodeListPageModal } from './nodesSlice';

const NodeListPageModal = props => {
  const { nodeListPageModalVisible, hideNodeListPageModal } = props;

  if (!nodeListPageModalVisible) {
    return null;
  }

  return (
    <Modal onClose={hideNodeListPageModal}>
      <NodeListPage />
    </Modal>
  );
};

NodeListPageModal.propTypes = {
  hideNodeListPageModal: PropTypes.func.isRequired,
  nodeListPageModalVisible: PropTypes.bool.isRequired
};

const mapStateToProps = state => {
  const { nodeListPageModalVisible } = state.nodes;
  return {
    nodeListPageModalVisible
  };
};

const mapDispatchToProps = {
  hideNodeListPageModal
};

export default connect(mapStateToProps, mapDispatchToProps)(NodeListPageModal);
