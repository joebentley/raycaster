export class Behaviour {
  constructor(id) {
    this.id = id;
  }

  setParent(parent) {
    this.parent = parent;
  }
}

export class InputController extends Behaviour {
  constructor(app) {
    super('input-controller');

    if (app) {
      this.setApp(app);
    }
  }

  setApp(app) {
    this.app = app;
  }

  update() {
    const app = this.app;
    if (app.keys[37]) {
      this.parent.facing -= 4;
    }
    if (app.keys[39]) {
      this.parent.facing += 4;
    }
    if (app.keys[38]) {
      const newX = this.parent.position.x + .1 * Math.cos(Math.PI / 180 * this.parent.facing);
      const newY = this.parent.position.y + .1 * Math.sin(Math.PI / 180 * this.parent.facing);
      // Don't let player get too close to wall
      const collX = this.parent.position.x + .4 * Math.cos(Math.PI / 180 * this.parent.facing);
      const collY = this.parent.position.y + .4 * Math.sin(Math.PI / 180 * this.parent.facing);
      if (app.gridWorld.collisionFunc(0)(collX, this.parent.position.y, 0) === null) {
        this.parent.position.x = newX;
      }
      if (app.gridWorld.collisionFunc(0)(this.parent.position.x, collY, 0) === null) {
        this.parent.position.y = newY;
      }
    }
    if (app.keys[40]) {
      const newX = this.parent.position.x - .1 * Math.cos(Math.PI / 180 * this.parent.facing);
      const newY = this.parent.position.y - .1 * Math.sin(Math.PI / 180 * this.parent.facing);
      // Don't let player get too close to wall
      const collX = this.parent.position.x - .4 * Math.cos(Math.PI / 180 * this.parent.facing);
      const collY = this.parent.position.y - .4 * Math.sin(Math.PI / 180 * this.parent.facing);
      if (app.gridWorld.collisionFunc(0)(collX, this.parent.position.y, 0) === null) {
        this.parent.position.x = newX;
      }
      if (app.gridWorld.collisionFunc(0)(this.parent.position.x, collY, 0) === null) {
        this.parent.position.y = newY;
      }
    }
  }
}