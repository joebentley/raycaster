export class RGBA {
  constructor(r, g, b, a) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }
}

export class SolidColour {
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

export class Texture {
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