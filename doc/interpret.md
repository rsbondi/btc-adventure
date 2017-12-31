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

## Interpreting a script

### Basic operations

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

### Conditional operation

Much like many scripting or programming languages, bitcoin scripts can have conditional operations represented by `OP_IF`, `OP_NOTIF`, `OP_ELSE` and `OP_ENDIF`.  The difference here is that being stack based, the condition is evaluated against the top of the stack.  If the item on the top of the stack is non zero, the section following the `OP_IF` is executed, if zero, executioin will branch to `OP_ELSE` or `OP_ENDIF`.  We track this with an array.  An array is used to allow nesting.

```javascript
let branch = []
```

and the `branch` array is used like

```javascript
OP_IF:  function() { branch.unshift(stack.pop() ? 1 : -1) }
```

When `OP_IF` is called we store the branch status with 2 flags, `1` to evaluate and `-1` to skip.  `unshift` is used here to put the flag to the front of the array for easy access with the zero index (`branch[0]`)

Code is evaluated or not based on the following

```javascript
const ok = !branch.length || branch[0] > -1 || ~['OP_IF', 'OP_NOTIF', 'OP_ELSE', 'OP_ENDIF'].indexOf(op)
```

`!branch.length` means the array is empty so no branch consideration.  If the first item of `branch` is `-1` we skip, this will later get set to 1 on `OP_ELSE`.  The last part allows evaluation of the conditional statements

`OP_ELSE` will invert the flag

```javascript
 OP_ELSE: function() { branch[0] = branch[0] === 1 ? -1 : 1 }
 ```
 so if we were evaluating, we now skip and visa versa.

 `OP_ENDIF` will remove the first item with `branch.shift()`