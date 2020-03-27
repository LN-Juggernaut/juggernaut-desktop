import React from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import {
  ListItem,
  ListItemGraphic,
  ListItemText,
  ListItemPrimaryText,
  ListItemSecondaryText,
  ListItemMeta,
  CircularProgress
} from 'rmwc';
import { Button } from '../../../utils/forms';
import { connectWallet } from '../wallet/walletSlice';

const WalletListItem = props => {
  const { name, host, id, removeWallet, connecting } = props;
  const dispatch = useDispatch();
  return (
    <ListItem>
      <ListItemGraphic icon="offline_bolt" />
      <ListItemText>
        <ListItemPrimaryText>{name}</ListItemPrimaryText>
        <ListItemSecondaryText>{`${host}`}</ListItemSecondaryText>
      </ListItemText>
      <ListItemMeta>
        {connecting && (
          <Button disabled label="Launching" icon={<CircularProgress />} />
        )}
        {!connecting && (
          <Button
            onClick={() => dispatch(connectWallet(id))}
            label="Launch"
            raised
          />
        )}
        <Button onClick={() => removeWallet(id)} label="Remove" danger />
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
