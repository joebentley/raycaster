import RayCaster from './raycaster.js';
import EventEmitter from 'events';
import { Entity, EntityManager, Behaviour } from './entity.js';
import { InputController } from './behaviours.js';
import GridWorld from './world.js';
import { RGBA, SolidColour, Texture } from './texture.js';

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

    const inputController = new InputController(this);
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
