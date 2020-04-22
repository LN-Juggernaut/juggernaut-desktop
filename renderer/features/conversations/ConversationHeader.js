import React from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import {
  MenuSurfaceAnchor,
  Menu,
  MenuItem,
  IconButton,
  Avatar,
  ListItemGraphic
} from 'rmwc';
import {
  removeConversation,
  updateConversationFeeLimitMSats
} from './conversationsSlice';
import { updateConversationFeeLimit } from '../../../utils/db';
import { queue } from '../../dialogQueue';
import FeeLimitIcon from '../images/icons/FeeLimitIcon';
import DeleteConversationIcon from '../images/icons/DeleteConversationIcon';

const validFeeLimit = feeLimitMSats => {
  const intVal = parseInt(feeLimitMSats, 10);
  if (isNaN(intVal) || !feeLimitMSats.match(/^[0-9]+$/) || intVal <= 0) {
    return false;
  }
  return true;
};

const ConversationHeader = props => {
  const [open, setOpen] = React.useState(false);
  const dispatch = useDispatch();

  const { id, color, displayName, feeLimitMSats } = props;
  return (
    <div className="conversationHeader">
      <span>
        <Avatar
          style={{
            backgroundColor: `${color}`,
            color: 'white'
          }}
          size="large"
          name={displayName.toUpperCase()}
        />
      </span>
      <span className="conversationHeaderAlias">{displayName}</span>
      <span>
        <MenuSurfaceAnchor>
          <Menu
            anchorCorner="bottomLeft"
            open={open}
            focusOnOpen={false}
            onClose={() => setOpen(false)}
            style={{ width: '250px' }}
          >
            <MenuItem
              onClick={async () => {
                let newLimit;
                /* eslint-disable no-await-in-loop */
                while (newLimit === undefined) {
                  newLimit = await queue.prompt({
                    title: 'Adjust Fee Limit',
                    body: 'How many msats are you willing to pay per message?',
                    acceptLabel: 'Save',
                    cancelLabel: 'Cancel',
                    inputProps: {
                      placeholder: feeLimitMSats,
                      type: 'number'
                    }
                  });
                  if (newLimit !== null && !validFeeLimit(newLimit)) {
                    await queue.alert({
                      title: 'Invalid Fee Limit',
                      body: 'Fee limit must be an integer greater than 0'
                    });
                    newLimit = undefined;
                  }
                }

                if (newLimit) {
                  newLimit = parseInt(newLimit, 10);
                  try {
                    await updateConversationFeeLimit(id, newLimit);
                    dispatch(
                      updateConversationFeeLimitMSats({
                        conversationId: id,
                        feeLimitMSats: newLimit
                      })
                    );
                  } catch (e) {
                    await queue.alert({
                      title: 'Failed to Adjust Fee Limit',
                      body: 'An unknown error occurred.  Please try again.'
                    });
                  }
                }
              }}
            >
              <ListItemGraphic icon={<FeeLimitIcon />} />
              Adjust Fee Limit
            </MenuItem>
            <MenuItem
              onClick={() => {
                dispatch(removeConversation(id));
              }}
            >
              <ListItemGraphic icon={<DeleteConversationIcon />} />
              Delete Conversation
            </MenuItem>
          </Menu>
          <IconButton
            className="conversation-header-more-icon"
            icon="more_vert"
            onClick={e => {
              e.stopPropagation();
              setOpen(!open);
            }}
          />
        </MenuSurfaceAnchor>
      </span>
    </div>
  );
};

ConversationHeader.propTypes = {
  id: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired,
  displayName: PropTypes.string.isRequired,
  feeLimitMSats: PropTypes.number.isRequired
};

export default ConversationHeader;
