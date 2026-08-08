// #!/bin/bash
// npm install puppeteer-extra puppeteer-extra-plugin-stealth
// npx puppeteer browsers install chrome
// node screenshot_other.js https://cnn.com output_cnn.png


const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const url = process.argv[2];
const png = process.argv[3] || 'output.png';

async function takeScreenshot(url) {
  // Start headless Chrome
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: '/usr/local/sbin/chrome-devel-sandbox',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    env: {
      ...process.env,
      GLIBC_TUNABLES: 'glibc.cpu.hwcaps=-SHSTK,-IBT'
    }
  });

  const page = await browser.newPage();

  // OG preview card size
  await page.setViewport({ width: 3840, height: 2160 });
await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');
await page.setExtraHTTPHeaders({
	 'X-Forwarded-For': '8.8.8.8' // pretend to be in the US
});

// rest of your script unchanged
// Instead of networkidle2, use domcontentloaded + a fixed wait
await page.goto(url, { waitUntil: 'domcontentloaded' });

// Just wait a fixed 3 seconds for the visuals to settle
await new Promise(r => setTimeout(r, 3000));

await page.screenshot({ path: png });


  await browser.close();
  console.log('Done! Screenshot saved to '+png);
}

takeScreenshot(url).catch(err => {
  console.error('Screenshot failed:', err);
  process.exit(1);
});
