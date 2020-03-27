import React, { useEffect, useState, useLayoutEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { IconButton } from 'rmwc';
import moment from 'moment';
import { messageType } from '../../types';
import MessageListItem from './MessageListItem';

const LOAD_MORE_BUFFER = 200;
const SCROLL_TO_BOTTOM_BUFFER = 400;

const MessageList = props => {
  const {
    messages,
    walletPubkey,
    displayName,
    color,
    conversationId,
    loadingNextPage,
    oldestMessageCreatedAt,
    hasMorePages,
    fetchNextPageOfMessages,
    markConversationMessagesAsRead,
    sendMessage
  } = props;

  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const listContainerEl = React.createRef();
  const prevFirstMessageIdRef = useRef();
  const prevOldestCreatedAtRef = useRef();

  const setPreviousOldestCreatedAtRef = () => {
    prevOldestCreatedAtRef.current = oldestMessageCreatedAt;
  };
  useEffect(setPreviousOldestCreatedAtRef);
  const prevOldestCreatedAt = prevOldestCreatedAtRef.current;

  const prevFirstMessageId = prevFirstMessageIdRef.current;
  let prevFirstMessageTop = null;
  if (prevFirstMessageId) {
    const prevFirstMessageEl = document.getElementById(prevFirstMessageId);
    prevFirstMessageTop = prevFirstMessageEl.scrollTop;
  }

  const canLoadMoreMessages = () => {
    return (
      listContainerEl.current &&
      listContainerEl.current.scrollTop <= LOAD_MORE_BUFFER &&
      !loadingNextPage &&
      hasMorePages
    );
  };

  const updateShowScrollToBottom = () => {
    if (listContainerEl.current) {
      const { scrollTop, scrollHeight, offsetHeight } = listContainerEl.current;
      setShowScrollToBottom(
        scrollHeight - SCROLL_TO_BOTTOM_BUFFER - scrollTop - offsetHeight >= 0
      );
    }
  };

  const onScroll = () => {
    updateShowScrollToBottom();
    if (canLoadMoreMessages()) {
      fetchNextPageOfMessages(conversationId);
    }
  };

  const scrollToBottom = () => {
    if (listContainerEl.current) {
      listContainerEl.current.scrollTo({
        top: listContainerEl.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  const scrollToUnread = () => {
    if (listContainerEl.current) {
      const unreadDivider = document.querySelectorAll('.first-unread')[0];
      if (unreadDivider) {
        markConversationMessagesAsRead(conversationId);
        listContainerEl.current.scrollTo({
          top: listContainerEl.current.scrollHeight
        });
      } else {
        listContainerEl.current.scrollTo({
          top: listContainerEl.current.scrollHeight
        });
      }
    }
  };
  const scrollToNewMessage = () => {
    if (oldestMessageCreatedAt === prevOldestCreatedAt) {
      listContainerEl.current.scrollTo({
        top: listContainerEl.current.scrollHeight
      });
      markConversationMessagesAsRead(conversationId);
    }
  };

  const addScrollEventListener = () => {
    updateShowScrollToBottom();
    if (listContainerEl.current) {
      listContainerEl.current.addEventListener('scroll', onScroll, {
        passive: true
      });
    }

    return () => {
      if (listContainerEl.current) {
        listContainerEl.current.removeEventListener('scroll', onScroll);
      }
    };
  };

  const maintainScrollPosition = () => {
    if (messages && messages.length > 0) {
      if (prevFirstMessageId) {
        const newTop = document.getElementById(prevFirstMessageId).offsetTop;
        listContainerEl.current.scrollTop =
          LOAD_MORE_BUFFER + newTop - prevFirstMessageTop - 110;
      }
      prevFirstMessageIdRef.current = messages[0].id;
    }
  };

  useEffect(addScrollEventListener);
  useEffect(scrollToUnread, [conversationId]);
  useEffect(scrollToNewMessage, [messages.length]);
  useLayoutEffect(maintainScrollPosition, [
    conversationId,
    oldestMessageCreatedAt
  ]);

  if (messages.length === 0) {
    return (
      <div className="empty-message-list-wrapper">No messages here yet</div>
    );
  }

  const groupMessagesByDay = messages => {
    const groups = [];
    let group = { day: null, messages: [] };
    const today = moment().format('dddd, MMMM Do');
    const yesterday = moment()
      .subtract(1, 'day')
      .format('dddd, MMMM Do');
    messages.forEach(message => {
      const messageDay = moment(message.createdAt).format('dddd, MMMM Do');
      let dayDisplay;

      if (messageDay === today) {
        dayDisplay = 'Today';
      } else if (messageDay === yesterday) {
        dayDisplay = 'Yesterday';
      } else {
        dayDisplay = messageDay;
      }
      if (group.day !== dayDisplay) {
        if (group.messages.length > 0) {
          groups.push(group);
        }
        group = { day: dayDisplay, messages: [] };
      }
      group.messages.push(message);
    });

    if (group.messages.length > 0) {
      groups.push(group);
    }

    return groups;
  };

  const messageGroups = groupMessagesByDay(messages);

  return (
    <div className="message-list-wrapper" ref={listContainerEl}>
      <div className="scrollToBottom">
        {showScrollToBottom && (
          <IconButton
            icon="expand_more"
            onClick={e => {
              e.stopPropagation();
              scrollToBottom();
            }}
          />
        )}
      </div>
      <div className="message-list">
        {messageGroups.map(messageGroup => (
          <div className="message-list-group" key={messageGroup.day}>
            <div className="message-list-group-subheader">
              <span className="day-wrapper">{messageGroup.day}</span>
            </div>
            {messageGroup.messages.map((message, index) => {
              const prevMessage = messageGroup.messages[index - 1];
              const firstUnreadMessage = prevMessage
                ? !prevMessage.unread && message.unread
                : message.unread;
              return (
                <MessageListItem
                  key={message.id}
                  id={message.id}
                  message={message}
                  displayName={displayName}
                  color={color}
                  preimage={message.preimage}
                  fromMe={walletPubkey === message.senderPubkey}
                  firstUnreadMessage={firstUnreadMessage}
                  sendMessage={sendMessage}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

MessageList.propTypes = {
  loadingNextPage: PropTypes.bool.isRequired,
  fetchNextPageOfMessages: PropTypes.func.isRequired,
  hasMorePages: PropTypes.bool.isRequired,
  oldestMessageCreatedAt: PropTypes.number.isRequired,
  messages: PropTypes.arrayOf(messageType),
  walletPubkey: PropTypes.string.isRequired,
  displayName: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  conversationId: PropTypes.number.isRequired,
  sendMessage: PropTypes.func.isRequired,
  markConversationMessagesAsRead: PropTypes.func.isRequired
};

MessageList.defaultProps = {
  messages: []
};

export default MessageList;
