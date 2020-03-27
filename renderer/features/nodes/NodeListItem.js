import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { DataTableRow, DataTableCell, Button, Icon, Avatar } from 'rmwc';
// import { Button } from '../../../utils/forms';
import { nodeType } from '../../types';

const NodeListItem = ({ node, ctaText, ctaClicked }) => {
  const { color, alias, pubKey, twoHopNodes, stats } = node;

  const pluralString = (value, str) =>
    value === 1
      ? `${Intl.NumberFormat().format(value)} ${str}`
      : `${Intl.NumberFormat().format(value)} ${str}s`;
  const isUnknownValue = value => {
    return (
      isNaN(value) ||
      value === Number.NEGATIVE_INFINITY ||
      value === Number.POSITIVE_INFINITY
    );
  };

  const displayValue = (value, str) => {
    if (isUnknownValue(value)) {
      return 'Unknown';
    }
    return pluralString(value, str);
  };

  const feeSats = displayValue(
    parseInt(stats.minFeeMsat.min, 10) / 1000,
    'sat'
  );
  const minSats = displayValue(stats.minHtlcMsat.min / 1000, 'sat');
  const capacitySats = displayValue(stats.capacity.sum, 'sat');
  const channels = displayValue(stats.channels, 'channel');
  const twoHopNodesDisplay = displayValue(twoHopNodes, 'node');
  const buttonClicked = e => {
    e.preventDefault();
    e.stopPropagation();
    ctaClicked(node);
  };

  return (
    <DataTableRow>
      <DataTableCell>
        <Icon
          icon={
            <Avatar
              style={{
                width: '48px',
                height: '48px',
                marginRight: '10px',
                backgroundColor: `${color}`,
                color: 'white'
              }}
              size="xlarge"
              name={alias.toUpperCase()}
            />
          }
        />
      </DataTableCell>
      <DataTableCell>
        {alias} ({pubKey.substr(0, 6)})
      </DataTableCell>
      <DataTableCell>{twoHopNodesDisplay}</DataTableCell>
      <DataTableCell>{channels}</DataTableCell>
      <DataTableCell>{feeSats}</DataTableCell>
      <DataTableCell>{minSats}</DataTableCell>
      <DataTableCell>{capacitySats}</DataTableCell>
      <DataTableCell>
        <Button raised label={ctaText} onClick={buttonClicked} />
      </DataTableCell>
    </DataTableRow>
  );
};

NodeListItem.propTypes = {
  node: nodeType.isRequired,
  pubKey: PropTypes.string.isRequired,
  ctaText: PropTypes.string.isRequired,
  ctaClicked: PropTypes.func.isRequired
};

export default connect(null)(NodeListItem);
