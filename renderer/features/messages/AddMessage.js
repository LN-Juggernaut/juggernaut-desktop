import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  IconButton,
  CircularProgress,
  MenuSurfaceAnchor,
  Menu,
  MenuSurface,
  MenuItem,
  ListItemGraphic
} from 'rmwc';
import { Picker } from 'emoji-mart';
import { queue } from '../../dialogQueue';
import PaymentRequestIcon from '../images/icons/PaymentRequestIcon';
import PaymentIcon from '../images/icons/PaymentIcon';

const AddMessage = props => {
  const { balance, sendMessage } = props;
  const [state, setState] = useState({
    message: '',
    disabled: true,
    error: null,
    saving: false
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [emojiMenuOpen, setEmojiMenuOpen] = useState(false);

  const handleSendMessage = async messageParams => {
    setState({ ...state, saving: true });
    await sendMessage(messageParams);
    setState({ ...state, saving: false, message: '' });
  };

  const sendPaymentRequest = async () => {
    setMenuOpen(false);

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const paymentRequestResponse = await queue.promptForm({
        title: 'Request Payment',
        body:
          'Send a payment request by specifying how many sats you want them to pay and an optional memo.',
        inputs: [
          {
            name: 'amount',
            label: 'Amount',
            required: true,
            type: 'number'
          },
          {
            name: 'memo',
            label: 'Memo (Optional)'
          }
        ],
        acceptLabel: 'Send',
        cancelLabel: 'Cancel'
      });

      if (!paymentRequestResponse) {
        // user canceled dialog prompt
        break;
      }

      const { amount, memo } = paymentRequestResponse;
      const satAmount = parseInt(amount, 10);
      if (isNaN(satAmount) || !amount.match(/^[0-9]+$/) || satAmount <= 0) {
        queue.alert({
          title: 'Invalid Payment Request',
          body: 'Amount must be an integer greater than zero'
        });
      } else {
        handleSendMessage({
          message: `${satAmount * 1000},${memo}`,
          amount: balance,
          contentType: 'paymentrequest',
          requestIdentifier: ''
        });
        break;
      }
    }
  };

  const attachPayment = async () => {
    setMenuOpen(false);

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const paymentAmountResponse = await queue.promptForm({
        title: 'Send Money',
        body: 'How many sats would you like to send?',
        inputs: [
          {
            name: 'amount',
            label: 'Amount',
            required: true,
            type: 'number'
          },
          {
            name: 'memo',
            label: 'Memo (Optional)'
          }
        ],
        acceptLabel: 'Send',
        cancelLabel: 'Cancel'
      });

      if (!paymentAmountResponse) {
        // user canceled dialog prompt
        break;
      }

      const { amount, memo } = paymentAmountResponse;
      const satAmount = parseInt(amount, 10);
      if (isNaN(satAmount) || !amount.match(/^[0-9]+$/) || satAmount <= 0) {
        queue.alert({
          title: 'Invalid Send Amount',
          body: `Amount must be an integer greater or equal to zero`
        });
      } else {
        handleSendMessage({
          message: `${memo}`,
          amount: satAmount * 1000,
          contentType: 'payment',
          requestIdentifier: ''
        });
        break;
      }
    }
  };

  const saveMessage = async () => {
    if (state.message.length === 0) {
      return;
    }
    handleSendMessage({
      message: state.message,
      contentType: 'text',
      requestIdentifier: '',
      amount: balance
    });
  };

  return (
    <div className="addMessageWrapper">
      <MenuSurfaceAnchor>
        <Menu
          anchorCorner="bottomLeft"
          open={menuOpen}
          focusOnOpen={false}
          style={{ width: '225px', borderRadius: '10px' }}
          onMouseLeave={() => {
            setMenuOpen(false);
          }}
        >
          <MenuItem onClick={sendPaymentRequest}>
            <ListItemGraphic icon={<PaymentRequestIcon />} />
            Payment Request
          </MenuItem>
          <MenuItem onClick={attachPayment}>
            <ListItemGraphic icon={<PaymentIcon />} />
            Payment
          </MenuItem>
        </Menu>
        <IconButton
          icon="add"
          onMouseEnter={() => {
            setMenuOpen(true);
          }}
        />
      </MenuSurfaceAnchor>
      <input
        className="add-message"
        ref={input => input && input.focus()}
        disabled={state.saving}
        onChange={e => {
          setState({
            ...state,
            message: e.target.value
          });
        }}
        onKeyPress={e => {
          if (e.which === 13) {
            saveMessage();
          }
        }}
        value={state.message}
        type="text"
        name="message"
        placeholder="Write a message..."
      />
      <MenuSurfaceAnchor>
        <MenuSurface
          anchorCorner="bottomLeft"
          open={emojiMenuOpen}
          style={{ borderRadius: '10px' }}
          onMouseLeave={() => {
            setEmojiMenuOpen(false);
          }}
        >
          <Picker
            useButton={false}
            showPreview
            showSkinTones
            native
            title=""
            skinEmoji="hand"
            set="twitter"
            onSelect={emoji => {
              setState({ ...state, message: state.message + emoji.native });
            }}
          />
        </MenuSurface>
        <IconButton
          icon="insert_emoticon"
          onMouseEnter={() => {
            setEmojiMenuOpen(true);
          }}
        />
      </MenuSurfaceAnchor>

      {state.saving && <IconButton icon={<CircularProgress />} />}
      {!state.saving && (
        <IconButton
          icon="flash_on"
          disabled={state.message.length === 0}
          onClick={saveMessage}
          className="sendButton"
        />
      )}
    </div>
  );
};

AddMessage.propTypes = {
  balance: PropTypes.number.isRequired,
  sendMessage: PropTypes.func.isRequired
};

export default AddMessage;
