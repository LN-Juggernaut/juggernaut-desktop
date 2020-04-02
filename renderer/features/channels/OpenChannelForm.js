import React from 'react';
import PropTypes from 'prop-types';
import { Typography, CircularProgress, Card } from 'rmwc';
import { Form, Field } from 'react-final-form';
import { FORM_ERROR } from 'final-form';
import { Button, TextField } from '../../../utils/forms';
import getNodeInterface from '../../../utils/getNodeInterface';
import errors from '../../constants/errors.json';
import { nodeType, nodeDetailsType } from '../../types';
import { Page, FixedHeader, ScrollableContent } from '../common';
import { OpenChannelIcon } from '../images';
import sharedStyles from '../../../utils/styles';

const initialValues = {
  pubkey: '',
  localSatoshis: '50000',
  remoteSatoshis: '1000',
  targetConfirmations: '1'
};

const validate = values => {
  const errors = {};
  const requiredFields = [
    { name: 'localSatoshis', label: 'Local Balance' },
    { name: 'remoteSatoshis', label: 'Remote Balance' },
    { name: 'targetConfirmations', label: 'Setup Time' }
  ];

  requiredFields.forEach(requiredField => {
    if (!values[requiredField.name]) {
      errors[requiredField.name] = `${requiredField.label} is required`;
    }
  });

  return errors;
};

const OpenChannelForm = props => {
  const { node, onSuccess } = props;
  const { addresses, pubKey } = node;
  const { addr } = addresses[0];

  const onSubmit = async values => {
    const { localSatoshis, remoteSatoshis, targetConfirmations } = values;
    const lnNode = getNodeInterface();

    try {
      await lnNode.openChannel({
        pubkey: pubKey,
        localSatoshis: parseInt(localSatoshis, 10),
        remoteSatoshis: parseInt(remoteSatoshis, 10),
        targetConfirmations: parseInt(targetConfirmations, 10),
        isPrivate: false,
        host: addr
      });
      onSuccess();
    } catch (e) {
      let errorMessage;

      if (e.message === errors.CHANNEL_TOO_SMALL) {
        errorMessage =
          'Failed to open channel because the capacity is too small.  Please increase the amounts and try again.';
      } else if (e.message === errors.PEER_IS_OFFLINE) {
        errorMessage =
          'Failed to open channel because the peer node is either offline or not in sync with the rest of the network.';
      } else {
        errorMessage =
          'Failed to open channel because something unexpected happened.  Please try again.';
      }
      return {
        [FORM_ERROR]: errorMessage
      };
    }
  };

  return (
    <Page>
      <FixedHeader
        title="Open Channel"
        details="You need to fund a channel with satoshis from your wallet.  Choose how many satoshis you'd like to place into each side of the channel."
        ImageComponent={OpenChannelIcon}
      />
      <ScrollableContent>
        <Card className="open-channel-card">
          <Form
            initialValues={initialValues}
            validate={validate}
            onSubmit={onSubmit}
          >
            {({ handleSubmit, submitting, submitError }) => (
              <form onSubmit={handleSubmit} style={sharedStyles.form}>
                <Field
                  name="localSatoshis"
                  render={({ input, meta }) => (
                    <TextField
                      {...input}
                      type="number"
                      error={meta.error}
                      touched={meta.touched}
                      label="Local Balance (satoshis)"
                    />
                  )}
                />

                <Field
                  name="remoteSatoshis"
                  render={({ input, meta }) => (
                    <TextField
                      {...input}
                      type="number"
                      error={meta.error}
                      touched={meta.touched}
                      label="Remote Balance (satoshis)"
                    />
                  )}
                />

                <Field
                  name="targetConfirmations"
                  render={({ input, meta }) => (
                    <TextField
                      {...input}
                      type="number"
                      error={meta.error}
                      touched={meta.touched}
                      label="Target Confirmations"
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
                  <Button label="Saving" disabled icon={<CircularProgress />} />
                )}
                {!submitting && (
                  <Button label="Open Channel" type="submit" unelevated />
                )}
              </form>
            )}
          </Form>
        </Card>
      </ScrollableContent>
    </Page>
  );
};

OpenChannelForm.propTypes = {
  node: PropTypes.oneOfType([nodeType, nodeDetailsType]).isRequired,
  onSuccess: PropTypes.func.isRequired
};

export default OpenChannelForm;
