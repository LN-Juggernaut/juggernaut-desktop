const mapAddress = address => {
  return {
    network: address.network,
    addr: address.addr
  };
};

export default mapAddress;
