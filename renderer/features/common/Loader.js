import React from 'react';
import PropTypes from 'prop-types';

import { CircularProgress, Icon } from 'rmwc';

const Loader = props => {
  const { color } = props;

  return (
    <div style={{ textAlign: 'center' }}>
      <Icon icon={<CircularProgress style={{ color }} />} />
    </div>
  );
};

Loader.propTypes = {
  color: PropTypes.string
};

Loader.defaultProps = {
  color: 'purple'
};

export default Loader;
