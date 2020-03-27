import React from 'react';
import { useDispatch } from 'react-redux';
import { Icon } from 'rmwc';
import { showNewConversationForm } from './conversationsSlice';

const EmptyConversationList = () => {
  const dispatch = useDispatch();

  return (
    <div className="empty-conversation-list">
      <div>
        <Icon icon={{ icon: 'chat', size: 'xlarge' }} />
      </div>
      <p>
        You have no conversations yet,{' '}
        <a
          tabIndex="0"
          role="link"
          onKeyPress={() => {}}
          onClick={() => {
            dispatch(showNewConversationForm());
          }}
        >
          create one
        </a>{' '}
        to get started.
      </p>
    </div>
  );
};

export default EmptyConversationList;
