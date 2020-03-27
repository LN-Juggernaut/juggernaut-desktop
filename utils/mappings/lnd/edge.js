import mapRoutingPolicy from './routing_policy';

const mapEdge = edge => {
  const mappedEdge = {
    channelId: edge.channelId,
    chanPoint: edge.chanPoint,
    lastUpdate: edge.lastUpdate,
    node1Pub: edge.node1_pub,
    node2Pub: edge.node2_pub,
    capacity: edge.capacity,
    node1Policy: mapRoutingPolicy(edge.node1_policy),
    node2Policy: mapRoutingPolicy(edge.node2_policy)
  };

  return mappedEdge;
};

export default mapEdge;
