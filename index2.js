function Ray(origin, angle) {
    this.origin = origin
    this.angle = angle
    this.maxDist = 100
}

Ray.prototype.cast = function (collisionFunc) {
    for (let distance = 0; distance <= 500; distance += 0.01) {
        const rayX = this.origin.x + distance * Math.cos(Math.PI / 180 * this.angle)
        const rayY = this.origin.y + distance * Math.sin(Math.PI / 180 * this.angle)

        if (collisionFunc(rayX, rayY)) {
            return distance
        }
    }
    return 0
}
