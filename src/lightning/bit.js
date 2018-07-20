const bigInt = require('big-integer') // TODO: refactor to bignumber.js
const big    = require('bignumber.js')

module.exports = {
    Bit: {
        Writer: {
            writeInt: function(data, n) {
                if(!n) {
                    n = 1
                    while (data > Math.pow(32, n))n++
                    n = n * 5
                }
                let str = data.toString(2)
                while(str.length < n) str = '0' + str
                const words = []
                for(let i = 0; i < n; i+=5) {
                    words.push(parseInt(str.slice(i, i+5), 2))
                }
                return Buffer.from(words)
            }
        },
        Reader: function(bits) {
            const buf = bits
            let   index = 0

            return {
                read(n) {
                    const b = buf.slice(index, index+n) 
                    index += n
                    return b              
                },
                readInt(n) {
                    const int = this.read(n).split('').reduce(function(o, bit, i) { 
                        return o.add(bigInt(bit).times(bigInt(2).pow(n-1-i))) // big endian
                      }, bigInt(0)) 
                      return  int.toJSNumber()                
                },
                remaining() {
                    return buf.length - index
                }
            }
        },
        str2bin(str) {
            let bin = []
            for(let i=0; i<str.length; i+=8) {
                bin.push(parseInt(str.slice(i, i+8),2))
            }
            return bin
        },
        str2words(str) {
            if(!str) return Buffer.from([])
            let binstr = Buffer.from(str, 'utf8').toString('hex')
            binstr = (new big(binstr, 16)).toString(2)
            while(binstr.length%8) binstr = '0'+binstr
            const arr = []
            for(let i=0; i<binstr.length; i+=5) {
                let slice = binstr.slice(i, i+5)
                while (slice.length <5) {
                    slice += '0' 
                }
                arr.push(parseInt(slice, 2))
            }
            return Buffer.from(arr)
        }
    }
}

// ""00000001000011000001001000011111000111000001100100000010""