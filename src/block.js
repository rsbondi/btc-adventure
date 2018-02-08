const { Bytes, Biterator } = require('./common')
const { Transaction } = require('./transaction')
const { Hash } = require('./common.js')


const Block = {
    // same for block and cmpctblock
    parseHeader: function(reader) {
        return {
            version  : reader.readInt(4),
            previous : Bytes.toHex(reader.readBytes(32).reverse()),
            merkle   : Bytes.toHex(reader.readBytes(32).reverse()),
            time     : reader.readInt(4),
            nbits    : Bytes.toHex(reader.readBytes(4).reverse()),
            nonce    : reader.readInt(4)
        }
    },
    parseCompact: function(blockstr) {
        const reader   = new Biterator(blockstr)
        const header = Block.parseHeader(reader)

        const nonce = reader.readInt(8) // A nonce for use in short transaction ID calculations, maybe this should be hex characters?
        const idslength = reader.readVarInt()
        let ids = [] // compare to your mempool transactions by calculating siphash for mempool txids and match to build block
        for(let i=0; i<idslength; i++) {
            ids.push(Bytes.toHex(reader.readBytes(6))) // int or bytes? doc says little endian so int would be this, need to see these vs full txid
        }

        const prefillLen = reader.readVarInt()
        let txs =[]
        let rawtxs = []
        let txbuf = Bytes.toHex(reader.getRemaining())
        for(let t=0; t<prefillLen; t++) {
            const txreader   = new Biterator(txbuf) // to read index, then throw away, need cleaner way to read varint
            let txindex = txreader.readVarInt()
            txbuf = Bytes.toHex(txreader.getRemaining())
            const tx = Transaction.parseRaw(txbuf)
            txs.push(tx)
            rawtxs.push(txbuf.slice(0, tx.size*2))
            txbuf = txbuf.slice(tx.size*2) 
        }
        

        return {header: header, nonce: nonce,ids:ids, transactions: txs, rawtxs: rawtxs}
    },
    parseRaw: function(blockstr) {
        const reader   = new Biterator(blockstr)
        const header = Block.parseHeader(reader)
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
