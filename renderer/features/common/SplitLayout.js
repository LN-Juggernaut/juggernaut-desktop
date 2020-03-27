import React from 'react';
import PropTypes from 'prop-types';
import Page from './Page';
import FixedHeader from './FixedHeader';
import ScrollableContent from './ScrollableContent';

const SplitLayout = props => {
  const { HeaderContent, BodyContent } = props;

  return (
    <Page>
      <FixedHeader>
        <HeaderContent />
      </FixedHeader>
      <ScrollableContent>
        <BodyContent />
      </ScrollableContent>
    </Page>
  );
};

SplitLayout.propTypes = {
  HeaderContent: PropTypes.node.isRequired,
  BodyContent: PropTypes.node.isRequired
};

export default SplitLayout;
