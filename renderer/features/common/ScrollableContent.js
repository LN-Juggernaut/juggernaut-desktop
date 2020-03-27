import React from 'react';
import PropTypes from 'prop-types';

const ScrollableContent = props => {
  const { children } = props;

  return <div className="scrollable-content">{children}</div>;
};

ScrollableContent.propTypes = {
  children: PropTypes.node.isRequired
};

export default ScrollableContent;
