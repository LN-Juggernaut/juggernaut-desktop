import React from 'react';
import PropTypes from 'prop-types';
import { Select as RmwcSelect } from 'rmwc';

/* eslint-disable react/jsx-props-no-spreading */
const styles = {
  container: { margin: 10 },
  error: {
    marginTop: 5,
    fontSize: '0.8em',
    color: 'red'
  }
};

const Select = props => {
  const { error, touched } = props;
  return (
    <div style={styles.container}>
      <RmwcSelect {...props} />
      {error && touched && <div style={styles.error}>{error}</div>}
    </div>
  );
};

Select.propTypes = {
  error: PropTypes.string,
  touched: PropTypes.bool.isRequired
};

Select.defaultProps = {
  error: ''
};

export default Select;
