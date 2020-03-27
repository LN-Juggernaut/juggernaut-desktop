import React from 'react';
import PropTypes from 'prop-types';
import QRCode from 'qrcode.react';
import { Card } from 'rmwc';
import { Page, FixedHeader } from '../common';

const Fund = props => {
  const { fundingAddress } = props;
  return (
    <Page>
      <FixedHeader
        title="Fund Your Wallet"
        details="You need to add funds to your wallet before you will be able to connect to the lightning network. Please send some satoshis to your wallet address below to get started."
        imageAlt="bitcoin illustration"
        imageSrc="../resources/images/bitcoin.svg"
      />
      <Card className="fund-wrapper">
        <div>
          <QRCode className="qr-address" value={fundingAddress} />
        </div>
        <div className="address">{fundingAddress}</div>
      </Card>
    </Page>
  );
};

Fund.propTypes = {
  fundingAddress: PropTypes.string.isRequired
};

export default Fund;
