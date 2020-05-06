import {
  shape,
  number,
  string,
  bool,
  arrayOf,
  oneOf,
  func,
  oneOfType,
  node
} from 'prop-types';

export const messageType = shape({
  id: number.isRequired,
  conversationId: number.isRequired,
  contentType: string.isRequired,
  createdAt: number.isRequired,
  senderPubkey: string.isRequired,
  receiverPubkey: string.isRequired,
  content: string.isRequired,
  unread: bool.isRequired,
  amountMSats: number.isRequired,
  feeAmountMSats: number.isRequired,
  response: shape({
    amountMSats: number.isRequired,
    feeAmountMSats: number.isRequired,
    createdAt: number.isRequired
  })
});

export const conversationType = shape({
  id: number.isRequired,
  walletId: number.isRequired,
  pubkey: string.isRequired,
  mostRecentMessageContent: string,
  mostRecentMessageAt: number,
  unreadMessages: number,
  alias: string,
  color: string,
  avatar: string
});

export const conversationTypeDefaults = {
  color: 'black',
  alias: '',
  mostRecentMessageContent: null,
  mostRecentMessageAt: null,
  unreadMessages: 0,
  avatar: null
};

export const walletType = shape({
  id: number.isRequired,
  host: string,
  macaroonPath: string,
  tlsCertPath: string,
  lndConnect: string
});

export const walletTypeDefaults = {
  host: '',
  macaroonPath: '',
  tlsCertPath: '',
  lndConnect: ''
};

export const walletInfoType = shape({
  version: string.isRequired,
  identity_pubkey: string.isRequired,
  alias: string.isRequired,
  color: string.isRequired,
  num_active_channels: number.isRequired,
  synced_to_chain: bool.isRequired,
  testnet: bool.isRequired
});

export const walletBalanceType = shape({
  total_balance: number.isRequired,
  confirmed_balance: number.isRequired,
  unconfirmed_balance: number.isRequired
});

export const channelBalanceType = shape({
  balance: number.isRequired,
  pending_open_balance: number.isRequired
});

export const nodePolicyType = shape({
  timeLockDelta: number.isRequired,
  minHtlc: number.isRequired,
  feeBaseMsat: number.isRequired,
  feeRateMilliMsat: number.isRequired,
  disabled: bool.isRequired,
  maxHtlcMsat: number.isRequired,
  lastUpdate: number.isRequired
});

export const nodeAddressType = shape({
  addr: string.isRequired,
  network: string.isRequired
});

export const nodeStatType = shape({
  min: number.isRequired,
  max: number.isRequired,
  avg: number.isRequired,
  sum: number.isRequired,
  count: number.isRequired
});

export const nodeStatsType = shape({
  channels: number.isRequired,
  capacity: nodeStatType,
  minHtlcMsat: nodeStatType,
  maxHtlcMsat: nodeStatType,
  minFeeMsat: nodeStatType
});

export const nodeType = shape({
  lastUpdate: number.isRequired,
  pubKey: string.isRequired,
  alias: string.isRequired,
  color: string.isRequired,
  addresses: arrayOf(nodeAddressType),
  stats: nodeStatsType,
  twoHopNodes: number.isRequired
});

export const remoteChannelType = shape({
  channelId: number.isRequired,
  chanPoint: string.isRequired,
  lastUpdate: number.isRequired,
  node1Pub: string.isRequired,
  node2Pub: string.isRequired,
  capacity: number.isRequired,
  node1Policy: nodePolicyType,
  node2Policy: nodePolicyType
});

export const pendingHtlcType = shape({
  incoming: bool.isRequired,
  amount: number.isRequired,
  hashLock: string.isRequired,
  expirationHeight: number.isRequired
});

export const pendingChannelType = shape({
  active: bool.isRequired,
  closing: bool.isRequired,
  remotePubkey: string.isRequired,
  channelPoint: string.isRequired,
  capacity: number.isRequired,
  localBalance: number.isRequired,
  remoteBalance: number.isRequired,
  localChanReserveSat: number.isRequired,
  remoteChanReserveSat: number.isRequired
});

export const channelType = shape({
  active: bool.isRequired,
  closing: bool.isRequired,
  remotePubkey: string.isRequired,
  channelPoint: string.isRequired,
  chanId: number.isRequired,
  capacity: number.isRequired,
  localBalance: number.isRequired,
  remoteBalance: number.isRequired,
  commitFee: number.isRequired,
  commitWeight: number.isRequired,
  feePerKw: number.isRequired,
  unsettledBalance: number.isRequired,
  totalSatoshisSent: number.isRequired,
  totalSatoshisReceived: number.isRequired,
  numUpdates: number.isRequired,
  pendingHtlcs: arrayOf(pendingHtlcType),
  csvDelay: number.isRequired,
  private: bool.isRequired,
  initiator: bool.isRequired,
  chanStatusFlags: string.isRequired,
  localChanReserveSat: number.isRequired,
  remoteChanReserveSat: number.isRequired,
  staticRemoteKey: bool.isRequired,
  lifetime: number.isRequired,
  uptime: number.isRequired,
  closeAddress: string.isRequired
});

export const peerType = shape({
  pubKey: string.isRequired,
  address: string.isRequired,
  bytesSent: number.isRequired,
  bytesRecv: number.isRequired,
  satSent: number.isRequired,
  satRecv: number.isRequired,
  inbound: bool.isRequired,
  pingTime: number.isRequired,
  syncType: string.isRequired
});

export const addressType = shape({
  network: string.isRequired,
  addr: string.isRequired
});

export const nodeDetailsType = shape({
  lastUpdate: number.isRequired,
  pubKey: string.isRequired,
  alias: string.isRequired,
  color: string.isRequired,
  addresses: arrayOf(addressType),
  numChannels: number.isRequired,
  totalCapacity: number.isRequired,
  remoteChannels: arrayOf(remoteChannelType),
  channels: arrayOf(channelType),
  pendingChannels: arrayOf(pendingChannelType),
  peer: peerType
});

export const ctaType = shape({
  type: oneOf(['button', 'icon']).isRequired,
  action: func.isRequired,
  label: string,
  icon: oneOfType([string, node]),
  tooltip: string
});

export const ctaDefaults = {
  label: null,
  icon: null,
  tooltip: null
};
