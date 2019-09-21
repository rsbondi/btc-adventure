const {Builder, By, Key, until} = require('selenium-webdriver');

const StaticServer = require('static-server');
let testdata = require('./test/json')
const url = 'http://127.0.0.1:1337/index.html'

function shot(i, tx) {
    return new Promise(async (res, rej) => {
        console.log('test tx', tx)

        let driver = await new Builder().forBrowser('chrome').build();
        try {
            await driver.get(url);
            const textarea = await driver.findElement(By.tagName('textarea'))
            await textarea.sendKeys(tx, Key.RETURN);
            const button = await driver.findElement(By.tagName('button'))
            await button.click()
            b64 = await driver.takeScreenshot()
            require('fs').writeFileSync(`shot${i}.png`, b64, 'base64')
        } finally {
            await driver.quit();
        }
        res()
    })
}

(async () => {
    var server = new StaticServer({
        rootPath: '.',
        port: 1337,
    });

    await server.start();
    let i = 0
    async function test() {
        return new Promise(async (res, rej) => {
            await shot(i, testdata[i].tx)
            i++
            res()
            if (i < testdata.length) await test()
        })
    }

    await test()
})()