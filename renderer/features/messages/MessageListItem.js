import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { Avatar } from 'rmwc';
import { messageType } from '../../types';
import MessageText from './MessageText';
import PaymentReceiver from './PaymentReceiver';
import PaymentSender from './PaymentSender';
import PaymentRequestReceiver from './PaymentRequestReceiver';
import PaymentRequestSender from './PaymentRequestSender';

const MessageListItem = props => {
  const {
    message,
    id,
    fromMe,
    displayName,
    color,
    firstUnreadMessage,
    sendMessage,
    preimage
  } = props;
  const {
    content,
    createdAt,
    feeAmountMSats,
    contentType,
    amountMSats,
    response
  } = message;
  const feeAmountSats = parseFloat(feeAmountMSats / 1000);
  const fromName = fromMe ? 'me' : displayName;
  const fromColor = fromMe ? 'black' : color;
  const createdAtTime = moment(createdAt);
  const unreadClass = firstUnreadMessage ? 'first-unread' : '';
  const responseReceived = false;

  let MessageContentComponent = MessageText;

  if (contentType === 'payment') {
    if (fromMe) {
      MessageContentComponent = PaymentSender;
    } else {
      MessageContentComponent = PaymentReceiver;
    }
  }

  if (contentType === 'paymentrequest') {
    if (fromMe) {
      MessageContentComponent = PaymentRequestSender;
    } else {
      MessageContentComponent = PaymentRequestReceiver;
    }
  }

  return (
    <div id={id} className={`message-item ${unreadClass}`}>
      <div className="message-avatar-wrapper">
        <Avatar
          className="message-avatar"
          style={{
            backgroundColor: `${fromColor}`,
            color: 'white'
          }}
          size="large"
          name={fromName.toUpperCase()}
        />
      </div>

      <div className="message-content">
        <div className="message-author">{fromName}</div>

        <MessageContentComponent
          content={content}
          amountMSats={amountMSats}
          responseReceived={responseReceived}
          sendMessage={sendMessage}
          preimage={preimage}
          response={response}
        />
      </div>
      <div className="message-info">
        {createdAtTime.format('h:mm A')}
        {fromMe && feeAmountSats > 0 && (
          <div className="message-fee-wrapper">
            <span className="message-fee">-{feeAmountSats} sat</span>
          </div>
        )}
      </div>
    </div>
  );
};

MessageListItem.propTypes = {
  message: messageType.isRequired,
  fromMe: PropTypes.bool.isRequired,
  id: PropTypes.number.isRequired,
  displayName: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  preimage: PropTypes.string.isRequired,
  firstUnreadMessage: PropTypes.bool.isRequired,
  sendMessage: PropTypes.func.isRequired
};

export default MessageListItem;
