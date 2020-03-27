import mapAddress from './address';

const mapNode = node => {
  const mappedNode = {
    lastUpdate: node.last_update,
    pubKey: node.pub_key,
    alias: node.alias,
    color: node.color
  };

  if (node.addresses) {
    mappedNode.addresses = node.addresses.map(mapAddress);
  } else {
    node.addresses = [];
  }

  return mappedNode;
};

export default mapNode;
