
class Ray {
    maxDist: number
    constructor (public origin: Point, public angle: number) {
        this.maxDist = 500
    }

    cast (collisionFunc: CollisionFuncTwo): CollisionResult {
        for (let distance = 0; distance <= this.maxDist; distance += 0.01) {
            const rayX = this.origin.x + distance * Math.cos(Math.PI / 180 * this.angle)
            const rayY = this.origin.y + distance * Math.sin(Math.PI / 180 * this.angle)

            let collisionResult = collisionFunc(rayX, rayY, distance)
            if (collisionResult !== null) {
                return collisionResult
            }
        }
        return null
    }
}

class RayCaster {
    constructor(
        public fov: number, public focalLength: number,
        public columnWidth: number, public screenWidth: number
    ) { }

    /**
     * Cast out a series of rays in a cone starting from origin at an angle this.fov / 2 either
     * side of the absolute angle facing, returning an array containing collision data for each ray
     * @param  {Point} origin           x and y coords to project from
     * @param  {number} facing          angle to project towards
     * @param  {function} collisionFunc returns collision data for x and y coords
     * @return {Array}                  contains collision data for each ray
     */
    cast (origin: Point, facing: number, collisionFunc: CollisionFunc): CollisionResult[] {
        const angleStep: number = this.columnWidth * this.fov / this.screenWidth

        let zArray: CollisionResult[] = []

        for (let i = 0; i < this.screenWidth / this.columnWidth; ++i) {
            const angle: number = facing - this.fov / 2 + angleStep * i
            const perspectiveAngle: number = Math.atan2(
                this.columnWidth * i / this.screenWidth - 0.5,
                this.focalLength
            )

            zArray[i] = new Ray(origin, angle).cast(collisionFunc(perspectiveAngle))
        }

        return zArray
    }
}

type Grid = number[][]

interface CollisionResult {
    z: number,
    type: number
}

type CollisionFunc = (perspectiveAngle: number) => CollisionFuncTwo

type CollisionFuncTwo = (x: number, y: number, distance: number) => CollisionResult

class GridWorld {
    textures: {[key: number]: Texture}
    constructor(public grid: Grid, public player: Player) {
        this.textures = {}
    }

    collisionFunc (perspectiveAngle: number): (x: number, y: number, distance: number) => CollisionResult {
        return (x: number, y: number, distance: number) => {
            const squareType: number = this.grid[Math.floor(y)][Math.floor(x)]
            if (squareType != 0) {
                return {
                    z: distance * Math.cos(perspectiveAngle),
                    type: squareType
                }
            }
            return null
        }
    }

    render (
        width: number, height: number,
        ctx: CanvasRenderingContext2D, rayCaster: RayCaster
    ): void {
        let imageData: ImageData = ctx.createImageData(width, height)
        let data: Uint8ClampedArray = imageData.data

        const zArray = rayCaster.cast(this.player.position, this.player.facing,
            this.collisionFunc.bind(this))

        for (let x = 0; x < width; ++x) {
            const columnIndex = Math.floor(x / rayCaster.columnWidth)
            const wallHeight = height / zArray[columnIndex].z
            const shadingFactor = Math.min(1, 1.4/zArray[columnIndex].z + 0.3)

            for (let y = 0; y < height; ++y) {
                const coord = y * width * 4 + (x * 4)
                if (
                    y < (height - wallHeight) / 2 ||
                    y > (height + wallHeight) / 2
                ) {
                    data[coord + 0] = 200
                    data[coord + 1] = 200
                    data[coord + 2] = 200
                } else {
                    const wallType = zArray[columnIndex].type;
                    if (wallType in this.textures) {
                        const texture = this.textures[wallType]
                        // Perspective transformation of walls
                        const texPixel = texture.interpTexPixel(
                            x / width * zArray[columnIndex].z,
                            (y - (height - wallHeight) / 2) / wallHeight
                        )
                        // const texPixel = this.textures[1].getTexPixel(x, y)
                        data[coord + 0] = texPixel.r
                        data[coord + 1] = texPixel.g
                        data[coord + 2] = texPixel.b

                        // data[coord + 0] = 0
                        // data[coord + 1] = 150 * shadingFactor
                        // data[coord + 2] = 0
                    }
                    data[coord + 0] *= shadingFactor
                    data[coord + 1] *= shadingFactor
                    data[coord + 2] *= shadingFactor
                }
                data[coord + 3] = 255
            }
        }

        ctx.putImageData(imageData, 0, 0)
    }

    registerTexture (wallIndex: number, texture: Texture) {
        this.textures[wallIndex] = texture
    }
}

// function Renderer(ctx, rayCaster) {
//     this.ctx = ctx
//     this.rayCaster = rayCaster
// }
//
// Renderer.prototype.render(origin, facing, world) {
//     this.rayCaster.cast(origin, facing, world.collisionFunc)
// }

interface Point {
    x: number,
    y: number
}

class Player {
    constructor(public position: Point, public facing: number) {}
}

interface RGBA {
    r: number,
    g: number,
    b: number,
    a: number
}

class Texture {
    loaded: boolean
    image: HTMLImageElement
    imageData: ImageData
    constructor() {
        this.loaded = false
    }

    load (path: string): Promise<Texture> {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        this.image = new Image()
        this.image.src = path

        return new Promise((resolve, reject) => {
            this.image.onload = () => {
                ctx.drawImage(this.image, 0, 0)
                this.imageData = ctx.getImageData(0, 0, this.image.width, this.image.height)
                this.loaded = true
                resolve(this)
            }
        })
    }

    interpTexPixel (x: number, y: number): RGBA {
        if (this.loaded) {
            const xImage = Math.round((x % 1) * this.image.width)
            const yImage = Math.round((y % 1) * (this.image.height / 2)) // HACK
            const coord = yImage * this.image.width * 4 + (xImage * 4)

            return {
                r: this.imageData.data[coord + 0],
                g: this.imageData.data[coord + 1],
                b: this.imageData.data[coord + 2],
                a: this.imageData.data[coord + 3]
            }
        }
        return null
    }

    getTexPixel (x: number, y: number): RGBA {
        if (this.loaded) {
            const xImage = x % this.image.width
            const yImage = y % (this.image.height / 2) // HACK
            const coord = yImage * this.image.width * 4 + (xImage * 4)

            return {
                r: this.imageData.data[coord + 0],
                g: this.imageData.data[coord + 1],
                b: this.imageData.data[coord + 2],
                a: this.imageData.data[coord + 3]
            }
        }
        return null
    }
}

class App {
    canvas: HTMLCanvasElement
    ctx: CanvasRenderingContext2D
    width: number
    height: number
    rayCaster: RayCaster
    keys: {[key: number]: boolean}
    player: Player
    gridWorld: GridWorld

    constructor () {
        this.canvas = <HTMLCanvasElement>document.getElementById('canvas')
        this.ctx = this.canvas.getContext('2d')
        this.width = this.canvas.width
        this.height = this.canvas.height
        this.rayCaster = new RayCaster(60, 1, 1, this.width)

        const roomData = [
            [1,1,1,1,1,1,1,1],
            [1,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,2],
            [1,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,1],
            [1,1,1,1,1,1,0,1],
            [1,0,0,0,0,0,0,1],
            [1,1,1,1,1,1,1,1]
        ]

        this.player = new Player({x: 5, y: 4}, 0)
        this.gridWorld = new GridWorld(roomData, this.player)

        this.keys = {}

        window.addEventListener('keydown', (e) => {
            this.keys[e.keyCode] = true;
        })
        window.addEventListener('keyup', (e) => {
            this.keys[e.keyCode] = false;
        })
    }

    run () {
        new Texture().load('wallpaper.png').then((texture) => {
            this.gridWorld.registerTexture(1, texture)
            return new Texture().load('grass.jpg')
        }).then((texture) => {
            this.gridWorld.registerTexture(2, texture)
        }).then(() => {
            window.requestAnimationFrame(this.loop.bind(this))
        })
    }

    loop () {
        if (this.keys[37]) {
            this.player.facing -= 4;
        }
        if (this.keys[39]) {
            this.player.facing += 4;
        }
        if (this.keys[38]) {
            const newX = this.player.position.x + .1 * Math.cos(Math.PI / 180 * this.player.facing)
            const newY = this.player.position.y + .1 * Math.sin(Math.PI / 180 * this.player.facing)
            // Don't let player get too close to wall
            const collX = this.player.position.x + .4 * Math.cos(Math.PI / 180 * this.player.facing)
            const collY = this.player.position.y + .4 * Math.sin(Math.PI / 180 * this.player.facing)
            if (this.gridWorld.collisionFunc(0)(collX, this.player.position.y, 0) === null) {
                this.player.position.x = newX
            }
            if (this.gridWorld.collisionFunc(0)(this.player.position.x, collY, 0) === null) {
                this.player.position.y = newY
            }
        }
        if (this.keys[40]) {
            const newX = this.player.position.x - .1 * Math.cos(Math.PI / 180 * this.player.facing)
            const newY = this.player.position.y - .1 * Math.sin(Math.PI / 180 * this.player.facing)
            // Don't let player get too close to wall
            const collX = this.player.position.x - .4 * Math.cos(Math.PI / 180 * this.player.facing)
            const collY = this.player.position.y - .4 * Math.sin(Math.PI / 180 * this.player.facing)
            if (this.gridWorld.collisionFunc(0)(collX, this.player.position.y, 0) === null) {
                this.player.position.x = newX
            }
            if (this.gridWorld.collisionFunc(0)(this.player.position.x, collY, 0) === null) {
                this.player.position.y = newY
            }
        }

        this.gridWorld.render(this.width, this.height, this.ctx, this.rayCaster)
        window.requestAnimationFrame(this.loop.bind(this))
    }
}

new App().run()
