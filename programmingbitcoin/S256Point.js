const { BigPoint } = require('./BigPoint')
const { S256Field } = require('./S256Field')
const { Signature } = require('./Signature')
const { Util } = require('./Util')
const crypto = require('crypto')
const ripemd160 = require('ripemd160')
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

    verify(z, sig) {
        const s_inv = sig.s.modPow(N.subtract(2), N)
        const u = z.multiply(s_inv).mod(N)
        const v = sig.r.multiply(s_inv).mod(N)
        const total = G.mul(u).add(this.mul(v))
        return total.x.num.eq(sig.r)
    }

    sec(compressed) {
        const xbuf = Buffer.from(Util.bigByteString(this.x.num),'hex')
        if(compressed) 
            return Buffer.concat([Buffer.from(this.y.num.mod(2).eq(0) ? '02' : '03', 'hex'), xbuf])
        else 
            return Buffer.concat([Buffer.from('04','hex'), xbuf, Buffer.from(Util.bigByteString(this.y.num),'hex')])
    }

    h160(compressed=true) {
        return Util.hash160(this.sec(compressed))
    }

    address(compressed=true, prefix='00') {
        const h160 = this.h160(compressed)
        return Util.encode_base58_checksum(Buffer.concat([Buffer.from(prefix, 'hex'), h160]))
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
