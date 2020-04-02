import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import {
  MenuSurfaceAnchor,
  Menu,
  MenuItem,
  Icon,
  ListDivider,
  ListItemGraphic,
  ListItemText,
  ListItemPrimaryText,
  ListItemSecondaryText
} from 'rmwc';
import { useHistory } from 'react-router-dom';
import routes from '../../constants/routes.json';
import { disconnectWallet } from '../wallets/WalletAPI';
import { logout } from '../common/actions';
import { showManageChannelsModal } from '../channels/channelsSlice';
import { showNodeListPageModal } from '../nodes/nodesSlice';
import BitcoinLogo from '../images/BitcoinLogo';
import JuggernautIcon from '../images/JuggernautIcon';
import ChannelsIcon from '../images/ChannelsIcon';
import NewConversationIcon from '../images/icons/NewConversationIcon';
import NewChannelIcon from '../images/icons/NewChannelIcon';
import LogoutIcon from '../images/icons/LogoutIcon';

const ConversationListHeader = props => {
  const {
    showNewConversationForm,
    availableBalance,
    pendingBalance,
    updateSearchQuery,
    searchQuery
  } = props;
  const history = useHistory();
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  return (
    <div className="conversationListHeader">
      <MenuSurfaceAnchor>
        <Menu
          style={{ width: '250px' }}
          anchorCorner="bottomStart"
          open={open}
          focusOnOpen={false}
          onClose={() => setOpen(false)}
        >
          <div className="profileMenuItem">
            <BitcoinLogo
              style={{ display: 'inline-block', marginRight: '15px' }}
              width="50px"
              height="50px"
            />

            <ListItemText>
              <ListItemPrimaryText>
                <span className="balanceSats">
                  {Intl.NumberFormat().format(availableBalance)}
                </span>{' '}
                sats
              </ListItemPrimaryText>
              <ListItemSecondaryText>
                {pendingBalance > 0 && (
                  <span className="pending-balance-sats">
                    <strong>{pendingBalance}</strong> sats (pending)
                  </span>
                )}
              </ListItemSecondaryText>
            </ListItemText>
          </div>
          <ListDivider />
          <MenuItem
            onClick={() => {
              showNewConversationForm();
            }}
          >
            <ListItemGraphic icon={<NewConversationIcon />} />
            <ListItemText>New Conversation</ListItemText>
          </MenuItem>
          <MenuItem
            onClick={() => {
              dispatch(showNodeListPageModal());
            }}
          >
            <ListItemGraphic icon={<NewChannelIcon />} />
            <ListItemText>New Channel</ListItemText>
          </MenuItem>
          <MenuItem
            onClick={() => {
              dispatch(showManageChannelsModal());
            }}
          >
            <ListItemGraphic icon={<ChannelsIcon />} />
            <ListItemText>Manage Channels</ListItemText>
          </MenuItem>
          <MenuItem
            onClick={async () => {
              await disconnectWallet();
              dispatch(logout());
              history.push(routes.WALLETS);
            }}
          >
            <ListItemGraphic icon={<LogoutIcon />} />
            <ListItemText>Logout</ListItemText>
          </MenuItem>
        </Menu>
        <JuggernautIcon
          style={{
            border: '1px solid rgb(240,240,240)',
            borderRadius: '50%',
            cursor: 'pointer',
            padding: '5px',
            boxShadow:
              '0 2px 2px 0 rgba(0, 0, 0, 0.14),0 3px 1px -2px rgba(0, 0, 0, 0.12), 0 1px 5px 0 rgba(0, 0, 0, 0.2)'
          }}
          width="48px"
          height="48px"
          onClick={e => {
            e.stopPropagation();
            setOpen(!open);
          }}
        />
      </MenuSurfaceAnchor>
      <div className="search">
        <Icon icon="search" />
        <input
          type="text"
          name="search"
          value={searchQuery}
          onChange={e => {
            updateSearchQuery(e.target.value);
          }}
          placeholder="Search"
        />
      </div>
    </div>
  );
};

ConversationListHeader.propTypes = {
  showNewConversationForm: PropTypes.func.isRequired,
  availableBalance: PropTypes.number.isRequired,
  pendingBalance: PropTypes.number.isRequired,
  searchQuery: PropTypes.string.isRequired,
  updateSearchQuery: PropTypes.func.isRequired
};

export default ConversationListHeader;
