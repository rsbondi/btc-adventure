const { Bytes, Biterator } = require('./common')
const { Script } = require('./script')

const Transaction = {
    parseRaw: function(rawtx) {
      let tx = {
          version: 1,
          locktime: 0,
          inputs: [],
          outputs: []
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
        tx.inputs.push({
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
        tx.outputs.push(out)
      }
      
      if(hasWitness) {
        for(let i=0;i<incount;i++) {
          const len = reader.readVarInt()
          tx.inputs[i].txinwitness = []
          for(let w=0;w<len;w++) {
            tx.inputs[i].txinwitness.push(Bytes.toHex(reader.readBytes(reader.readVarInt())))
          }
        }  
      }

      tx.locktime = reader.readInt(4)
      tx.size = reader.getIndex()
      
      return tx    
    }
}


module.exports = { Transaction: Transaction }