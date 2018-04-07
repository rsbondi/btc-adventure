const bigInt = require('big-integer')

class BigFieldElement {
    constructor(num, prime) {
        if( num.lt(0) || num.geq(prime))
            throw(`num should be between 0 and ${prime}-1`)

        this.num = num
        this.prime = prime
    }

    eq(other) { return other.num.eq(this.num) && other.prime.eq(this.prime) }

    neq(other) { return other.num.neq(this.num) || other.prime.neq(this.prime) }

    _valid(other) { if(other.prime.neq(this.prime)) throw('cannot add two numbers in different Fields') }

    add(other) {
        this._valid(other)
        const num = this.num.add(other.num).mod(this.prime)
        return new this.constructor(num, this.prime)
    }

    sub(other) {
        this._valid(other)
        const mod = (x, n) => (x.mod(n).add(n)).mod(n) // js hack for mod of negative, need hack with big-integer also
        const num = mod(this.num.subtract(other.num), (this.prime)) 
        return new this.constructor(num, this.prime)

    }

    mul(other) {
        this._valid(other)
        const num = this.num.multiply(other.num).mod(this.prime)
        return new this.constructor(num, this.prime)
    }

    pow(other) {
        this._valid(other)
        return new this.constructor(bigInt(this.num).modPow(other.num, this.prime), this.prime)
    }

    div(other) {
        this._valid(other)
        const nminus2 = new this.constructor(this.prime.subtract(2), this.prime)
        const result = this.mul(other.pow(nminus2))
        return new this.constructor(result.num, this.prime)

    }

}
module.exports = {
    BigFieldElement: BigFieldElement
}
