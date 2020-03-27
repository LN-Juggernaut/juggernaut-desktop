import React from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import OrderedMessageList from '../messages/OrderedMessageList';
import ConversationHeader from './ConversationHeader';
import AddMessage from '../messages/AddMessage';
import { createMessage, createMessageResponse } from '../../../utils/db';
import extractMessagePreview from '../../../utils/extractMessagePreview';
import getNodeInterface from '../../../utils/getNodeInterface';
import { addMessage, updateMessage } from '../messages/messagesSlice';
import { newConversationMessage } from './conversationsSlice';
import { updateAvailableBalance } from '../wallet/walletSlice';
import { queue } from '../../dialogQueue';
import errors from '../../constants/errors.json';

const Conversation = props => {
  const {
    id,
    color,
    withPubkey,
    walletPubkey,
    displayName,
    balance,
    feeLimitMSats
  } = props;
  const dispatch = useDispatch();

  const sendMessage = async ({
    message,
    amount,
    contentType,
    requestIdentifier
  }) => {
    if (contentType === 'text' && message.length === 0) {
      return;
    }
    if (contentType === 'payment' && (!amount || amount <= 0)) {
      return;
    }

    const createdAt = new Date().getTime();

    try {
      const lnNode = getNodeInterface();
      const {
        amountMSats,
        feeAmountMSats,
        preimage
      } = await lnNode.sendMessageToPubKey(
        message,
        contentType,
        requestIdentifier,
        withPubkey,
        amount,
        feeLimitMSats
      );

      const satsSpent = (feeAmountMSats + amountMSats) / 1000;
      if (requestIdentifier && requestIdentifier !== '') {
        const { requestMessage, response } = await createMessageResponse({
          conversationId: id,
          createdAt,
          preimage,
          feeAmountMSats,
          senderPubkey: walletPubkey,
          receiverPubkey: withPubkey,
          content: message,
          contentType,
          requestIdentifier,
          amountMSats: amountMSats * -1,
          unread: false
        });

        dispatch(
          updateMessage({
            id: requestMessage.id,
            conversationId: id,
            response
          })
        );
      } else {
        const messageResponse = await createMessage({
          conversationId: id,
          createdAt,
          preimage,
          feeAmountMSats,
          senderPubkey: walletPubkey,
          receiverPubkey: withPubkey,
          content: message,
          contentType,
          requestIdentifier,
          amountMSats: amountMSats * -1,
          unread: false
        });

        dispatch(
          addMessage({
            id: messageResponse.id,
            conversationId: id,
            receiverPubkey: withPubkey,
            senderPubkey: walletPubkey,
            content: message,
            preimage,
            contentType,
            requestIdentifier,
            unread: false,
            amountMSats: messageResponse.amountMSats,
            feeAmountMSats: messageResponse.feeAmountMSats,
            createdAt
          })
        );

        dispatch(
          newConversationMessage({
            mostRecentMessageContent: extractMessagePreview(
              message,
              contentType
            ),
            mostRecentMessageAt: createdAt,
            balance: messageResponse.balance,
            unreadMessages: messageResponse.unreadMessages,
            conversationId: id
          })
        );

        dispatch(
          updateAvailableBalance({
            balanceAdjustment: -1 * satsSpent
          })
        );
      }
    } catch (e) {
      if (e.message === 'FAILED_NO_ROUTE') {
        await queue.alert({
          title: 'Failed to send message',
          body:
            'Could not find a route for the current fee limit.  Try opening some channels or increasing the fee limit and sending again.'
        });
      } else if (e.message === 'FAILED_INSUFFICIENT_BALANCE') {
        await queue.alert({
          title: 'Failed to send message',
          body:
            'Could not find a route.  Try opening a channel to connect to the network.'
        });
      } else if (e.message === errors.OLD_LND_VERSION) {
        await queue.alert({
          title: 'Failed to send message',
          body:
            'It appears you are using an unsupported version of LND.  Please upgrade to at least version 0.9.0'
        });
      } else {
        console.log(e);
        await queue.alert({
          title: 'Failed to send message',
          body: 'The destination node does not support receiving messages.'
        });
      }
    }
  };

  return (
    <div className="conversationWrapper">
      <ConversationHeader
        id={id}
        color={color}
        displayName={displayName}
        balance={balance}
        feeLimitMSats={feeLimitMSats}
      />
      <OrderedMessageList
        conversationId={id}
        walletPubkey={walletPubkey}
        displayName={displayName}
        color={color}
        sendMessage={sendMessage}
      />
      <AddMessage key={id} balance={balance} sendMessage={sendMessage} />
    </div>
  );
};

Conversation.propTypes = {
  id: PropTypes.number.isRequired,
  withPubkey: PropTypes.string.isRequired,
  walletPubkey: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  displayName: PropTypes.string.isRequired,
  balance: PropTypes.number.isRequired,
  feeLimitMSats: PropTypes.number
};

Conversation.defaultProps = {
  feeLimitMSats: 10000
};

export default Conversation;
