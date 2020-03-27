import React from 'react';
import { Button as RmwcBtn } from 'rmwc';

const styles = { btn: { margin: 10 } };

/* eslint-disable react/jsx-props-no-spreading */
const Button = props => {
  return <RmwcBtn style={styles.btn} {...props} />;
};

export default Button;
