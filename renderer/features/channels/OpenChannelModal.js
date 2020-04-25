import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Modal from '../common/Modal';
import OpenChannelForm from './OpenChannelForm';
import { fetchChannels, hideOpenChannelModal } from './channelsSlice';

const OpenChannelModal = props => {
  const {
    openChannelWithPubkey,
    openChannelModalVisible,
    hideOpenChannelModal,
    fetchChannels
  } = props;

  // Without explicitly casting openChannelWithPubkey, isOpen might be object
  const isOpen = openChannelModalVisible && !!openChannelWithPubkey;

  return (
    <Modal isOpen={isOpen} onClose={hideOpenChannelModal}>
      {isOpen && (
        <OpenChannelForm
          pubkey={openChannelWithPubkey}
          onSuccess={() => {
            fetchChannels();
            hideOpenChannelModal();
          }}
        />
      )}
    </Modal>
  );
};

OpenChannelModal.propTypes = {
  hideOpenChannelModal: PropTypes.func.isRequired,
  fetchChannels: PropTypes.func.isRequired,
  openChannelWithPubkey: PropTypes.string,
  openChannelModalVisible: PropTypes.bool.isRequired
};

OpenChannelModal.defaultProps = {
  openChannelWithPubkey: null
};

const mapStateToProps = state => {
  const { openChannelModalVisible, openChannelWithPubkey } = state.channels;
  return {
    openChannelModalVisible,
    openChannelWithPubkey
  };
};

const mapDispatchToProps = {
  hideOpenChannelModal,
  fetchChannels
};

export default connect(mapStateToProps, mapDispatchToProps)(OpenChannelModal);
