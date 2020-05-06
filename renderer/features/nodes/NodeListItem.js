import React from 'react';
import { connect } from 'react-redux';
import { DataTableRow, DataTableCell, Button, IconButton } from 'rmwc';
import { nodeType, ctaType, ctaDefaults } from '../../types';
import OptionalTooltip from '../common/OptionalTooltip';

const NodeListItem = ({ node, cta }) => {
  const { alias, pubKey, twoHopNodes, stats } = node;

  const isUnknownValue = value => {
    return (
      isNaN(value) ||
      value === Number.NEGATIVE_INFINITY ||
      value === Number.POSITIVE_INFINITY
    );
  };

  const displayValue = value => {
    if (isUnknownValue(value)) {
      return 'Unknown';
    }
    return Intl.NumberFormat().format(value);
  };

  const feeSats = displayValue(parseInt(stats.minFeeMsat.min, 10) / 1000);
  const minSats = displayValue(stats.minHtlcMsat.min / 1000);
  const capacitySats = displayValue(stats.capacity.sum);

  const clickHandler = e => {
    e.preventDefault();
    e.stopPropagation();
    document.activeElement.blur();
    cta.action(node);
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
        {cta.type === 'button' && (
          <OptionalTooltip content={cta.tooltip}>
            <Button
              raised
              label={cta.label}
              icon={cta.icon}
              onClick={clickHandler}
            />
          </OptionalTooltip>
        )}
        {cta.type === 'icon' && (
          <OptionalTooltip content={cta.tooltip}>
            <IconButton
              label={cta.label}
              icon={cta.icon}
              onClick={clickHandler}
            />
          </OptionalTooltip>
        )}
      </DataTableCell>
    </DataTableRow>
  );
};

NodeListItem.propTypes = {
  node: nodeType.isRequired,
  cta: ctaType
};

NodeListItem.defaultProps = {
  cta: ctaDefaults
};

export default connect(null)(NodeListItem);
