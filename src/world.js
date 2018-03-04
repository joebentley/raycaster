
export default class GridWorld {
  constructor(grid, player) {
    this.grid = grid;
    this.player = player;
    this.textures = {};
  }

  collisionFunc(perspectiveAngle) {
    return (x, y, distance) => {
      const squareType = this.grid.get(Math.round(x), Math.round(y));

      if (squareType !== 0) {
        // fraction of wall that the ray intersects from 0 to 1, 0 being left 1 being right
        // how far along the wall the ray hit, so middle of the wall would be 0.5
        let fractionOfWall = 0;
        // determine direction of wall
        if (
          this.grid.get(Math.round(x-0.1), Math.round(y)) == 0 ||
          this.grid.get(Math.round(x+0.1), Math.round(y)) == 0
        ) { // wall is in x direction
          fractionOfWall = y - Math.floor(y);
        }
        else if (
          this.grid.get(Math.round(x), Math.round(y-0.1)) == 0 ||
          this.grid.get(Math.round(x), Math.round(y+0.1)) == 0
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
      const topOfWall = (height - wallHeight) / 2;

      for (let y = 0; y < height; ++y) {
        const coord = y * width * 4 + (x * 4);
        if (
          y < topOfWall ||
          y > topOfWall + wallHeight
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
              (y - topOfWall) / wallHeight
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