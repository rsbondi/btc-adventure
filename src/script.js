const { opcodes, codeops, Bytes } = require('./common')

module.exports = {
    // static utility
    Script: {
        fromAsm: function(asm) {
          return asm.split(' ').reduce(function(o,c,i) { 
            if(typeof opcodes[c]!='undefined') { o.push(opcodes[c]); return o }
            else {
              var bytes = Bytes.fromHex(c)
              if(bytes.length == 1 && bytes[0] > 1 && bytes[0] <= 16) {o.push(bytes[0]+0x50); return o}
              else if (bytes[0] < 0x02) { o.push(bytes[0]); return o}
              return o.concat( [bytes.length] ).concat(bytes)
            }
          },[])
        },
        toAsm: function(bytes) {
          if(typeof bytes === 'string') bytes = Bytes.fromHex(bytes)
          var commands = []
          
          for(var b=0;b<bytes.length;b++) {
            var byte = bytes[b]
            if(byte <0x02) {
              commands.push(byte)
              continue
            }
            if(byte >= 0x52 && byte <= 0x60)  {
              commands.push(byte-0x50)
              continue
            }
            if(byte >= 0x02 && byte <= 0x4b) {
              commands.push(Bytes.toHex(bytes.slice(b+1, b+1+byte)))
              b+=byte
              continue
            }
            if(codeops[byte]) commands.push(codeops[byte])
            else throw('unknown opcode'+byte+' '+b)
          }
          return commands
        }
      }
}