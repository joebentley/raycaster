/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _raycaster = _interopRequireDefault(__webpack_require__(1));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var GridWorld =
/*#__PURE__*/
function () {
  function GridWorld(grid, player) {
    _classCallCheck(this, GridWorld);

    this.grid = grid;
    this.player = player;
    this.textures = {};
  }

  _createClass(GridWorld, [{
    key: "collisionFunc",
    value: function collisionFunc(perspectiveAngle) {
      var _this = this;

      return function (x, y, distance) {
        var squareType = _this.grid[Math.floor(y)][Math.floor(x)];

        if (squareType != 0) {
          return {
            z: distance * Math.cos(perspectiveAngle),
            type: squareType
          };
        }

        return null;
      };
    }
  }, {
    key: "render",
    value: function render(width, height, ctx, rayCaster) {
      var imageData = ctx.createImageData(width, height);
      var data = imageData.data;
      var zArray = rayCaster.cast(this.player.position, this.player.facing, this.collisionFunc.bind(this));

      for (var x = 0; x < width; ++x) {
        var columnIndex = Math.floor(x / rayCaster.columnWidth);
        var wallHeight = height / zArray[columnIndex].z;
        var shadingFactor = Math.min(1, 1.4 / zArray[columnIndex].z + 0.3);

        for (var y = 0; y < height; ++y) {
          var coord = y * width * 4 + x * 4;

          if (y < (height - wallHeight) / 2 || y > (height + wallHeight) / 2) {
            data[coord + 0] = 200;
            data[coord + 1] = 200;
            data[coord + 2] = 200;
          } else {
            var wallType = zArray[columnIndex].type;

            if (wallType in this.textures) {
              var texture = this.textures[wallType]; // Perspective transformation of walls

              var texPixel = texture.interpTexPixel(x / width * zArray[columnIndex].z, (y - (height - wallHeight) / 2) / wallHeight); // const texPixel = this.textures[1].getTexPixel(x, y)

              data[coord + 0] = texPixel.r;
              data[coord + 1] = texPixel.g;
              data[coord + 2] = texPixel.b; // data[coord + 0] = 0
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
  }, {
    key: "registerTexture",
    value: function registerTexture(wallIndex, texture) {
      this.textures[wallIndex] = texture;
    }
  }]);

  return GridWorld;
}();

var Player = function Player(position, facing) {
  _classCallCheck(this, Player);

  this.position = position;
  this.facing = facing;
};

var RGBA = function RGBA(r, g, b, a) {
  _classCallCheck(this, RGBA);

  this.r = r;
  this.g = g;
  this.b = b;
  this.a = a;
};

var SolidColour =
/*#__PURE__*/
function () {
  function SolidColour(colour) {
    _classCallCheck(this, SolidColour);

    this.colour = colour;
  }

  _createClass(SolidColour, [{
    key: "interpTexPixel",
    value: function interpTexPixel(x, y) {
      return this.colour;
    }
  }, {
    key: "getTexPixel",
    value: function getTexPixel(x, y) {
      return this.colour;
    }
  }]);

  return SolidColour;
}();

var Texture =
/*#__PURE__*/
function () {
  function Texture() {
    _classCallCheck(this, Texture);

    this.loaded = false;
  }

  _createClass(Texture, [{
    key: "load",
    value: function load(path) {
      var _this2 = this;

      var canvas = document.createElement('canvas');
      var ctx = canvas.getContext('2d');
      this.image = new Image();
      this.image.src = path;
      return new Promise(function (resolve, reject) {
        _this2.image.onload = function () {
          ctx.drawImage(_this2.image, 0, 0);
          _this2.imageData = ctx.getImageData(0, 0, _this2.image.width, _this2.image.height);
          _this2.loaded = true;
          resolve(_this2);
        };

        _this2.image.onerror = reject;
      });
    }
  }, {
    key: "interpTexPixel",
    value: function interpTexPixel(x, y) {
      if (this.loaded) {
        var xImage = Math.round(x % 1 * this.image.width);
        var yImage = Math.round(y % 1 * (this.image.height / 2)); // HACK

        var coord = yImage * this.image.width * 4 + xImage * 4;
        return {
          r: this.imageData.data[coord + 0],
          g: this.imageData.data[coord + 1],
          b: this.imageData.data[coord + 2],
          a: this.imageData.data[coord + 3]
        };
      }

      return null;
    }
  }, {
    key: "getTexPixel",
    value: function getTexPixel(x, y) {
      if (this.loaded) {
        var xImage = x % this.image.width;
        var yImage = y % (this.image.height / 2); // HACK

        var coord = yImage * this.image.width * 4 + xImage * 4;
        return {
          r: this.imageData.data[coord + 0],
          g: this.imageData.data[coord + 1],
          b: this.imageData.data[coord + 2],
          a: this.imageData.data[coord + 3]
        };
      }

      return null;
    }
  }]);

  return Texture;
}();

var App =
/*#__PURE__*/
function () {
  function App() {
    var _this3 = this;

    _classCallCheck(this, App);

    this.canvas = document.getElementById('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.rayCaster = new _raycaster.default(60, 1, 1, this.width);
    var roomData = [[1, 1, 1, 1, 1, 1, 2, 1], [1, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 3], [1, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 1], [1, 1, 1, 1, 1, 1, 0, 1], [1, 0, 0, 0, 0, 0, 0, 1], [1, 1, 1, 1, 1, 1, 1, 1]];
    this.player = new Player({
      x: 5,
      y: 4
    }, 0);
    this.gridWorld = new GridWorld(roomData, this.player);
    this.keys = {};
    window.addEventListener('keydown', function (e) {
      _this3.keys[e.keyCode] = true;
    });
    window.addEventListener('keyup', function (e) {
      _this3.keys[e.keyCode] = false;
    });
  }

  _createClass(App, [{
    key: "run",
    value: function run() {
      var _this4 = this;

      new Texture().load('wallpaper.png').then(function (texture) {
        _this4.gridWorld.registerTexture(1, texture);

        return new Texture().load('grass.jpg');
      }).then(function (texture) {
        _this4.gridWorld.registerTexture(2, texture);
      }).then(function () {
        _this4.gridWorld.registerTexture(3, new SolidColour(new RGBA(255, 0, 0, 0)));
      }).finally(function () {
        debugger; // Start the app

        window.requestAnimationFrame(_this4.loop.bind(_this4));
      });
    }
  }, {
    key: "loop",
    value: function loop() {
      if (this.keys[37]) {
        this.player.facing -= 4;
      }

      if (this.keys[39]) {
        this.player.facing += 4;
      }

      if (this.keys[38]) {
        var newX = this.player.position.x + .1 * Math.cos(Math.PI / 180 * this.player.facing);
        var newY = this.player.position.y + .1 * Math.sin(Math.PI / 180 * this.player.facing); // Don't let player get too close to wall

        var collX = this.player.position.x + .4 * Math.cos(Math.PI / 180 * this.player.facing);
        var collY = this.player.position.y + .4 * Math.sin(Math.PI / 180 * this.player.facing);

        if (this.gridWorld.collisionFunc(0)(collX, this.player.position.y, 0) === null) {
          this.player.position.x = newX;
        }

        if (this.gridWorld.collisionFunc(0)(this.player.position.x, collY, 0) === null) {
          this.player.position.y = newY;
        }
      }

      if (this.keys[40]) {
        var _newX = this.player.position.x - .1 * Math.cos(Math.PI / 180 * this.player.facing);

        var _newY = this.player.position.y - .1 * Math.sin(Math.PI / 180 * this.player.facing); // Don't let player get too close to wall


        var _collX = this.player.position.x - .4 * Math.cos(Math.PI / 180 * this.player.facing);

        var _collY = this.player.position.y - .4 * Math.sin(Math.PI / 180 * this.player.facing);

        if (this.gridWorld.collisionFunc(0)(_collX, this.player.position.y, 0) === null) {
          this.player.position.x = _newX;
        }

        if (this.gridWorld.collisionFunc(0)(this.player.position.x, _collY, 0) === null) {
          this.player.position.y = _newY;
        }
      }

      this.gridWorld.render(this.width, this.height, this.ctx, this.rayCaster);
      window.requestAnimationFrame(this.loop.bind(this));
    }
  }]);

  return App;
}();

new App().run();

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Ray =
/*#__PURE__*/
function () {
  function Ray(origin, angle) {
    _classCallCheck(this, Ray);

    this.origin = origin;
    this.angle = angle;
    this.maxDist = 500;
  }

  _createClass(Ray, [{
    key: "cast",
    value: function cast(collisionFunc) {
      for (var distance = 0; distance <= this.maxDist; distance += 0.01) {
        var rayX = this.origin.x + distance * Math.cos(Math.PI / 180 * this.angle);
        var rayY = this.origin.y + distance * Math.sin(Math.PI / 180 * this.angle);
        var collisionResult = collisionFunc(rayX, rayY, distance);

        if (collisionResult !== null) {
          return collisionResult;
        }
      }

      return null;
    }
  }]);

  return Ray;
}();

var RayCaster =
/*#__PURE__*/
function () {
  function RayCaster(fov, focalLength, columnWidth, screenWidth) {
    _classCallCheck(this, RayCaster);

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


  _createClass(RayCaster, [{
    key: "cast",
    value: function cast(origin, facing, collisionFunc) {
      var angleStep = this.columnWidth * this.fov / this.screenWidth;
      var zArray = [];

      for (var i = 0; i < this.screenWidth / this.columnWidth; ++i) {
        var angle = facing - this.fov / 2 + angleStep * i;
        var perspectiveAngle = Math.atan2(this.columnWidth * i / this.screenWidth - 0.5, this.focalLength);
        zArray[i] = new Ray(origin, angle).cast(collisionFunc(perspectiveAngle));
      }

      return zArray;
    }
  }]);

  return RayCaster;
}();

exports.default = RayCaster;

/***/ })
/******/ ]);
//# sourceMappingURL=bundle.js.map