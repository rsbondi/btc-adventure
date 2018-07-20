const bech32 = require('bech32')
const { Bit }= require('./bit')
const big    = require('bignumber.js')

const prefixes = [
    "lnbcrt",
    "lnbc",
    "lntb"
]

const amounts = {
    '' : new big(1),
    'm': new big(0.001),
    'u': new big(0.000001),
    'n': new big(0.000000001),
    'p': new big(0.000000000001)
}

function binStr2hex(bin) {
    return Buffer.from(Bit.str2bin(bin)).toString('hex')
}

const decodeTypes = {
     1: {label: 'payment_hash',          process(data) { return binStr2hex(data) } },
    13: {label: 'description',           process(data) { return Buffer.from(Bit.str2bin(data)).toString('utf8')}},
    19: {label: 'payee_pubkey',          process(data) { return binStr2hex(data) }},
    23: {label: 'purpose_hash',          process(data) { return binStr2hex(data) }},
     6: {label: 'expiry',                process(data) { return Bit.Reader(data).readInt(data.length) }},
    24: {label: 'min_final_cltv_expiry', process(data) { return Bit.Reader(data).readInt(data.length) }},
     9: {label: 'witness',               process(data) { return binStr2hex(data) }},
     3: {
            label: 'routing',
            process(data) { 
                const reader = Bit.Reader(data)
                let routing = []
                while(reader.remaining() >= 408) // why again trailing 4 bits???
                    routing.push({
                        pubkey                     : binStr2hex(reader.read(264)),
                        short_channel_id           : binStr2hex(reader.read(64)),
                        fee_base_msat              : reader.readInt(32),
                        fee_proportional_millionths: reader.readInt(32),
                        cltv_expiry_delta          : reader.readInt(16)
                    })
                
                return routing
            }
        },
}

function hexStr2bin(data, n) {
    let binstr = new big(data, 16).toString(2)
    while(binstr.length<n) binstr = '0'+binstr 
    const arr = []
    for(let i=0; i<binstr.length; i+=5) {
        let slice = binstr.slice(i, i+5)
        while (slice.length <5) {
            slice += '0' // why? Something I do not understand about 5 bit words
        }
        arr.push(parseInt(slice, 2))
    }
    return Buffer.from(arr)
}


const encodeTypes = {
    'payment_hash'         : {value:  1, process(data) { return hexStr2bin(data, 256) } },
    'description'          : {value: 13, process(data) { return Bit.str2words(data) }},
    // 'payee_pubkey'         : {value: 19, process(data) { return hexStr2bin(data, 264) } },
    'purpose_hash'         : {value: 23, process(data) { return hexStr2bin(data, 256) }},
    'expiry'               : {value:  6, process(data) { return Bit.Writer.writeInt(data) }},
    'min_final_cltv_expiry': {value: 24, process(data) { return Bit.Writer.writeInt(data) }},
    'witness'              : {value:  9, process(data) { return hexStr2bin(data, data.length * 4) } },
    // 'witness'              : {value:  9, process(data) { return Buffer.concat([Buffer.from([0]), hexStr2bin(data, data.length * 4)]) } },
    // 'routing'              : {value:  3, process(data) {} }
}

const Payment = {
    decode: function(req) {
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
            tagged.push({type: decodeTypes[type].label, data: decodeTypes[type].process(data)})
        }

        const sig = binStr2hex(reader.read(512))

        return {
            prefix       : prefix,
            timestamp    : ts,
            amount       : amount.toNumber(),
            taggedFields : tagged,
            signature    : sig
        }

    },
    encodeAmount: amt => {
        let key = '', whole = 0;
        let amount = new big(amt)
        Object.keys(amounts).some(k => {
            if(amount.isGreaterThanOrEqualTo(amounts[k])) {
                key = k
                whole = amount.dividedBy(amounts[k])
                if(!~whole.toString().indexOf('.')) return true;
            }
        })
        return whole + key
    },
    encode: inv => {
        let prefix = inv.prefix
        if(inv.amount) {
            prefix += Payment.encodeAmount(inv.amount)
        }
        let words = Bit.Writer.writeInt(inv.timestamp, 35)
        inv.taggedFields.forEach(f => {
            if(encodeTypes[f.type]) {
                const data = encodeTypes[f.type].process(f.data)
                const typebuf = Bit.Writer.writeInt(encodeTypes[f.type].value, 5)
                const lenbuf = Bit.Writer.writeInt(data.length, 10)
                words = Buffer.concat([words, typebuf, lenbuf, data], words.length+data.length+3)
            }
        })
        return bech32.encode(prefix, words, 9999)
    }

}

module.exports = {Payment: Payment}