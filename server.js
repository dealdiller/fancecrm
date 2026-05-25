const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
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
  if (cleanUrl === "/zabory-iz-profnastila") return "public/zabory-iz-profnastila.html";
  if (cleanUrl === "/kalkulyator-zabora") return "public/kalkulyator-zabora.html";
  return cleanUrl.replace(/^\/+/, "");
}

function handleRequest(req, res) {
  const filePath = path.join(root, resolvePath(req.url || "/"));
  if (!filePath.startsWith(root)) {
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
