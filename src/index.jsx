import App from './app.js';
import Editor from './editor.jsx'; // eslint-disable-line
import React from 'react'; // eslint-disable-line
import ReactDOM from 'react-dom';

const app = new App();

app.on('load', function () {
  const width = app.gridWorld.width;
  const height = app.gridWorld.height;
  ReactDOM.render(<Editor width={width} height={height} />, document.getElementById('root'));
});

app.run();
