import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'rmwc';

const PaymentSender = props => {
  const { content, amountMSats } = props;
  const amountSats = Math.abs(amountMSats) / 1000;
  return (
    <div className="message-payment sender">
      <div className="icon-wrapper">
        <Icon icon="call_made" />
      </div>
      <div className="content-wrapper">
        Sent {amountSats} sats
        <div className="payment-memo">&nbsp;-&nbsp;&apos;{content}&apos;</div>
      </div>
    </div>
  );
};

PaymentSender.propTypes = {
  content: PropTypes.string.isRequired,
  amountMSats: PropTypes.number.isRequired
};

export default PaymentSender;
