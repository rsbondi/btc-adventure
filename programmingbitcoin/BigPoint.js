const bigInt = require('big-integer')
const { BigFieldElement } = require('./BigFieldElement')

class BigPoint{
    constructor(x, y, a, b) {
        this.two = new BigFieldElement(bigInt(2), a.prime)
        this.three = new BigFieldElement(bigInt(3), a.prime)
        this.x = x
        this.y = y
        this.a = a
        this.b = b

        if(x === null && y === null) {
            this.infinity = true
        } else {
            const ysquared = this.y.pow(this.two)
            const quad = this.x.pow(this.three).add(this.a.mul(this.x)).add(this.b)
            if(ysquared.neq(quad))
                throw(`Point (${x.num},${y.num}) is not on the curve where a,b=${a.num},${b.num}`)
        }
    }

    eq(other) {
        return this.a.eq(other.a) && this.b.eq(other.b) && this.x.eq(other.x) && this.y.eq(other.y)
    }

    // exercise 2
    neq(other) {
        return this.a.neq(other.a) || this.b.neq(other.b) || this.x.neq(other.x) || this.y.neq(other.y)
    }

    _valid(other) {
        if(this.a.neq(other.a) || this.b.neq(other.b)) throw('can not add to points on different curves')
    }
    add(other) {
        this._valid(other)

        // exercise 4
        if(this.infinity) return other
        if(other.infinity) return this

        // exercise 5
        if(this.x.eq(other.x) && this.y.add(other.y).eq(new BigFieldElement(bigInt(0), this.x.prime))) {
            return new this.constructor(null, null, this.a, this.b)
        }

        let s, x3, y3
        if(this.neq(other)) {
            s = other.y.sub(this.y).div(other.x.sub(this.x)) // s=(y2-y1)/(x2-x1)
        } else {
            s = this.x.pow(this.two).mul(this.three).add(this.a).div(this.y.mul(this.two)) // s=(3x1^2+a)/(2y1)
        }
        x3 = s.pow(this.two).sub(this.x).sub(other.x)
        y3 = s.mul(this.x.sub(x3)).sub(this.y) // y3=s(x1-x3)-y1
        return new this.constructor(x3, y3, this.a, this.b)

    }

}

module.exports = {
    BigPoint: BigPoint
}

