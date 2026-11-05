import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getData } from "../lib";
import { CategoryProps } from "../../type";
import { backendUrl } from "../assets/FrontendUtils";

const BannerCategories = () => {
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
    <nav aria-label="Browse categories" className="scrollbar-hide mx-auto flex max-w-screen-xl gap-3 overflow-x-auto px-4 py-4 sm:px-6 lg:px-8">
      {categories.map((item: CategoryProps) => (
        <Link
          to={`category/${item?._base}`}
          key={item?._id}
          className="flex shrink-0 items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3 transition duration-200 hover:-translate-y-0.5 hover:border-indigo-400 hover:shadow-panel"
        >
          <img
            src={item?.image}
            alt="cat-image"
            className="h-11 w-11 shrink-0 rounded-full border border-line bg-muted object-cover"
          />
          <p className="text-sm font-semibold">{item?.name}</p>
        </Link>
      ))}
    </nav>
  );
};

export default BannerCategories;
