import React from 'react';
import PropTypes from 'prop-types';
import { Typography, IconButton } from 'rmwc';
import { Link } from 'react-router-dom';
import BitcoinIcon from '../images/BitcoinIcon';

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

      <div className="fixed-header-content">
        <div className="fixed-header-content-text">
          <Typography className="title" use="headline5" tag="h5">
            {title}
          </Typography>

          <p className="details">{details}</p>
        </div>
        <div className="fixed-header-content-image">
          {ImageComponent && (
            <ImageComponent
              className="fixed-header-image-component"
              width={imageWidth}
              height={imageHeight}
            />
          )}
        </div>
      </div>
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
