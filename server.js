const http = require("http");
const fs = require("fs");
const path = require("path");

const sourceRoot = __dirname;
const staticRoot = fs.existsSync(path.join(sourceRoot, "dist", "index.html"))
  ? path.join(sourceRoot, "dist")
  : sourceRoot;
const port = process.env.PORT || 4173;

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8"
};

function resolvePath(url) {
  const cleanUrl = decodeURIComponent(url.split("?")[0]);
  if (cleanUrl === "/" || cleanUrl === "/crm") return "index.html";
  if (cleanUrl === "/app.js" || cleanUrl === "/client.js" || cleanUrl === "/assets/client.js") {
    return fs.existsSync(path.join(staticRoot, "assets/client.js")) ? "assets/client.js" : "client.js";
  }
  if (cleanUrl === "/zabory-iz-profnastila") return "public/zabory-iz-profnastila.html";
  if (cleanUrl === "/kalkulyator-zabora") return "public/kalkulyator-zabora.html";
  return cleanUrl.replace(/^\/+/, "");
}

function handleRequest(req, res) {
  const filePath = path.resolve(staticRoot, resolvePath(req.url || "/"));
  if (filePath !== staticRoot && !filePath.startsWith(`${staticRoot}${path.sep}`)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { "content-type": types[ext] || "application/octet-stream" });
    res.end(content);
  });
}

if (require.main === module && !process.env.VERCEL) {
  const server = http.createServer(handleRequest);
  server.listen(port, () => {
    console.log(`FenceFlow CRM preview: http://localhost:${port}`);
  });
}

module.exports = handleRequest;
