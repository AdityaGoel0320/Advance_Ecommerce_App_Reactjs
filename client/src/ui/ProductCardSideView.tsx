import { store } from "../lib/store";
import { ProductProps } from "../../type";
import { useEffect, useState } from "react";

const ProductCardSideView = ({ product }: { product?: ProductProps }) => {
  const { addToFavorite, favoriteProduct } = store();

  const [existingProduct, setExistingProduct] = useState<ProductProps | null>(
    null
  );

  useEffect(() => {
    const availableItem = favoriteProduct.find(
      (item) => item?._id === product?._id
    );
    setExistingProduct(availableItem || null);
  }, [product, favoriteProduct]);


  return (
    <div className="absolute right-1 top-1 flex flex-col gap-1 transition translate-x-12 group-hover:translate-x-0 duration-300">
      
    </div>
  );
};

export default ProductCardSideView;
