import RayCaster from './raycaster.js';
import EventEmitter from 'events';
import { Entity, EntityManager, Behaviour } from './entity.js';
import { playerUpdate } from './behaviours.js';

class GridWorld {
  constructor(grid, player) {
    this.grid = grid;
    this.player = player;
    this.textures = {};
  }

  get width() {
    return this.grid[0].length;
  }

  get height() {
    return this.grid.length;
  }

  collisionFunc(perspectiveAngle) {
    return (x, y, distance) => {
      const squareType = this.grid[Math.round(y)][Math.round(x)];

      if (squareType !== 0) {
        // fraction of wall that the ray intersects from 0 to 1, 0 being left 1 being right
        // how far along the wall the ray hit, so middle of the wall would be 0.5
        let fractionOfWall = 0;
        // determine direction of wall
        if (
          this.grid[Math.round(y)][Math.round(x-0.1)] == 0 ||
          this.grid[Math.round(y)][Math.round(x+0.1)] == 0
        ) { // wall is in x direction
          fractionOfWall = y - Math.floor(y);
        }
        else if (
          this.grid[Math.round(y-0.1)][Math.round(x)] == 0 ||
          this.grid[Math.round(y+0.1)][Math.round(x)] == 0
        ) { // wall is in y direction
          fractionOfWall = x - Math.floor(x);
        }

        return {
          z: distance * Math.cos(perspectiveAngle),
          type: squareType,
          fractionOfWall: fractionOfWall
        };
      }
      return null;
    };
  }

  render(width, height, ctx, rayCaster) {
    let imageData = ctx.createImageData(width, height);
    let data = imageData.data;

    const zArray = rayCaster.cast(this.player.position, this.player.facing,
      this.collisionFunc.bind(this));

    for (let x = 0; x < width; ++x) {
      const columnIndex = Math.floor(x / rayCaster.columnWidth);
      const wallHeight = height / zArray[columnIndex].z;
      const shadingFactor = Math.min(1, 1.4 / zArray[columnIndex].z + 0.3);

      for (let y = 0; y < height; ++y) {
        const coord = y * width * 4 + (x * 4);
        if (
          y < (height - wallHeight) / 2 ||
          y > (height + wallHeight) / 2
        ) {
          data[coord + 0] = 200;
          data[coord + 1] = 200;
          data[coord + 2] = 200;
        } else {
          const wallType = zArray[columnIndex].type;
          if (wallType in this.textures) {
            const texture = this.textures[wallType];
            // Perspective transformation of walls
            const texPixel = texture.interpTexPixel(
              // get x coord of as how far along the wall the way hit
              zArray[columnIndex].fractionOfWall,
              (y - (height - wallHeight) / 2) / wallHeight
            );

            data[coord + 0] = texPixel.r;
            data[coord + 1] = texPixel.g;
            data[coord + 2] = texPixel.b;
          }
          data[coord + 0] *= shadingFactor;
          data[coord + 1] *= shadingFactor;
          data[coord + 2] *= shadingFactor;
        }
        data[coord + 3] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }

  registerTexture(wallIndex, texture) {
    this.textures[wallIndex] = texture;
  }
}

class RGBA {
  constructor(r, g, b, a) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }
}

class SolidColour {
  constructor(colour) {
    this.colour = colour;
  }

  interpTexPixel(x, y) {
    return this.colour;
  }

  getTexPixel(x, y) {
    return this.colour;
  }
}

class Texture {
  constructor() {
    this.loaded = false;
  }

  load(path) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    this.image = new Image();
    this.image.src = path;

    return new Promise((resolve, reject) => {
      this.image.onload = () => {
        ctx.drawImage(this.image, 0, 0);
        this.imageData = ctx.getImageData(0, 0, this.image.width, this.image.height);
        this.loaded = true;
        resolve(this);
      };

      this.image.onerror = reject;
    });
  }

  interpTexPixel(x, y) {
    if (this.loaded) {
      const xImage = Math.round((x % 1) * this.image.width);
      const yImage = Math.round((y % 1) * (this.image.height / 2)); // HACK
      const coord = yImage * this.image.width * 4 + (xImage * 4);

      return {
        r: this.imageData.data[coord + 0],
        g: this.imageData.data[coord + 1],
        b: this.imageData.data[coord + 2],
        a: this.imageData.data[coord + 3]
      };
    }
    return null;
  }

  getTexPixel(x, y) {
    if (this.loaded) {
      const xImage = x % this.image.width;
      const yImage = y % (this.image.height / 2); // HACK
      const coord = yImage * this.image.width * 4 + (xImage * 4);

      return {
        r: this.imageData.data[coord + 0],
        g: this.imageData.data[coord + 1],
        b: this.imageData.data[coord + 2],
        a: this.imageData.data[coord + 3]
      };
    }
    return null;
  }
}

export default class App extends EventEmitter {
  constructor() {
    super();

    this.canvas = document.getElementById('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.rayCaster = new RayCaster(60, 1, 1, this.width);
    this.events = {};

    const roomData = [
      [1, 1, 1, 1, 1, 1, 2, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 3],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1]
    ];

    this.entityManager = new EntityManager();

    const player = new Entity('player');
    player.position = { x: 5, y: 4 };

    // TODO move this into behaviours.js
    const inputController = new Behaviour('controller');
    inputController.update = playerUpdate.bind(player, this);

    player.addBehaviour(inputController);
    this.entityManager.addEntity(player);

    this.gridWorld = new GridWorld(roomData, player);

    this.keys = {};

    window.addEventListener('keydown', (e) => {
      this.keys[e.keyCode] = true;
    });
    window.addEventListener('keyup', (e) => {
      this.keys[e.keyCode] = false;
    });
  }

  run() {
    new Texture().load('wallpaper.png').then((texture) => {
      this.gridWorld.registerTexture(1, texture);
      return new Texture().load('grass.jpg');
    }).then((texture) => {
      this.gridWorld.registerTexture(2, texture);
    }).then(() => {
      this.gridWorld.registerTexture(3, new SolidColour(new RGBA(255, 0, 0, 0)));
    }).finally(() => {
      // Start the app
      this.emit('load');
      window.requestAnimationFrame(this.loop.bind(this));
    });
  }

  loop() {
    this.entityManager.updateAll();
    this.gridWorld.render(this.width, this.height, this.ctx, this.rayCaster);
    window.requestAnimationFrame(this.loop.bind(this));
  }
}
