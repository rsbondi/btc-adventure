const bigInt = require('big-integer')
const { Reader } = require('./Util')

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

module.exports = {Script: Script}    
