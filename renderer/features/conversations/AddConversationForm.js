import React from 'react';
import PropTypes from 'prop-types';
import { Typography, CircularProgress, Card } from 'rmwc';
import { Form, Field } from 'react-final-form';
import { FORM_ERROR } from 'final-form';
import { Button, TextField } from '../../../utils/forms';
import getNodeInterface from '../../../utils/getNodeInterface';
import sharedStyles from '../../../utils/styles';

const initialValues = {
  pubkey: ''
};

const validate = values => {
  const errors = {};
  const requiredFields = [{ name: 'pubkey', label: 'Pubkey' }];

  requiredFields.forEach(requiredField => {
    if (!values[requiredField.name]) {
      errors[requiredField.name] = `${requiredField.label} is required`;
    }
  });

  return errors;
};

const AddConversationForm = props => {
  const { handleNewConversation } = props;

  const onSubmit = async values => {
    const { pubkey } = values;
    const lnNode = getNodeInterface();

    try {
      const { alias, color } = await lnNode.getNodeInfo(pubkey);
      handleNewConversation({ pubKey: pubkey, alias, color });
    } catch (e) {
      return {
        [FORM_ERROR]: e.message
      };
    }
  };

  return (
    <Card style={{ marginTop: '25px', padding: '5px' }}>
      <Form
        initialValues={initialValues}
        validate={validate}
        onSubmit={onSubmit}
      >
        {({ handleSubmit, submitting, submitError }) => (
          <form onSubmit={handleSubmit} style={sharedStyles.form}>
            <Field
              name="pubkey"
              render={({ input, meta }) => (
                <TextField
                  {...input}
                  error={meta.error}
                  touched={meta.touched}
                  label="PubKey"
                />
              )}
            />

            {submitError && (
              <Typography tag="div" className="global-form-error" use="body1">
                {submitError}
              </Typography>
            )}
            {submitting && (
              <Button label="Saving" disabled icon={<CircularProgress />} />
            )}
            {!submitting && <Button label="Save" type="submit" unelevated />}
          </form>
        )}
      </Form>
    </Card>
  );
};

AddConversationForm.propTypes = {
  handleNewConversation: PropTypes.func.isRequired
};

export default AddConversationForm;
