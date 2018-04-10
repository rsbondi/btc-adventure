const crypto = require('crypto')
const ripemd160 = require('ripemd160')
const bigInt = require('big-integer')

let Util = {
    encode_base58(s) {
        const alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
        let count = 0
        while(!s[count]) count++

        let result = []
        let num = bigInt(s.toString('hex'), 16)
        let mod
        while (num.gt(0)) {
            [num, mod] = Object.values(num.divmod(58))
            result.unshift(alphabet[mod].charCodeAt(0))
        }
        for(let c=0; c<count; c++) result.unshift('1'.charCodeAt(0))
        return new Buffer(result)
    },

    double_sha256(s) {
        const first = crypto.createHash('sha256').update(s).digest()
        return crypto.createHash('sha256').update(first).digest()
    },

    hash160(s) {
        const first = crypto.createHash('sha256').update(s).digest()
        return new ripemd160().update(first).digest()

    },

    encode_base58_checksum(s) {
        return Util.encode_base58(Buffer.concat([s, Util.double_sha256(s).slice(0, 4)]))
    }
}

module.exports = {
    Util: Util
}