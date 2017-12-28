const { Hash } = require('./common.js')
module.exports = {
  Interpretor: function() {
    // TODO: check for bool as 0 and 1
    let stack = []
    let branch = []
    const ops = {
      OP_0:                   function() { stack.push('') },
      OP_PUSHDATA1:           function() {},                                                          // The next byte contains the number of bytes to be pushed onto the stack.
      OP_PUSHDATA2:           function() {},                                                          // The next two bytes contains the number of bytes to be pushed onto the stack.
      OP_PUSHDATA4:           function() {},                                                          // The next four bytes contains the number of bytes to be pushed onto the stack.
      OP_1NEGATE:             function() { stack.push(-1) },
      OP_RESERVED:            function() {},                                                          // Transaction is invalid unless occuring in an unexecuted OP_IF branch
      OP_1:                   function() { stack.push(1) },
      OP_2:                   function() { stack.push(2) },
      OP_3:                   function() { stack.push(3) },
      OP_4:                   function() { stack.push(4) },
      OP_5:                   function() { stack.push(5) },
      OP_6:                   function() { stack.push(6) },
      OP_7:                   function() { stack.push(7) },
      OP_8:                   function() { stack.push(8) },
      OP_9:                   function() { stack.push(9) },
      OP_10:                  function() { stack.push(10) },
      OP_11:                  function() { stack.push(11) },
      OP_12:                  function() { stack.push(12) },
      OP_13:                  function() { stack.push(13) },
      OP_14:                  function() { stack.push(14) },
      OP_15:                  function() { stack.push(15) },
      OP_16:                  function() { stack.push(16) },
      OP_NOP:                 function() { /* do nothing */ },
      OP_VER:                 function() {},                                                          // Transaction is invalid unless occuring in an unexecuted OP_IF branch
      OP_NOTIF:               function() { branch.unshift(!stack.pop() ? 1 : -1) },
      OP_VERIF:               function() {},                                                          // Transaction is invalid unless occuring in an unexecuted OP_IF branch
      OP_VERNOTIF:            function() {},                                                          // Transaction is invalid unless occuring in an unexecuted OP_IF branch
      OP_VERIFY:              function() { const top = stack.pop(); if(!top) throw('fail') },
      OP_RETURN:              function() { throw('fail') },
      OP_TOALTSTACK:          function() {},                                                          // Puts the input onto the top of the alt stack. Removes it from the main stack.
      OP_FROMALTSTACK:        function() {},                                                          // Puts the input onto the top of the main stack. Removes it from the alt stack.
      OP_2DROP:               function() { stack.pop(); stack.pop()},
      OP_2DUP:                function() { stack.push(stack.slice(-2)) },
      OP_3DUP:                function() { stack.push(stack.slice(-3)) },
      OP_2OVER:               function() { stack.push(stack.slice(-4,-2)) },
      OP_2ROT:                function() { [].push.apply(stack, stack.splice(-6, 2)) },
      OP_2SWAP:               function() { [].push.apply(stack, stack.splice(-4, 2)) },
      OP_IFDUP:               function() { const top = stack.slice(-1); if(top) stack.push(top) },
      OP_DEPTH:               function() { stack.push(stack.length) },
      OP_OVER:                function() { stack.push( stack[stack.length-2]) },
      OP_PICK:                function() { const top = parseInt(stack.pop(), 10); stack.push(stack[stack.length - top]) },
      OP_ROT:                 function() { stack.push(stack.splice(-3, 1)[0]) },
      OP_TUCK:                function() { stack.splice(-3, 0, stack.slice(-1)) },
      OP_CAT:                 function() { throw('disabled') },
      OP_SUBSTR:              function() { throw('disabled') },
      OP_LEFT:                function() { throw('disabled') },
      OP_RIGHT:               function() { throw('disabled') },
      OP_SIZE:                function() { stack.push(stack.slice(-1).length) },
      OP_INVERT:              function() { throw('disabled') },
      OP_AND:                 function() { throw('disabled') },
      OP_OR:                  function() { throw('disabled') },
      OP_XOR:                 function() { throw('disabled') },
      OP_EQUAL:               function() { const b = stack.pop(); const a = stack.pop(); stack.push(a+'' == b+'' ? 1 : 0) },
      OP_EQUALVERIFY:         function() {},                                                          // Same as OP_EQUAL, but runs OP_VERIFY afterward.
      OP_RESERVED1:           function() {},                                                          // Transaction is invalid unless occuring in an unexecuted OP_IF branch
      OP_RESERVED2:           function() {},                                                          // Transaction is invalid unless occuring in an unexecuted OP_IF branch
      OP_1ADD:                function() { stack.push(parseInt(stack.pop(), 10) + 1) },
      OP_1SUB:                function() { stack.push(parseInt(stack.pop(), 10) - 1) },
      OP_2MUL:                function() { throw('disabled') },
      OP_2DIV:                function() { throw('disabled') },
      OP_NEGATE:              function() { stack.push(-parseInt(stack.pop(), 10)) },
      OP_ABS:                 function() { stack.push(Math.abs(parseInt(stack.pop(), 10))) },
      OP_NOT:                 function() { const top = stack.pop(); stack.push(!isNaN(top) ? !parseInt(top, 10) : !top) },
      OP_0NOTEQUAL:           function() { const top = stack.pop(); stack.push(!isNaN(top) && parseInt(top, 10) === 0 ? 0 : 1) },
      OP_ADD:                 function() { stack.push(parseInt(stack.pop(), 10) + parseInt(stack.pop(), 10)) },
      OP_SUB:                 function() { stack.push(-parseInt(stack.pop(), 10) + parseInt(stack.pop(), 10)) },
      OP_MUL:                 function() { throw('disabled') },
      OP_DIV:                 function() { throw('disabled') },
      OP_MOD:                 function() { throw('disabled') },
      OP_LSHIFT:              function() { throw('disabled') },
      OP_RSHIFT:              function() { throw('disabled') },
      OP_BOOLAND:             function() { const b = stack.pop(); const a = stack.pop(); stack.push(a!=='0' && b!=='0' ? 1 : 0) },
      OP_BOOLOR:              function() { const b = stack.pop(); const a = stack.pop(); stack.push(a!=='0' || b!=='0' ? 1 : 0) },
      OP_NUMEQUAL:            function() { const b = stack.pop(); const a = stack.pop(); stack.push(!isNaN(a) && !isNaN(b) && a == b ? 1 : 0) },
      OP_NUMEQUALVERIFY:      function() {},                                                          // same as OP_NUMEQUAL, but runs OP_VERIFY afterward.
      OP_NUMNOTEQUAL:         function() { const b = stack.pop(); const a = stack.pop(); stack.push(!isNaN(a) && !isNaN(b) && a != b ? 1 : 0) },
      OP_LESSTHAN:            function() { const b = parseInt(stack.pop(), 10); const a = parseInt(stack.pop(), 10); stack.push(a < b ? 1 : 0) },
      OP_GREATERTHAN:         function() { const b = parseInt(stack.pop(), 10); const a = parseInt(stack.pop(), 10); stack.push(a > b ? 1 : 0) },
      OP_LESSTHANOREQUAL:     function() { const b = parseInt(stack.pop(), 10); const a = parseInt(stack.pop(), 10); stack.push(a <= b ? 1 : 0) },
      OP_GREATERTHANOREQUAL:  function() { const b = parseInt(stack.pop(), 10); const a = parseInt(stack.pop(), 10); stack.push(a >= b ? 1 : 0) },
      OP_MIN:                 function() { const b = parseInt(stack.pop(), 10); const a = parseInt(stack.pop(), 10); stack.push(Math.min(a, b)) },
      OP_MAX:                 function() { const b = parseInt(stack.pop(), 10); const a = parseInt(stack.pop(), 10); stack.push(Math.min(a, b)) },
      OP_WITHIN:              function() { const b = parseInt(stack.pop(), 10); const a = parseInt(stack.pop(), 10); const x = parseInt(stack.pop(), 10); stack.push(x >= a && x < b? 1 : 0) },
      OP_RIPEMD160:           function() { stack.push(Hash.rmd160(stack.pop())) },
      OP_SHA1:                function() {},
      OP_HASH160:             function() { const top = stack.pop(); Hash.pubhash(top) },
      OP_HASH256:             function() { const top = stack.pop(); Hash.datahash(top) },
      OP_CODESEPARATOR:       function() {},                                                          // All of the signature checking words will only match signatures to the data after the most recently-executed OP_CODESEPARATOR.
      OP_CHECKSIG:            function() {},                                                          // [sig pubkey] The entire transaction's outputs, inputs, and script (from the most recently-executed OP_CODESEPARATOR to the end) are hashed. The signature used by OP_CHECKSIG must be a valid signature for this hash and public key. If it is, 1 is returned, 0 otherwise.
      OP_CHECKSIGVERIFY:      function() {},                                                          // Same as OP_CHECKSIG, but OP_VERIFY is executed afterward. fail if fales
      /*
      Compares the first signature against each public key until it finds an ECDSA match. Starting with the subsequent public key, 
      it compares the second signature against each remaining public key until it finds an ECDSA match. 
      The process is repeated until all signatures have been checked or not enough public keys remain to produce a successful result. 
      All signatures need to match a public key. Because public keys are not checked again if they fail any signature comparison, 
      signatures must be placed in the scriptSig using the same order as their corresponding public keys were placed in the scriptPubKey or redeemScript. 
      If all signatures are valid, 1 is returned, 0 otherwise. Due to a bug, one extra unused value is removed from the stack.
      */
      OP_CHECKMULTISIG:       function() {},
      OP_CHECKMULTISIGVERIFY: function() {},                                                         // Same as OP_CHECKSIG, but OP_VERIFY is executed afterward.
      OP_NOP1:                function() { /* ignored */ },
      /*
      Marks transaction as invalid if the top stack item is greater than the transaction's nLockTime field, 
      otherwise script evaluation continues as though an OP_NOP was executed. Transaction is also invalid if 
      1. the stack is empty; or 
      2. the top stack item is negative; or 
      3. the top stack item is greater than or equal to 500000000 while the transaction's nLockTime field is less than 500000000, 
      or vice versa; or 4. the input's nSequence field is equal to 0xffffffff. The precise semantics are described in BIP 0065
      */
      OP_CHECKLOCKTIMEVERIFY: function() {},
      /*
      Marks transaction as invalid if the relative lock time of the input (enforced by BIP 0068 with nSequence) is not equal to or longer than the value of the top stack item. T
      he precise semantics are described in BIP 0112.
      */
      OP_CHECKSEQUENCEVERIFY: function() {},
      OP_NOP4:                function() { /* ignored */ },
      OP_NOP5:                function() { /* ignored */ },
      OP_NOP6:                function() { /* ignored */ },
      OP_NOP7:                function() { /* ignored */ },
      OP_NOP8:                function() { /* ignored */ },
      OP_NOP9:                function() { /* ignored */ },
      OP_NOP10:               function() { /* ignored */ },
      OP_INVALIDOPCODE:       function() { throw('invalid') }  ,      
      OP_SHA256:              function() { const top = stack.pop(); stack.push(Hash.sha256(top)) },
      OP_DUP:                 function() { stack.push(stack[stack.length-1]) },
      OP_IF:                  function() { branch.unshift(stack.pop() ? 1 : -1) },
      OP_ELSE:                function() { branch[0] = branch[0] === 1 ? -1 : 1 },
      OP_NIP:                 function() { const top = stack.pop(); stack.pop(); stack.push(top)},
      OP_SWAP:                function() { const one = stack.pop(); const two = stack.pop(); stack.push(one); stack.push(2)},
      OP_ENDIF:               function() { branch.shift() },
      OP_DROP:                function() { stack.pop()},
      OP_ROLL:                function() { const index = stack.length - 1 - parseInt(stack.pop(), 10); stack.push(stack.splice(index, 1)[0]) }
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