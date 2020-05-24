const { Octokit } = require("@octokit/rest");

const YOUR_API_KEY = "";

module.exports = exports = new Octokit({
  auth: YOUR_API_KEY,
  baseUrl: "https://api.github.com",
});
