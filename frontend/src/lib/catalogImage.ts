import catalogImages from "./catalogImages.json";

const images: Record<string, string> = catalogImages;
const categoryImages: Record<string, string> = {
  tvandaudio: "speaker",
  tvbox: "tv-box.svg",
  powertools: "tools",
  headphones: "headphones",
  cellphones: "phone",
  smartwatches: "watch",
  gameandvideo: "controller.svg",
  robotclean: "vacuum",
  sportwatches: "watch",
  tablets: "writing-tablet.svg",
  computersandlaptop: "laptop",
  camerasandphotos: "camera",
};

export function resolveCatalogImage(source: string | undefined, category = "", baseUrl = "/") {
  const local = source ? images[source] : undefined;
  if (local) return `${baseUrl}${local.slice(1)}`;
  if (!source || source.endsWith("image-unavailable.svg")) {
    const group = categoryImages[category.toLowerCase().replace(/&/g, "and").replace(/[^a-z]/g, "")];
    if (group) return `${baseUrl}catalog/${group.includes(".") ? group : `${group}.jpg`}`;
  }
  return source || `${baseUrl}image-unavailable.svg`;
}
