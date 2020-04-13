import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Form, Field } from 'react-final-form';
import { FORM_ERROR } from 'final-form';
import { Card, Typography, CircularProgress } from 'rmwc';
import { Button, TextField } from '../../../utils/forms';
import FixedHeader from '../common/FixedHeader';
import getNodeInterface from '../../../utils/getNodeInterface';
import Page from '../common/Page';
import UnlockIcon from '../images/UnlockIcon';
import routes from '../../constants/routes.json';
import sharedStyles from '../../../utils/styles';

const initialValues = {
  password: ''
};

class Locked extends Component {
  componentDidUpdate() {
    const { connected, walletId, history } = this.props;

    if (connected) {
      history.push(`${routes.WALLETS}/${walletId}/chat`);
    }
  }

  render() {
    const onSubmit = async values => {
      const { password } = values;
      const lnNode = getNodeInterface();

      try {
        await lnNode.unlock(password);
      } catch (e) {
        return {
          [FORM_ERROR]: 'Invalid password'
        };
      }
    };

    return (
      <Page>
        <FixedHeader
          title="Unlock Node"
          details="Your node is protected by a password and currently locked.  Unlock your node by entering your password below."
          ImageComponent={UnlockIcon}
        />
        <Card style={{ marginTop: '25px' }}>
          <Form initialValues={initialValues} onSubmit={onSubmit}>
            {({ handleSubmit, submitting, submitError }) => (
              <form onSubmit={handleSubmit} style={sharedStyles.form}>
                <Field
                  name="password"
                  render={({ input, meta }) => (
                    <TextField
                      {...input}
                      type="password"
                      error={meta.error}
                      touched={meta.touched}
                      label="Password"
                    />
                  )}
                />

                {submitError && (
                  <Typography
                    className="global-form-error"
                    tag="div"
                    use="body1"
                  >
                    {submitError}
                  </Typography>
                )}
                {submitting && (
                  <Button
                    label="Unlocking"
                    disabled
                    icon={<CircularProgress />}
                  />
                )}
                {!submitting && (
                  <Button label="Unlock Node" type="submit" unelevated />
                )}
              </form>
            )}
          </Form>
        </Card>
      </Page>
    );
  }
}

Locked.propTypes = {
  connected: PropTypes.bool.isRequired,
  walletId: PropTypes.number.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired
};

const mapStateToProps = state => {
  const { connected, walletId } = state.wallet;
  return {
    connected,
    walletId
  };
};

export default withRouter(connect(mapStateToProps, {})(Locked));
