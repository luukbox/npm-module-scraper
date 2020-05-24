const fetch = require("node-fetch");
const octokit = require("./octokit");

exports.getRepoMetaData = async (owner, repo) => {
  const repo_get_response = await octokit.repos.get({ owner, repo });
  return repo_get_response.data;
};

exports.getPackageJson = async (fullName) => {
  if (!fullName) {
    return;
  }
  const packageJsonUrl =
    "https://raw.githubusercontent.com/" + fullName + "/master/package.json";
  console.log("Fetching " + packageJsonUrl + "...");
  const pkgResp = await fetch(packageJsonUrl);
  return await pkgResp.json();
};
