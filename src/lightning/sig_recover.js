const secp256k1 = require('secp256k1')
const bech32 = require('bech32')
const crypto = require('crypto')

const payreq = "lnsb20300n1pdarmakpp57zzavxfm39rzg9juc6awru0zfgxvdaewkdupkmmw0x787ds0k04sdqcvdex2ct5v4jzq6twyp3k7er9cqzys7d9uyytydxmsqdz6h9s9wlu2276hjsysa3upu0mz0k55el5323634yjasmnep6hkmyh93ke6nj0v9p3rzgyl5wwu2cfplyg5wv9wdycqaaejt7"
const bech = bech32.decode(payreq, 9999)

const sig = Buffer.from("f34bc2116469b700345ab960577f8a57b5794090ec781e3f627da94cfe9154751a925d86e790eaf6d92e58db3a9c9ec286231209fa39dc56121f9114730ae693", 'hex')
const data_part_less_sig = convert(bech.words.slice(0, -104), 5, 8,true)
const msg = Buffer.concat([Buffer.from(bech.prefix, 'utf8'), Buffer.from(data_part_less_sig)]) // prefix concat data all in bytes
const sighash = crypto.createHash('sha256').update(msg).digest()

const pub = secp256k1.recover(sighash, sig, 0) // 0208c49665537360e0f94a6403ac2c2776b4ea87b66c084f9f52bf7014f80c6238

console.log(pub.toString('hex'))

// from bech32 lib, not exposed
function convert (data, inBits, outBits, pad) {
    var value = 0
    var bits = 0
    var maxV = (1 << outBits) - 1
  
    var result = []
    for (var i = 0; i < data.length; ++i) {
      value = (value << inBits) | data[i]
      bits += inBits
  
      while (bits >= outBits) {
        bits -= outBits
        result.push((value >> bits) & maxV)
      }
    }
  
    if (pad) {
      if (bits > 0) {
        result.push((value << (outBits - bits)) & maxV)
      }
    } else {
      if (bits >= inBits) throw new Error('Excess padding')
      if ((value << (outBits - bits)) & maxV) throw new Error('Non-zero padding')
    }
  
    return result
  }