import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import {
  IconButton,
  ListItem,
  ListItemGraphic,
  ListItemText,
  ListItemPrimaryText,
  ListItemSecondaryText,
  ListItemMeta,
  CircularProgress
} from 'rmwc';
import { connectWallet } from '../wallet/walletSlice';
import { queue } from '../../dialogQueue';

const WalletListItem = props => {
  const { name, host, id, removeWallet, connecting } = props;
  const dispatch = useDispatch();

  const [thisWalletConnecting, setThisWalletConnecting] = useState(false);

  useEffect(() => {
    if (!connecting) {
      setThisWalletConnecting(false);
    }
  }, [connecting]);

  return (
    <ListItem
      onClick={e => {
        e.preventDefault();
        e.stopPropagation();
        document.activeElement.blur();
        if (!connecting) {
          dispatch(connectWallet(id));
          setThisWalletConnecting(true);
        }
      }}
    >
      <ListItemGraphic icon="offline_bolt" />
      <ListItemText>
        <ListItemPrimaryText>{name}</ListItemPrimaryText>
        <ListItemSecondaryText>{`${host}`}</ListItemSecondaryText>
      </ListItemText>
      <ListItemMeta>
        {thisWalletConnecting && (
          <IconButton disabled icon={<CircularProgress />} />
        )}
        <IconButton
          icon="delete"
          disabled={connecting}
          onClick={async e => {
            e.preventDefault();
            e.stopPropagation();
            document.activeElement.blur();
            const confirm = await queue.confirm({
              title: 'Are you sure?',
              body: 'Are you sure you want to remove this wallet?',
              acceptLabel: 'Yes'
            });

            if (confirm) {
              removeWallet(id);
            }
          }}
        />
      </ListItemMeta>
    </ListItem>
  );
};

WalletListItem.propTypes = {
  name: PropTypes.string.isRequired,
  host: PropTypes.string.isRequired,
  id: PropTypes.number.isRequired,
  removeWallet: PropTypes.func.isRequired,
  connecting: PropTypes.bool.isRequired
};

export default WalletListItem;
