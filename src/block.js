const { Bytes, Biterator } = require('./common')
const { Transaction } = require('./transaction')
const { Hash } = require('./common.js')

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
        let rawtxs = []
        let txbuf = Bytes.toHex(reader.getRemaining())
        for(let t=0; t<ntx; t++) {
            const tx = Transaction.parseRaw(txbuf)
            txs.push(tx)
            rawtxs.push(txbuf.slice(0, tx.size*2))
            txbuf = txbuf.slice(tx.size*2) 
        }
        return {header: header, transactions: txs, rawtxs: rawtxs} 
    },
    calcMerkleRoot: function(txs) {
        function processRow(row) {
            if (row.length % 2) row.push(row[row.length - 1])
            let newrow = []
            for(let start = 0, end = 2; start < row.length; start+=2, end+=2 ) {
                newrow.push(Bytes.reverseHex(Hash.dhash(row.slice(start, end).map(h => Bytes.reverseHex(h)).join(''))))
            }
            return newrow
        }
        let row = txs
        while(row.length > 1) row = processRow(row)
        return row[0]
    }
}

module.exports = {Block: Block}
