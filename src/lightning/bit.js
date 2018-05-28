const bigInt = require('big-integer')

module.exports = {
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
                    var int = this.read(n).split('').reduce(function(o, bit, i) { 
                        return o.add(bigInt(bit).times(bigInt(2).pow(n-1-i))) // big endian
                      }, bigInt(0)) 
                      return  int.toJSNumber()                
                }
            }
        }
    }
}

// ""00000001000011000001001000011111000111000001100100000010""