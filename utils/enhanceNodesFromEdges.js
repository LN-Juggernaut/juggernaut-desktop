const getInitialStatsObject = () => {
  return {
    channels: 0,
    capacity: {
      min: Number.POSITIVE_INFINITY,
      max: Number.NEGATIVE_INFINITY,
      avg: 0,
      sum: 0,
      count: 0
    },
    minHtlcMsat: {
      min: Number.POSITIVE_INFINITY,
      max: Number.NEGATIVE_INFINITY,
      avg: 0,
      sum: 0,
      count: 0
    },
    maxHtlcMsat: {
      min: Number.POSITIVE_INFINITY,
      max: Number.NEGATIVE_INFINITY,
      avg: 0,
      sum: 0,
      count: 0
    },
    minFeeMsat: {
      min: Number.POSITIVE_INFINITY,
      max: Number.NEGATIVE_INFINITY,
      avg: 0,
      sum: 0,
      count: 0
    }
  };
};

const updateStatsForValue = (stat, value) => {
  if (value < stat.min) {
    stat.min = value;
  }
  if (value > stat.max) {
    stat.max = value;
  }
  stat.sum += value;
  stat.count += 1;
  stat.avg = stat.sum / stat.count;
};

const updateStatsForEdgeWithPolicy = (stats, edge, policy) => {
  stats.channels += 1;
  updateStatsForValue(stats.capacity, edge.capacity / 2.0);
  if (policy) {
    const { minHtlcMsat, maxHtlcMsat, feeBaseMsat, feeRateMilliMsat } = policy;
    const fee = feeBaseMsat + (minHtlcMsat * feeRateMilliMsat) / 1000000;
    updateStatsForValue(stats.minHtlcMsat, minHtlcMsat);
    updateStatsForValue(stats.maxHtlcMsat, maxHtlcMsat);
    updateStatsForValue(stats.minFeeMsat, fee);
  }
};

const enhanceNodesFromEdges = (nodes, edges) => {
  const pubKeyNodeMap = {};
  const pubKeyEdgeMap = {};

  nodes.forEach(node => {
    node.stats = getInitialStatsObject();
    pubKeyNodeMap[node.pubKey] = node;
    pubKeyEdgeMap[node.pubKey] = [];
  });

  edges.forEach(edge => {
    const nodePubs = [edge.node1Pub, edge.node2Pub];
    const nodePolicies = [edge.node1Policy, edge.node2Policy];
    nodePubs.forEach((nodePub, index) => {
      const node = pubKeyNodeMap[nodePub];
      if (node) {
        pubKeyEdgeMap[nodePub].push(edge);
        updateStatsForEdgeWithPolicy(node.stats, edge, nodePolicies[index]);
      }
    });
  });

  const countReachableNodesWithinHops = (pubKey, hops) => {
    const visitedNodes = {};
    visitAllNodesWithinHops(pubKey, visitedNodes, hops);
    return Object.keys(visitedNodes).length;
  };

  const visitAllNodesWithinHops = (pubKey, visitedNodes, hops) => {
    visitedNodes[pubKey] = 1;
    if (hops === 0) {
      return;
    }
    const edges = pubKeyEdgeMap[pubKey];
    edges.forEach(edge => {
      const remotePub =
        pubKey === edge.node1Pub ? edge.node2Pub : edge.node1Pub;
      if (!visitedNodes[remotePub]) {
        visitAllNodesWithinHops(remotePub, visitedNodes, hops - 1);
      }
    });
  };

  Object.keys(pubKeyEdgeMap).forEach(pubKey => {
    pubKeyNodeMap[pubKey].twoHopNodes = countReachableNodesWithinHops(
      pubKey,
      2
    );
  });

  return nodes;
};

export default enhanceNodesFromEdges;
