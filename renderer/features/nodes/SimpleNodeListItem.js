import React from 'react';
import {
  DataTableRow,
  DataTableCell,
  Button,
  Icon,
  Avatar,
  IconButton
} from 'rmwc';
import OptionalTooltip from '../common/OptionalTooltip';
import { nodeType, ctaType, ctaDefaults } from '../../types';

const NodeListItem = ({ node, cta }) => {
  const { color, alias, pubKey } = node;

  const clickHandler = e => {
    e.preventDefault();
    e.stopPropagation();
    document.activeElement.blur();
    cta.action(node);
  };

  return (
    <DataTableRow>
      <DataTableCell style={{ padding: '10px' }}>
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
        />{' '}
        {alias}
      </DataTableCell>
      <DataTableCell>{pubKey}</DataTableCell>
      <DataTableCell alignEnd>
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
export default NodeListItem;
