import React from 'react';
import PropTypes from 'prop-types';
import { TextField as RmwcTextField } from 'rmwc';

const styles = {
  container: { margin: 10 },
  error: {
    margin: 10,
    marginTop: 5,
    fontSize: '0.8em',
    color: 'red'
  }
};

/* eslint-disable react/jsx-props-no-spreading */
const TextField = props => {
  const {
    error,
    touched,
    name,
    value,
    onChange,
    onBlur,
    onFocus,
    label,
    trailingIcon,
    type
  } = props;
  return (
    <>
      <RmwcTextField
        type={type}
        name={name}
        value={value}
        label={label}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        style={styles.container}
        trailingIcon={trailingIcon}
        tabIndex="0"
      />
      {error && touched && <div className="input-error">{error}</div>}
    </>
  );
};

TextField.propTypes = {
  error: PropTypes.string,
  touched: PropTypes.bool.isRequired,
  name: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func,
  label: PropTypes.string,
  type: PropTypes.string,
  trailingIcon: PropTypes.shape({
    icon: PropTypes.string,
    tabIndex: PropTypes.number,
    onClick: PropTypes.func
  })
};

TextField.defaultProps = {
  error: '',
  name: '',
  value: '',
  label: '',
  type: 'text',
  onChange: () => {},
  onBlur: () => {},
  onFocus: () => {},
  trailingIcon: null
};

export default TextField;
