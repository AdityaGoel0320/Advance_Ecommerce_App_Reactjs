import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import * as catalog from "../../admin/constants/index.mjs";

const urls = new Set();
function collectImages(value) {
  if (typeof value === "string") {
    if (value.startsWith("https://i.ibb.co/")) urls.add(value);
  } else if (Array.isArray(value)) {
    value.forEach(collectImages);
  } else if (value && typeof value === "object") {
    Object.values(value).forEach(collectImages);
  }
}
collectImages(catalog);

const directory = new URL("../public/catalog/", import.meta.url);
await mkdir(directory, { recursive: true });
const manifest = {};
const failures = [];
const queue = [...urls];

async function downloadImages() {
  while (queue.length) {
    const url = queue.shift();
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
      if (!response.ok || !response.headers.get("content-type")?.startsWith("image/")) {
        throw new Error(`Image request failed: ${response.status}`);
      }
      const extension = new URL(url).pathname.split(".").pop();
      const filename = `${createHash("sha256").update(url).digest("hex").slice(0, 16)}.${extension}`;
      await writeFile(new URL(filename, directory), Buffer.from(await response.arrayBuffer()));
      manifest[url] = `/catalog/${filename}`;
    } catch (error) {
      manifest[url] = "/image-unavailable.svg";
      failures.push({ url, message: error.message });
    }
  }
}

await Promise.all(Array.from({ length: 4 }, downloadImages));
await writeFile(
  new URL("../src/lib/catalogImages.json", import.meta.url),
  `${JSON.stringify(Object.fromEntries(Object.entries(manifest).sort()), null, 2)}\n`
);
console.log(`Downloaded ${urls.size - failures.length}/${urls.size} catalogue images.`);
if (failures.length) {
  console.error(failures);
  process.exitCode = 1;
}