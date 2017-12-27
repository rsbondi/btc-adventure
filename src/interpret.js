const { Hash } = require('./common.js')
module.exports = {
  Interpretor: function() {
    let stack = []
    let branch = 0
    const ops = {
        OP_SHA256: function() {
            const top = stack.pop()
            stack.push(Hash.sha256(top))
        },
        OP_IF: function() {
            branch = stack.pop() ? 1 : -1
        },
        OP_ELSE: function() {
            branch = branch === 1 ? -1 : 1
        },
        OP_NIP: function() { const top = stack.pop(); stack.pop(); stack.push(top)},
        OP_SWAP: function() { const one = stack.pop(); const two = stack.pop(); stack.push(one); stack.push(2)},
        OP_ENDIF: function() {
            branch = 0
        },
        OP_DROP: function() { stack.pop()},
        OP_ROLL: function() { 
            const index = stack.length - 1 - parseInt(stack.pop(), 10)
            stack.push(stack.splice(index, 1)[0])
        }
    }
    return {
      run: function(script) {
        script.forEach(op => {
            if(branch === -1) { return } // skip if or else
            if(ops[op]) ops[op]()

            else if(branch > -1) stack.push(op)
            
        })
        // console.log(stack)
      }
    }
  }
}