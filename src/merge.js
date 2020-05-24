const fs = require("fs").promises;

const combined = {};
for (let i = 1; i < 21; i++) {
  try {
    const data = require("../all_npm_part_" + i + ".json");
    for (let key in data) {
      combined[key] = data[key];
    }
  } catch (e) {
    console.log(e);
  }
}

console.log("size: " + Object.keys(combined).length);

fs.writeFile("all_npm_merged.json", JSON.stringify(combined, null, 4))
  .then((v) => console.log("done"))
  .catch((e) => console.error(e));
