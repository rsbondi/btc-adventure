const { N , G} = require('./S256Point')
const { Signature } = require('./Signature')
const { Util } = require('./Util')
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

    wif(testnet=false) {
        let prefix = '80', suffix = ''
        if(testnet) prefix = 'ef'

        let secret_string = Util.bigByteString(this.secret) 
        const secret_bytes = Buffer.from(secret_string, 'hex')

        if(this.compressed) suffix = '01'
        return Util.encode_base58_checksum(Buffer.concat([Buffer.from(prefix, 'hex'), secret_bytes, Buffer.from(suffix, 'hex')]))
    }

}

module.exports = {
    PrivateKey: PrivateKey
}