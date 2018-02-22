import App from './app.js';
import Editor from './editor.jsx'; // eslint-disable-line
import React from 'react'; // eslint-disable-line
import ReactDOM from 'react-dom';

const app = new App();

app.once('load', function () {
  ReactDOM.render(
    <Editor width={app.gridWorld.width} height={app.gridWorld.height} />,
    document.getElementById('root')
  );
});

app.run();
