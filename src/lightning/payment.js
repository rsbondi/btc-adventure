const bech32 = require('bech32')
const { Bit }= require('./bit')
const big    = require('bignumber.js')

const prefixes = [
    "lnbcrt",
    "lnbc",
    "lntb"
]

const amounts = {
    'm': new big(0.001),
    'u': new big(0.000001),
    'n': new big(0.000000001),
    'p': new big(0.000000000001)
    
}

module.exports = {
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
}