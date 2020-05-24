const fs = require("fs").promises;
const { isNpmRepo, fetchWeeklyDownloads } = require("../npm");
const { INCLUDE_DEV_DEPENDENCIES } = require("../config");

const Package = require("../Package");
const { getRepoMetaData, getPackageJson } = require("./metadata");
const octokit = require("./octokit");

class Query {
  constructor(q = "language:javascript", sort) {
    this.q = q;
    this.sort = !sort || sort === "" ? undefined : sort;
    this.order = "desc";
    this.per_page = 100;
    this.page = 1;
  }

  async query(n) {
    const numPages = Math.ceil(n / this.per_page);
    let items = [];
    for (let i = 1; i <= numPages; i++) {
      this.page = i;
      console.log("github/index/query", this);
      let response = await octokit.search.repos(this);
      items = [...items, ...response.data.items];
    }
    return items;
  }
}

const fetchRoots = async () => {
  let roots = [];
  let repos = {};

  try {
    roots = require("./roots.json");
  } catch {}

  if (roots.lenght > 0) {
    return roots;
  }

  let items = [];
  for (let q of [
    "language:javascript",
    "language:typescript",
    "node.js",
    "angular",
    "react",
    "vue",
  ]) {
    for (let sort of ["", "stars", "updated"]) {
      const query = new Query(q, sort);
      const result_items = await query.query(1000);
      items = [...items, ...result_items];
    }
  }

  const pkgs = [];
  for (let item of items) {
    try {
      const pkg = await getPackageJson(item.full_name);
      if (!pkg) {
        console.log("pkg undefined");
        continue;
      }
      let packageName = item.full_name;
      let weeklyDownloads = -1;
      let isNpm = await isNpmRepo(pkg.name);
      if (isNpm) {
        packageName = pkg.name;
        weeklyDownloads = await fetchWeeklyDownloads(pkg.name);
      }

      if (repos[packageName]) {
        // we already parsed this
        continue;
      }

      if (pkg.dependencies) {
        const dependencies = Object.keys(pkg.dependencies);
        dependencies.forEach((dep) => {
          if (!roots.includes(dep)) {
            roots.push(dep);
          }
        });
      }
      if (INCLUDE_DEV_DEPENDENCIES && pkg.devDependencies) {
        const devDependencies = Object.keys(pkg.devDependencies);
        devDependencies.forEach((dep) => {
          if (!roots.includes(dep)) {
            roots.push(dep);
          }
        });
      }

      const repoMetaData = await getRepoMetaData(
        item.full_name.split("/")[0],
        item.name
      );

      repos[packageName] = new Package(
        packageName,
        item.full_name,
        "github.com/" + item.full_name,
        pkg.dependencies ? Object.keys(pkg.dependencies) : [],
        pkg.devDependencies ? Object.keys(pkg.devDependencies) : [],
        isNpm,
        repoMetaData.id,
        repoMetaData.stargazers_count,
        repoMetaData.open_issues_count,
        weeklyDownloads
      );
    } catch (err) {
      console.error(err);
    }
  }

  pkgs.forEach((p) => {
    repos[p.name] = p;
  });

  fs.writeFile("./roots.json", JSON.stringify(roots, null, 4));
  return {
    repos,
    roots,
  };
};

module.exports = exports = {
  getPackageJson,
  getRepoMetaData,
  fetchRoots,
};
