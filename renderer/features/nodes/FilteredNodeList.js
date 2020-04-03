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
    lastFetch,
    filteredPubKeys
  } = props;

  const [query, setQuery] = useState('');
  const [nodes, setNodes] = useState(
    graphIndex.search({ query, filteredPubKeys })
  );

  const updateQuery = query => {
    setQuery(query);
    setNodes(graphIndex.search({ query, filteredPubKeys }));
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
  lastFetch: PropTypes.number,
  filteredPubKeys: PropTypes.arrayOf(PropTypes.string).isRequired
};

FilteredNodeList.defaultProps = {
  viewType: 'advanced',
  lastFetch: null
};

const mapStateToProps = (state, props) => {
  const { loading, lastFetch } = state.nodes;
  const { conversationsById, conversations } = state.conversations;
  const { filterConversations } = props;
  const filteredPubKeys = [];

  if (filterConversations) {
    conversations.forEach(conversationId => {
      const conversation = conversationsById[conversationId];
      filteredPubKeys.push(conversation.pubkey);
    });
  }

  return { loading, lastFetch, filteredPubKeys };
};

const mapDispatchToProps = {
  fetchNodes
};

export default connect(mapStateToProps, mapDispatchToProps)(FilteredNodeList);
