function Ray(origin, angle) {
    this.origin = origin
    this.angle = angle
    this.maxDist = 500
}

Ray.prototype.cast = function (collisionFunc) {
    for (let distance = 0; distance <= this.maxDist; distance += 0.01) {
        const rayX = this.origin.x + distance * Math.cos(Math.PI / 180 * this.angle)
        const rayY = this.origin.y + distance * Math.sin(Math.PI / 180 * this.angle)

        let collisionResult = collisionFunc(rayX, rayY, distance)
        if (collisionResult.hit === true) {
            return collisionResult
        }
    }
    return null
}

function RayCaster(fov, focalLength, columnWidth, screenWidth) {
    this.fov = fov
    this.focalLength = focalLength
    this.columnWidth = columnWidth
    this.screenWidth = screenWidth
}

/**
 * Cast out a series of rays in a cone starting from origin at an angle this.fov / 2 either
 * side of the absolute angle facing, returning an array containing collision data for each ray
 * @param  {Object} origin          x and y coords to project from
 * @param  {number} facing          angle to project towards
 * @param  {function} collisionFunc returns collision data for x and y coords
 * @return {Array}                  contains collision data for each ray
 */
RayCaster.prototype.cast = function (origin, facing, collisionFunc) {
    const angleStep = this.columnWidth * this.fov / this.screenWidth

    let zArray = []

    for (let i = 0; i < this.screenWidth / this.columnWidth; ++i) {
        const angle = facing - this.fov / 2 + angleStep * i
        const perspectiveAngle = Math.atan2(
            this.columnWidth * i / this.screenWidth - 0.5,
            this.focalLength
        )

        zArray[i] = new Ray(origin, angle).cast(collisionFunc(perspectiveAngle))
    }

    return zArray
}

function World() {
}

function GridWorld() {
    this.grid = [[]]
}

GridWorld.prototype = World

GridWorld.prototype.collisionFunc = function (perspectiveAngle) {
    return function (x, y, distance) {
        const squareType = this.grid[Math.floor(y)][Math.floor(x)]
        if (squareType != 0) {
            return {
                z: distance * Math.cos(perspectiveAngle),
                type: squareType
            }
        }
        return null
    }
}

GridWorld.prototype.render = function (ctx) {
    var imageData = ctx.createImageData(width, height)
    var data = imageData.data

    for (let x = 0; x < width; ++x) {
        const columnIndex = Math.floor(x / columnWidth)
        const wallHeight = height / zArray[columnIndex].z
        const shadingFactor = Math.min(1, 1.4/zArray[columnIndex].z + 0.3)

        for (let y = 0; y < height; ++y) {
            if (
                y < (height - wallHeight) / 2 ||
                y > (height + wallHeight) / 2
            ) {
                data[y * width * 4 + (x * 4) + 0] = 200
                data[y * width * 4 + (x * 4) + 1] = 200
                data[y * width * 4 + (x * 4) + 2] = 200
            } else {
                if (zArray[columnIndex].type == 1) {
                    data[y * width * 4 + (x * 4) + 0] = 0
                    data[y * width * 4 + (x * 4) + 1] = 150 * shadingFactor
                    data[y * width * 4 + (x * 4) + 2] = 0
                }
                else if (zArray[columnIndex].type == 2) {
                    data[y * width * 4 + (x * 4) + 0] = 150 * shadingFactor
                    data[y * width * 4 + (x * 4) + 1] = 0
                    data[y * width * 4 + (x * 4) + 2] = 0
                }
            }
            data[y * width * 4 + (x * 4) + 3] = 255
        }
    }

    ctx.putImageData(imageData, 0, 0)
}

function Renderer(ctx, rayCaster) {
    this.ctx = ctx
    this.rayCaster = rayCaster
}

Renderer.prototype.render(origin, facing, world) {
    this.rayCaster.cast(origin, facing, world.collisionFunc)
}

function Player(x, y, facing) {
    this.x = x
    this.y = y
    this.facing = facing
}
