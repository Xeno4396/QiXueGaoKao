const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");

fs.mkdirSync(dist, { recursive: true });

for (const file of ["index.html"]) {
  fs.copyFileSync(path.join(root, file), path.join(dist, file));
}

for (const directory of ["assets", "data"]) {
  fs.cpSync(path.join(root, directory), path.join(dist, directory), {
    recursive: true,
    force: true,
  });
}

console.log("Static site copied to dist/");
