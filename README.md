# NPM Module Scraper

This scraper is part of our IE 684 Web Mining Project: "Mining Node.js Module Dependencies – Analysis of a Dependency Graph & Development of a Dependency Recommender System"

Usage:

- `$ npm install`

- Set `YOUR_PART` variable in `src/all_npm.js` to the assigned part or change `NUM_PARTS` to `1` to scrape all the modules in one sessions (not recommended).

- Set `YOUR_API_KEY` variable in `src/github/octokit.js` to your Github API Key

- `$ npm start` : fetches all the modules within your assigned part defined in `packagesList.json`. `packagesList.json` is a list of all NPM module names currently available on NPM and was created via npms CouchDB

- `$ npm merge` : merges all fetched parts
