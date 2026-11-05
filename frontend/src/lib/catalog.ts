import catalog from "../../../shared/products.json";
import { ProductProps } from "../../type";

const products: ProductProps[] = catalog;
const byId = new Map(products.map((product) => [product._id, product]));

export function refreshCatalogProduct(product: ProductProps): ProductProps {
  const current = byId.get(product._id);
  return current ? { ...current, quantity: product.quantity } : product;
}

export function refreshCatalogItems(items: ProductProps[]) {
  return items.map(refreshCatalogProduct);
}
