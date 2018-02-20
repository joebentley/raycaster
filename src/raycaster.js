class Ray {
  constructor(origin, angle) {
    this.origin = origin;
    this.angle = angle;
    this.maxDist = 500;
  }

  cast(collisionFunc) {
    for (let distance = 0; distance <= this.maxDist; distance += 0.01) {
      const rayX = this.origin.x + distance * Math.cos(Math.PI / 180 * this.angle);
      const rayY = this.origin.y + distance * Math.sin(Math.PI / 180 * this.angle);

      let collisionResult = collisionFunc(rayX, rayY, distance);
      if (collisionResult !== null) {
        return collisionResult;
      }
    }
    return null;
  }
}

export default class RayCaster {
  constructor(fov, focalLength, columnWidth, screenWidth) {
    this.fov = fov;
    this.focalLength = focalLength;
    this.columnWidth = columnWidth;
    this.screenWidth = screenWidth;
  }

  /**
   * Cast out a series of rays in a cone starting from origin at an angle this.fov / 2 either
   * side of the absolute angle facing, returning an array containing collision data for each ray
   * @param  {Object} origin          x and y coords to project from
   * @param  {number} facing          angle to project towards
   * @param  {Function} collisionFunc returns collision data for x and y coords
   * @return {Array}                  contains collision data for each ray
   */
  cast(origin, facing, collisionFunc) {
    const angleStep = this.columnWidth * this.fov / this.screenWidth;

    let zArray = [];

    for (let i = 0; i < this.screenWidth / this.columnWidth; ++i) {
      const angle = facing - this.fov / 2 + angleStep * i;
      const perspectiveAngle = Math.atan2(this.columnWidth * i / this.screenWidth - 0.5, this.focalLength);

      zArray[i] = new Ray(origin, angle).cast(collisionFunc(perspectiveAngle));
    }

    return zArray;
  }
}
