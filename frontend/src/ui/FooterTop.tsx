import { FiBox, FiTag, FiTruck, FiMessageCircle } from "react-icons/fi";
import Container from "./Container";

const FooterTop = () => {
  const footers = [
    {
      icon: FiBox,
      title: "High Quality Selection",
      subTitle: "Total Product Quality Control For Peace Of Mind",
    },
    {
      icon: FiTag,
      title: "Affordable Prices",
      subTitle: "Factory Direct Prices For Maximum Savings",
    },
    {
      icon: FiTruck,
      title: "Express Shipping",
      subTitle: "Fast, Reliable Delivery From Global Warehouses",
    },
    {
      icon: FiMessageCircle,
      title: "Worry Free",
      subTitle: "Instant Access To Professional Support",
    },
  ];
  return (
    <div className="border-y border-line bg-surface">
      <Container className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {footers?.map((item) => (
          <div
            key={item?.title}
            className="flex items-start gap-3"
          >
            <span className="rounded-xl bg-indigo-500/10 p-3 text-indigo-500"><item.icon size={22} /></span>
            <div>
              <h3 className="text-sm font-semibold">{item?.title}</h3>
              <p className="mt-1 text-xs leading-5 text-subtle">{item?.subTitle}</p>
            </div>
          </div>
        ))}
      </Container>
    </div>
  );
};

export default FooterTop;
