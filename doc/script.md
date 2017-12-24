# Parsing raw bitcoin script

## Utility functions

To get started there are some constants that need to be defined.
These can be found in [common.js](../src/common.js)

Here I defined `opcodes` for translating asm code into the equivalent hex bytes
and for a lack of a better term I defined `codeops` to go the other way.

Also in `common.js` is defined a utility static object for handling the conversion of strings to byte data, in the form of an array of bytes and to convert the byte data back to strings

```javascript
const Bytes = {
    fromHex: function(bytes) {
      return bytes.split('').reduce((o,c,i) => {
        if(i%2===0) o.push(c)
        else o[o.length-1]+=c
        return o
      }, []).map(b => parseInt(b, 16))
    },
    toHex: function (bytes) {
      return bytes.reduce((o, c) => { return o += ('0' + (c & 0xFF).toString(16)).slice(-2)},'' )
    }
}
```

`fromHex` reads in the string 2 characters at a time into an array and converts them to there equivalent numeric values

`toHex` iterates a byte array into the corresponding string representation

## Script parsing

Next we introduce the `Script` object in [script.js](../src/script.js) for converting from asm to an array of bytes(this format chosen for later being able to interperate the scripts, coming soon) and back.

```javascript
fromAsm: function(asm) {
    return asm.split(' ').reduce((o,c,i) => { 
        if(typeof opcodes[c]!='undefined') { o.push(opcodes[c]); return o }
        else {
            var bytes = Bytes.fromHex(c)
            if(bytes.length == 1 && bytes[0] > 1 && bytes[0] <= 16) {o.push(bytes[0]+0x50); return o}
            else if (bytes[0] < 0x02) { o.push(bytes[0]); return o}
            return o.concat( [bytes.length] ).concat(bytes)
        }
    },[])
},
```
The above will read in the code as an asm string and convert to byte array.  First we spit by spaces and iterate the results.  If we come across a known opcode, we use its hex numeric equivalent. Otherwise we read in the bytes.  `OP_2-OP_16` can be represented as the numeric value after the underscore, and there hex values are offset by `0x50`.  `1` and `0` represent `true` and `false` and the raw value is used(I think the wiki is wrong here?).  If none of these conditions are met(key or script hashes), then it seraializes to the length followed by the bytes

```javascript
toAsm: function(bytes) {
    if(typeof bytes === 'string') bytes = Bytes.fromHex(bytes)
    var commands = []
    
    for(var b=0;b<bytes.length;b++) {
    var byte = bytes[b]
    if(byte <0x02) {
        commands.push(byte)
        continue
    }
    if(byte >= 0x52 && byte <= 0x60)  {
        commands.push(byte-0x50)
        continue
    }
    if(byte >= 0x02 && byte <= 0x4b) {
        commands.push(Bytes.toHex(bytes.slice(b+1, b+1+byte)))
        b+=byte
        continue
    }
    if(codeops[byte]) commands.push(codeops[byte])
    else throw('unknown opcode'+byte+' '+b)
    }
    return commands
}
```
To go the other way we iterate the bytes one at a time and check the following conditions.  `true` and `false` get represented by their binary value.  `OP_2-OP_16` apply the same `0x50` offset in the other direction.  Next comes the byte length followed by the bytes, and finally we are left with just the op codes.