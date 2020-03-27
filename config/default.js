import getPackageDetails from '../utils/getPackageDetails';
import isStableVersion from '../utils/isStableVersion';
// The current stable base version.
// If the current version is in the same range asd this, the default database domain will be used.
const STABLE_VERSION = '0.1.x';

const IS_STABLE_VERSION = isStableVersion(
  getPackageDetails().version,
  STABLE_VERSION
);

module.exports = {
  // Default debug settings.
  debug: 'juggernaut:main,juggernaut:updater,juggernaut:grpc,lnrpc*',
  debugLevel: 'info',

  // Database settings.
  db: {
    namespace: 'juggernaut',
    domain: IS_STABLE_VERSION ? null : 'next'
  },

  theme: 'light',
  locale: 'en',

  autoupdate: {
    active: true,
    channel: 'beta',
    interval: 60 * 60 * 1000
  },

  // Supported chains.
  chains: ['bitcoin'],

  // Supported networks.
  networks: ['mainnet', 'testnet', 'regtest', 'simnet'],

  // Default chain for new wallets (bitcoin|litecoin).
  chain: 'bitcoin',

  // Default network for new wallets (mainnet|testnet|regtest|simnet).
  network: 'mainnet',

  // Default address format (p2wkh|np2wkh)
  address: 'p2wkh',

  // Default currency units.
  units: {
    bitcoin: 'sats'
  },

  // Default block explorer (blockstream|blockcypher|smartbit|insight)
  blockExplorer: 'blockstream',
  // Default exchange rate provider (coinbase|bitstamp|kraken|bitfinex)
  rateProvider: 'coinbase',
  // Default invoice settings
  invoices: {
    expire: 3600,
    baseRetryDelay: 1000,
    useAddressFallback: false,
    retryCount: 2, // Number of retries for pay invoice failure
    feeIncrementExponent: 1.1 // Exponent applied to fee limit on payment retry attempts
  },

  autopay: {
    min: '1',
    max: '1500000',
    defaultValue: '150000'
  },

  channels: {
    // Default view mode(card|list)
    viewMode: 'card',
    // JSON feed for suggested nodes list
    suggestedNodes: 'https://resources.zaphq.io/api/v1/suggested-nodes'
  },

  secureStorage: {
    namespace: IS_STABLE_VERSION ? 'ln-juggernaut' : 'ln-juggernaut-next',
    isWinPlatformSupported: false
  },

  // feature flags to enable/disable experimental functionality
  features: {
    autopay: false,
    // enables/disables mainnet lnd autopilot setting selection
    // if false, autopilot selection won't be available
    mainnetAutopilot: false,
    networkSelection: false,
    scbRestore: false
  },

  // number of onchain confirmations for the specified periods
  // potentially needs multiple chain support (LTC)
  lndTargetConfirmations: {
    fast: 1,
    medium: 6,
    slow: 60
  },
  // number of confirmations for the onchain receiving transaction in the context of
  // transaction finality
  onchainFinality: {
    pending: 0,
    confirmed: 1
  },

  lnurl: {
    requirePrompt: true
  },

  // activity list related settings
  activity: {
    pageSize: 25 // Number of items per one fetch
  }
};
