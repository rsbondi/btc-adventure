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
      OP_EQUAL:               function() {},                                                          // Returns 1 if the inputs are exactly equal, 0 otherwise.
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
      OP_BOOLAND:             function() {},
      OP_BOOLOR:              function() {},
      OP_NUMEQUAL:            function() {},
      OP_NUMEQUALVERIFY:      function() {},
      OP_NUMNOTEQUAL:         function() {},
      OP_LESSTHAN:            function() {},
      OP_GREATERTHAN:         function() {},
      OP_LESSTHANOREQUAL:     function() {},
      OP_GREATERTHANOREQUAL:  function() {},
      OP_MIN:                 function() {},
      OP_MAX:                 function() {},
      OP_WITHIN:              function() {},
      OP_RIPEMD160:           function() {},
      OP_SHA1:                function() {},
      OP_HASH160:             function() { const top = stack.pop(); Hash.pubhash(top) },
      OP_HASH256:             function() { const top = stack.pop(); Hash.datahash(top) },
      OP_CODESEPARATOR:       function() {},
      OP_CHECKSIG:            function() {},
      OP_CHECKSIGVERIFY:      function() {},
      OP_CHECKMULTISIG:       function() {},
      OP_CHECKMULTISIGVERIFY: function() {},
      OP_NOP1:                function() {},
      OP_CHECKLOCKTIMEVERIFY: function() {},
      OP_CHECKSEQUENCEVERIFY: function() {},
      OP_NOP4:                function() {},
      OP_NOP5:                function() {},
      OP_NOP6:                function() {},
      OP_NOP7:                function() {},
      OP_NOP8:                function() {},
      OP_NOP9:                function() {},
      OP_NOP10:               function() {},
      OP_INVALIDOPCODE:       function() {}  ,      
      OP_SHA256:              function() { const top = stack.pop(); stack.push(Hash.sha256(top)) },
      OP_DUP:                 function() { stack.push(stack[stack.length-1]) },
      OP_IF:                  function() { branch.unshift(stack.pop() ? 1 : -1) },
      OP_ELSE:                function() { branch[0] = branch[0] === 1 ? -1 : 1 },
      OP_NIP:                 function() { const top = stack.pop(); stack.pop(); stack.push(top)},
      OP_SWAP:                function() { const one = stack.pop(); const two = stack.pop(); stack.push(one); stack.push(2)},
      OP_ENDIF:               function() { branch.shift() },
      OP_DROP:                function() { stack.pop()},
      OP_ROLL:                function() {  const index = stack.length - 1 - parseInt(stack.pop(), 10); stack.push(stack.splice(index, 1)[0]) }
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