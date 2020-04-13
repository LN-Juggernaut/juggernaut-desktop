import getNodeInterface from '../../../utils/getNodeInterface';
import { readWallet } from '../../../utils/db';
import { saveMessagesToDatabase } from '../messages/MessageAPI';

export const unlockWallet = async password => {
  const lnNode = getNodeInterface();
  await lnNode.unlock(password);
};

export const connectWallet = async walletId => {
  const lnNode = getNodeInterface();
  const wallet = await readWallet(walletId);
  await lnNode.connect({
    ...wallet,
    protoDir: window.Juggernaut.lndProtoDir
  });
  return lnNode.state;
};

export const disconnectWallet = async () => {
  const lnNode = getNodeInterface();
  lnNode.removeAllListeners('subscribeMessages.data');
  lnNode.removeAllListeners('subscribeChannelGraph.data');
  lnNode.removeAllListeners('subscribeTransactions.data');
  lnNode.removeAllListeners('subscribeChannelEvents.data');
  lnNode.removeAllListeners('subscribePeerEvent.data');
  lnNode.removeAllListeners('WALLET_LOCKED');
  lnNode.removeAllListeners('WALLET_ACTIVE');
  return lnNode.disconnect();
};

export const getBalanceInformation = async () => {
  const lnNode = getNodeInterface();
  const {
    availableBalance,
    pendingBalance
  } = await lnNode.getBalanceInformation();
  return { availableBalance, pendingBalance };
};

export const getWalletDetails = async wallet => {
  const lnNode = getNodeInterface();

  const info = await lnNode.getInfo();
  const {
    availableBalance,
    pendingBalance
  } = await lnNode.getBalanceInformation();

  const { lastSettleIndex } = wallet;
  const fundingAddress = await lnNode.newAddress(2);
  let messages = await lnNode.getMessagesSinceSettleIndex(lastSettleIndex);

  // TODO: we will always do this until we receive our first message
  //       really we should only do this on first load of a wallet
  if (!lastSettleIndex) {
    const sentMessages = await lnNode.getAllSentMessages();
    const mostRecentSentMessage = sentMessages[sentMessages.length - 1];
    if (mostRecentSentMessage) {
      messages.forEach(message => {
        if (message.createdAt <= mostRecentSentMessage.createdAt) {
          message.unread = false;
        }
      });
    }
    messages = messages.concat(sentMessages);
  }
  await saveMessagesToDatabase(messages, wallet.id);

  const peers = await lnNode.listPeers();

  return {
    locked: false,
    info,
    peers,
    availableBalance,
    pendingBalance,
    fundingAddress
  };
};

export const validWalletConnectionDetails = async details => {
  const lnNode = getNodeInterface();
  return lnNode.validConnectionDetails({
    ...details,
    protoDir: window.Juggernaut.lndProtoDir
  });
};
