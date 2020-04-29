import React from 'react';
import { useDispatch, connect } from 'react-redux';
import PropTypes from 'prop-types';
import { showOpenChannelModal } from '../channels/channelsSlice';
import FilteredNodeList from './FilteredNodeList';
import { Page, FixedHeader } from '../common';
import { NodeListIcon } from '../images';

const NodeListPage = ({ narrow }) => {
  const dispatch = useDispatch();

  return (
    <Page>
      <FixedHeader
        title="Open a Channel"
        details="A channel allows you to send and receive payments and messages on the lightning network with that node and anyone they are connected to."
        ImageComponent={NodeListIcon}
      />
      <FilteredNodeList
        cta={{
          label: 'Open',
          type: 'button',
          action: node => {
            dispatch(showOpenChannelModal({ pubkey: node.pubKey }));
          }
        }}
        viewType={narrow ? 'simple' : 'advanced'}
      />
    </Page>
  );
};

NodeListPage.propTypes = {
  narrow: PropTypes.bool.isRequired
};

const mapStateToProps = state => {
  return {
    narrow: state.app.narrow
  };
};

export default connect(mapStateToProps)(NodeListPage);
