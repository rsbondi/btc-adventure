const { Hash } = require('./common.js')
module.exports = {
  Interpretor: function() {
    let stack = []
    let branch = []
    const ops = {
        OP_0: function() {},
        OP_PUSHDATA1: function() {},
        OP_PUSHDATA2: function() {},
        OP_PUSHDATA4: function() {},
        OP_1NEGATE: function() {},
        OP_RESERVED: function() {},
        OP_1: function() { stack.push(1) },
        OP_2: function() { stack.push(2) },
        OP_3: function() { stack.push(3) },
        OP_4: function() { stack.push(4) },
        OP_5: function() { stack.push(5) },
        OP_6: function() { stack.push(6) },
        OP_7: function() { stack.push(7) },
        OP_8: function() { stack.push(8) },
        OP_9: function() { stack.push(9) },
        OP_10: function() { stack.push(10) },
        OP_11: function() { stack.push(11) },
        OP_12: function() { stack.push(12) },
        OP_13: function() { stack.push(13) },
        OP_14: function() { stack.push(14) },
        OP_15: function() { stack.push(15) },
        OP_16: function() { stack.push(16) },
        OP_NOP: function() {},
        OP_VER: function() {},
        OP_NOTIF: function() {},
        OP_VERIF: function() {},
        OP_VERNOTIF: function() {},
        OP_VERIFY: function() {},
        OP_RETURN: function() {},
        OP_TOALTSTACK: function() {},
        OP_FROMALTSTACK: function() {},
        OP_2DROP: function() {},
        OP_2DUP: function() {},
        OP_3DUP: function() {},
        OP_2OVER: function() {},
        OP_2ROT: function() {},
        OP_2SWAP: function() {},
        OP_IFDUP: function() {},
        OP_DEPTH: function() {},
        OP_OVER: function() {},
        OP_PICK: function() {},
        OP_ROT: function() {},
        OP_TUCK: function() {},
        OP_CAT: function() {},
        OP_SUBSTR: function() {},
        OP_LEFT: function() {},
        OP_RIGHT: function() {},
        OP_SIZE: function() {},
        OP_INVERT: function() {},
        OP_AND: function() {},
        OP_OR: function() {},
        OP_XOR: function() {},
        OP_EQUAL: function() {},
        OP_EQUALVERIFY: function() {},
        OP_RESERVED1: function() {},
        OP_RESERVED2: function() {},
        OP_1ADD: function() {},
        OP_1SUB: function() {},
        OP_2MUL: function() {},
        OP_2DIV: function() {},
        OP_NEGATE: function() {},
        OP_ABS: function() {},
        OP_NOT: function() {},
        OP_0NOTEQUAL: function() {},
        OP_ADD: function() {},
        OP_SUB: function() {},
        OP_MUL: function() {},
        OP_DIV: function() {},
        OP_MOD: function() {},
        OP_LSHIFT: function() {},
        OP_RSHIFT: function() {},
        OP_BOOLAND: function() {},
        OP_BOOLOR: function() {},
        OP_NUMEQUAL: function() {},
        OP_NUMEQUALVERIFY: function() {},
        OP_NUMNOTEQUAL: function() {},
        OP_LESSTHAN: function() {},
        OP_GREATERTHAN: function() {},
        OP_LESSTHANOREQUAL: function() {},
        OP_GREATERTHANOREQUAL: function() {},
        OP_MIN: function() {},
        OP_MAX: function() {},
        OP_WITHIN: function() {},
        OP_RIPEMD160: function() {},
        OP_SHA1: function() {},
        OP_HASH160: function() {},
        OP_HASH256: function() {},
        OP_CODESEPARATOR: function() {},
        OP_CHECKSIG: function() {},
        OP_CHECKSIGVERIFY: function() {},
        OP_CHECKMULTISIG: function() {},
        OP_CHECKMULTISIGVERIFY: function() {},
        OP_NOP1: function() {},
        OP_CHECKLOCKTIMEVERIFY: function() {},
        OP_CHECKSEQUENCEVERIFY: function() {},
        OP_NOP4: function() {},
        OP_NOP5: function() {},
        OP_NOP6: function() {},
        OP_NOP7: function() {},
        OP_NOP8: function() {},
        OP_NOP9: function() {},
        OP_NOP10: function() {},
        OP_INVALIDOPCODE:  function() {}  ,      
        OP_SHA256: function() { const top = stack.pop(); stack.push(Hash.sha256(top)) },
        OP_DUP:    function() { stack.push(stack[stack.length-1]) },
        OP_IF:     function() { branch.unshift(stack.pop() ? 1 : -1) },
        OP_ELSE:   function() { branch[0] = branch[0] === 1 ? -1 : 1 },
        OP_NIP:    function() { const top = stack.pop(); stack.pop(); stack.push(top)},
        OP_SWAP:   function() { const one = stack.pop(); const two = stack.pop(); stack.push(one); stack.push(2)},
        OP_ENDIF:  function() { branch.shift() },
        OP_DROP:   function() { stack.pop()},
        OP_ROLL:   function() {  const index = stack.length - 1 - parseInt(stack.pop(), 10); stack.push(stack.splice(index, 1)[0]) }
    }
    return {
      run: function(script) {
        script.forEach(op => {
            const ok = !branch.length || branch[0] > -1 || ~['OP_IF', 'OP_ELSE', 'OP_ENDIF'].indexOf(op)
            if(!ok) return
            let opnum = 0
            if(!isNaN(op)) opnum = parseInt(op, 10)

            if(ops[op]) ops[op]()
            else if(opnum > 1 && opnum < 76) {
                // push opnum bytes to stack
            }
            else stack.push(op)
            
            console.log(op, stack)
        })
      }
    }
  }
}