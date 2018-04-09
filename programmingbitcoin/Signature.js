class Signature {
    constructor(r, s) {
        this.r = r // x coorditate of point R
        this.s = s // s = (z+re)/k
    }

    der() {
        let rbin = Buffer.from(this.r.toString(16), 'hex')
        while(!rbin[0]) rbin = rbin.slice(1)
        if(rbin[0] & 0x80) rbin = Buffer.concat([Buffer.from('00', 'hex'), rbin])
        let result = Buffer.concat([Buffer.from('02', 'hex'),Buffer.from(rbin.length.toString(16), 'hex'), rbin])

        let sbin = Buffer.from(this.s.toString(16), 'hex')
        while(!sbin[0]) sbin = sbin.slice(1)
        if(sbin[0] & 0x80) sbin = Buffer.concat([Buffer.from('00', 'hex'), sbin])
        result = Buffer.concat([result, Buffer.from('02', 'hex'),Buffer.from(sbin.length.toString(16), 'hex'), sbin])
        return Buffer.concat([Buffer.from('30', 'hex'), Buffer.from(result.length.toString(16), 'hex'), result])
    }
}

module.exports = {
    Signature: Signature
}
