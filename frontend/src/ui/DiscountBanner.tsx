import { Link } from "react-router-dom";
import Container from "./Container";
import Title from "./Title";
import {
  brandFive,
  brandFour,
  brandOne,
  brandSix,
  brandThree,
  brandTwo,
  discountImgOne,
  discountImgTwo,
} from "../assets";

const DiscountBanner = () => {
  const popularSearchItems = [
    { title: "Smart Watches", link: "smartWatches" },
    { title: "Headphone", link: "headphones" },
    { title: "Cameras", link: "camerasAndPhotos" },
    { title: "Audio", link: "tvAndAudio" },
    { title: "Laptop & Computers", link: "computersAndLaptop" },
    { title: "Cell Phone", link: "cellPhones" },
  ];
  return (
    <Container>
      <div>
        <Title text="Popular Search" />

        <div className="w-full h-[1px] bg-gray-200 mt-3" />
      </div>
      <div className="my-7 flex items-center flex-wrap gap-4">
        {popularSearchItems?.map(({ title, link }) => (
          <Link
            to={`/category/${link}`}
            key={title}
            className="rounded-xl border border-line bg-surface px-5 py-3 text-sm font-medium transition hover:border-indigo-500 hover:text-indigo-500"
          >
            {title}
          </Link>
        ))}
      </div>
      <div className="w-full p-6 sm:p-8 bg-indigo-600 text-white rounded-2xl flex items-center justify-between gap-4 overflow-hidden">
        <img
          src={discountImgOne}
          alt="discountImgOne"
          className="hidden lg:inline-flex h-36"
        />
        <div className="flex flex-1 flex-col gap-3 items-center text-center">
          <div className="flex flex-wrap items-center justify-center gap-3 text-2xl sm:text-3xl font-bold">
            <h2>Sony Headphone</h2>
            <Link
              to={"/product"}
              className="border border-white/30 bg-white/10 px-4 py-2 text-sm text-white rounded-xl hover:bg-white/20 transition"
            >
              Discount 20%
            </Link>
          </div>
          <p className="text-sm text-indigo-100 font-medium">
            Better sound for whatever your day brings.
          </p>
        </div>
        <img
          src={discountImgTwo}
          alt="discountImgTwo"
          className="hidden lg:inline-flex h-36"
        />
      </div>
      <div className="mt-7">
        <p className="font-bold text-2xl">Brands We Distribute</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 mt-7 overflow-hidden rounded-xl bg-white text-slate-900">
          <div className="border border-r-0 border-gray-300 flex items-center justify-center px-6 py-2 cursor-pointer group">
            <img
              src={brandOne}
              alt="brandOne"
              className="w-36 h-auto group-hover:opacity-50 duration-200"
            />
          </div>
          <div className="border border-r-0 border-gray-300 flex items-center justify-center px-6 py-2 cursor-pointer group">
            <img
              src={brandTwo}
              alt="brandTwo"
              className="w-36 h-auto group-hover:opacity-50 duration-200"
            />
          </div>
          <div className="border border-r-0 border-gray-300 flex items-center justify-center px-6 py-2 cursor-pointer group">
            <img
              src={brandThree}
              alt="brandThree"
              className="w-36 h-auto group-hover:opacity-50 duration-200"
            />
          </div>
          <div className="border border-r-0 border-gray-300 flex items-center justify-center px-6 py-2 cursor-pointer group">
            <img
              src={brandFour}
              alt="brandFour"
              className="w-36 h-auto group-hover:opacity-50 duration-200"
            />
          </div>
          <div className="border border-r-0 border-gray-300 flex items-center justify-center px-6 py-2 cursor-pointer group">
            <img
              src={brandFive}
              alt="brandFive"
              className="w-36 h-auto group-hover:opacity-50 duration-200"
            />
          </div>
          <div className="border border-gray-300 flex items-center justify-center px-6 py-2 cursor-pointer group">
            <img
              src={brandSix}
              alt="brandSix"
              className="w-36 h-auto group-hover:opacity-50 duration-200"
            />
          </div>
        </div>
      </div>
    </Container>
  );
};

export default DiscountBanner;
