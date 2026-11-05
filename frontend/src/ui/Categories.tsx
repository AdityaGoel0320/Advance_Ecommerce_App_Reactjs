import { useEffect, useState } from "react";
import { getData } from "../lib";
import Container from "./Container";
import { CategoryProps } from "../../type";
import { Link } from "react-router-dom";
import Title from "./Title";
import { backendUrl } from "../assets/FrontendUtils";

const Categories = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const endpoint = `${backendUrl}/categories`;
      try {
        const data = await getData(endpoint);
        setCategories(data);
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };

    fetchData();
  }, []);

  return (
    <Container>
      <div className="mb-6">
        <div className="section-heading">
          <Title text="Popular categories" />
          <Link
            to={"/category/tvAndAudio"}
            className="text-sm font-semibold text-indigo-600 dark:text-indigo-400"
          >
            Explore categories &rarr;
          </Link>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories?.map((item: CategoryProps) => (
          <Link
            to={`category/${item?._base}`}
            key={item?._id}
            className="panel group flex flex-col items-center gap-4 p-4 text-center transition duration-300 hover:-translate-y-1 hover:border-indigo-400"
          >
            <img
              src={item?.image}
              alt={item.name}
              loading="lazy"
              className="aspect-square w-full rounded-xl bg-white object-contain p-3 transition duration-300 group-hover:scale-105"
            />
            <div>
              <p className="text-sm font-semibold">{item?.name}</p>
            </div>
          </Link>
        ))}
      </div>
    </Container>
  );
};

export default Categories;
