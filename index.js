const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
const width = canvas.width
const height = canvas.height

const roomData = [
    [1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,1],
    [1,0,0,2,0,0,0,1],
    [1,0,0,2,0,0,0,1],
    [1,0,0,2,0,0,0,1],
    [1,0,0,2,0,0,0,1],
    [1,1,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1]
]

const player = {
    x: 4,
    y: 4,
    facing: 0
}

const fov = 60
const focalLength = 1
const columnWidth = 1
const angleStep = columnWidth * fov / width

let keys = []
window.addEventListener('keydown', function (e) {
    keys[e.keyCode] = true;
})
window.addEventListener('keyup', function (e) {
    keys[e.keyCode] = false;
})

function loop () {
    if (keys[37]) {
        player.facing -= 4;
    }
    if (keys[39]) {
        player.facing += 4;
    }
    if (keys[38]) {
        const newX = player.x + .1 * Math.cos(Math.PI / 180 * player.facing)
        const newY = player.y + .1 * Math.sin(Math.PI / 180 * player.facing)
        // Don't let player get too close to wall
        const collX = player.x + .4 * Math.cos(Math.PI / 180 * player.facing)
        const collY = player.y + .4 * Math.sin(Math.PI / 180 * player.facing)
        if (roomData[Math.floor(player.y)][Math.floor(collX)] == 0) {
            player.x = newX
        }
        if (roomData[Math.floor(collY)][Math.floor(player.x)] == 0) {
            player.y = newY
        }
    }
    if (keys[40]) {
        const newX = player.x - .1 * Math.cos(Math.PI / 180 * player.facing)
        const newY = player.y - .1 * Math.sin(Math.PI / 180 * player.facing)
        // Don't let player get too close to wall
        const collX = player.x - .4 * Math.cos(Math.PI / 180 * player.facing)
        const collY = player.y - .4 * Math.sin(Math.PI / 180 * player.facing)
        if (roomData[Math.floor(player.y)][Math.floor(collX)] == 0) {
            player.x = newX
        }
        if (roomData[Math.floor(collY)][Math.floor(player.x)] == 0) {
            player.y = newY
        }
    }

    let zArray = []

    for (let i = 0; i < width / columnWidth; ++i) {
        const angle = player.facing - fov / 2 + angleStep * i
        const perspectiveAngle = Math.atan2(
            columnWidth * i / width - 0.5,
            focalLength
        )

        for (let distance = 0; distance <= 500; distance += 0.01) {
            const rayX = player.x + distance * Math.cos(Math.PI / 180 * angle)
            const rayY = player.y + distance * Math.sin(Math.PI / 180 * angle)

            let squareType = roomData[Math.floor(rayY)][Math.floor(rayX)]
            if (squareType != 0) {
                zArray[i] = {
                    z: distance * Math.cos(perspectiveAngle),
                    type: squareType
                }
                break
            }
        }
    }

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

    window.requestAnimationFrame(loop)
}

window.requestAnimationFrame(loop)
