import { Link } from "react-router-dom";
import { ProductProps } from "../../type";
import Container from "./Container";
import Pagination from "./Pagination";
import Title from "./Title";

interface Props {
  products: ProductProps[];
}

const ProductList = ({ products }: Props) => {
  const itemsPerPage = 12;
  return (
    <Container>
      <div className="mb-6">
        <div className="section-heading">
          <div><p className="mb-2 text-xs font-semibold uppercase tracking-widest text-indigo-500">The edit</p><Title text="Your next favorites" /></div>
          <Link
            to={"/product"}
            className="text-sm font-semibold text-indigo-600 dark:text-indigo-400"
          >
            View all products &rarr;
          </Link>
        </div>
      </div>

      <Pagination items={products} itemsPerPage={itemsPerPage} />
    </Container>
  );
};

export default ProductList;
