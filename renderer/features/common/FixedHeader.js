import React from 'react';
import PropTypes from 'prop-types';
import { Theme, Typography, IconButton } from 'rmwc';
import { Link } from 'react-router-dom';
import BitcoinIcon from '../images/BitcoinIcon';
import Blob from '../images/Blob';
import './FixedHeader.scss';

const FixedHeader = props => {
  const {
    backDestination,
    backCallback,
    title,
    details,
    ImageComponent,
    imageWidth,
    imageHeight
  } = props;

  const hasBackButton = backCallback || backDestination;

  return (
    <div className="fixed-header">
      {hasBackButton && (
        <div className="back-button" data-tid="backButton">
          {backCallback && (
            <IconButton
              icon="arrow_back"
              label="Back"
              onClick={() => backCallback()}
            />
          )}
          {backDestination && (
            <Link to={backDestination}>
              <IconButton icon="keyboard_backspace" />
            </Link>
          )}
        </div>
      )}

      <Theme use={['primaryBg', 'onSecondary']} wrap>
        <div className="content">
          <div className="text">
            <Typography className="title" use="headline5" tag="h5">
              {title}
            </Typography>

            <Typography className="details" use="body1">
              {details}
            </Typography>
          </div>
          <Blob
            className="blob min-screen-width-800"
            alt="123"
            src="../resources/images/blob-4.png"
          />
          <div className="image">
            {ImageComponent && (
              <ImageComponent
                className="image-component min-screen-width-800"
                width={imageWidth}
                height={imageHeight}
              />
            )}
          </div>
        </div>
      </Theme>
    </div>
  );
};

FixedHeader.propTypes = {
  details: PropTypes.string,
  backDestination: PropTypes.string,
  backCallback: PropTypes.func,
  title: PropTypes.string,
  ImageComponent: PropTypes.func,
  imageWidth: PropTypes.string,
  imageHeight: PropTypes.string
};

FixedHeader.defaultProps = {
  details: null,
  backDestination: null,
  title: null,
  backCallback: null,
  ImageComponent: BitcoinIcon,
  imageWidth: '120px',
  imageHeight: '120px'
};

export default FixedHeader;
