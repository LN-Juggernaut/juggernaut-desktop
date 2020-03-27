import React from 'react';
import PropTypes from 'prop-types';
import { Icon, IconButton, Card } from 'rmwc';
import Loader from '../common/Loader';
import { queue } from '../../dialogQueue';
import getNodeInterface from '../../../utils/getNodeInterface';
import { channelType, pendingChannelType } from '../../types';

const ChannelListItem = props => {
  const { channel } = props;
  const {
    active,
    closing,
    capacity,
    localBalance,
    remoteBalance,
    chanId,
    channelPoint,
    node
  } = channel;

  const remoteName = node
    ? `${node.alias} (${node.pubKey.substr(0, 6)})`
    : 'Remote Node';

  const localBalancePercentage = Math.max(
    5,
    100.0 * ((1.0 * localBalance) / capacity)
  );
  const remoteBalancePercentage = Math.max(
    5,
    100.0 * ((1.0 * remoteBalance) / capacity)
  );
  return (
    <Card>
      <div className="channel">
        <div className="channel-graphic">
          <div className="channel-headers">
            <div className="local-header">Local Balance</div>
            <div className="capacity-header">Capacity</div>
            <div className="remote-header">{remoteName}</div>
          </div>
          <div className="channel-bars">
            <div className="local meter">
              <span style={{ width: `${localBalancePercentage}%` }} />
            </div>
            <div className="channel-status">
              {active && !closing && <Icon icon="sync_alt" />}
              {!active && !closing && <Loader color="green" />}
              {!active && closing && <Loader color="red" />}
            </div>
            <div className="remote meter">
              <span style={{ width: `${remoteBalancePercentage}%` }} />
            </div>
          </div>
          <div className="channel-values">
            <div className="local-value">
              {Intl.NumberFormat().format(localBalance)}
            </div>
            <div className="capacity-value">
              {Intl.NumberFormat().format(capacity)}
            </div>
            <div className="remote-value">
              {Intl.NumberFormat().format(remoteBalance)}
            </div>
          </div>
        </div>
        <div className="channel-actions">
          <IconButton
            icon="delete"
            disabled={!active}
            onClick={async e => {
              e.stopPropagation();
              const confirm = await queue.confirm({
                title: 'Are you sure?',
                body: 'Are you sure you want to close this channel?',
                acceptLabel: 'Yes'
              });

              if (confirm) {
                const lnNode = getNodeInterface();
                try {
                  await lnNode.closeChannel({
                    channelPoint,
                    chanId,
                    force: false
                  });
                } catch (e) {
                  console.log(e);
                  // await queue.alert({
                  //   title: 'Failed to close channel',
                  //   body: e.toString()
                  // });
                }
              }
            }}
          />
        </div>
      </div>
    </Card>
  );
};

ChannelListItem.propTypes = {
  channel: PropTypes.oneOfType([channelType, pendingChannelType]).isRequired
};

export default ChannelListItem;
