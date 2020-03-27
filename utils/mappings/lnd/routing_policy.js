const mapRoutingPolicy = policy => {
  if (!policy) {
    return null;
  }

  return {
    timeLockDelta: policy.time_lock_delta,
    minHtlcMsat: policy.min_htlc,
    feeBaseMsat: policy.fee_base_msat,
    feeRateMilliMsat: policy.fee_rate_milli_msat,
    disabled: policy.disabled,
    maxHtlcMsat: policy.max_htlc_msat,
    lastUpdate: policy.last_update
  };
};

export default mapRoutingPolicy;
