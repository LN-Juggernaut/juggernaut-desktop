import React from 'react';
import PropTypes from 'prop-types';
import { DataTable, DataTableContent, DataTableBody, Elevation } from 'rmwc';
import { nodeType, ctaType, ctaDefaults } from '../../types';
import NodeListItem from './NodeListItem';
import SimpleNodeListItem from './SimpleNodeListItem';
import NodeListHeader from './NodeListHeader';
import EmptyNodeListItem from './EmptyNodeListItem';
import './NodeList.scss';

const NodeList = props => {
  const { nodes, query, cta, viewType } = props;
  const NodeListItemComponent =
    viewType === 'advanced' ? NodeListItem : SimpleNodeListItem;

  const tableClass =
    viewType === 'advanced'
      ? 'table-action-list-advanced'
      : 'table-action-list-simple';

  return (
    <Elevation z={4} wrap>
      <DataTable
        className={`table-action-list ${tableClass}`}
        style={{ width: '100%', border: '0px', marginBottom: '25px' }}
        stickyRows={1}
      >
        <DataTableContent>
          {viewType === 'advanced' && <NodeListHeader />}
          <DataTableBody>
            {nodes.length === 0 && (
              <EmptyNodeListItem columns={8} query={query} />
            )}
            {nodes.map(node => (
              <NodeListItemComponent key={node.pubKey} node={node} cta={cta} />
            ))}
          </DataTableBody>
        </DataTableContent>
      </DataTable>
    </Elevation>
  );
};

NodeList.propTypes = {
  nodes: PropTypes.arrayOf(nodeType).isRequired,
  query: PropTypes.string,
  cta: ctaType,
  viewType: PropTypes.string.isRequired
};

NodeList.defaultProps = {
  cta: ctaDefaults
};

NodeList.defaultProps = {
  query: ''
};

export default NodeList;
