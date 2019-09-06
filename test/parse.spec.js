const Browser = require('zombie');
const StaticServer = require('static-server');
const assert = require('assert')
let testdata = require('./testdata')
rawtx = require('./rawtx')


describe('test local page', () => {
    const browser = new Browser();
    before(async function () {
        var server = new StaticServer({
            rootPath: '.',            // required, the root of the server file tree
            port: 1337,               // required, the port to listen
        });

        await server.start();

    });

    function loadtx(tx) {
        return new Promise((res, rej) => {
            browser.fill('textarea', tx)
            browser.pressButton('button').then(() => {
                res()
            }).catch(rej)
        })
    }


    it('should load title', next => {
        const h2 = 'Raw Bitcoin Transaction Breakdown'
        browser.visit('http://127.0.0.1:1337/index.html', err => {
            browser.assert.text('h2', h2);
            next()
        });
    })

    function onetime(i, label, next, cb) {
        data = testdata[i]
        if (label && !data[label]) {
            i++
            if (i == testdata.length) {
                next()
                return
            }
            onetime(i, label, next, cb)
            return
        }
        loadtx(data.tx).then(() => {
            cb(data)
            if (i == testdata.length - 1) next()
            else {
                i++
                onetime(i, label, next, cb)
            }
        })

    }

    it('should parse version', next => {
        onetime(0, '', next, data => {
            // console.log('test tx version', data.tx)
            const version = browser.querySelector('.version')
            assert.strictEqual(version.innerHTML, data.version.html)
            assert.strictEqual(version.getAttribute('title'), data.version.title)
        })


    })

    it('should parse marker', next => {
        onetime(0, 'marker', next, data => {
            browser.assert.text('.marker', '00', data.marker.html)
            browser.assert.attribute('.marker', 'title', data.marker.title)
        })
    })

    it('should parse flag', next => {
        onetime(0, 'flag', next, data => {
            browser.assert.text('.flag', data.flag.html)
            browser.assert.attribute('.flag', 'title', data.flag.title)
        })
    })

    it('should parse number of inputs', next => {
        onetime(0, 'nin', next, data => {
            const nin = browser.querySelector('.nin')
            assert.strictEqual(nin.innerHTML, data.nin.html)
            assert.strictEqual(nin.getAttribute('title'), data.nin.title)
        })
    })

    it('should present json', next => {
        onetime(0, 'nin', next, data => {
            const json = browser.querySelector('#json')
            const have = JSON.parse(json.innerHTML)
            const want = data.json
            assert.strictEqual(want.version, have.version)

            want.vin.forEach((inp, i) => {
                assert.strictEqual(have.vin[i].txid, inp.txid)
            })

            want.vout.forEach((out, i) => {
                assert.strictEqual(have.vout[i].value, out.value)
            })
        })
    })


    it('output text should match input text', next => {
        onetime(0, '', next, data => {
            const inp = browser.querySelector('textarea')
            const out = browser.querySelector('.result')
            assert.strictEqual(inp.value, out.textContent)
        })
    })

    it('output text matches in many txs', next => {
        testdata = rawtx
        onetime(0, '', next, data => {
            const inp = browser.querySelector('textarea')
            const out = browser.querySelector('.result')
            assert.strictEqual(inp.value, out.textContent)
        })
    })

})