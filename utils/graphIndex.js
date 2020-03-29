const nodes = {
  byPubKey: {},
  pubKeys: []
};

const sortBy = 'REACHABILITY';

const getSortValues = (node, sortBy) => {
  if (sortBy === 'MINIMUM_FEE_MAX') {
    return {
      value: node.stats.minFeeMsat.max,
      tiebreak: node.stats.minHtlcMsat.max
    };
  }

  if (sortBy === 'REACHABILITY') {
    return {
      value: node.twoHopNodes,
      tiebreak: node.stats.minHtlcMsat.max
    };
  }
};

const defaultSort = (nodeA, nodeB) => {
  const { value: aValue, tiebreak: aTiebreaker } = getSortValues(nodeA, sortBy);
  const { value: bValue, tiebreak: bTiebreaker } = getSortValues(nodeB, sortBy);
  if (aValue === bValue) {
    return bTiebreaker - aTiebreaker;
  }
  return bValue - aValue;
};

const addNode = node => {
  if (!nodes.byPubKey[node.pubKey]) {
    nodes.pubKeys.push(node.pubKey);
  }
  nodes.byPubKey[node.pubKey] = node;
};

const addNodes = nodes => {
  nodes.forEach(addNode);
};

const findByPubKey = pubKey => {
  return nodes.byPubKey[pubKey];
};

const search = options => {
  const { query = '', page = 0, pageSize = 25, sort = defaultSort } = options;
  return nodes.pubKeys
    .filter(pubKey => {
      const node = nodes.byPubKey[pubKey];
      return node.alias.includes(query) || node.pubKey === query;
    })
    .map(pubKey => {
      return nodes.byPubKey[pubKey];
    })
    .sort(sort)
    .slice(page * pageSize, (page + 1) * pageSize);
};

const clear = () => {
  nodes.byPubKey = {};
  nodes.pubKeys = [];
};

export default {
  addNode,
  addNodes,
  search,
  findByPubKey,
  clear
};
