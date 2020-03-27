import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {
  ListItem,
  ListItemGraphic,
  ListItemText,
  ListItemPrimaryText,
  ListItemSecondaryText,
  ListItemMeta,
  Avatar
} from 'rmwc';
import { conversationType } from '../../types';

class ConversationListItem extends Component {
  render() {
    const { conversation, selected, select, id } = this.props;
    const {
      color,
      displayName,
      mostRecentMessageAt,
      mostRecentMessageContent,
      unreadMessages
    } = conversation;
    let createdAtTime;
    const displayLastMessage = mostRecentMessageContent || '';

    if (mostRecentMessageAt) {
      createdAtTime = moment(mostRecentMessageAt);
      if (
        moment().format('YYYY-MM-DD') === createdAtTime.format('YYYY-MM-DD')
      ) {
        createdAtTime = createdAtTime.format('h:mm A');
      } else {
        createdAtTime = createdAtTime.format('M/D/YY');
      }
    } else {
      createdAtTime = '';
    }

    return (
      <ListItem
        ripple={false}
        onClick={() => select({ id })}
        selected={selected}
        className="conversationListItem"
      >
        <ListItemGraphic
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
              name={displayName.toUpperCase()}
            />
          }
        />
        <ListItemText>
          <ListItemPrimaryText>{displayName}</ListItemPrimaryText>
          <ListItemSecondaryText>{displayLastMessage}</ListItemSecondaryText>
        </ListItemText>
        <ListItemMeta>
          {createdAtTime}
          {unreadMessages > 0 && (
            <div className="unreadMessages">
              <span>{unreadMessages}</span>
            </div>
          )}
        </ListItemMeta>
      </ListItem>
    );
  }
}

ConversationListItem.propTypes = {
  conversation: conversationType.isRequired,
  selected: PropTypes.bool.isRequired,
  select: PropTypes.func.isRequired,
  id: PropTypes.number.isRequired
};

export default ConversationListItem;
