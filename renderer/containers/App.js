import React from 'react';
import PropTypes from 'prop-types';

const App = props => {
  const { children } = props;
  return <>{children}</>;
};

App.propTypes = {
  children: PropTypes.node.isRequired
};

export default App;
