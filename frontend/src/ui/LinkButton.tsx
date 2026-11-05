import { Link } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa6";
import { twMerge } from "tailwind-merge";

interface Props {
  showButton?: boolean;
  link?: string;
  className?: string;
}

const LinkButton = ({ showButton, link, className }: Props) => {
  const newClassName = twMerge(
    "primary-button",
    className
  );
  return (
    <Link to={link ? link : "/product"} className={newClassName}>
      {showButton && <FaArrowLeft />} Start Shopping
    </Link>
  );
};

export default LinkButton;
