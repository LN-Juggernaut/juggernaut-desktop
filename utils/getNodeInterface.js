import { lndRPC } from '../renderer/workers';

export default function getNodeInterface(nodeType = 'lnd') {
  if (nodeType === 'lnd') {
    return lndRPC;
  }
}
