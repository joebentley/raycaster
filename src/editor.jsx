import React from 'react';

function Square(onClick) {
  return <button className="square" onClick={onClick} />;
}

export default class Editor extends React.Component {
  render () {
    return <div className="editor">{Square(function () { console.log('hello'); })}</div>
  }
}
