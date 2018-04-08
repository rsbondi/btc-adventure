const { BigPoint } = require('./BigPoint')
const { S256Field } = require('./S256Field')
const { Signature } = require('./Signature')
const bigInt = require('big-integer')

const A = bigInt(0)
const B = bigInt(7)

class S256Point extends BigPoint {
    constructor(x, y) {
        const a = new S256Field(A)
        const b = new S256Field(B)
        
        super(x, y, a, b)
                
    }

    mul(other) {
        if(!this.exp) {
            this.exp = [this]
            for(let n=0; n<255; n++) {
                this.exp.push(this.exp[n].add(this.exp[n]))
            }
        }
        let sum = null
        for(let n=0; n<256; n++) {
            const b = other.shiftRight(n).and(1)
            if(b.value) {
                if(!sum) sum = this.exp[n]
                else sum = sum.add(this.exp[n])
            } 
        }
        return sum
    }

    /*
        # 1/s = pow(s, N-2, N)
        s_inv = pow(sig.s, N-2, N)
        # u = z / s
        u = z * s_inv % N
        # v = r / s
        v = sig.r * s_inv % N
        # u*G + v*P should have as the x coordinate, r
        total = u*G + v*self
        return total.x.num == sig.r
    */
    verify(z, sig) {
        const s_inv = sig.s.modPow(N-2, N)
        const u = z.multiply(s_inv).mod(N)
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
