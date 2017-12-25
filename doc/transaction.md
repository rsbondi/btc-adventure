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

The `Transaction` object handles parsing via static member `parseRaw` with the signature of `parseRaw: function(rawtx)` where the `rawtx` parameter is the raw transaction hex string.  It will return an object representing the transaction with the following representation

```javascript
let tx = {
    version: 1,
    locktime: 0,
    inputs: [],
    outputs: []
}
```
Then we create or `Biterator` described above passing the bytes of the raw transaction.

*see [script.md](./script.md) for explanation of the `Byte` object found in [common.js](../src/common.js)*

```javascript
const reader = new Biterator(Bytes.fromHex(rawtx))
```

The first 4 bytes of a raw transaction represent the version number

```javascript
tx.version = reader.readInt(4)
```

Next we find the number of inputs

```javascript
let incount = reader.readVarInt()
```

Why is `let` used here you may ask?  This was not clear from the documentation on the bitcoin wiki, which apparently showed the pre segwit format only.  This is what I have derived from reading other code is that the byte in this position, if non zero is the nuber of inputs.  If it is zero followed by `0x01`, this indicates that the transaction has witness data.  The code I derived this from peeks ahead, but I prefer iterating in sequence, so this is resoved with the following

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
tx.inputs.push({
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
  tx.outputs.push(out)
}
```

If there is witness data, add it.

```javascript
if(hasWitness) {
  for(let i=0;i<incount;i++) {
    const len = reader.readVarInt()
    tx.inputs[i].txinwitness = []
    for(let w=0;w<len;w++) {
      tx.inputs[i].txinwitness.push(Bytes.toHex(reader.readBytes(reader.readVarInt())))
    }
  }  
}

```
We loop through the inputs a second time adding witness data for each input.

The number of witness data entries is a `varInt`

```javascript
const len = reader.readVarInt()
```
Loop and add witness data similar to how we did input and output loops, but converting to a hex string

```javascript
for(let w=0;w<len;w++) {
  tx.inputs[i].txinwitness.push(Bytes.toHex(reader.readBytes(reader.readVarInt())))
}
```
Finally the last 4 byte integer is the `locktime`

```javascript
tx.locktime = reader.readInt(4)
```