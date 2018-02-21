import React from 'react';

export default class Editor extends React.Component {
  render () {
    return <h1>{this.props.width} {this.props.height}</h1>;
  }
}
