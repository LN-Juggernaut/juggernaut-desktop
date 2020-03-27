import React from 'react';
import PropTypes from 'prop-types';

const FixedContent = props => {
  const { children } = props;

  return <div className="fixed-content">{children}</div>;
};

FixedContent.propTypes = {
  children: PropTypes.node.isRequired
};

export default FixedContent;
