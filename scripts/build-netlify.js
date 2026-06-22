const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const dist = path.join(root, ".publish");

fs.mkdirSync(dist, { recursive: true });

for (const file of [
  "index.html",
  "admission-scores-2025.html",
  "plans-2026.html",
  "plan-comparison-report.html",
]) {
  fs.copyFileSync(path.join(root, file), path.join(dist, file));
}

for (const directory of ["assets", "data"]) {
  fs.cpSync(path.join(root, directory), path.join(dist, directory), {
    recursive: true,
    force: true,
  });
}

console.log("Static site copied to dist/");
