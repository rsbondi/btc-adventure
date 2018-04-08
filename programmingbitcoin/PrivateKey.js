const { N , G} = require('./S256Point')
const { Signature } = require('./Signature')
const bigInt = require('big-integer')

class PrivateKey {
    constructor(secret) {
        this.secret = secret
        this.point = G.mul(secret)
    }

    sign(z) {
        const k = bigInt.randBetween(1, N)
        const r = G.mul(k).x.num
        const k_inv = k.modPow(N.subtract(2), N)
        let s = z.add(r.multiply(this.secret)).multiply(k_inv).mod(N)
        if(s.gt(N.divide(2))) s = N.subtract(s)
        return new Signature(r, s)
    }
}

module.exports = {
    PrivateKey: PrivateKey
}