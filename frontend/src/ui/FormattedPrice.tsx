import { formatINR } from "../lib/currency";

const FormattedPrice = ({ amount }: { amount?: number }) => {
  return <span>{formatINR(amount)}</span>;
};

export default FormattedPrice;
