import React from 'react';
import PropTypes from 'prop-types';
import { DataTableRow, DataTableCell } from 'rmwc';

const EmptyNodeListItem = ({ query, columns }) => {
  return (
    <DataTableRow>
      <DataTableCell style={{ textAlign: 'center' }} colSpan={columns}>
        No nodes found with an alias or pubkey containing &apos;{query}&apos;.
      </DataTableCell>
    </DataTableRow>
  );
};

EmptyNodeListItem.propTypes = {
  query: PropTypes.string.isRequired,
  columns: PropTypes.number.isRequired
};

export default EmptyNodeListItem;
