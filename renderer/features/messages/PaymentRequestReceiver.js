import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'rmwc';
import { queue } from '../../dialogQueue';

const PaymentRequestReceiver = props => {
  const { content, sendMessage, preimage, response } = props;
  const [amountMSats, memo] = content.split(',');
  const intAmountMSats = parseInt(amountMSats, 10);
  const amountSats = intAmountMSats / 1000;
  const [saving, setSaving] = useState(false);
  const statusClass = response ? 'paid' : 'pending';
  const wantsOrWanted = response ? 'Wanted' : 'Wants';
  const handleSendMessage = async () => {
    setSaving(true);
    const response = await queue.confirm({
      title: 'Are you sure you?',
      body: `You are about to send ${amountSats} sats.`
    });

    if (response) {
      await sendMessage({
        message: '',
        amount: intAmountMSats,
        contentType: 'payment',
        requestIdentifier: preimage.substr(0, 8)
      });
    }
    setSaving(false);
  };

  return (
    <div className={`message-payment-request receiver ${statusClass}`}>
      <div className="icon-wrapper">
        {response && <Icon icon="check" />}
        {!response && !saving && (
          <span
            tabIndex="0"
            onKeyPress={() => {}}
            role="button"
            onClick={handleSendMessage}
          >
            Pay Request
          </span>
        )}
      </div>
      <div className="content-wrapper">
        {wantsOrWanted} you to pay {amountSats} sats
        {memo && (
          <div className="payment-memo">&nbsp;-&nbsp;&apos;{memo}&apos;</div>
        )}
      </div>
    </div>
  );
};

PaymentRequestReceiver.propTypes = {
  content: PropTypes.string.isRequired,
  sendMessage: PropTypes.func.isRequired,
  preimage: PropTypes.string.isRequired,
  response: PropTypes.shape({
    amountMSats: PropTypes.number.isRequired,
    feeAmountMSats: PropTypes.number.isRequired,
    createdAt: PropTypes.number.isRequired
  })
};

PaymentRequestReceiver.defaultProps = {
  response: null
};

export default PaymentRequestReceiver;
