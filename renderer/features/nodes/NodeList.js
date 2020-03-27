import React from 'react';
import PropTypes from 'prop-types';
import { DataTable, DataTableContent, DataTableBody, Elevation } from 'rmwc';
import { nodeType } from '../../types';
import NodeListItem from './NodeListItem';
import SimpleNodeListItem from './SimpleNodeListItem';
import NodeListHeader from './NodeListHeader';
import EmptyNodeListItem from './EmptyNodeListItem';

const NodeList = props => {
  const { nodes, query, ctaText, ctaClicked, viewType } = props;
  const NodeListItemComponent =
    viewType === 'advanced' ? NodeListItem : SimpleNodeListItem;

  return (
    <Elevation z={4} wrap>
      <DataTable
        className="table-action-list"
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
              <NodeListItemComponent
                key={node.pubKey}
                node={node}
                ctaText={ctaText}
                ctaClicked={ctaClicked}
              />
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
  ctaText: PropTypes.string.isRequired,
  ctaClicked: PropTypes.func.isRequired,
  viewType: PropTypes.string.isRequired
};

NodeList.defaultProps = {
  query: ''
};

export default NodeList;
