const bigInt = require('big-integer')

class FieldElement {
    constructor(num, prime) {
        if( num < 0 || num >= prime)
            throw(`num should be between 0 and ${prime}-1`)

        this.num = num
        this.prime = prime
    }

    eq(other) { return other.num == this.num && other.prime == this.prime }

    // exercise 1
    neq(other) { return other.num != this.num || other.prime != this.prime}

    _valid(other) { if(other.prime != this.prime) throw('cannot add two numbers in different Fields') }

    add(other) {
        this._valid(other)
        const num = (this.num + other.num) % this.prime
        return new this.constructor(num, this.prime)
    }

    // exercise 3
    sub(other) {
        this._valid(other)
        const mod = (x, n) => (x % n + n) % n // js hack for mod of negative
        const num = mod(this.num - other.num, this.prime) 
        return new this.constructor(num, this.prime)

    }

    // exercise 6
    mul(other) {
        this._valid(other)
        const num = (this.num * other.num) % this.prime
        return new this.constructor(num, this.prime)
    }

    pow(other) {
        this._valid(other)
        return new this.constructor(bigInt(this.num).pow(other.num).mod(this.prime).toJSNumber(), this.prime)
    }

    div(other) {
        this._valid(other)
        const nminus2 = new this.constructor(this.prime -2, this.prime)
        const result = this.mul(other.pow(nminus2))
        return new this.constructor(result.num, this.prime)

    }

}
module.exports = {
    FieldElement: FieldElement
}
