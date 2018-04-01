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

        let s, x3, y3
        if(this.neq(other)) {
            // exercise 7
            s = bigInt(other.y).subtract(this.y).divide(bigInt(other.x).subtract(this.x)) // s=(y2-y1)/(x2-x1)
        } else {
            // exercise 9
            s = bigInt(this.x).pow(2).multiply(3).add(this.a).divide(bigInt(this.y).multiply(2)) // s=(3x1^2+a)/(2y1)
        }
        x3 = s.pow(2).subtract(this.x).subtract(other.x)
        y3 = s.multiply(bigInt(this.x).subtract(x3)).subtract(this.y) // y3=s(x1-x3)-y1
        return new this.constructor(x3.toJSNumber(), y3.toJSNumber(), this.a, this.b)

    }

}

module.exports = {
    Point: Point
}

