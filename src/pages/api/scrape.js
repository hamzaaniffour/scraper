import puppeteer from 'puppeteer';

export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { keyword } = req.body;

  if (!keyword) {
    return res.status(400).json({ error: 'Keyword is required' });
  }

  let browser;
  try {
    console.log('Launching Puppeteer...');
    browser = await puppeteer.launch({ headless: false }); // Set headless to false for debugging
    const page = await browser.newPage();

    // Set a user-agent to mimic a real browser
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    let emails = [];
    for (let i = 0; i < 4; i++) {
      console.log(`Navigating to Google page ${i + 1} with keyword: ${keyword}`);
      await page.goto(`https://www.google.com/search?q=${encodeURIComponent(keyword)}&start=${i * 10}`, { waitUntil: 'networkidle2' });

      console.log('Waiting for page to load...');
      await page.waitForSelector('body', { timeout: 30000 });

      console.log('Extracting sponsored URLs...');
      const sponsoredUrls = await page.evaluate(() => {
        const sponsoredElements = Array.from(document.querySelectorAll('div'));
        return sponsoredElements
          .filter(element => element.innerText.includes('Sponsorisé'))
          .map(element => {
            const link = element.querySelector('a');
            // Avoid Google Maps links
            if (link && !link.href.includes('google.com/maps')) {
              return link.href;
            }
            return null;
          })
          .filter(url => url !== null);
      });

      if (sponsoredUrls.length === 0) {
        console.log(`No sponsored results found on page ${i + 1}.`);
        continue;
      }

      console.log(`Found sponsored URLs on page ${i + 1}: ${sponsoredUrls}`);

      for (let url of sponsoredUrls) {
        console.log(`Navigating to sponsored URL: ${url}`);
        try {
          await page.goto(url, { waitUntil: 'networkidle2' });

          const pageEmails = await page.evaluate(() => {
            const emailRegex = /[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+/g;
            const text = document.body.innerText;
            return text.match(emailRegex) || [];
          });

          console.log(`Found emails on ${url}: ${pageEmails}`);
          emails = emails.concat(pageEmails);
        } catch (err) {
          console.error(`Failed to navigate to ${url}: `, err);
          continue;
        }
      }
    }

    await browser.close();

    console.log('Scraping complete. Returning emails...');
    return res.status(200).json({ message: 'Scraping successful', emails });
  } catch (error) {
    if (browser) {
      await browser.close();
    }

    console.error('Error during scraping:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};