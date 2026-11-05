import { twMerge } from "tailwind-merge";
import FormattedPrice from "./FormattedPrice";

interface Props {
  regularPrice?: number;
  discountedPrice?: number;
  className?: string;
}
const PriceTag = ({ regularPrice, discountedPrice, className }: Props) => {
  return (
    <div className={twMerge("flex flex-wrap items-center gap-x-2 gap-y-1 text-sm", className)}>
      <p className="line-through text-subtle font-medium">
        <FormattedPrice amount={regularPrice} />
      </p>
      <p className="font-bold text-indigo-600 dark:text-indigo-400">
        <FormattedPrice amount={discountedPrice} />
      </p>
    </div>
  );
};

export default PriceTag;
