import { FaRegStar, FaStar } from "react-icons/fa6";
import { store } from "../lib/store";
import { ProductProps } from "../../type";
import toast from "react-hot-toast";
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

  const handleFavorite = () => {
    if (product) {
      addToFavorite(product).then(() => {
        toast.success(
          existingProduct
            ? `${product?.name.substring(0, 10)} removed successfully!`
            : `${product?.name.substring(0, 10)} added successfully!`
        );
      });
    }
  };

  return (
    <div className="absolute right-2 top-2">
      <button type="button"
        aria-label={existingProduct ? "Remove from favorites" : "Add to favorites"}
        aria-pressed={!!existingProduct}
        onClick={handleFavorite}
        className="w-10 h-10 inline-flex text-slate-700 bg-white/95 shadow-sm text-lg items-center justify-center rounded-full hover:text-indigo-600 hover:bg-indigo-50 duration-200"
      >
        {existingProduct ? <FaStar /> : <FaRegStar />}
        {/* <span className="text-xs absolute -left-28 bg-black text-white px-2 py-1 rounded-sm hidden">
      Add to wishlist
    </span> */}
      </button>
    </div>
  );
};

export default ProductCardSideView;
