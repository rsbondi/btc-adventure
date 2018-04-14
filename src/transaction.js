const { Bytes, Biterator, Hash, Bitwriter } = require('./common')
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
      const txhash = Bytes.reverseHex(Hash.dhash(rawtx.slice(0,tx.size*2)))
      tx.txid = hasWitness ? Bytes.reverseHex(Hash.dhash(noseg))
        : txhash
      tx.hash = txhash

      return tx    
    },
    serailize: function(tx) {
      const writer = new Bitwriter()

      writer.writeInt(tx.version, 4)
      const hasWitness = tx.vin[0].txinwitness ? 1 : 0

      if(hasWitness) writer.write('0001')
      writer.writeVarInt(tx.vin.length)

      tx.vin.forEach(input => {
        writer.write(Bytes.reverseHex(input.txid))
        writer.writeInt(input.vout, 4)
        writer.writeVarInt(input.scriptSig.hex.length / 2)
        writer.write(input.scriptSig.hex)
        writer.writeInt(input.sequence, 4)
      }) 

      writer.writeVarInt(tx.vout.length)
      tx.vout.forEach(out => {
        writer.writeInt(out.value * 100000000, 8)
        writer.writeVarInt(out.scriptPubKey.hex.length/2)
        writer.write(out.scriptPubKey.hex)
      })

      if(hasWitness) {
        tx.vin.forEach(input => {
          const nwit = input.txinwitness.length
          writer.writeVarInt(nwit)
          input.txinwitness.forEach(wit => {
            writer.writeVarInt(wit.length)
            writer.write(wit)
          })
        })
      }
      
      writer.writeInt(tx.locktime, 4)
      
      return writer.getValue()
    },
    create: function(tx) {
        // create standard transaction
        // create inputs with no script, add script when signing
        // output scriptPubKey = OP_DUP OP_HASH160 <pub key hash> OP_EQUALVERIFY OP_CHECKSIG
        // the output scriptPubKey seems to depend on where you send, P2SH (multisig) = OP_HASH160 <script hash> OP_EQUAL
        // signature from rpc = createrawtransaction [{"txid":"id","vout":n},...] {"address":amount,"data":"hex",...} ( locktime ) ( replaceable )
        // "data" in above is OP_RETURN, ignore for now
    },
    // createmultisig nrequired ["key",...]
    createMulti: function(nrequired, keys) {

    } ,
    verifyHash(raw, prev) {
      let tx = Transaction.parseRaw(raw)
      let verifyHashes = []
      tx.vin.forEach(function(vin, i) {
        let pubkey = prev[vin.txid].vout[vin.vout].scriptPubKey.hex
        const sigkey = vin.scriptSig.asm.split(' ')
        let sig = sigkey[0]
        hashtype = sig.slice(-2)
        let txcopy = Object.assign({}, tx)
        txcopy.vin.forEach(function(cvin, ci) {
          if(ci == i) {
            txcopy.vin[ci].scriptSig = {hex: pubkey}
          } else cvin = '00'
        })
        const ser = Transaction.serailize(txcopy)
        verifyHashes.push(Hash.dhash(`${ser}${hashtype}000000`))
      })
      return verifyHashes
    }
}


module.exports = { Transaction: Transaction }