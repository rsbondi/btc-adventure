# Parsing raw bitcoin transaction

Reference code from [transaction.js](../src/transaction.js)

## Biterator, iterator for bitcoin format

First off we need a way to iterate the raw data within the rules of the bitcoin raw transaction format.
I created the `Biterator` object for this in [common.js](../src/common.js)

```javascript
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
  ```
The `Biterator` object is initialized with a byte array, stored internally in `buf` and initialized with `index` of 0, this is used for tracking where we are in `buf`.

`readBytes` will return `n` bytes and increment `index`.

`readInt` will read `n` bytes and multiply starting with the least significant digit, since this is little endian format(least significant digit first), we can loop from the first byte and simply multiply by the power of 256(base of a byte).

`readVarInt` is a scpecial case for reading varying length objects, like scripts for example.  Depending on the value of the first byte, a differnt number of bytes are read to get the length of the following data(ex. script).  If the first byte is less than `0xFD`, the byte itself represents the length.  Otherwise, `0xFD-0xFF` will represent how many of the following bytes are read to get the length, 2, 4 or 6 bytes(16, 32 and 64 bit integers) respectively.

## Parsing raw transaction

To get an understanding of the pieces of a raw transaction, take a look [here](https://rsbondi.github.io/btc-adventure/)

The `Transaction` object handles parsing via static member `parseRaw` with the signature of `parseRaw: function(rawtx)` where the `rawtx` parameter is the raw transaction hex string.  It will return an object representing the transaction with the following representation

```javascript
let tx = {
    version: 1,
    locktime: 0,
    vin: [],
    vout: []
}
```
Then we create or `Biterator` described above passing the bytes of the raw transaction.

*see [script.md](./script.md) for explanation of the `Byte` object found in [common.js](../src/common.js)*

```javascript
const reader = new Biterator(Bytes.fromHex(rawtx))
```

### Version

The first 4 bytes of a raw transaction represent the version number

```javascript
tx.version = reader.readInt(4)
```
### Inputs

Next we find the number of inputs

```javascript
let incount = reader.readVarInt()
```

Why is `let` used here you may ask?  With the addition of segwit the format has changed slightly.  Pre segwit the number of inputs followed the version.
Post segwit uses what is called a "marker" and "flag" followed by the number of inputs.  If following the version is `0x00`(marker) then `0x01`(flag), 
this indicates a segwit transaction.  See [here](https://bitcoincore.org/en/segwit_wallet_dev/#transaction-serialization) for detailed info on segwit transaction format.

#### Witness Data?
```javascript
let hasWitness = false
if(incount === 0x00) {
  hasWitness = reader.readInt(1)  === 0x01
  incount = reader.readVarInt()
}
```

Now loop through the inputs now that we know how many

```javascript

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
```

`txid` or transaction id is the previous transaction where the unspent outut is used for the input of the current transaction that we are parsing.  It is 32 byte little endian, hence the `reverse()`

```javascript
const txid = Bytes.toHex(reader.readBytes(32).reverse())
```

`vout` is the previous transaction output index, a 4 byte integer
```javascript
const vout = reader.readInt(4)
```

`scriptSig` is the signature script, with a lenth determined by the next `varInt` describe in the `Biterator ` section above.  So we read in that many bytes

```javascript
const scriptbytes = reader.readBytes(reader.readVarInt())
```

We display as both hex and asm described in [script.md](./script.md)

```javascript
const hex = Bytes.toHex(scriptbytes)
const asm = Script.toAsm(scriptbytes).join(' ')
```

And we add to our input array, along with the next 4 byte integer for the `sequence`

```javascript
tx.vin.push({
  txid: txid, 
  vout: vout,
  scriptSig:  { 
    asm: asm,
    hex: hex
  },
  sequence: reader.readInt(4)
})
```
 *note, we are not done yet with the inputs, they may have witness data*

### Outputs

Outputs are read in a similar manner to inputs, but without any special consideration

```javascript
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
```

If there is witness data, add it.

```javascript
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

```
The first 2 lines in the `if` block are saved here, see "Sizes and Hashes" below

We loop through the inputs a second time adding witness data for each input.

The number of witness data entries is a `varInt`

```javascript
const len = reader.readVarInt()
```
Loop and add witness data similar to how we did input and output loops, but converting to a hex string

```javascript
for(let w=0;w<len;w++) {
  tx.vin[i].txinwitness.push(Bytes.toHex(reader.readBytes(reader.readVarInt())))
}
```

### Locktime

Finally the last 4 byte integer is the `locktime`

```javascript
tx.locktime = reader.readInt(4)
```
### Sizes and Hashes

Now that we have everything, we can calculate the sizes and hashes

```javascript
tx.size = reader.getIndex()
tx.vsize = hasWitness ? Math.ceil((witnessSize*3+tx.size) / 4) : tx.size

const noseg = hasWitness ? rawtx.slice(0, 8) +
  rawtx.slice(12, witnessStart * 2) +
  rawtx.slice(tx.size * 2 - 8, tx.size * 2) : ''
const txhash = Bytes.reverseHex(Hash.dhash(rawtx.slice(0,tx.size*2)))
tx.txid = hasWitness ? Bytes.reverseHex(Hash.dhash(noseg))
  : txhash
tx.hash = txhash
```

`size` is the size, includeing witness if any

`vsize` is the size excluding witness data. See [here](https://bitcoincore.org/en/segwit_wallet_dev/#transaction-fee-estimation) for description of the formula used.

The hash and txid are calculate through wrapper functions in [common.js](../src/common.js) via the `Hash` object.  If there is no witness data, the `txid` and `hash` are the same, the reverse of a double `sha256` of the raw transaction.  If witness data is present, the `hash` is the double `sha256` of the raw data, and the `txid` is double `sha256` of the raw transaction with the witness data removed.  In the above code, `noseg` represents the transaction minus witness data.  The first chunk is the version, 4 bytes so 8 hex characters.  The second chunk skips the marker and flag(see "Witness Data?" above) and goes to the start of the witness data, and the last chunk is the lock time

### Hash wrappers for reference

```javascript
const Hash = {
  sha256: function(hexstr) { return crypto.createHash('sha256').update(new Buffer(hexstr, 'hex')).digest('hex') }, 
  rmd160: function(hexstr) { return new ripemd160().update(new Buffer(hexstr, 'hex')).digest('hex') },  
  dhash: function (data) { return Hash.sha256(Hash.sha256(data)) }, 
  hash160: function (data) { return Hash.rmd160(Hash.sha256(data)) } 
}
```

_it is important to note that hashing is done on the binary data, these wrappers allow using a hex string, `new Buffer(hexstr, 'hex')` the `'hex'` is important here otherwise you would be hashing the string and not the binary data.  For example in the psuedo code `hash('hello')` is valid but has no meaning in hex, so hashing `hash('ab1234')` without the content type hex is valid but meaningless for our purpose_

## Serializing transactions

Serializing a transaction puts all the bytes into the sequence that we parsed above.  It consist of the same 4 sections as above, version, inputs, outputs and locktime.  If there is witness data, the marker/flag and the witness data.

### version

```javascript
  const writer = new Bitwriter()

  writer.writeInt(tx.version, 4)
```

### marker/flag, if applicable

```javascript
  const hasWitness = tx.vin[0].txinwitness ? 1 : 0

  if(hasWitness) writer.write('0001')
```

### inputs

```javascript
  writer.writeVarInt(tx.vin.length)

  tx.vin.forEach(input => {
    writer.write(Bytes.reverseHex(input.txid))
    writer.writeInt(input.vout, 4)
    writer.writeVarInt(input.scriptSig.hex.length / 2)
    writer.write(input.scriptSig.hex)
    writer.writeInt(input.sequence, 4)
  }) 
```

### outputs

```javascript
  writer.writeVarInt(tx.vout.length)
  tx.vout.forEach(out => {
    writer.writeInt(out.value * 100000000, 8)
    writer.writeVarInt(out.scriptPubKey.hex.length/2)
    writer.write(out.scriptPubKey.hex)
  })
```

### witness data, if applicable

```javascript
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
```

### locktime

```javascript
  writer.writeInt(tx.locktime, 4)
```

## Verifying transactions

This is a little bit tricky, the hardest part was figuring out what to use to verify the signature.  The public key and the signature part is obvious, but the "message" took some work to derive.  The steps to do so are outlined in [this](https://en.bitcoin.it/wiki/File:Bitcoin_OpCheckSig_InDetail.png) image.  Following the steps, it was not too painful, since I had already had the parsing and serializing working.  To verify a transaction, the TLDR is you replace the input `scriptSig` with the `scriptPubKey` from its corresponding output from the previous transaction.  There is a little more to it, check the image, but I omitted for my own clarity.  I made the following code to get the "message" part of the verification.

```javascript
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
```

I am pushing all input "messages" to an array, in the real world I imagine that the verification would be in the same loop but this makes it easier to visualize by separating it out.

The `OP_CHECKSIG` part of the interpreter looks like this

```javascript
  OP_CHECKSIG: function() { 
    const pub = stack.pop(); 
    const sig = stack.pop();  
    const key = ec.keyFromPublic(pub, 'hex')
    const ver = key.verify(txhash, sig)
    stack.push(ver)
  }
```

where `txhash` is the hash caclulated by serializing with the `scriptPubKey` substitued for `scriptSig`

