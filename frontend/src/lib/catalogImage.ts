import catalogImages from "./catalogImages.json";

const images: Record<string, string> = catalogImages;
const categoryImages: Record<string, string> = {
  tvandaudio: "speaker",
  tvbox: "speaker",
  powertools: "tools",
  headphones: "headphones",
  cellphones: "phone",
  smartwatches: "watch",
  gameandvideo: "gaming",
  robotclean: "vacuum",
  sportwatches: "watch",
  tablets: "tablet",
  computersandlaptop: "laptop",
  camerasandphotos: "camera",
};

export function resolveCatalogImage(source: string | undefined, category = "", baseUrl = "/") {
  const local = source ? images[source] : undefined;
  if (local) return `${baseUrl}${local.slice(1)}`;
  if (!source || source.endsWith("image-unavailable.svg")) {
    const group = categoryImages[category.toLowerCase().replace(/&/g, "and").replace(/[^a-z]/g, "")];
    if (group) return `${baseUrl}catalog/${group}.jpg`;
  }
  return source || `${baseUrl}image-unavailable.svg`;
}
