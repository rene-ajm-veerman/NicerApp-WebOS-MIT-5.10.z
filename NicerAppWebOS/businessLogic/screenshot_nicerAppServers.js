const puppeteer = require('puppeteer');

// The URL to screenshot comes from the command line:
// node screenshot.js https://nicer.app
const url = process.argv[2];
const png = process.argv[3] || 'output.png';

async function takeScreenshot(url) {
  // Start headless Chrome
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // OG preview card size
  await page.setViewport({ width: 1280, height: 630 });

  // Navigate and wait for network to settle
  await page.goto(url, { waitUntil: 'networkidle2' });

  // Now wait for YOUR app to say it's ready
  // Timeout after 10 seconds just in case something goes wrong
  await page.waitForFunction(
    'window._screenshotReady === true',
    { timeout: 10000 }
  );

  // Snap it!
  await page.screenshot({ path: png });

  await browser.close();
  console.log('Done! Screenshot saved to output.png');
}

takeScreenshot(url).catch(err => {
  console.error('Screenshot failed:', err);
  process.exit(1);
});
