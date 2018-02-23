import React from 'react'; // eslint-disable-line
import ReactDOM from 'react-dom';
import App from './app.js';
import Editor from './editor.jsx'; // eslint-disable-line
import { copy2DArray } from './utils.js';

import '../public/index.css';

const app = new App();

app.once('load', function () {
  ReactDOM.render(
    <Editor
      width={app.gridWorld.width}
      height={app.gridWorld.height}
      initialData={copy2DArray(app.gridWorld.grid)}
      numTypesOfSquare={4}
      updateGrid={(newGrid) => app.gridWorld.grid = newGrid}/>,
    document.getElementById('root')
  );
});

app.run();
