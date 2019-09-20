const Browser = require('zombie');
const StaticServer = require('static-server');
const assert = require('assert')
let testdata = require('./testdata')
const jdata = require('./json')

let url

if (process.env["TESTDEPLOY"]) {
    url = "https://rsbondi.github.io/btc-adventure/"
} else {
    url = 'http://127.0.0.1:1337/index.html'
}


describe(`test page at ${url}`, () => {
    before(async function () {
        if (!process.env["TESTDEPLOY"]) {
            var server = new StaticServer({
                rootPath: '.',
                port: 1337,
            });

            await server.start();
        }
    });

    function loadtx(browser, tx) {
        return new Promise((res, rej) => {
            browser.fill('textarea', tx)
            browser.pressButton('button').then(() => {
                res()
            }).catch(rej)
        })
    }


    function onetime(i, label, cb) {
        return new Promise((res, rej) => {
            const data = testdata[i]
            if (label && !data[label]) { res(); return }
            const browser = new Browser();
            browser.visit(url, err => {
                loadtx(browser, data.tx).then(() => {
                    cb(browser)
                    res()
                })
            });
        });
    }

    function testloop(label, next, cb) {
        const promises = []
        for (let i = 0; i < testdata.length; i++) {
            const data = testdata[i]
            // console.log(data.tx.slice(0, 50))
            promises.push(
                onetime(i, label, browser => cb(browser, data))
            )
        }
        Promise.all(promises).then(() => next())

    }

    it('should load title', next => {
        const h2 = 'Raw Bitcoin Transaction Breakdown'
        const browser = new Browser();
        browser.visit(url, err => {
            browser.assert.text('h2', h2);
            next()
        });
    })

    it('should parse version', next => {
        testloop('', next, (browser, data) => {
            const version = browser.querySelector('.version')
            assert.strictEqual(version.innerHTML, data.version.html)
            assert.strictEqual(version.getAttribute('title'), data.version.title)
        })
    })

    it('should parse marker', next => {
        testloop('marker', next, (browser, data) => {
            browser.assert.text('.marker', '00', data.marker.html)
            browser.assert.attribute('.marker', 'title', data.marker.title)
        })
    })

    it('should parse flag', next => {
        testloop('flag', next, (browser, data) => {
            browser.assert.text('.flag', data.flag.html)
            browser.assert.attribute('.flag', 'title', data.flag.title)
        })
    })

    it('should parse number of inputs', next => {
        testloop('nin', next, (browser, data) => {
            const nin = browser.querySelector('.nin')
            assert.strictEqual(nin.innerHTML, data.nin.html)
            assert.strictEqual(nin.getAttribute('title'), data.nin.title)
        })
    })

    it('should present json', next => {
        testloop('', next, (browser, data) => {
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
        testloop('', next, (browser, data) => {
            const inp = browser.querySelector('textarea')
            const out = browser.querySelector('.result')
            assert.strictEqual(inp.value, out.textContent)
        })
    })

    it('output text matches in many txs', next => {
        testdata = jdata
        testloop('', next, (browser, data) => {
            const inp = browser.querySelector('textarea')
            const out = browser.querySelector('.result')
            assert.strictEqual(inp.value, out.textContent)
        })
    })

    it('test json against auto generated data from bitcoin core', next => {
        testdata = jdata
        testloop('', next, (browser, data) => {
            const json = browser.querySelector('#json')
            const have = JSON.parse(json.innerHTML)
            const want = data.json
            assert.strictEqual(want.version, have.version)

            want.vin.forEach((inp, i) => {
                if (!inp.txid) return // skip coinbase
                assert.strictEqual(have.vin[i].txid, inp.txid)
            })

            want.vout.forEach((out, i) => {
                assert.strictEqual(have.vout[i].value, out.value)
            })
        })
    })
})