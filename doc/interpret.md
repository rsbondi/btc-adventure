# Interpret script

We saw earlier how to break down a raw hex script into readable opcodes.  Now we will look at how those codes are interpreted.

## General scripting

Bitcoin scripting is a stack based language meaning it performs operations on values previously added to the stack.  For example, to add 2 numbers, lets say 1 and 2, we would push 1 to the stack, push 2 to the stack, then call OP_ADD, which will remove the top 2 values from the stack and push the result back to the stack

The script would look like this `OP_1 OP_2 OP_ADD`

Execution

|OP|Stack|Description|
|--|-----|-----------|
||`[]`|start with empty stack|
|OP_1|`[1]`|push 1 to stack|
|OP_2|`[1, 2]`|push 2 to stack|
|OP_ADD|`[3]`|remove 2 from stack<br> remove 1 from stack<br> add them and push result to stack|

## Our approach to interpret a script

First we create an `Interpretor` object, with a `stack` variable, which is simply an array.  Within the `Interpretor` we create an `ops` object.  `ops` is a mapping of opcodes to the functions they will perform.

abbreviated example.

```javascript
Interpretor: function() {
    let stack = []
    const ops = {
      OP_1:   function() { stack.push(1) },
      OP_2:   function() { stack.push(2) },
      OP_ADD: function() { stack.push(parseInt(stack.pop(), 10) + parseInt(stack.pop(), 10)) },
    }
```

and to run the `Interpretor`

```javascript
run: function(script) {
  if(typeof script === 'string') script = script.split(' ')
  script.forEach(op => {
    if(ops[op]) ops[op]()
    ...
  }
}
```

So we basically just point to the `ops` object and call the function mapped to it by `op`