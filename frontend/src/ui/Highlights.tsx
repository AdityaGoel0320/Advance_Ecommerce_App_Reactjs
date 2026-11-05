import { useEffect, useState } from "react";
import { getData } from "../lib/index.ts";
import Container from "./Container.tsx";
import { HighlightsType } from "../../type.ts";
import { Link } from "react-router-dom";
import { backendUrl } from "../assets/FrontendUtils.tsx"
import FormattedPrice from "./FormattedPrice";



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

  return (
    <Container className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {highlightsData?.map((item: HighlightsType) => (
        <div
          key={item?._id}
          className="relative h-60 rounded-2xl border border-line shadow-panel overflow-hidden group"
        >
          <div
            className="absolute inset-0 bg-cover bg-center rounded-lg transition-transform duration-300 group-hover:scale-110"
            style={{
              backgroundImage: item?.image?.endsWith("image-unavailable.svg") ? undefined : `url(${item?.image})`,
              backgroundColor: item?.image?.endsWith("image-unavailable.svg") ? "rgb(var(--muted))" : undefined,
              color: item?.color,
            }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/50 to-transparent" aria-hidden="true" />
          <div
            className="relative z-10 p-6 flex flex-col justify-between h-full text-white"
          >
            <div>
              <h3 className="text-2xl font-bold max-w-44">{item?.name}</h3>
              <p className="text-base font-bold mt-4">
                {item.startingPrice !== undefined ? <>From <FormattedPrice amount={item.startingPrice} /></> : item.title.replace(/\$/g, "INR ")}
              </p>
            </div>
            <Link to={item?._base} className="inline-flex w-fit items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm after:absolute after:inset-0">
              {item?.buttonTitle}
            </Link>
          </div>
        </div>
      ))}
    </Container>
  );
};

export default Highlights;
