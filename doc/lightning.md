# Lightning

WIP

## Payment reqest

The details of the payment request can be found [here](https://github.com/lightningnetwork/lightning-rfc/blob/master/11-payment-encoding.md)

Since the bech32 format is used, the bech32 package is used to do the initial parsing. The 32 in bech32 is the number of characters available in the encoding, similar to base58 or base54.  So each character will yield a number from 0 to 31.  The bech32 package returns 2 values, `prefix`(prefix and amount) and `words`.  This was confusing as the meaning of the word "word" is ambiguous, but after much experimenting, I figured out that it is just the integer representation of the character defined by the [bech32](https://github.com/bitcoin/bips/blob/master/bip-0173.mediawiki#bech32) spec.  In the lightning spec, everything is in bits, so once you can think of a "word" as 5 bits, then the rest falls into place.

### prefix

### amout

### timestamp

First I created a `Bit` class for handling bits, using strings for readability while debugging.

```javascript
   Bit: {
       Reader: function(bits) {
           var buf = bits,
               index = 0
           return {
               read: function(n) {
                   var b = buf.slice(index, index+n) 
                   index += n
                   return b              
               },
               readInt(n) {
                   var int = this.read(n).split('').reduce(function(o, bit, i)  
                       return o.add(bigInt(bit).times(bigInt(2).pow(n-1-i))) // ig endian
                     }, bigInt(0)) 
                     return  int.toJSNumber()                
               }
           }
       }
   }
```

Then parse the payment, first convert the "words(5 bit)" into a binary string

```javascript
var bin = bech.words.reduce((o, c, i) => {
    var bin = c.toString(2)
    for(var i=5-bin.length; i; i--) bin = '0'+bin
    return o + bin
},'')

```

then create a reader of type `Bit` and read the 35 bit integer

```javascript
var reader = Bit.Reader(bin)
var ts = reader.readInt(35)

```

The `Payement` object

```javascript
Payment: {
    parse: function(req) {
        var bech = bech32.decode(req, 9999)

        var bin = bech.words.reduce((o, c, i) => {
            var bin = c.toString(2)
            for(var i=5-bin.length; i; i--) bin = '0'+bin
            return o + bin
        },'')
        
        var reader = Bit.Reader(bin)
        var ts = reader.readInt(35)

        return {
            prefix     : bech.prefix,
            timestamp  : ts
        }

    }
}

```
`read` simply returns the next `n` bits.  `readInt` will call `read(n)` and act on each bit, raising 2 to the proper power for the position, note unlike bitcoin, lightning useds big endian.

