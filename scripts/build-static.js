const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "dist");

const files = [
  "index.html",
  "styles.css",
  "robots.txt",
  "sitemap.xml"
];

function copyFile(relativePath, targetPath = relativePath) {
  const source = path.join(root, relativePath);
  const target = path.join(outDir, targetPath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
}

function copyDir(relativeDir) {
  const sourceDir = path.join(root, relativeDir);
  if (!fs.existsSync(sourceDir)) return;

  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    const relativePath = path.join(relativeDir, entry.name);
    if (entry.isDirectory()) {
      copyDir(relativePath);
    } else {
      copyFile(relativePath);
    }
  }
}

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

for (const file of files) copyFile(file);
copyFile("client.js", "assets/client.js");
copyDir("public");

console.log(`Built static FenceFlow CRM into ${outDir}`);
