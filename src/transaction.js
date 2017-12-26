const { Bytes, Biterator, Hash } = require('./common')
const { Script } = require('./script')

// TODO: coninbase seems to parse but has different format

const Transaction = {
    parseRaw: function(rawtx) {
      let tx = {
          version: 1,
          locktime: 0,
          vin: [],
          vout: []
      }

      const reader = new Biterator(Bytes.fromHex(rawtx))
      
      tx.version = reader.readInt(4)
      let hasWitness = false
      let incount = reader.readVarInt()
      if(incount === 0x00) {
        hasWitness = reader.readInt(1)  === 0x01
        incount = reader.readVarInt()
      }
      
      for(let i=0;i<incount;i++) {
        const txid = Bytes.toHex(reader.readBytes(32).reverse())
        const vout = reader.readInt(4)
        const scriptbytes = reader.readBytes(reader.readVarInt())
        const hex = Bytes.toHex(scriptbytes)
        const asm = Script.toAsm(scriptbytes).join(' ')
        tx.vin.push({
          txid: txid, // little endian
          vout: vout,
          scriptSig:  { 
            asm: asm,
            hex: hex
          },
          sequence: reader.readInt(4)
        })
      }
      
      const nout = reader.readVarInt()
      
      for(let i=0;i<nout;i++) {
        let out = {
          value: reader.readInt(8)/100000000,
          n: i
        }
        const scriptbytes = reader.readBytes(reader.readVarInt())
        out.scriptPubKey = {
          asm:  Script.toAsm(scriptbytes).join(' '),
          hex: Bytes.toHex(scriptbytes)
        }
        tx.vout.push(out)
      }
      let witnessStart = 0
      let witnessSize = 0
      if(hasWitness) {
        witnessStart = reader.getIndex() 
        witnessSize = witnessStart + 2 // +lock time - marker - flag
        for(let i=0;i<incount;i++) {
          const len = reader.readVarInt()
          tx.vin[i].txinwitness = []
          for(let w=0;w<len;w++) {
            tx.vin[i].txinwitness.push(Bytes.toHex(reader.readBytes(reader.readVarInt())))
          }
        }  
      }

      tx.locktime = reader.readInt(4)
      tx.size = reader.getIndex()
      tx.vsize = hasWitness ? Math.ceil((witnessSize*3+tx.size) / 4) : tx.size
      
      const noseg = hasWitness ? rawtx.slice(0, 8 /* version*/) +
        rawtx.slice(12, witnessStart * 2  /* skip marker/flag, to witness - marker/flag */) +
        rawtx.slice(tx.size * 2 - 8, tx.size * 2) : ''
      // the previous and following lines limit to the calculated size of the transaction, 
      // since in the block thay are concatenated and we don't know until we get here
      const txhash = Bytes.reverseHex(Hash.datahash(rawtx.slice(0,tx.size*2)))
      tx.txid = hasWitness ? Bytes.reverseHex(Hash.datahash(noseg))
        : txhash
      tx.hash = txhash

      return tx    
    }
}


module.exports = { Transaction: Transaction }