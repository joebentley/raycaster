import React from 'react';

function Square(props) { // eslint-disable-line
  return <button className="square" onClick={props.onClick} />;
}

export default class Editor extends React.Component {
  handleClick(i) {
    console.log(i);
  }

  render() {
    const rows = [];
    for (let y = 0; y < this.props.height; ++y) {
      const squares = [];
      for (let x = 0; x < this.props.width; ++x) {
        const i = y * this.props.width + x;
        squares[x] = <Square key={i} onClick={() => this.handleClick(i)} />;
      }
      rows[y] = <div key={y} className="board-row">{squares}</div>;
    }

    return (
      <div className="editor">
        {rows}
      </div>
    );
  }
}
