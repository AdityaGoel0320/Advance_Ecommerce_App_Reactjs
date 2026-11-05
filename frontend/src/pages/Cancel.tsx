import Container from "../ui/Container";
import { Link } from "react-router-dom";
import { FiShoppingBag } from "react-icons/fi";

const Cancel = () => {
  return (
    <Container>
      <div className="panel flex flex-col items-center gap-4 px-6 py-16 text-center">
        <FiShoppingBag size={36} className="text-indigo-500" />
        <h1 className="text-2xl font-bold">Checkout canceled</h1>
        <p className="text-subtle">Your cart is still here. Continue whenever you are ready.</p>
        <Link to="/cart" className="primary-button">Return to cart</Link>
      </div>
    </Container>
  );
};

export default Cancel;
