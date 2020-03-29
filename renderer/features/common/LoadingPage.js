import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Loader from './Loader';

const LoadingPage = props => {
  const { message } = props;

  return (
    <div
      style={{
        height: '100vh',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <div>
        <Loader />
        <div>{message}</div>
      </div>
    </div>
  );
};

LoadingPage.propTypes = {
  message: PropTypes.string
};

LoadingPage.defaultProps = {
  message: ''
};

const mapStateToProps = state => {
  const { loadingMessage } = state.wallet;
  return {
    message: loadingMessage
  };
};
export default connect(mapStateToProps)(LoadingPage);
