# Parsing raw bitcoin transaction

Reference code from [transaction.js](../src/transaction.js)

First off we need a way to iterate the raw data within the rules of the bitcoin raw transaction format.
I created the `Biterator` object for this

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

`readVarInt` is a scpecial case for reading varying length objects, like scripts for example.  Depending on the value of the first byte, a differnt number of bytes are read to get the length of the following data(ex. script).  If the first byte is less than `0xFD`, the byte itself represents the length.  Otherwise, `0xFD-0xFF` will represent how many of the following bytes are read to get the length, 2, 4 or 6 respectively.

