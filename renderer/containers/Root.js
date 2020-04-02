import React from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { hot } from 'react-hot-loader/root';
import { ThemeProvider } from 'rmwc';
import Routes from '../Routes';
import { defaultTheme } from '../themes';

const Root = ({ store, history }) => (
  <ThemeProvider options={defaultTheme}>
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <Routes />
      </ConnectedRouter>
    </Provider>
  </ThemeProvider>
);

Root.propTypes = {
  store: PropTypes.shape({
    dispatch: PropTypes.func.isRequired,
    subscribe: PropTypes.func.isRequired,
    getState: PropTypes.func.isRequired
  }).isRequired,
  history: PropTypes.shape({
    length: PropTypes.number.isRequired,
    action: PropTypes.string.isRequired,
    location: PropTypes.shape({
      pathname: PropTypes.string.isRequired,
      search: PropTypes.string.isRequired,
      hash: PropTypes.string.isRequired
    }).isRequired,
    listen: PropTypes.func.isRequired,
    push: PropTypes.func.isRequired
  }).isRequired
};

export default hot(Root);
