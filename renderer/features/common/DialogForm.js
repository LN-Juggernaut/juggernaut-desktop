import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { TextField } from 'rmwc';
import { randomId } from '@rmwc/base';

class DialogPromptForm extends Component {
  constructor(props) {
    super(props);
    const initialState = {};
    props.inputs.forEach(input => {
      initialState[input.name] = '';
    });
    this.state = initialState;
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    const { apiRef } = this.props;
    apiRef(() => this.state);
  }

  handleChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  render() {
    const { body, inputs } = this.props;
    return (
      <div>
        {body && <div style={{ marginBottom: '1rem' }}>{body}</div>}
        {inputs.map(inputProps => {
          const { name } = inputProps;
          const { [name]: value } = this.state;
          return (
            <TextField
              key={name}
              style={{ width: '100%' }}
              autoFocus
              {...inputProps}
              value={value}
              onChange={this.handleChange}
            />
          );
        })}
      </div>
    );
  }
}

DialogPromptForm.propTypes = {
  body: PropTypes.node.isRequired,
  inputs: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired
    })
  ).isRequired,
  apiRef: PropTypes.func.isRequired
};

export const dialogPromptFormFactory = dialog => {
  let getValues;

  const apiRef = _getValues => {
    getValues = _getValues;
  };

  const body = (
    <DialogPromptForm
      body={dialog.body}
      inputs={dialog.inputs}
      apiRef={apiRef}
    />
  );

  return {
    title: 'PrompForm',
    ...dialog,
    body,
    resolve: evt => {
      dialog.resolve(evt.detail.action === 'accept' ? getValues() : null);
      getValues = undefined;
    }
  };
};

export const dialogFactory = (factory, queue) => dialog => {
  return new Promise((resolve, reject) => {
    const d = factory({ id: randomId(), ...dialog, resolve, reject });
    queue.push(d);
  });
};
