import React from 'react';

function Square(props) { // eslint-disable-line
  return <button className="square" onClick={props.onClick} />;
}

export default class Editor extends React.Component {
  render () {
    return <div className="editor"><Square onClick={() => { console.log('hello');}} /></div>;
  }
}
