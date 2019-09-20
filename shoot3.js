const puppeteer = require('puppeteer');
const StaticServer = require('static-server');
let testdata = require('./test/json')
const url = 'http://127.0.0.1:1337/index.html'
let browser, page

class shoot {
    constructor(i, tx) {
        this.i = i
        this.tx = tx
    }

    shoot() {

    }
}

function shot(i, tx) {
    return new Promise(async (res, rej) => {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
    
        await page.goto(url);
        await page.waitFor('textarea');

        // await page.$eval('textarea', el => el.value = tx);
        await page.focus('textarea')
        await page.keyboard.type(tx)

        await page.click('button');
        await page.waitForSelector('.result');

        await page.screenshot({ path: `shot${i}.png`, fullPage: true })
        await browser.close();

        res()
    })
}

(async () => {
    var server = new StaticServer({
        rootPath: '.',
        port: 1337,
    });

    await server.start();

    const promises = []
    for (i=0; i<testdata.length;i++) {
        promises.push(new Promise(async (res, rej) => {
            await shot(i, testdata[i].tx)
            res()
        }))
    }    

    await Promise.all(promises)
    server.stop()
})()