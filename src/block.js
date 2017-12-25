const { Bytes, Biterator } = require('./common')

const Block = {
    parseRaw: function(blockstr) {
        const reader   = new Biterator(blockstr)
        const header = {
            version  : reader.readInt(4),
            previous : Bytes.toHex(reader.readBytes(32).reverse()),
            merkle   : Bytes.toHex(reader.readBytes(32).reverse()),
            time     : reader.readInt(4),
            nbits    : Bytes.toHex(reader.readBytes(4).reverse()),
            nonce    : reader.readInt(4)
        }

        return header
    }
}

module.exports = {Block: Block}
