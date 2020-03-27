import { proxy } from 'comlinkjs';
import proxymise from './proxymise';

const LndGrpcWrapper = proxy(new Worker('./grpc.worker.js'));

class GrpcInstance {
  constructor() {
    if (!GrpcInstance.instance) {
      GrpcInstance.instance = new LndGrpcWrapper();
    }
    return GrpcInstance.instance;
  }
}

export const lndRPC = proxymise(new GrpcInstance());
