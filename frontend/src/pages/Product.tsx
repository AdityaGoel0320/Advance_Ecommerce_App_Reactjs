import _ from "lodash";
import { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { MdOutlineStarOutline } from "react-icons/md";
import { useParams } from "react-router-dom";
import { ProductProps } from "../../type";
import { productPayment } from "../assets";
import { getData } from "../lib";
import AddToCardBtn from "../ui/AddToCardBtn";
import CategoryFilters from "../ui/CategoryFilters";
import Container from "../ui/Container";
import FormattedPrice from "../ui/FormattedPrice";
import PriceTag from "../ui/PriceTag";
import ProductCard from "../ui/ProductCard";
import Loading from "../ui/Loading";
import ProductFeatures from "../ui/ProductFeatures";
import { backendUrl } from "../assets/FrontendUtils";

const Product = () => {
  const [productData, setProductData] = useState<ProductProps | null>(null);
  const [allProducts, setAllProducts] = useState<ProductProps[]>([]);
  const [imgUrl, setImgUrl] = useState("");
  const [color, setColor] = useState("");
  const [loading, setLoading] = useState(true);
  const { id } = useParams();

  const endpoint = id
    ? `${backendUrl}/products/${id}`
    : `${backendUrl}/products/`;
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getData(endpoint);

        if (id) {
          setProductData(data);
          setAllProducts([]);
        } else {
          setAllProducts(data);
          setProductData(null);
        }
      } catch (error) {
        console.error("Error fetching data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, endpoint]);

  useEffect(() => {
    if (productData) {
      setImgUrl(productData?.images[0]);
      setColor(productData?.colors[0]);
    }
  }, [productData]);

  return (
    <div>
      {loading ? (
        <Loading />
      ) : (
        <Container>
          {!!id && productData && _.isEmpty(allProducts) ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="panel flex min-w-0 items-start gap-3 p-3 sm:p-5">
                <div className="w-16 shrink-0 space-y-3 sm:w-20">
                  {[...new Set(productData.images)].map((item) => (
                    <img
                      key={item}
                      src={item}
                      alt="img"
                      className={`w-full rounded-xl bg-white object-contain p-2 cursor-pointer opacity-80 hover:opacity-100 duration-300 ${
                        imgUrl === item &&
                        "border border-gray-500 rounded-sm opacity-100"
                      }`}
                      onClick={() => setImgUrl(item)}
                    />
                  ))}
                </div>
                <div className="min-w-0 flex-1 self-center rounded-xl bg-white">
                  <img src={imgUrl} alt={productData.name} className="aspect-square w-full object-contain p-4" />
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <h1 className="text-3xl font-bold">{productData?.name}</h1>
                <p className="text-sm leading-7 text-subtle">{productData.description}</p>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <PriceTag
                    regularPrice={productData?.regularPrice}
                    discountedPrice={productData?.discountedPrice}
                    className="text-xl"
                  />
                  <div className="flex items-center gap-1">
                    <div className="text-base text-lightText flex items-center">
                      <MdOutlineStarOutline />
                      <MdOutlineStarOutline />
                      <MdOutlineStarOutline />
                      <MdOutlineStarOutline />
                      <MdOutlineStarOutline />
                    </div>
                    <p className="text-base font-semibold">{`(${productData?.reviews} reviews)`}</p>
                  </div>
                </div>
                <p className={`text-sm font-medium ${productData.isStock ? "text-emerald-600 dark:text-emerald-400" : "text-subtle"}`}>
                  {productData.isStock ? "In stock and available to order" : "Currently unavailable"}
                </p>
                <p>
                  You are saving{" "}
                  <span className="text-base font-semibold text-green-500">
                    <FormattedPrice
                      amount={
                        productData?.regularPrice! -
                        productData?.discountedPrice!
                      }
                    />
                  </span>{" "}
                  upon purchase
                </p>
                <div>
                  {color && (
                    <p className="mb-1 font-medium px-1">
                      Color:{" "}
                      <span
                        className="font-semibold capitalize"
                        style={{ color: color }}
                      >
                        {color}
                      </span>
                    </p>
                  )}
                  <div className="flex items-center gap-x-3">
                    {productData?.colors.map((item) => (
                      <div
                        key={item}
                        className={`${
                          item === color
                            ? "border border-black p-1 rounded-full"
                            : "border-transparent"
                        }`}
                      >
                        <div
                          className="w-10 h-10 rounded-full cursor-pointer"
                          style={{ backgroundColor: item }}
                          onClick={() => setColor(item)}
                        />
                      </div>
                    ))}
                  </div>
                  {color && (
                    <button
                      onClick={() => setColor("")}
                      className="font-semibold mt-1 flex items-center gap-1 hover:text-red-600 duration-200"
                    >
                      <IoClose className="mt-1" /> Clear
                    </button>
                  )}
                </div>
                <p>
                  Brand:{" "}
                  <span className="font-medium">{productData?.brand}</span>
                </p>
                <p>
                  Category:{" "}
                  <span className="font-medium">{productData?.category}</span>
                </p>

                <AddToCardBtn
                  className="w-full py-3 text-base"
                  title="Buy now"
                  product={productData}
                />

                <div className="panel p-5 flex flex-col items-center justify-center gap-3 text-sm">
                  <img
                    src={productPayment}
                    alt="payment"
                    className="max-w-full rounded-lg bg-white p-2 object-contain"
                  />
                  <p className="font-semibold">
                    Guaranteed safe & secure checkout
                  </p>
                </div>
              </div>
              <ProductFeatures product={productData} />
            </div>
          ) : (
            <div className="flex flex-col items-start gap-6 md:flex-row">
              <CategoryFilters id={id} />
              <div className="w-full min-w-0 flex-1">
                <p className="text-2xl sm:text-3xl font-bold mb-6">
                  Discover the collection
                </p>
                <div className="grid grid-cols-1 min-[380px]:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {loading ? (
                    <div>
                      <p>Loading...</p>
                    </div>
                  ) : (
                    allProducts?.map((item: ProductProps) => (
                      <ProductCard item={item} key={item?._id} />
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </Container>
      )}
    </div>
  );
};

export default Product;
