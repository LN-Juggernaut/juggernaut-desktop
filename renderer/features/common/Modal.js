import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'rmwc';

const Modal = props => {
  const { children, onClose } = props;

  return (
    <div className="modal-wrapper">
      <div className="modal">
        <div className="modalHeader">
          <Icon
            icon={{ icon: 'close', size: 'large' }}
            onClick={() => onClose()}
          />
        </div>
        <div className="modalBody">{children}</div>
      </div>
      <div className="modal-footer">&nbsp;</div>
    </div>
  );
};

Modal.propTypes = {
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired
};

export default Modal;
