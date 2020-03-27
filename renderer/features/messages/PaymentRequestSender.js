import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'rmwc';

const PaymentRequestSender = props => {
  const { content, response } = props;
  const [amountMSats, memo] = content.split(',');
  const amountSats = parseInt(amountMSats, 10) / 1000;
  const statusClass = response ? 'paid' : 'pending';
  const icon = response ? 'check' : 'sync';
  return (
    <div className={`message-payment-request sender ${statusClass}`}>
      <div className="icon-wrapper">
        <Icon icon={icon} />
      </div>
      <div className="content-wrapper">
        Requested {amountSats} sats
        <div className="payment-memo">&nbsp;-&nbsp;&apos;{memo}&apos;</div>
      </div>
    </div>
  );
};

PaymentRequestSender.propTypes = {
  content: PropTypes.string.isRequired,
  response: PropTypes.shape({
    amountMSats: PropTypes.number.isRequired,
    feeAmountMSats: PropTypes.number.isRequired,
    createdAt: PropTypes.number.isRequired
  })
};

PaymentRequestSender.defaultProps = {
  response: null
};

export default PaymentRequestSender;
