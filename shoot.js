const puppeteer = require('puppeteer');
const StaticServer = require('static-server');
let testdata = require('./test/testdata')
const url = 'http://127.0.0.1:1337/index.html'
let browser, page

function shot(i, tx) {
    return new Promise(async (res, rej) => {
        await page.goto(url);
        await page.waitFor('textarea');

        // await page.$eval('textarea', el => el.value = tx);
        await page.focus('textarea')
        await page.keyboard.type(tx)
    
        await page.click('button');
        await page.waitForSelector('.result');

        await page.screenshot({path: `shot${i}.png`, fullPage: true})
    
        res()
    })
}

(async () => {
    var server = new StaticServer({
        rootPath: '.', 
        port: 1337,
    });

    await server.start();
    browser = await puppeteer.launch();
    page = await browser.newPage();

    let i = 0
    async function test() {
        console.log('test', i)
        return new Promise(async (res, rej) => {
            await shot(i, testdata[i].tx)
            i++
            if(i<testdata.length) await test()
            res()
        })
    }

    await test()
    await browser.close();
    server.stop()
})()