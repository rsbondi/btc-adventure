const { Bytes, Biterator } = require('./common')
const { Transaction } = require('./transaction')

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

        const ntx = reader.readVarInt()

        let txs =[]
        let txbuf = Bytes.toHex(reader.getRemaining())
        for(let t=0; t<ntx; t++) {
            const tx = Transaction.parseRaw(txbuf)
            txs.push(tx)
            txbuf = txbuf.slice(tx.size*2) 
        }
        return {header: header, transactions: txs} 
    }
}

module.exports = {Block: Block}
