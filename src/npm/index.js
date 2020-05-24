const NpmApi = require("npm-api");
const Package = require("../Package");
const npm = new NpmApi();
const fetch = require("node-fetch");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchPkg(moduleName) {
  const repo = npm.repo(moduleName);
  const pkg = await repo.package();

  if (!pkg) {
    return;
  }

  let dependencies = [];
  let devDependencies = [];
  if (pkg.dependencies) {
    dependencies = Object.keys(pkg.dependencies);
  }
  if (pkg.devDependencies) {
    devDependencies = Object.keys(pkg.devDependencies);
  }

  if (
    !pkg.repository ||
    !pkg.repository.url ||
    !pkg.repository.url.includes("github.com/")
  ) {
    // the module is not maintained properly or the repository is not hosted on github
    // we should not care about it
    return;
  }

  let repoUrl = pkg.repository.url;

  let fullName = repoUrl.split("github.com/")[1];
  if (fullName.endsWith(".git")) {
    fullName = fullName.slice(0, fullName.length - 4);
  }
  let weeklyDownloads = await fetchWeeklyDownloads(pkg.name);

  return new Package(
    pkg.name,
    fullName,
    repoUrl,
    dependencies,
    devDependencies,
    true,
    undefined,
    undefined,
    undefined,
    weeklyDownloads
  );
}

async function isNpmRepo(name) {
  if (!name || name === "undefined") {
    return false;
  }
  try {
    const repo = npm.repo(name);
    const pkg = await repo.package();
    if (pkg) {
      return true;
    }
  } catch {}
  return false;
}

async function fetchWeeklyDownloads(packageName) {
  const response = await fetch(
    "https://api.npmjs.org/downloads/point/last-week/" + packageName
  );
  const resJson = await response.json();
  if (resJson.error) {
    return null;
  }
  return resJson.downloads;
}

module.exports = exports = {
  isNpmRepo,
  fetchPkg,
  fetchWeeklyDownloads,
};
