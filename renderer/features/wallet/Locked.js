import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { useParams } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { IconButton, CircularProgress } from 'rmwc';
import routes from '../../constants/routes.json';
import { unlockWallet } from '../wallets/WalletAPI';

class Locked extends Component {
  componentDidUpdate() {
    const { id } = useParams();
    const { connected, history } = this.props;

    if (connected) {
      history.push(`${routes.WALLETS}/${id}/chat`);
    }
  }

  render() {
    const [state, setState] = React.useState({
      password: '',
      disabled: true,
      error: null,
      saving: false
    });

    const tryUnlock = async () => {
      setState({ ...state, saving: true });

      await unlockWallet(state.password);
    };
    return (
      <div>
        <input
          ref={input => input && input.focus()}
          disabled={state.saving}
          onChange={e => {
            setState({
              ...state,
              password: e.target.value
            });
          }}
          onKeyPress={e => {
            if (e.which === 13) {
              tryUnlock();
            }
          }}
          value={state.password}
          type="password"
          name="password"
          placeholder="Enter wallet password to unlock"
        />
        {state.error && <p>{state.error}</p>}
        {state.saving && <IconButton icon={<CircularProgress />} />}
        {!state.saving && (
          <IconButton
            icon="send"
            disabled={state.password.length === 0}
            onClick={tryUnlock}
          />
        )}
      </div>
    );
  }
}

Locked.propTypes = {
  connected: PropTypes.bool.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired
};

const mapStateToProps = state => {
  const { connected } = state.wallet;
  return {
    connected
  };
};

export default withRouter(connect(mapStateToProps, {})(Locked));
