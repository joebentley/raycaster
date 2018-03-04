
export class PointMap {
  constructor() {
    this.map = {};
  }
  
  get(x, y) {
    return this.map[`${x}, ${y}`];
  }

  set(x, y, value) {
    this.map[`${x}, ${y}`] = value;
  }

  copy() {
    const map = new PointMap();
    for (const key in this.map) {
      map.map[key] = this.map[key];
    }
    return map;
  }

  static fromList(list) {
    const map = new PointMap();

    for (let y = 0; y < list.length; ++y) {
      for (let x = 0; x < list[0].length; ++x) {
        map.set(x, y, list[y][x]);
      }
    }

    return map;
  }
}