const { Reader, Util } = require('./Util')
const { Script } = require('./Script')

class TxOut {
    constructor(amount, script_pubkey) {
        this.amount = amount
        this.script_pubkey = Script.parse(script_pubkey)
    }

    static parse(s) {
        const amount = s.read(8, true)
        const script_pubkey_length = s.read_varint()
        const script_pubkey = Buffer.from(Util.bigByteString(s.read(script_pubkey_length)), 'hex')
        return new this(amount, script_pubkey)
    }
}

module.exports = {TxOut: TxOut}    
