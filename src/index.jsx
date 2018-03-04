import React from 'react'; // eslint-disable-line
import ReactDOM from 'react-dom';
import App from './app.js';
import Editor from './editor.jsx'; // eslint-disable-line

import '../public/index.css';

const app = new App();

app.once('load', function () {
  ReactDOM.render(
    <Editor
      width={8}
      height={10}
      initialData={app.gridWorld.grid.copy()}
      numTypesOfSquare={4}
      updateGrid={(newGrid) => app.gridWorld.grid = newGrid}/>,
    document.getElementById('root')
  );
});

app.run();
