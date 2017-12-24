const { Bytes } = require('./common')
const { Script } = require('./script')
const bigInt = require('big-integer')

// this may need to move to common, not sure yet
function Biterator(bytes) {
    var index = 0
    var buf   = bytes
  
    return {
      readBytes: function(n) {
        var bytes = buf.slice(index, index+n) 
        index += n
        return bytes
        
      },
      readInt: function(n) {
        var int = this.readBytes(n).reduce(function(o, byte, i) { 
          return o.add(bigInt(byte).times(bigInt(256).pow(i))) // little endian lsd first, no reverse
        }, bigInt(0)) 
        return  int.toJSNumber()
      },
      readVarInt: function() {
        var byte = this.readBytes(1)[0]
        if(byte < 0xFD) return byte
        else self.readInt(2 * (byte-0xFC))
      }
    }
  }

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
      
      return tx    
    }
}


module.exports = { Transaction: Transaction }