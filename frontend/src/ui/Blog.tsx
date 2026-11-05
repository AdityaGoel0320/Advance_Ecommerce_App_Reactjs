import { useEffect, useState } from "react";
import { getData } from "../lib";
import Container from "./Container";
import Title from "./Title";
import { BlogProps } from "../../type";
import { backendUrl } from "../assets/FrontendUtils";

const Blog = () => {
  const [blogsData, setBlogsData] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      const endpoint = `${backendUrl}/blogs`;
      try {
        const data = await getData(endpoint);
        setBlogsData(data);
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };

    fetchData();
  }, []);

  return (
    <Container>
      <Title text="Fresh inspiration" />
      <p className="mt-2 text-sm text-subtle">Ideas and discoveries for your everyday.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-7">
        {blogsData?.map((item: BlogProps) => (
          <article key={item?._id} className="panel group overflow-hidden">
            <div className="overflow-hidden">
              <img
                src={item?.image}
                alt={item.title}
                loading="lazy"
                className="aspect-video w-full object-cover group-hover:scale-105 duration-500"
              />
            </div>
            <div className="p-5">
              <p className="mb-2 text-xs uppercase font-semibold tracking-wider text-indigo-500">
                {item?._base}
              </p>
              <h3 className="text-lg font-semibold line-clamp-2">{item?.title}</h3>
            </div>
          </article>
        ))}
      </div>
    </Container>
  );
};

export default Blog;
