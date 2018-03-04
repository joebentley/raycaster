import React from 'react';

function Square(props) { // eslint-disable-line
  return <button className="square" onClick={props.onClick}>{props.number}</button>;
}

export default class Editor extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      grid: props.initialData
    };
  }

  handleClick(x, y) {
    let newGrid = this.state.grid.copy();
    newGrid.set(x, y, (newGrid.get(x, y) + 1) % this.props.numTypesOfSquare);
    this.props.updateGrid(newGrid);
    this.setState({
      grid: newGrid
    });
  }

  render() {
    const rows = [];
    for (let y = 0; y < this.props.height; ++y) {
      const squares = [];
      for (let x = 0; x < this.props.width; ++x) {
        const i = y * this.props.width + x;
        squares[x] = <Square
          key={i}
          onClick={() => this.handleClick(x, y)}
          number={this.state.grid.get(x, y)} />;
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
