import { useEffect, useState } from "react";
import { CategoryProps } from "../../type";
import { getData } from "../lib";
import { Link } from "react-router-dom";
import { backendUrl } from "../assets/FrontendUtils";

interface Props {
  id: string | undefined;
}

const CategoryFilters = ({ id }: Props) => {
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
    <aside aria-label="Filter by category" className="panel w-full shrink-0 p-5 md:sticky md:top-44 md:w-52">
      <p className="mb-4 text-lg font-semibold">Categories</p>
      <div>
        <div className="flex gap-2 overflow-x-auto pb-1 md:flex-col">
          {categories?.map((item: CategoryProps) => (
            <Link
              to={`/category/${item?._base}`}
              key={item?._id}
              aria-current={item._base === id ? "page" : undefined}
              className={`shrink-0 rounded-lg px-3 py-2.5 text-sm font-medium transition duration-200 ${
                item?._base === id
                  ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                  : "text-subtle hover:bg-muted hover:text-ink"
              }`}
            >
              {item?.name}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default CategoryFilters;
