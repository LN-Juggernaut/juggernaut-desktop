import React from 'react';
import PropTypes from 'prop-types';
import ElevatedSearchInput from '../common/ElevatedSearchInput';

const NodeListFilter = props => {
  const { query, setNodeQuery } = props;

  return (
    <ElevatedSearchInput
      query={query}
      setQuery={setNodeQuery}
      placeholder="Search by alias or pubkey"
    />
  );
};

NodeListFilter.propTypes = {
  setNodeQuery: PropTypes.func.isRequired,
  query: PropTypes.string
};

NodeListFilter.defaultProps = {
  query: ''
};

export default NodeListFilter;
