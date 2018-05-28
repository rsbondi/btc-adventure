# Lightning

WIP

## Payment reqest

The details of the payment request can be found [here](https://github.com/lightningnetwork/lightning-rfc/blob/master/11-payment-encoding.md)

Since the bech32 format is used, the bech32 package is used to do the initial parsing. The 32 in bech32 is the number of characters available in the encoding, similar to base58 or base54.  So each character will yield a number from 0 to 31.  The bech32 package returns 2 values, `prefix`(prefix and amount) and `words`.  This was confusing as the meaning of the word "word" is ambiguous, but after much experimenting, I figured out that it is just the integer representation of the character defined by the [bech32](https://github.com/bitcoin/bips/blob/master/bip-0173.mediawiki#bech32) spec.  In the lightning spec, everything is in bits, so once you can think of a "word" as 5 bits, then the rest falls into place.

### prefix

The prefix from the bech32 library include all the "human readable" information, which is the `prefix`, `amount` and `multiplier` as defined in the above referenced doc.  The prefix is calculated like this

```javascript
const prefix = prefixes.reduce(function(o, c, i) {
    if(!o && bech.prefix.match(c)) o = c
    return o
}, '')
```

This just matches to known prefixes

### amout

The amount(optional) consists of a numeric value and optionally a units value(`m`, `u`, `n`, `p` for milli, micro, nano and pico).  I introduced the `bignumber.js` library to handle the level of decimal places.

```javascript
const amt = bech.prefix.slice(prefix.length)  // get everything after prefix
let amount = new big(0)
if(amt) {
    const unit = amt.slice(-1)                // get last character
    if(~Object.keys(amounts).indexOf(unit)) { // if it is unit char, multiply
        const val = new big(amt.slice(0, -1))
        amount = val.times(amounts[unit])
    } else amount = new big(amt)              // no units, whole btc?
}

```

### timestamp

First I created a `Bit` class for handling bits, using strings for readability while debugging.

```javascript
Bit: {
    Reader: function(bits) {
        const buf = bits
        let   index = 0

        return {
            read: function(n) {
                const b = buf.slice(index, index+n) 
                index += n
                return b              
            },
            readInt(n) {
                const int = this.read(n).split('').reduce(function(o, bit, i) { 
                    return o.add(bigInt(bit).times(bigInt(2).pow(n-1-i))) // big endian
                    }, bigInt(0)) 
                    return  int.toJSNumber()                
            }
        }
    }
}
```

Then parse the payment, first convert the "words(5 bit)" into a binary string

```javascript
const bin = bech.words.reduce((o, c, i) => {
    let bin = c.toString(2)
    for(let i=5-bin.length; i; i--) bin = '0'+bin
    return o + bin
},'')

```

then create a reader of type `Bit` and read the 35 bit integer

```javascript
const reader = Bit.Reader(bin)
const ts = reader.readInt(35)

```

The `Payement` object

```javascript
Payment: {
    parse: function(req) {
        const bech = bech32.decode(req, 9999)

        const prefix = prefixes.reduce(function(o, c, i) {
            if(!o && bech.prefix.match(c)) o = c
            return o
        }, '')

        const amt = bech.prefix.slice(prefix.length)
        let amount = new big(0)
        if(amt) {
            const unit = amt.slice(-1)
            if(~Object.keys(amounts).indexOf(unit)) {
                const val = new big(amt.slice(0, -1))
                amount = val.times(amounts[unit])
            } else amount = new big(amt) // no units
        }

        const bin = bech.words.reduce((o, c, i) => {
            let bin = c.toString(2)
            for(let i=5-bin.length; i; i--) bin = '0'+bin
            return o + bin
        },'')
        
        const reader = Bit.Reader(bin)
        const ts = reader.readInt(35)

        return {
            prefix     : prefix,
            timestamp  : ts,
            amount     : amount.toNumber()
        }

    }
}

```
`read` simply returns the next `n` bits.  `readInt` will call `read(n)` and act on each bit, raising 2 to the proper power for the position, note unlike bitcoin, lightning useds big endian.

