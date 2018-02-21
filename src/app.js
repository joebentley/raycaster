import RayCaster from './raycaster.js';


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
      const squareType = this.grid[Math.floor(y)][Math.floor(x)];
      if (squareType != 0) {
        return {
          z: distance * Math.cos(perspectiveAngle),
          type: squareType
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
              x / width * zArray[columnIndex].z,
              (y - (height - wallHeight) / 2) / wallHeight
            );
            // const texPixel = this.textures[1].getTexPixel(x, y)
            data[coord + 0] = texPixel.r;
            data[coord + 1] = texPixel.g;
            data[coord + 2] = texPixel.b;

            // data[coord + 0] = 0
            // data[coord + 1] = 150 * shadingFactor
            // data[coord + 2] = 0
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


class Player {
  constructor(position, facing) {
    this.position = position;
    this.facing = facing;
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

export default class App {
  constructor() {
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

    this.player = new Player({
      x: 5,
      y: 4
    }, 0);
    this.gridWorld = new GridWorld(roomData, this.player);

    this.keys = {};

    window.addEventListener('keydown', (e) => {
      this.keys[e.keyCode] = true;
    });
    window.addEventListener('keyup', (e) => {
      this.keys[e.keyCode] = false;
    });
  }

  on(event, callback) {
    this.events[event] = callback;
  }

  emit(event) {
    if (event in this.events) {
      this.events[event]();
    }
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
    if (this.keys[37]) {
      this.player.facing -= 4;
    }
    if (this.keys[39]) {
      this.player.facing += 4;
    }
    if (this.keys[38]) {
      const newX = this.player.position.x + .1 * Math.cos(Math.PI / 180 * this.player.facing);
      const newY = this.player.position.y + .1 * Math.sin(Math.PI / 180 * this.player.facing);
      // Don't let player get too close to wall
      const collX = this.player.position.x + .4 * Math.cos(Math.PI / 180 * this.player.facing);
      const collY = this.player.position.y + .4 * Math.sin(Math.PI / 180 * this.player.facing);
      if (this.gridWorld.collisionFunc(0)(collX, this.player.position.y, 0) === null) {
        this.player.position.x = newX;
      }
      if (this.gridWorld.collisionFunc(0)(this.player.position.x, collY, 0) === null) {
        this.player.position.y = newY;
      }
    }
    if (this.keys[40]) {
      const newX = this.player.position.x - .1 * Math.cos(Math.PI / 180 * this.player.facing);
      const newY = this.player.position.y - .1 * Math.sin(Math.PI / 180 * this.player.facing);
      // Don't let player get too close to wall
      const collX = this.player.position.x - .4 * Math.cos(Math.PI / 180 * this.player.facing);
      const collY = this.player.position.y - .4 * Math.sin(Math.PI / 180 * this.player.facing);
      if (this.gridWorld.collisionFunc(0)(collX, this.player.position.y, 0) === null) {
        this.player.position.x = newX;
      }
      if (this.gridWorld.collisionFunc(0)(this.player.position.x, collY, 0) === null) {
        this.player.position.y = newY;
      }
    }

    this.gridWorld.render(this.width, this.height, this.ctx, this.rayCaster);
    window.requestAnimationFrame(this.loop.bind(this));
  }
}