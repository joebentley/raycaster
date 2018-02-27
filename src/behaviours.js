export function playerUpdate(app) {
  if (app.keys[37]) {
    this.facing -= 4;
  }
  if (app.keys[39]) {
    this.facing += 4;
  }
  if (app.keys[38]) {
    const newX = this.position.x + .1 * Math.cos(Math.PI / 180 * this.facing);
    const newY = this.position.y + .1 * Math.sin(Math.PI / 180 * this.facing);
    // Don't let player get too close to wall
    const collX = this.position.x + .4 * Math.cos(Math.PI / 180 * this.facing);
    const collY = this.position.y + .4 * Math.sin(Math.PI / 180 * this.facing);
    if (app.gridWorld.collisionFunc(0)(collX, this.position.y, 0) === null) {
      this.position.x = newX;
    }
    if (app.gridWorld.collisionFunc(0)(this.position.x, collY, 0) === null) {
      this.position.y = newY;
    }
  }
  if (app.keys[40]) {
    const newX = this.position.x - .1 * Math.cos(Math.PI / 180 * this.facing);
    const newY = this.position.y - .1 * Math.sin(Math.PI / 180 * this.facing);
    // Don't let player get too close to wall
    const collX = this.position.x - .4 * Math.cos(Math.PI / 180 * this.facing);
    const collY = this.position.y - .4 * Math.sin(Math.PI / 180 * this.facing);
    if (app.gridWorld.collisionFunc(0)(collX, this.position.y, 0) === null) {
      this.position.x = newX;
    }
    if (app.gridWorld.collisionFunc(0)(this.position.x, collY, 0) === null) {
      this.position.y = newY;
    }
  }
}