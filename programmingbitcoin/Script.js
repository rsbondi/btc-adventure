const bigInt = require('big-integer')

class Script {
    constructor(elements) {
        this.elements = elements
    }

    static parse(binary) {
        const s = new Reader(binary)
        let elements = []
        let current = s.read(1)
        while(current !== null) {
            const op_code = current
            if (op_code > 1 && op_code <= 75) 
                elements.push(s.read(op_code))
            else
                elements.push(op_code)
            current = s.read(1)            
        }

        return new this(elements)
    }
}

class Reader {
    constructor(buffer) {
        this.buffer = buffer
        this.index = 0
        
    }

    read(n) {
        if(this.index == this.buffer.length) return null
        // let ret = new Buffer.from(this.buffer.slice(this.index, this.index+n))
        let ret = this.buffer.slice(this.index, this.index+n)
        ret = bigInt(ret.toString('hex'), 16)
        this.index += n
        return ret
    }
}

module.exports = {Script: Script}    
