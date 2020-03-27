import React from 'react';
import ReactDOM from 'react-dom';
import Root from './containers/Root';
import { history, configuredStore } from './store';
import './app.global.scss';
import db from './db';
import runMigrations from './db/migrations';

runMigrations(db);
const store = configuredStore();

const MOUNT_NODE = document.getElementById('root');

const render = Component => {
  ReactDOM.render(<Component store={store} history={history} />, MOUNT_NODE);
};

render(Root);

if (module.hot) {
  module.hot.accept('./containers/Root', () => {
    render(Root);
  });
}
