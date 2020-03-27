import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'rmwc';

const NoConversationsFound = props => {
  const { searchQuery } = props;
  return (
    <div className="empty-conversation-list">
      <div>
        <Icon icon={{ icon: 'search', size: 'xlarge' }} />
      </div>
      <p>No conversations found matching &apos;{searchQuery}&apos;</p>
    </div>
  );
};

NoConversationsFound.propTypes = {
  searchQuery: PropTypes.string.isRequired
};

export default NoConversationsFound;
