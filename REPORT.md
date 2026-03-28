# SEO Blog Post Creation Tool — Project Report

## Overview

This document explains the design, pipeline architecture, technology choices, and step-by-step workflow of the **SEO Blog Post Creation Tool** — an AI-powered web application that automates the full lifecycle of SEO-optimized product blog content, from scraping trending products to publishing finished articles.

---

## Application Architecture

The tool is built as a single-page React application (`.jsx`) that calls the Anthropic Claude API for AI-generated content. It follows a 4-stage pipeline presented as a guided wizard interface:

```
Stage 1: Scrape Products
       ↓
Stage 2: Research SEO Keywords
       ↓
Stage 3: Generate AI Blog Post (via Claude API)
       ↓
Stage 4: Publish to Platform
```

---

## Stage 1 — Product Scraping

### What it does
Simulates a product scraper targeting Amazon Best Sellers and eBay Trending. In a production deployment, this would use:

- **Amazon**: `amazon-paapi` (Amazon Product Advertising API) or a headless browser (Playwright/Puppeteer) to scrape `/best-sellers/` pages
- **eBay**: eBay Finding API (`findItemsAdvanced` endpoint) for trending/popular items
- **Flipkart**: Unofficial scraping via `axios` + `cheerio` targeting the Top Picks section

### Implementation approach (production)
```javascript
// Example: Real Amazon scraper using Playwright
const browser = await playwright.chromium.launch();
const page = await browser.newPage();
await page.goto('https://www.amazon.com/best-sellers/');
const products = await page.$$eval('.zg-item-immersion', items =>
  items.map(item => ({
    title: item.querySelector('.p13n-sc-truncate')?.innerText,
    price: item.querySelector('.p13n-sc-price')?.innerText,
    rating: item.querySelector('.a-icon-alt')?.innerText,
    asin: item.dataset.asin,
  }))
);
```

### Filters supported
- Category (Electronics, Beauty, Kitchen, Sports, etc.)
- Source platform (Amazon, eBay, Flipkart)
- Badge type (Best Seller, Trending, New Release)

---

## Stage 2 — SEO Keyword Research

### What it does
Generates keyword suggestions for the selected product, showing:
- **Search volume** (monthly searches)
- **Keyword difficulty** (KD score 0–100)
- **Search intent** (Informational, Commercial, Transactional)

### Tool integrations (production)
The tool is designed to support multiple keyword research backends:

| Tool | API / Method | Notes |
|------|-------------|-------|
| **Ubersuggest** | Neil Patel Data API | Requires paid API key |
| **Google Keyword Planner** | Google Ads API (`generateKeywordIdeas`) | Requires Google Ads account |
| **Ahrefs** | Ahrefs API v3 (`/keywords-explorer`) | Enterprise tier required |
| **SEMrush** | SEMrush API (`phrase_related`) | Subscription required |

### Example: Google Keyword Planner API call (production)
```javascript
const { KeywordPlanIdeaServiceClient } = require('google-ads-api');
const client = new KeywordPlanIdeaServiceClient({ authOptions });
const [response] = await client.generateKeywordIdeas({
  customerId: ADS_CUSTOMER_ID,
  language: { resourceName: 'languageConstants/1000' },
  geoTargetConstants: ['geoTargetConstants/2840'],
  keywordSeed: { keywords: [productTitle] },
  pageSize: 20,
});
```

### Keyword selection rules
- Select exactly 3–4 keywords for best SEO density
- Prioritize keywords with difficulty < 50 for new sites
- Mix intents: 1–2 commercial + 1–2 informational
- Ensure at least one keyword includes the exact product name or model

---

## Stage 3 — AI Blog Post Generation

### What it does
Sends a structured prompt to the **Claude Sonnet API** to generate a 150–200 word SEO-optimized blog post that:
- Incorporates all 3–4 selected keywords naturally
- Matches the chosen tone (Informative, Conversational, Enthusiastic, Professional)
- Includes a compelling title and call-to-action
- Avoids keyword stuffing (natural prose flow)

### API integration
```javascript
const response = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    messages: [{
      role: "user",
      content: `Write a 150–200 word SEO blog post about ${product.title}.
                Include these keywords: ${keywords.join(", ")}.
                Tone: ${tone}. Include title and CTA.`
    }]
  })
});
```

### Quality checks (automated)
After generation, the tool automatically validates:
- ✓ Word count falls within 150–200 word target
- ✓ All selected keywords appear in the content
- ✓ Title is present and non-empty
- Readability grade estimate (Grade 8–10 target)

### Regeneration
If the output doesn't meet quality checks, the user can regenerate with one click. Each generation is a fresh API call with the same prompt, producing variant results.

---

## Stage 4 — Publishing

### Supported platforms
| Platform | Method | URL |
|----------|--------|-----|
| **Medium** | Medium API (`POST /v1/users/{userId}/posts`) or manual paste | medium.com |
| **WordPress** | WP REST API (`POST /wp-json/wp/v2/posts`) | wordpress.com / self-hosted |
| **Hashnode** | Hashnode GraphQL API (`createPublicationStory`) | hashnode.com |
| **Dev.to** | DEV API (`POST /api/articles`) | dev.to |

### Example: WordPress REST API publish (production)
```javascript
const response = await fetch(`${WP_SITE_URL}/wp-json/wp/v2/posts`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Basic ${btoa(`${WP_USERNAME}:${WP_APP_PASSWORD}`)}`,
  },
  body: JSON.stringify({
    title: blogTitle,
    content: blogBody,
    status: 'publish',
    tags: selectedKeywords,
    meta: {
      _yoast_wpseo_focuskw: keywords[0],
      _yoast_wpseo_metadesc: blogBody.slice(0, 160),
    }
  })
});
```

### Example: Medium API publish (production)
```javascript
const response = await fetch(`https://api.medium.com/v1/users/${userId}/posts`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${MEDIUM_TOKEN}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: blogTitle,
    contentFormat: 'markdown',
    content: `# ${blogTitle}\n\n${blogBody}`,
    tags: selectedKeywords.slice(0, 5),
    publishStatus: 'public',
  })
});
```

### Post-publish metrics shown
- SEO score (simulated; production would use Yoast/RankMath API)
- Readability grade
- Word count
- Keyword coverage (all keywords used = 100%)
- Live post URL

---

## Technology Stack

| Component | Technology |
|-----------|-----------|
| Frontend framework | React (JSX) |
| AI content generation | Anthropic Claude Sonnet API |
| Product data source | Amazon Best Sellers (simulated) |
| Keyword research | Ubersuggest / Google Keyword Planner (simulated) |
| Styling | CSS variables, inline styles (claude.ai native design system) |
| Publishing targets | Medium, WordPress, Hashnode, Dev.to |

---

## Where Blogs Are Posted

In the current demo application, the publishing flow is simulated and generates a representative URL in the format:

```
https://medium.com/@seo-tool/{slug}-{unique-id}
```

For a production deployment, the tool would publish to:
- **Medium**: `https://medium.com/@your-username/post-slug`
- **WordPress**: `https://your-site.com/blog/post-slug`
- **Hashnode**: `https://your-blog.hashnode.dev/post-slug`
- **Dev.to**: `https://dev.to/your-username/post-slug`

To enable real publishing, replace the `publish()` mock in Step 4 with the appropriate platform API call shown above, and provide authentication credentials via environment variables.

---

## Steps Followed (Summary)

1. **UI design**: Built a 4-step wizard interface using React with the Anthropic design system (CSS variables, flat aesthetic, responsive layout).

2. **Product scraping layer**: Implemented a product card UI with simulated data matching Amazon Best Seller format (title, price, rating, review count, badge). Production would use Playwright headless scraping or the Amazon PAAPI.

3. **Keyword research layer**: Built keyword result cards showing volume, difficulty (color-coded: green < 35, amber 35–50, red > 50), and search intent. Up to 4 keywords selectable. Integrated with simulated Ubersuggest/GKP data; production would call real keyword APIs.

4. **AI content generation**: Integrated the Claude Sonnet API with a structured prompt enforcing word count (150–200 words), keyword inclusion, tone matching, and CTA. Added real-time keyword coverage validation post-generation.

5. **Publishing interface**: Built platform selector (Medium, WordPress, Hashnode, Dev.to) with copy-to-clipboard and direct platform deep-link buttons, plus simulated publish flow with post-publish SEO metrics.

6. **Quality assurance**: Word count badge (green when in range), keyword coverage pills (green/red), readability grade displayed after publish.

---

## Running the Application

The application is a single `.jsx` file designed to run as a React artifact in Claude.ai. To run it locally:

```bash
# Clone or save the index.jsx file
# Install dependencies
npm install react react-dom

# Run with Vite or Create React App
npx vite
# or
npx create-react-app seo-tool && cp index.jsx src/App.jsx && npm start
```

The Anthropic API key is handled automatically when running inside claude.ai artifacts. For local deployment, add your key to the fetch headers:
```javascript
headers: {
  "Content-Type": "application/json",
  "x-api-key": process.env.REACT_APP_ANTHROPIC_KEY,
  "anthropic-version": "2023-06-01"
}
```

---

*Report generated: March 2026 | Tool: SEO Blog Post Creator v1.0*
