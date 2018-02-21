import React from 'react';
import ReactDOM from 'react-dom';
import App from './app.js';

new App().run();

class Game extends React.Component { // eslint-disable-line
  render () {
    return <h1>Hello</h1>;
  }
}

ReactDOM.render(<Game />, document.getElementById('root'));
