const pre = document.querySelector('pre')
const ta = document.querySelector('textarea')
const btn = document.querySelector('button')

const opcodes = { // copy paste from https://github.com/bcoin-org/bcoin/blob/master/lib/script/common.js
  // Push
  OP_0: 0x00,

  OP_PUSHDATA1: 0x4c,
  OP_PUSHDATA2: 0x4d,
  OP_PUSHDATA4: 0x4e,

  OP_1NEGATE: 0x4f,

  OP_RESERVED: 0x50,

  OP_1: 0x51,
  OP_2: 0x52,
  OP_3: 0x53,
  OP_4: 0x54,
  OP_5: 0x55,
  OP_6: 0x56,
  OP_7: 0x57,
  OP_8: 0x58,
  OP_9: 0x59,
  OP_10: 0x5a,
  OP_11: 0x5b,
  OP_12: 0x5c,
  OP_13: 0x5d,
  OP_14: 0x5e,
  OP_15: 0x5f,
  OP_16: 0x60,

  // Control
  OP_NOP: 0x61,
  OP_VER: 0x62,
  OP_IF: 0x63,
  OP_NOTIF: 0x64,
  OP_VERIF: 0x65,
  OP_VERNOTIF: 0x66,
  OP_ELSE: 0x67,
  OP_ENDIF: 0x68,
  OP_VERIFY: 0x69,
  OP_RETURN: 0x6a,

  // Stack
  OP_TOALTSTACK: 0x6b,
  OP_FROMALTSTACK: 0x6c,
  OP_2DROP: 0x6d,
  OP_2DUP: 0x6e,
  OP_3DUP: 0x6f,
  OP_2OVER: 0x70,
  OP_2ROT: 0x71,
  OP_2SWAP: 0x72,
  OP_IFDUP: 0x73,
  OP_DEPTH: 0x74,
  OP_DROP: 0x75,
  OP_DUP: 0x76,
  OP_NIP: 0x77,
  OP_OVER: 0x78,
  OP_PICK: 0x79,
  OP_ROLL: 0x7a,
  OP_ROT: 0x7b,
  OP_SWAP: 0x7c,
  OP_TUCK: 0x7d,

  // Splice
  OP_CAT: 0x7e,
  OP_SUBSTR: 0x7f,
  OP_LEFT: 0x80,
  OP_RIGHT: 0x81,
  OP_SIZE: 0x82,

  // Bit
  OP_INVERT: 0x83,
  OP_AND: 0x84,
  OP_OR: 0x85,
  OP_XOR: 0x86,
  OP_EQUAL: 0x87,
  OP_EQUALVERIFY: 0x88,
  OP_RESERVED1: 0x89,
  OP_RESERVED2: 0x8a,

  // Numeric
  OP_1ADD: 0x8b,
  OP_1SUB: 0x8c,
  OP_2MUL: 0x8d,
  OP_2DIV: 0x8e,
  OP_NEGATE: 0x8f,
  OP_ABS: 0x90,
  OP_NOT: 0x91,
  OP_0NOTEQUAL: 0x92,
  OP_ADD: 0x93,
  OP_SUB: 0x94,
  OP_MUL: 0x95,
  OP_DIV: 0x96,
  OP_MOD: 0x97,
  OP_LSHIFT: 0x98,
  OP_RSHIFT: 0x99,
  OP_BOOLAND: 0x9a,
  OP_BOOLOR: 0x9b,
  OP_NUMEQUAL: 0x9c,
  OP_NUMEQUALVERIFY: 0x9d,
  OP_NUMNOTEQUAL: 0x9e,
  OP_LESSTHAN: 0x9f,
  OP_GREATERTHAN: 0xa0,
  OP_LESSTHANOREQUAL: 0xa1,
  OP_GREATERTHANOREQUAL: 0xa2,
  OP_MIN: 0xa3,
  OP_MAX: 0xa4,
  OP_WITHIN: 0xa5,

  // Crypto
  OP_RIPEMD160: 0xa6,
  OP_SHA1: 0xa7,
  OP_SHA256: 0xa8,
  OP_HASH160: 0xa9,
  OP_HASH256: 0xaa,
  OP_CODESEPARATOR: 0xab,
  OP_CHECKSIG: 0xac,
  OP_CHECKSIGVERIFY: 0xad,
  OP_CHECKMULTISIG: 0xae,
  OP_CHECKMULTISIGVERIFY: 0xaf,

  // Expansion
  OP_NOP1: 0xb0,
  OP_CHECKLOCKTIMEVERIFY: 0xb1,
  OP_CHECKSEQUENCEVERIFY: 0xb2,
  OP_NOP4: 0xb3,
  OP_NOP5: 0xb4,
  OP_NOP6: 0xb5,
  OP_NOP7: 0xb6,
  OP_NOP8: 0xb7,
  OP_NOP9: 0xb8,
  OP_NOP10: 0xb9,

  // Custom
  OP_INVALIDOPCODE: 0xff
};

// this allows you to get code name from hex value
const codeops = Object.keys(opcodes).reduce((o, k) => {
  o[opcodes[k]] = k; return o;
}, {})

const Bytes = {
  fromHex: function (bytes) {
    return bytes.split('').reduce((o, c, i) => {
      if (i % 2 === 0) o.push(c)
      else o[o.length - 1] += c
      return o
    }, []).map(b => parseInt(b, 16))
  },
  toHex: function (bytes) {
    return bytes.reduce((o, c) => { return o += ('0' + (c & 0xFF).toString(16)).slice(-2) }, '')
  },
  reverseHex: function (hex) { return Bytes.toHex(Bytes.fromHex(hex).reverse()) }
}

const Script = {
  // asm opcode string to byte array (can serialize to string Bytes.toHex())
  fromAsm: function (asm) {
    return asm.split(' ').reduce((o, c, i) => {
      if (typeof opcodes[c] != 'undefined') { o.push(opcodes[c]); return o }
      else {
        var bytes = Bytes.fromHex(c)
        if (bytes.length == 1 && bytes[0] > 1 && bytes[0] <= 16) { o.push(bytes[0] + 0x50); return o }
        else if (bytes[0] < 0x02) { o.push(bytes[0]); return o }
        return o.concat([bytes.length]).concat(bytes)
      }
    }, [])
  },
  // hex script to array of op codes (join for asm string)
  toAsm: function (bytes) {
    if (typeof bytes === 'string') bytes = Bytes.fromHex(bytes)
    var commands = []

    for (var b = 0; b < bytes.length; b++) {
      var byte = bytes[b]
      if (byte < 0x02) {
        commands.push(byte)
        continue
      }
      if (byte >= 0x52 && byte <= 0x60) {
        commands.push(byte - 0x50)
        continue
      }
      if (byte >= 0x02 && byte <= 0x4b) {
        commands.push(Bytes.toHex(bytes.slice(b + 1, b + 1 + byte)))
        b += byte
        continue
      }
      if (codeops[byte]) commands.push(codeops[byte])
      else throw ('unknown opcode' + byte + ' ' + b)
    }
    return commands
  }
}

function Biterator(bytes) {
  if (typeof bytes === 'string') bytes = Bytes.fromHex(bytes)
  var index = 0
  var buf = bytes
  var hex = ''

  return {
    getHex: function () { return Bytes.toHex(hex) },
    readBytes: function (n) {
      hex = buf.slice(index, index + n)
      index += n
      return hex
    },
    readInt: function (n) {
      var int = this.readBytes(n).reduce(function (o, byte, i) {
        return o + byte * Math.pow(256, i)
      }, 0)
      return int
    },
    readVarInt: function () {
      var byte = this.readBytes(1)[0]
      if (byte < 0xFD) return byte
      else this.readInt(2 * (byte - 0xFC))
    },
    getRemaining: function () {
      return buf.slice(index)
    },
    getIndex: function () { return index }
  }
}

function addSpan(cls, title, hex) {
  let span = document.createElement('span')
  span.className = cls
  span.title = title
  span.innerHTML = hex
  pre.appendChild(span)
}

const Transaction = {
  parseRaw: function (rawtx) {
    let tx = {
      version: 1,
      locktime: 0,
      vin: [],
      vout: []
    }

    const reader = new Biterator(Bytes.fromHex(rawtx))
    pre.innerHTML = ''

    tx.version = reader.readInt(4)
    addSpan('version', `version=${tx.version} (little endian)`, reader.getHex())

    let hasWitness = false
    let incount = reader.readVarInt()
    if (incount === 0x00) {
      addSpan('marker', 'marker 00', '00')
      hasWitness = reader.readInt(1) === 0x01
      addSpan('flag', 'flag 01', '01')
      incount = reader.readVarInt()
    }

    addSpan('nin', `number of inputs = ${incount}`, reader.getHex())

    for (let i = 0; i < incount; i++) {
      const txid = Bytes.toHex(reader.readBytes(32).slice(0).reverse())
      addSpan('txid', `input ${i} txid = ${txid} (little endian)`, reader.getHex())

      const vout = reader.readInt(4)
      addSpan('vout', `input ${i} previous tx output index = ${vout} (little endian)`, reader.getHex())

      const nbytes = reader.readVarInt()
      addSpan('nin', `input ${i} script byte length = ${nbytes}`, reader.getHex())
      const scriptbytes = reader.readBytes(nbytes)

      const hex = Bytes.toHex(scriptbytes)
      const asm = Script.toAsm(scriptbytes).join(' ')
      console.log(hex)
      addSpan('script', `input ${i} script = ${hex}`, reader.getHex())

      const sequence = reader.readInt(4)
      addSpan('sequence', `input ${i} sequence = ${sequence}`, reader.getHex())

      tx.vin.push({
        txid: txid, // little endian
        vout: vout,
        scriptSig: {
          asm: asm,
          hex: hex
        },
        sequence: sequence
      })
    }
    const nout = reader.readVarInt()
    addSpan('nin', `number of outputs = ${nout}`, reader.getHex())

    for (let i = 0; i < nout; i++) {
      let out = {
        value: reader.readInt(8) / 100000000,
        n: i
      }
      addSpan('outval', `output ${i} value = ${out.value} (little endian)`, reader.getHex())

      const nobytes = reader.readVarInt()
      addSpan('nin', `output ${i} script byte length = ${nobytes}`, reader.getHex())

      const scriptbytes = reader.readBytes(nobytes)
      out.scriptPubKey = {
        asm: Script.toAsm(scriptbytes).join(' '),
        hex: Bytes.toHex(scriptbytes)
      }
      addSpan('outscript', `output ${i} script = ${out.scriptPubKey.asm}`, reader.getHex())
      tx.vout.push(out)
    }
    let witnessStart = 0
    let witnessSize = 0
    if (hasWitness) {
      witnessStart = reader.getIndex()
      witnessSize = witnessStart + 2 // +lock time - marker - flag
      for (let i = 0; i < incount; i++) {
        const len = reader.readVarInt()
        addSpan('nin', `input ${i} witness data count = ${len}`, reader.getHex())

        tx.vin[i].txinwitness = []
        for (let w = 0; w < len; w++) {
          const wlen = reader.readVarInt()
          addSpan('win', `input ${i}, witness ${w} length = ${wlen}`, reader.getHex())
          tx.vin[i].txinwitness.push(Bytes.toHex(reader.readBytes(wlen)))
          addSpan('wit', `input ${i}, witness ${w} data`, reader.getHex())
        }
      }
    }

    tx.locktime = reader.readInt(4)
    addSpan('version', `locktime = ${tx.locktime}`, reader.getHex())
  }

}

btn.addEventListener('click', e => Transaction.parseRaw(ta.value))