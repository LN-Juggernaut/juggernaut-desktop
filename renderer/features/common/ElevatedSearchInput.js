import React from 'react';
import PropTypes from 'prop-types';
import { Card, Icon } from 'rmwc';

const ElevatedSearchInput = props => {
  const { query, setQuery, placeholder, icon } = props;

  return (
    <div className="elevated-search">
      <Card className="search-card">
        <div className="search-wrapper">
          <Icon icon={icon} />
          <input
            placeholder={placeholder}
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
      </Card>
    </div>
  );
};

ElevatedSearchInput.propTypes = {
  query: PropTypes.string.isRequired,
  setQuery: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  icon: PropTypes.string
};

ElevatedSearchInput.defaultProps = {
  placeholder: 'Search',
  icon: 'search'
};

export default ElevatedSearchInput;
