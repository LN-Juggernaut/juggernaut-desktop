import React, { createRef } from 'react';
import PropTypes from 'prop-types';
import url from 'url';
import { Typography, CircularProgress } from 'rmwc';
import { useDispatch } from 'react-redux';
import { Form, Field } from 'react-final-form';
import { FORM_ERROR } from 'final-form';
import { Button, TextField } from '../../../utils/forms';
import { validWalletConnectionDetails } from './WalletAPI';
import { createWallet } from '../../../utils/db';
import { addWallet, hideAddWalletModal } from './walletsSlice';

import sharedStyles from '../../../utils/styles';

let initialValues = {
  lndconnectUri:
    'lndconnect://127.0.0.1:10001?cert=MIIB4jCCAYegAwIBAgIQZIjf9YcKuhYLFTytdLyShDAKBggqhkjOPQQDAjAxMR8wHQYDVQQKExZsbmQgYXV0b2dlbmVyYXRlZCBjZXJ0MQ4wDAYDVQQDEwVhbGljZTAeFw0yMDAxMjEyMjIwMThaFw0yMTAzMTcyMjIwMThaMDExHzAdBgNVBAoTFmxuZCBhdXRvZ2VuZXJhdGVkIGNlcnQxDjAMBgNVBAMTBWFsaWNlMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEKERJWBeTwom6HTKZvYGBiswUpvQ4wl6j2fSCPn006_Bbsgypf8UFTauK2yYZNwvua5GlnjBTDWQJZHPzE2WtqaOBgDB-MA4GA1UdDwEB_wQEAwICpDAPBgNVHRMBAf8EBTADAQH_MFsGA1UdEQRUMFKCBWFsaWNlgglsb2NhbGhvc3SCBWFsaWNlggR1bml4ggp1bml4cGFja2V0ggdidWZjb25uhwR_AAABhxAAAAAAAAAAAAAAAAAAAAABhwSsFQACMAoGCCqGSM49BAMCA0kAMEYCIQCvg2WFh8rIRfL1P52pHLZ-rKf5ol8A8VHYMBzkVhQKHQIhAKrGdlGm8Rq2zC1DnlvcpUbdaowcv6pu4Z40N0Zvl7nJ&macaroon=AgEDbG5kAusBAwoQuhhRrCe_YkW131FNi09DPxIBMBoWCgdhZGRyZXNzEgRyZWFkEgV3cml0ZRoTCgRpbmZvEgRyZWFkEgV3cml0ZRoXCghpbnZvaWNlcxIEcmVhZBIFd3JpdGUaFAoIbWFjYXJvb24SCGdlbmVyYXRlGhYKB21lc3NhZ2USBHJlYWQSBXdyaXRlGhcKCG9mZmNoYWluEgRyZWFkEgV3cml0ZRoWCgdvbmNoYWluEgRyZWFkEgV3cml0ZRoUCgVwZWVycxIEcmVhZBIFd3JpdGUaGAoGc2lnbmVyEghnZW5lcmF0ZRIEcmVhZAAABiC4M0K3XBu4s1TOn1LBzbq9TQrTh_aKP-NJk3GqMAI7zA',
  name: 'Alice',
  host: 'localhost:10001',
  macaroon:
    '/Users/jamespeerless/.polar/networks/1/volumes/lnd/alice/data/chain/bitcoin/regtest/admin.macaroon',
  cert: '/Users/jamespeerless/.polar/networks/1/volumes/lnd/alice/tls.cert'
};

initialValues = {
  lndconnectUri: '',
  name: '',
  host: '',
  macaroon: '',
  cert: ''
};

const AddWalletForm = props => {
  const dispatch = useDispatch();
  const certFileInput = createRef();
  const macaroonFileInput = createRef();
  const { activeTab } = props;

  const validate = values => {
    const errors = {};
    let requiredFields = [
      { name: 'name', label: 'Name' },
      { name: 'host', label: 'Host' },
      { name: 'macaroon', label: 'Macaroon' },
      { name: 'cert', label: 'TLS Cert' }
    ];

    if (activeTab === 0) {
      requiredFields = [
        { name: 'name', label: 'Name' },
        { name: 'lndconnectUri', label: 'LND Connect URI' }
      ];
    }

    requiredFields.forEach(requiredField => {
      if (!values[requiredField.name]) {
        errors[requiredField.name] = `${requiredField.label} is required`;
      }
    });

    return errors;
  };

  const onSubmit = async values => {
    const { name, host, macaroon, cert, lndconnectUri } = values;

    try {
      const valid = await validWalletConnectionDetails({
        host,
        macaroon,
        cert,
        lndconnectUri
      });

      if (!valid) {
        throw new Error('Could not connect to your node with those details');
      }

      let walletHost = host;

      try {
        const parsedUrl = url.parse(lndconnectUri);

        if (parsedUrl.protocol === 'lndconnect:') {
          walletHost = parsedUrl.host;
        }
      } catch (e) {
        console.log('failed to pare lndconnectUri');
      }

      const { id: walletId } = await createWallet({
        name,
        host: walletHost,
        macaroon,
        cert,
        lndconnectUri
      });
      dispatch(
        addWallet({
          id: walletId,
          name,
          host: walletHost
        })
      );
      dispatch(hideAddWalletModal());
    } catch (e) {
      return {
        [FORM_ERROR]: e.message
      };
    }
  };

  return (
    <Form initialValues={initialValues} validate={validate} onSubmit={onSubmit}>
      {({ handleSubmit, submitting, submitError }) => (
        <form onSubmit={handleSubmit} style={sharedStyles.form}>
          <Field
            name="name"
            render={({ input, meta }) => (
              <TextField
                {...input}
                type="text"
                error={meta.error}
                touched={meta.touched}
                label="Name"
              />
            )}
          />
          {activeTab === 0 && (
            <Field
              name="lndconnectUri"
              render={({ input, meta }) => (
                <TextField
                  {...input}
                  type="text"
                  error={meta.error}
                  touched={meta.touched}
                  label="LND Connect URI"
                />
              )}
            />
          )}

          {activeTab === 1 && (
            <>
              <Field
                name="host"
                render={({ input, meta }) => (
                  <TextField
                    {...input}
                    type="text"
                    error={meta.error}
                    touched={meta.touched}
                    label="Host (host:port)"
                  />
                )}
              />
              <Field
                name="macaroon"
                render={({ input, meta }) => (
                  <>
                    <TextField
                      {...input}
                      type="text"
                      error={meta.error}
                      touched={meta.touched}
                      label="Macaroon"
                      trailingIcon={{
                        icon: 'attach_file',
                        tabIndex: 0,
                        onClick: () => macaroonFileInput.current.click()
                      }}
                    />
                    <input
                      ref={macaroonFileInput}
                      type="file"
                      onChange={() =>
                        input.onChange(macaroonFileInput.current.files[0].path)
                      }
                      style={{ display: 'none' }}
                      name="macaroon_file"
                    />
                  </>
                )}
              />
              <Field
                name="cert"
                render={({ input, meta }) => (
                  <>
                    <TextField
                      {...input}
                      type="text"
                      error={meta.error}
                      touched={meta.touched}
                      label="TLS Cert"
                      trailingIcon={{
                        icon: 'attach_file',
                        tabIndex: 0,
                        onClick: () => certFileInput.current.click()
                      }}
                    />
                    <input
                      ref={certFileInput}
                      type="file"
                      onChange={() =>
                        input.onChange(certFileInput.current.files[0].path)
                      }
                      style={{ display: 'none' }}
                      name="cert_file"
                    />
                  </>
                )}
              />
            </>
          )}
          {submitError && (
            <Typography
              style={{ textAlign: 'center', color: 'red', margin: '10px' }}
              use="body1"
            >
              {submitError}
            </Typography>
          )}
          {submitting && (
            <Button
              label="Testing Connection"
              disabled
              icon={<CircularProgress />}
            />
          )}
          {!submitting && <Button label="Save" type="submit" unelevated />}
        </form>
      )}
    </Form>
  );
};

AddWalletForm.propTypes = {
  activeTab: PropTypes.number.isRequired
};

export default AddWalletForm;
