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

function binStr2hex(bin) {
    return Buffer.from(Bit.str2bin(bin)).toString('hex')
}

const types = {
     1: {label: 'payment_hash',          process(data) { return binStr2hex(data) } },
    13: {label: 'description',           process(data) { return Buffer.from(Bit.str2bin(data)).toString('utf8')}},
    19: {label: 'payee_pubkey',          process(data) { return binStr2hex(data) }},
    23: {label: 'purpose_hash',          process(data) { return binStr2hex(data) }},
     6: {label: 'expiry',                process(data) { return Bit.Reader(data).readInt(data.length) }},
    24: {label: 'min_final_cltv_expiry', process(data) { return Bit.Reader(data).readInt(data.length) }},
     9: {label: 'witness',               process(data) { return binStr2hex(data) }},
     3: {label: 'routing',               process(data) { return data}},
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

            let tagged = []
            while(reader.remaining() > 520) { // have data
                const type = reader.readInt(5)
                const len  = reader.readInt(10)
                const data = reader.read(len * 5)
                tagged.push({type: types[type].label, data: types[type].process(data)})
            }

            const sig = binStr2hex(reader.read(512))

            return {
                prefix       : prefix,
                timestamp    : ts,
                amount       : amount.toNumber(),
                taggedFields : tagged,
                signature    : sig
            }

        }
    }
}