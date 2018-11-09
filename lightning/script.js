const Bit = {
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
      for(let i=0; i<str.length - str.length%8; i+=8) {
          bin.push(parseInt(str.slice(i, i+8),2))
      }
      return bin
  },
}

const big    = BigNumber

const prefixes = [
    "lnbcrt",
    "lnbc",
    "lntb",
    "lnsb"
]

const amounts = {
    '' : new big(1),
    'm': new big(0.001),
    'u': new big(0.000001),
    'n': new big(0.000000001),
    'p': new big(0.000000000001)
}

const fallbacks = {
    17: 'p2pkh',
    18: 'p2sh'
}

function binStr2hex(bin) {
  return Array.from(Uint8Array.from(Bit.str2bin(bin))).map(b => b.toString(16).padStart(2, "0")).join("")
}

const decodeTypes = {
     1: {label: 'payment_hash',          process(data) { return binStr2hex(data) } },
    13: {label: 'description',           process(data) { return UTF8.getStringFromBytes(Uint8Array.from(Bit.str2bin(data)))}},
    19: {label: 'payee_pubkey',          process(data) { return binStr2hex(data) }},
    23: {label: 'purpose_hash',          process(data) { return binStr2hex(data) }},
     6: {label: 'expiry',                process(data) { return Bit.Reader(data).readInt(data.length) }},
    24: {label: 'min_final_cltv_expiry', process(data) { return Bit.Reader(data).readInt(data.length) }},
     9: {label: 'fallback_address',      process(data) { 
         let version = Bit.Reader(data).readInt(5)
         if(fallbacks[version]) version = fallbacks[version]; else version = 'v'+version
         return version+'-'+binStr2hex(data.slice(5)) 
        }
    },
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

let pre = document.querySelector('pre')

const Payment = {
    decode: function(req) {
        const bech = bech32.decode(req, 9999)

        const prefix = prefixes.reduce(function(o, c, i) {
            if(!o && bech.prefix.match(c)) o = c
            return o
        }, '')

        const prefixChars = req.slice(0, prefix.length)
        let html = `<span class="prefix" title="prefix">${prefixChars}</span>`

        const amt = bech.prefix.slice(prefix.length)
        let amount = new big(0)
        if(amt) {
            const unit = amt.slice(-1)
            if(~Object.keys(amounts).indexOf(unit)) {
                const val = new big(amt.slice(0, -1))
                amount = val.times(amounts[unit])
            } else amount = new big(amt) // no units
        }

        const amountChars = amt
        const amountValue = amount.toString()
        html += `<span class="amount" title="amount: ${amountValue}">${amountChars}</span>`

        let reqIndex = bech.prefix.length+1
        const sep = req.slice(bech.prefix.length, reqIndex)
        html += `<span class="sep" title="separator">${sep}</span>`

        const bin = bech.words.reduce((o, c, i) => {
            let bin = c.toString(2)
            for(let i=5-bin.length; i; i--) bin = '0'+bin
            return o + bin
        },'')
        
        const reader = Bit.Reader(bin)
        const ts = reader.readInt(35)

        const timestampChars = req.slice(reqIndex, reqIndex+7)
        reqIndex += 7

        html += `<span class="timestamp" title="timestamp: ${ts}">${timestampChars}</span>`

        let tagged = []
        while(reader.remaining() > 520) { // have data
            const type = reader.readInt(5)
            const len  = reader.readInt(10)
            const data = reader.read(len * 5)
            const item = {type: decodeTypes[type].label, data: decodeTypes[type].process(data)}
            tagged.push(item)
            const strlen = len + 3
            html += `<span class="type" title="type: ${item.type}">${req.slice(reqIndex, reqIndex+1)}</span>`
            html += `<span class="len" title="length: ${len}">${req.slice(reqIndex+1, reqIndex+3)}</span>`
            let itemTitle = `${item.type}: ${item.data}`
            if(item.type == 'routing') itemTitle = "routing: see json for breakdown"
            html += `<span class="tagged ${item.type}" title="${itemTitle}">${req.slice(reqIndex+3, reqIndex+3+len)}</span>`
            reqIndex+=strlen
        }

        const sig = binStr2hex(reader.read(520))

        const sigChars = req.slice(reqIndex, reqIndex+104)
        html += `<span class="signature" title="signature: ${sig}">${sigChars}</span>`

        html += `<span class="checksum" title="checksum">${req.slice(-6)}</span>`

        pre.innerHTML = html

        return {
            prefix       : prefix,
            timestamp    : ts,
            amount       : amount.toNumber(),
            taggedFields : tagged,
            signature    : sig
        }

    },
}

let button = document.querySelector('button')
let json = document.querySelector('#json')
let ta = document.querySelector('textarea')

button.addEventListener('click', e => {
  json.innerHTML = JSON.stringify(Payment.decode(ta.value),null,2)
})

