# LinkedIn Scrapper

Lead generation tool to scrape LinkedIn profiles by role — extracts **name**, **email**, **phone**, **company**, and **role/title**.

## Target Roles

| Role | Keywords |
|------|----------|
| Project Manager | PM, Scrum Master, Program Manager |
| Tech Manager | Engineering Manager, VP Engineering, Tech Lead |
| CEO | Chief Executive Officer, Founder & CEO |
| CTO | Chief Technology Officer, VP Technology |
| Agency / Freelancer | Agency Owner, Freelance Consultant |

## Features

- Black & white clean UI
- Demo mode (no credentials needed — sample data)
- Live scrape mode (Puppeteer + LinkedIn login)
- Filter and sort results in real-time
- Export to CSV or JSON
- Contact info extraction (email, phone)

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file
cp .env.example .env

# 3. Edit .env — add your LinkedIn credentials
nano .env

# 4. Start the server
npm start
```

Open [http://localhost:3000](http://localhost:3000)

## Usage

### Demo Mode
Click **Run Demo Search** — no credentials required. Loads sample data for all roles.

### Live Scrape Mode
1. Switch to **Live Scrape** mode
2. Enter your LinkedIn email and password
3. Select target roles
4. Optionally filter by location
5. Click **Start Scraping**

The scraper will:
1. Log into LinkedIn using your credentials
2. Search for each selected role
3. Visit individual profiles to extract contact info
4. Return structured lead data

## ⚠️ Disclaimer

This tool is for **educational and authorized use only**. LinkedIn's Terms of Service prohibit automated data collection. Use responsibly:
- Only scrape data you are authorized to access
- Respect rate limits and add delays between requests
- Do not use for spam or unsolicited outreach
- Consider LinkedIn's official API for production use

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `LINKEDIN_EMAIL` | — | Your LinkedIn email |
| `LINKEDIN_PASSWORD` | — | Your LinkedIn password |
| `PORT` | `3000` | Server port |
| `HEADLESS` | `true` | Run browser headlessly |
| `MAX_RESULTS` | `50` | Max results to scrape |
