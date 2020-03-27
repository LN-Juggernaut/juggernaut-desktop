/* eslint-disable no-restricted-globals */

import { expose } from 'comlinkjs';
import * as Protobuf from 'protobufjs';
import Long from 'long';
import LndGrpcWrapper from '../../services/lnd/grpc';

// Protobuf assumes that long.js is either available on the global scope or available to be required. However, when
// used from the context of one of our web workers neither of these assumptions is true. In order to ensure that Long
// support is available in protobuf we manually configure protobuf here, before it is used.
//
// See https://github.com/protobufjs/protobuf.js#browserify-integration
//
// This ensures that large numbers (such as those returned from chan_id props) can be properly handled without rounding.
Protobuf.util.Long = Long;
Protobuf.configure();

expose(LndGrpcWrapper, self);
