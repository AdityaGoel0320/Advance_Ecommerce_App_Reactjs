import axios from "axios";
import { backendUrl } from "../assets/FrontendUtils";
import catalogImages from "./catalogImages.json";
import { refreshCatalogProduct } from "./catalog";

const imagePaths: Record<string, string> = catalogImages;

const localizeImages = (value: any): any => {
  if (typeof value === "string") {
    const localPath = imagePaths[value];
    return localPath ? `${import.meta.env.BASE_URL}${localPath.slice(1)}` : value;
  }
  if (Array.isArray(value)) return value.map(localizeImages);
  if (value && typeof value === "object") {
    const current = "discountedPrice" in value && "_id" in value ? refreshCatalogProduct(value) : value;
    return Object.fromEntries(Object.entries(current).map(([key, item]) => [key, localizeImages(item)]));
  }
  return value;
};

export const getData = async (endpoint: string) => {
  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Data fetching Error" + response?.statusText);
    }

    const data = await response.json();

    return localizeImages(data);
  } catch (error) {
    console.error("Error while fetching data", error);
    throw error;
  }
};

export const getProducts = async () => {
  const products = await axios.get(`${backendUrl}/products`);
  products.data = localizeImages(products.data);
  return products;
};
