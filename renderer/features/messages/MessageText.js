import React from 'react';
import PropTypes from 'prop-types';

const MessageText = props => {
  const { content } = props;
  return <div className="message-text">{content}</div>;
};

MessageText.propTypes = {
  content: PropTypes.string.isRequired
};

export default MessageText;
