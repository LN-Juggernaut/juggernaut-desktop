import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import moment from 'moment';
import Loader from '../common/Loader';
import NodeList from './NodeList';
import NodeListFilter from './NodeListFilter';
import { fetchNodes } from './nodesSlice';
import graphIndex from '../../../utils/graphIndex';

const FilteredNodeList = props => {
  const {
    ctaText,
    ctaClicked,
    loading,
    fetchNodes,
    viewType,
    lastFetch
  } = props;

  const [query, setQuery] = useState('');
  const [nodes, setNodes] = useState(graphIndex.search({ query }));

  const updateQuery = query => {
    setQuery(query);
    setNodes(graphIndex.search({ query }));
  };

  useEffect(() => {
    if (
      moment()
        .subtract(5, 'minutes')
        .isAfter(moment(lastFetch))
    ) {
      fetchNodes();
    }
  }, []);

  useEffect(() => {
    updateQuery(query);
  }, [loading, lastFetch]);

  if (loading && !lastFetch) {
    return <Loader />;
  }

  return (
    <>
      <NodeListFilter query={query} setNodeQuery={updateQuery} />
      <NodeList
        query={query}
        nodes={nodes}
        ctaText={ctaText}
        ctaClicked={ctaClicked}
        viewType={viewType}
      />
    </>
  );
};

FilteredNodeList.propTypes = {
  ctaText: PropTypes.string.isRequired,
  ctaClicked: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  fetchNodes: PropTypes.func.isRequired,
  viewType: PropTypes.string,
  lastFetch: PropTypes.number
};

FilteredNodeList.defaultProps = {
  viewType: 'advanced',
  lastFetch: null
};

const mapStateToProps = state => {
  const { loading, lastFetch } = state.nodes;
  return { loading, lastFetch };
};

const mapDispatchToProps = {
  fetchNodes
};

export default connect(mapStateToProps, mapDispatchToProps)(FilteredNodeList);
