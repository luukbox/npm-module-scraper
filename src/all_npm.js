const fs = require("fs").promises;
const { getRepoMetaData } = require("./github");
const { fetchPkg } = require("./npm");
const packagesList = require("../packagesList.json");

/*  */
/*  */
/*  */
const MY_PART = 1;
/*  */
/*  */
/*  */

const NUM_PARTS = 20;
if (
  typeof MY_PART !== "number" ||
  MY_PART === NaN ||
  MY_PART < 1 ||
  MY_PART > NUM_PARTS
) {
  throw Error(" 1 <= PART <=" + NUM_PARTS);
}

const my_results_file_name = "all_npm_part_" + MY_PART + ".json";
const my_unscrapable_file_name =
  "all_npm_part_" + MY_PART + "_unscrapable.json";
const my_results_file_path = "../" + my_results_file_name;
const my_unscrapable_file_path = "../" + my_unscrapable_file_name;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function dumpResults(results) {
  try {
    await fs.writeFile(my_results_file_name, JSON.stringify(results, null, 4));
  } catch (err) {
    console.error("dumpResults: ", err);
  }
}

async function getPackage(name) {
  try {
    const pkg = await fetchPkg(name);
    if (pkg) {
      try {
        const repoMetaData = await getRepoMetaData(
          pkg.fullName.split("/")[0],
          pkg.fullName.split("/")[1]
        );
        pkg.githubId = repoMetaData.id;
        pkg.stars = repoMetaData.stargazers_count;
        pkg.issues = repoMetaData.open_issues_count;
      } catch {}
    }
    return pkg;
  } catch (err) {
    console.log("fetchPkg Error:", err);
  }
}

const partsInterval = Math.ceil(packagesList.length / NUM_PARTS);
const startIndexInclusive = (MY_PART - 1) * partsInterval;
const endIndexExclusive = MY_PART * partsInterval;

(async () => {
  let count = 0;
  let total = endIndexExclusive - startIndexInclusive;
  let currentIndex = startIndexInclusive;

  let my_results;
  try {
    my_results = require(my_results_file_path);
  } catch {
    await dumpResults({});
    my_results = require(my_results_file_path);
  }
  let my_unscrapable;
  try {
    my_unscrapable = require(my_unscrapable_file_path);
  } catch {
    await fs.writeFile(my_unscrapable_file_name, "[]");
    my_unscrapable = require(my_unscrapable_file_path);
  }

  while (currentIndex < endIndexExclusive) {
    const names = [];
    for (let i = 0; i < 10 && currentIndex < endIndexExclusive; i++) {
      count++;
      const name = packagesList[currentIndex++];
      if (
        !Object.keys(my_results).includes(name) &&
        !my_unscrapable.includes(name)
      ) {
        names.push(name);
      }
    }
    const promises = names.map((name) => getPackage(name));
    if (names.length > 0) {
      console.log(
        `Fetching [${names
          .map((name) => "'" + name + "'")
          .join(", ")}] (${count}/${total})`
      );
    }
    const pkgs = await Promise.all(promises);
    for (let i = 0; i < pkgs.length; i++) {
      const p = pkgs[i];
      if (p) {
        my_results[p.name] = p;
      } else {
        my_unscrapable.push(names[i]);
      }
    }

    // await sleep(pkgs.length * 200);
    if (pkgs.length > 0) {
      await dumpResults(my_results);
      await fs.writeFile(
        my_unscrapable_file_name,
        JSON.stringify(my_unscrapable)
      );
    }
  }

  await dumpResults(my_results);
})();
