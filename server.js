// Servidor estatico minimo (sem dependencias). Necessario porque navegadores
// bloqueiam modulos ES (import/export) abertos via file://.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const port = Number(process.env.PORT) || 3000;
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript" };

createServer(async (req, res) => {
  const pathname = new URL(req.url, "http://localhost").pathname;
  const relative = normalize(pathname === "/" ? "/index.html" : pathname);
  const file = join(root, relative);
  const type = types[extname(file)];
  if (!file.startsWith(root) || !type) {
    res.writeHead(404).end("Not found");
    return;
  }
  try {
    res.writeHead(200, { "Content-Type": type }).end(await readFile(file));
  } catch {
    res.writeHead(404).end("Not found");
  }
}).listen(port, () => console.log(`Abra http://localhost:${port}`));
