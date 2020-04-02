import React from 'react';
import { DataTableHead, DataTableRow, DataTableHeadCell, Tooltip } from 'rmwc';

const NodeListHeader = () => {
  return (
    <DataTableHead className="node-list-table-header">
      <DataTableRow>
        <Tooltip
          content={
            <div style={{ padding: '10px' }}>
              <strong>Alias (PubKey)</strong> is the nodes advertised alias and
              the first six characters of their public key.
            </div>
          }
        >
          <DataTableHeadCell className="node-list-header-cell">
            Alias
          </DataTableHeadCell>
        </Tooltip>

        <Tooltip
          content={
            <div style={{ padding: '10px' }}>
              <strong>2-Hop Nodes</strong> is an estimate of how many nodes are
              reachable within two hops of this node.
            </div>
          }
        >
          <DataTableHeadCell className="node-list-header-cell">
            2-Hop Nodes
          </DataTableHeadCell>
        </Tooltip>
        <Tooltip
          content={
            <div style={{ padding: '10px' }}>
              <strong>Channels</strong> is the number of public channels this
              node has open.
            </div>
          }
        >
          <DataTableHeadCell className="node-list-header-cell">
            Channels
          </DataTableHeadCell>
        </Tooltip>
        <Tooltip
          content={
            <div style={{ padding: '10px' }}>
              <strong>Minimum Fee</strong> is an estimate of the minimum fee
              this node will charge you to route payments. It is based on the
              node&apos;s existing set of advertised channels.
            </div>
          }
        >
          <DataTableHeadCell className="node-list-header-cell">
            Min Fee
          </DataTableHeadCell>
        </Tooltip>
        <Tooltip
          content={
            <div style={{ padding: '10px' }}>
              <strong>Minimum Amount</strong> is the minimum amount of satoshis
              that this node is willing to route.
            </div>
          }
        >
          <DataTableHeadCell className="node-list-header-cell">
            Min Amt
          </DataTableHeadCell>
        </Tooltip>
        <Tooltip
          content={
            <div style={{ padding: '10px' }}>
              <strong>Capacity</strong> is an estimate of the available capacity
              of this node based on existing channels
            </div>
          }
        >
          <DataTableHeadCell className="node-list-header-cell">
            Capacity
          </DataTableHeadCell>
        </Tooltip>
        <DataTableHeadCell className="node-list-header-cell">
          Action
        </DataTableHeadCell>
      </DataTableRow>
    </DataTableHead>
  );
};

export default NodeListHeader;
