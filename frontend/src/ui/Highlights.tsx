import { useEffect, useState } from "react";
import { getData } from "../lib/index.ts";
import Container from "./Container.tsx";
import { HighlightsType } from "../../type.ts";
import { Link } from "react-router-dom";
import { backendUrl } from "../assets/FrontendUtils.tsx"



const Highlights = () => {
  const [highlightsData, setHighlightsData] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      const endpoint = `${backendUrl}/highlights`;
      try {
        const data = await getData(endpoint);
        setHighlightsData(data);
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };

    fetchData();
  }, []);

  const handleRouting = (_base: string) => {
    console.log("base", _base);
  };

  return (
    <Container className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {highlightsData?.map((item: HighlightsType) => (
        <div
          onClick={() => handleRouting(item?._base)}
          key={item?._id}
          className="relative h-60 rounded-lg shadow-md cursor-pointer overflow-hidden group"
        >
          <div
            className="absolute inset-0 bg-cover bg-center rounded-lg transition-transform duration-300 group-hover:scale-110"
            style={{
              backgroundImage: item?.image?.endsWith("image-unavailable.svg") ? undefined : `url(${item?.image})`,
              backgroundColor: item?.image?.endsWith("image-unavailable.svg") ? "#f3f4f6" : undefined,
              color: item?.color,
            }}
          ></div>
          <div
            className="relative z-10 p-6 flex flex-col justify-between h-full"
            style={{
              color: item?.image?.endsWith("image-unavailable.svg") ? "#111827" : item?.color,
            }}
          >
            <div>
              <h3 className="text-2xl font-bold max-w-44">{item?.name}</h3>
              <p className="text-base font-bold mt-4">{item?.title}</p>
            </div>
            <Link to={item?._base} className="text-base font-normal relative">
              {item?.buttonTitle}
            </Link>
          </div>
        </div>
      ))}
    </Container>
  );
};

export default Highlights;
