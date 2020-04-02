import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { DataTableRow, DataTableCell, Button } from 'rmwc';
import { nodeType } from '../../types';

const NodeListItem = ({ node, ctaText, ctaClicked }) => {
  const { alias, pubKey, twoHopNodes, stats } = node;

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

  const buttonClicked = e => {
    e.preventDefault();
    e.stopPropagation();
    ctaClicked(node);
  };

  return (
    <DataTableRow>
      <DataTableCell>
        {alias} ({pubKey.substr(0, 6)})
      </DataTableCell>
      <DataTableCell>{twoHopNodes}</DataTableCell>
      <DataTableCell>{stats.channels}</DataTableCell>
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
