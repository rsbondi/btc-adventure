const bech32 = require('bech32')
const { Bit }= require('./bit')

const prefixes = [
    "lnbcrt",
    "lnbc",
    "lntb"
]

module.exports = {
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
}