// test-puppeteer.js
const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto('https://www.google.com', { waitUntil: 'networkidle2' });

    console.log('Page title:', await page.title());

    await browser.close();
  } catch (error) {
    console.error('Error running Puppeteer:', error);
  }
})();