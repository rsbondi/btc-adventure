const bigInt = require('big-integer')

class Point{
    constructor(x, y, a, b) {
        this.x = x
        this.y = y
        this.a = a
        this.b = b

        if(x === null && y === null) {
            this.infinity = true
        } else {
            const ysquared = bigInt(this.y).pow(2)
            const quad = bigInt(this.x).pow(3).add(bigInt(this.a).multiply(this.x)).add(this.b)
            if(ysquared.neq(quad))
                throw(`Point (${x},${y}) is not on the curve where a,b=${a},${b}`)
        }
    }

    eq(other) {
        return this.a == other.a && this.b == other.b && this.x == other.x && this.y == other.y
    }

    // exercise 2
    neq(other) {
        return this.a != other.a || this.b != other.b || this.x != other.x || this.y != other.y
    }

    _valid(other) {
        if(this.a != other.a || this.b != other.b) throw('can not add to points on different curves')
    }
    add(other) {
        this._valid(other)
        
        // exercise 4
        if(this.infinity) return other
        if(other.infinity) return this

        // exercise 5
        if(this.x == other.x && this.y + other.y ===  0) return new this.constructor(null, null, this.a, this.b)
    }

}

module.exports = {
    Point: Point
}

