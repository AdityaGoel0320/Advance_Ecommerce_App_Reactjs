import { mkdir, writeFile } from "node:fs/promises";
import * as catalog from "../../backend/constants/index.mjs";

const sources = {
  headphones: "photo-1505740420928-5e560c06d30e",
  phone: "photo-1511707171634-5f897ff02aa9",
  watch: "photo-1523275335684-37898b6baf30",
  laptop: "photo-1496181133206-80ce9b88a853",
  camera: "photo-1516035069371-29a1b244cc32",
  gaming: "photo-1486401899868-0e435ed85128",
  tablet: "photo-1544244015-0df4b3ffc6b0",
  speaker: "photo-1608043152269-423dbba4e7e1",
  tools: "photo-1504148455328-c376907d081c",
  vacuum: "photo-1558317374-067fb5f30001",
};

const imageGroups = {
  headphones: ["cat-Headphone.webp", "headphone.jpg", "earbuds.webp", "highlights-One.webp"],
  phone: ["catPhone.webp", "phone.webp", "phoneTwo.jpg", "highlights-Two.webp"],
  watch: ["cat-Smart-Watch.webp", "cat-Sport-Watch.webp", "smart-Watch.webp", "sport-Watch.jpg", "watchTwo.jpg", "watch-Three.jpg"],
  laptop: ["cat-Computer.webp", "laptop.webp", "blogOne.webp"],
  camera: ["cat-Camera.webp", "camera.webp", "wifi-Camera.webp", "blog-Three.webp"],
  gaming: ["cat-Gaming.webp", "gaming-Controller.webp", "usb.jpg"],
  tablet: ["cat-Tablet.webp", "writing-Tablet.webp"],
  speaker: ["cat-Tv-Audio.webp", "catTvBox.webp", "tvBox.webp", "bluetooth-Speaker.webp", "home-Speaker.webp", "soundBox.webp", "speaker.webp", "mp3-Player.webp", "highlights-Three.webp", "blogTwo.webp"],
  tools: ["cat-Powertool.webp", "hand-Drill.jpg", "blueGun.jpg"],
  vacuum: ["cat-Robot-Clean.webp", "vaccum-Cleaner.webp", "vaccum.webp"],
};

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
const queue = Object.entries(sources);

async function downloadImages() {
  while (queue.length) {
    const [name, photo] = queue.shift();
    const url = `https://images.unsplash.com/${photo}?auto=format&fit=crop&w=900&q=85`;
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
      if (!response.ok || !response.headers.get("content-type")?.startsWith("image/")) {
        throw new Error(`Image request failed: ${response.status}`);
      }
      const filename = `${name}.jpg`;
      await writeFile(new URL(filename, directory), Buffer.from(await response.arrayBuffer()));
    } catch (error) {
      failures.push({ url, message: error.message });
    }
  }
}

await Promise.all(Array.from({ length: 4 }, downloadImages));
if (failures.length) {
  console.error("Image downloads failed; existing image manifest was preserved.", failures);
  process.exitCode = 1;
} else {
  for (const url of urls) {
    const filename = new URL(url).pathname.split("/").pop();
    const group = Object.entries(imageGroups).find(([, filenames]) => filenames.includes(filename))?.[0];
    if (!group) throw new Error(`No representative product image configured for ${url}`);
    manifest[url] = `/catalog/${group}.jpg`;
  }
  await writeFile(
    new URL("../src/lib/catalogImages.json", import.meta.url),
    `${JSON.stringify(Object.fromEntries(Object.entries(manifest).sort()), null, 2)}\n`
  );
  console.log(`Downloaded ${Object.keys(sources).length} photos covering ${urls.size} catalogue image references.`);
}