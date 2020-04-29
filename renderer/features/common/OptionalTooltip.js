import React from 'react';
import PropTypes from 'prop-types';
import { Tooltip } from 'rmwc';

const OptionalTooltip = ({ content, children, ...otherProps }) => {
  if (!content) {
    return children;
  }

  return (
    <Tooltip content={content} {...otherProps}>
      {children}
    </Tooltip>
  );
};

OptionalTooltip.propTypes = {
  content: PropTypes.string,
  children: PropTypes.node.isRequired
};

OptionalTooltip.defaultProps = {
  content: null
};

export default OptionalTooltip;
