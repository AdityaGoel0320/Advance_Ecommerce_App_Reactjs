import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ProductProps } from "../../type";
import { getData } from "../lib";
import CategoryFilters from "../ui/CategoryFilters";
import Container from "../ui/Container";
import ProductCard from "../ui/ProductCard";
import Loading from "../ui/Loading";
import { backendUrl } from "../assets/FrontendUtils";

const Category = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const endpoint = `${backendUrl}/categories/${id}`;
      try {
        setLoading(true);
        const data = await getData(endpoint);
        setProducts(data);
      } catch (error) {
        console.error("Error fetching data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const formatId = (id: string) => {
    return id
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/(^\w|\s\w)/g, (match) => match.toUpperCase());
  };

  return (
    <div>
      {loading ? (
        <Loading />
      ) : (
        <Container>
          <h2 className="text-4xl text-center font-semibold mb-5">
            {id ? formatId(id) : "All categories"}
          </h2>
          <div className="flex flex-col items-start gap-6 md:flex-row">
            <CategoryFilters id={id} />
            <div className="grid w-full min-w-0 flex-1 grid-cols-1 min-[380px]:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {loading ? (
                <div>
                  <p>Loading...</p>
                </div>
              ) : (
                products?.map((item: ProductProps) => (
                  <ProductCard item={item} key={item?._id} />
                ))
              )}
            </div>
          </div>
        </Container>
      )}
    </div>
  );
};

export default Category;
