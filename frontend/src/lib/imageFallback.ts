import catalogImages from "./catalogImages.json";

const imagePaths: Record<string, string> = catalogImages;

export const handleImageLoad = (event: Event) => {
  const image = event.target;
  if (!(image instanceof HTMLImageElement)) return;
  if (image.dataset.profileAvatar === "true") return;
  const localPath = imagePaths[image.src];
  if (!localPath) return;
  image.removeAttribute("srcset");
  image.src = `${import.meta.env.BASE_URL}${localPath.slice(1)}`;
};

export const handleImageError = (event: Event) => {
  const image = event.target;
  if (!(image instanceof HTMLImageElement)) return;
  if (image.dataset.profileAvatar === "true") return;
  const localPath = imagePaths[image.src];
  if (localPath) {
    handleImageLoad(event);
    return;
  }
  const fallback = new URL(`${import.meta.env.BASE_URL}image-unavailable.svg`, location.origin).href;
  if (image.src === fallback) return;
  image.removeAttribute("srcset");
  image.src = fallback;
};