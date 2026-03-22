const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');

const ROLE_QUERIES = {
  'project-manager': 'Project Manager',
  'tech-manager': 'Technical Manager',
  'ceo': 'CEO Chief Executive Officer',
  'cto': 'CTO Chief Technology Officer',
  'agency-freelancer': 'Agency Owner Freelancer'
};

const delay = (min, max) => {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise(resolve => setTimeout(resolve, ms));
};

async function createBrowser(headless = true) {
  const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH ||
    await chromium.executablePath();

  return puppeteer.launch({
    args: [
      ...chromium.args,
      '--disable-blink-features=AutomationControlled',
      '--disable-infobars',
      '--window-size=1366,768',
    ],
    defaultViewport: { width: 1366, height: 768 },
    executablePath,
    headless: headless ? chromium.headless : false,
  });
}

async function loginLinkedIn(page, email, password) {
  await page.goto('https://www.linkedin.com/login', { waitUntil: 'networkidle2' });

  await page.waitForSelector('#username');
  await page.type('#username', email, { delay: 80 });
  await page.type('#password', password, { delay: 80 });

  await page.click('[type="submit"]');
  await page.waitForNavigation({ waitUntil: 'networkidle2' });

  const url = page.url();
  if (url.includes('checkpoint') || url.includes('login')) {
    throw new Error('LinkedIn login failed or requires verification. Please check your credentials.');
  }

  return true;
}

async function searchPeople(page, query, location = '', maxResults = 25) {
  const searchUrl = location
    ? `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`
    : `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(query)}`;

  await page.goto(searchUrl, { waitUntil: 'networkidle2' });
  await delay(2000, 3500);

  const results = [];
  let pageNum = 1;

  while (results.length < maxResults) {
    await page.waitForSelector('.reusable-search__result-container', { timeout: 10000 }).catch(() => null);

    const profiles = await page.evaluate(() => {
      const items = document.querySelectorAll('.reusable-search__result-container');
      return Array.from(items).map(item => {
        const nameEl = item.querySelector('.entity-result__title-text a span[aria-hidden="true"]');
        const titleEl = item.querySelector('.entity-result__primary-subtitle');
        const locationEl = item.querySelector('.entity-result__secondary-subtitle');
        const linkEl = item.querySelector('.entity-result__title-text a');

        return {
          name: nameEl ? nameEl.innerText.trim() : '',
          title: titleEl ? titleEl.innerText.trim() : '',
          location: locationEl ? locationEl.innerText.trim() : '',
          profileUrl: linkEl ? linkEl.href : ''
        };
      }).filter(p => p.name && p.profileUrl);
    });

    results.push(...profiles);

    if (results.length >= maxResults) break;

    // Try next page
    const nextBtn = await page.$('.artdeco-pagination__button--next:not([disabled])');
    if (!nextBtn) break;

    await nextBtn.click();
    await delay(2500, 4000);
    pageNum++;

    if (pageNum > 5) break;
  }

  return results.slice(0, maxResults);
}

async function scrapeProfileDetails(page, profileUrl) {
  await page.goto(profileUrl, { waitUntil: 'networkidle2' });
  await delay(2000, 3500);

  const data = await page.evaluate(() => {
    // Name
    const nameEl = document.querySelector('h1.text-heading-xlarge');
    const name = nameEl ? nameEl.innerText.trim() : '';

    // Title/Role
    const titleEl = document.querySelector('.text-body-medium.break-words');
    const title = titleEl ? titleEl.innerText.trim() : '';

    // Company (current position)
    const companyEl = document.querySelector('[data-field="experience_company_logo"] .hoverable-link-text') ||
      document.querySelector('.pv-text-details__right-panel .mr1 span.visually-hidden') ||
      document.querySelector('.inline-show-more-text--is-collapsed span');
    const company = companyEl ? companyEl.innerText.trim() : '';

    // Location
    const locationEl = document.querySelector('.text-body-small.inline.t-black--light.break-words');
    const location = locationEl ? locationEl.innerText.trim() : '';

    // Contact info button check
    const contactBtn = document.querySelector('#top-card-text-details-contact-info');
    const hasContactInfo = !!contactBtn;

    // Email from about section
    const aboutSection = document.querySelector('#about ~ .display-flex .visually-hidden');
    const about = aboutSection ? aboutSection.innerText : '';

    // Extract emails from page text
    const bodyText = document.body.innerText;
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emails = [...new Set(bodyText.match(emailRegex) || [])].filter(e => !e.includes('linkedin'));

    // Extract phone numbers from page text
    const phoneRegex = /(\+?[\d\s\-().]{10,})/g;
    const phones = [];

    return {
      name,
      title,
      company,
      location,
      email: emails[0] || '',
      phone: phones[0] || '',
      profileUrl: window.location.href,
      hasContactInfo
    };
  });

  // If profile has contact info, try to get it
  if (data.hasContactInfo) {
    try {
      await page.click('#top-card-text-details-contact-info');
      await delay(1500, 2500);

      const contactData = await page.evaluate(() => {
        const emailEl = document.querySelector('.pv-contact-info__contact-type.ci-email a');
        const phoneEl = document.querySelector('.pv-contact-info__contact-type.ci-phone span');

        return {
          email: emailEl ? emailEl.innerText.trim() : '',
          phone: phoneEl ? phoneEl.innerText.trim() : ''
        };
      });

      if (contactData.email) data.email = contactData.email;
      if (contactData.phone) data.phone = contactData.phone;

      // Close modal
      await page.keyboard.press('Escape');
    } catch (e) {
      // Contact info modal failed, continue
    }
  }

  return data;
}

async function scrapeLinkedIn({ email, password, roles, location, maxResults, headless }) {
  const browser = await createBrowser(headless);
  const page = await browser.newPage();

  try {
    // Stealth settings
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' });

    // Login
    await loginLinkedIn(page, email, password);

    const allResults = [];

    for (const role of roles) {
      const query = ROLE_QUERIES[role] || role;
      const searchResults = await searchPeople(page, query, location, Math.ceil(maxResults / roles.length));

      for (const profile of searchResults) {
        try {
          const details = await scrapeProfileDetails(page, profile.profileUrl);
          allResults.push({
            ...details,
            searchRole: role,
            name: details.name || profile.name,
            title: details.title || profile.title,
            company: details.company || '',
            email: details.email || '',
            phone: details.phone || '',
            location: details.location || profile.location,
            profileUrl: profile.profileUrl,
            scrapedAt: new Date().toISOString()
          });
          await delay(2000, 4000);
        } catch (e) {
          // Add partial data if full scrape fails
          allResults.push({
            ...profile,
            searchRole: role,
            email: '',
            phone: '',
            company: '',
            scrapedAt: new Date().toISOString()
          });
        }
      }
    }

    return { success: true, data: allResults };

  } catch (error) {
    return { success: false, error: error.message };
  } finally {
    await browser.close();
  }
}

module.exports = { scrapeLinkedIn, ROLE_QUERIES };
