import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Modal from '../common/Modal';
import OpenChannelForm from './OpenChannelForm';
import { fetchChannels, hideOpenChannelModal } from './channelsSlice';
import { nodeType, nodeDetailsType } from '../../types';

const OpenChannelModal = props => {
  const {
    openChannelWithNode,
    openChannelModalVisible,
    hideOpenChannelModal,
    fetchChannels
  } = props;

  const isOpen = openChannelModalVisible && openChannelWithNode;

  return (
    <Modal isOpen={isOpen} onClose={hideOpenChannelModal}>
      <OpenChannelForm
        node={openChannelWithNode}
        onSuccess={() => {
          fetchChannels();
          hideOpenChannelModal();
        }}
      />
    </Modal>
  );
};

OpenChannelModal.propTypes = {
  hideOpenChannelModal: PropTypes.func.isRequired,
  fetchChannels: PropTypes.func.isRequired,
  openChannelWithNode: PropTypes.oneOfType([nodeType, nodeDetailsType]),
  openChannelModalVisible: PropTypes.bool.isRequired
};
OpenChannelModal.defaultProps = {
  openChannelWithNode: null
};

const mapStateToProps = state => {
  const { openChannelModalVisible, openChannelWithNode } = state.channels;
  return {
    openChannelModalVisible,
    openChannelWithNode
  };
};

const mapDispatchToProps = {
  hideOpenChannelModal,
  fetchChannels
};

export default connect(mapStateToProps, mapDispatchToProps)(OpenChannelModal);
