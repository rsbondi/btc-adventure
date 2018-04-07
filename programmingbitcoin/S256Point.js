const { BigPoint } = require('./BigPoint')
const { S256Field } = require('./S256Field')
const bigInt = require('big-integer')

const A = bigInt(0)
const B = bigInt(7)

class S256Point extends BigPoint {
    constructor(x, y) {
        const a = new S256Field(A)
        const b = new S256Field(B)
        
        super(x, y, a, b)
    }
}

const G = new S256Point(
    new S256Field(bigInt("79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798", 16)),
    new S256Field(bigInt("483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8", 16)),
)
N = bigInt("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141", 16)

module.exports = {
    S256Point: S256Point,
    G: G,
    N: N
}
