import React from 'react';
import PropTypes from 'prop-types';
import { DataTableRow, DataTableCell, Button, Icon, Avatar } from 'rmwc';
import { nodeType } from '../../types';

const NodeListItem = ({ node, ctaText, ctaClicked }) => {
  const { color, alias, pubKey } = node;

  const buttonClicked = e => {
    e.preventDefault();
    e.stopPropagation();
    document.activeElement.blur();
    ctaClicked(node);
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
        <Button raised label={ctaText} onClick={buttonClicked} />
      </DataTableCell>
    </DataTableRow>
  );
};

NodeListItem.propTypes = {
  node: nodeType.isRequired,
  ctaText: PropTypes.string.isRequired,
  ctaClicked: PropTypes.func.isRequired
};

export default NodeListItem;
