// ローカル確認用サーバー(Python不要): ビルド後に dist/ を配信します
//   node serve.mjs   → http://localhost:8000
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join, extname, normalize, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = fileURLToPath(new URL(".", import.meta.url));
const DIST = join(ROOT, "dist");
const PORT = Number(process.env.PORT) || 8000;

const build = spawnSync(process.execPath, [join(ROOT, "build.mjs")], { stdio: "inherit" });
if (build.status !== 0) process.exit(build.status ?? 1);

const TYPES = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8", ".svg": "image/svg+xml",
  ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".ico": "image/x-icon",
};

createServer(async (req, res) => {
  try {
    let path = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (path.endsWith("/")) path += "index.html";
    const file = normalize(join(DIST, path));
    if (file !== DIST && !file.startsWith(DIST + sep)) { res.writeHead(403).end("Forbidden"); return; }
    const data = await readFile(file);
    res.writeHead(200, { "Content-Type": TYPES[extname(file)] || "application/octet-stream" });
    res.end(data);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("Not Found");
  }
}).listen(PORT, () => console.log(`✔ http://localhost:${PORT} で確認できます(停止: Ctrl+C)`));
