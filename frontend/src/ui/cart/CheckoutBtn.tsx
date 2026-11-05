import { ProductProps } from "../../../type";
import { backendUrl } from "../../assets/FrontendUtils";
import { store } from "../../lib/store";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { getCheckoutUrl } from "../../lib/checkout";

interface Props {
  products: ProductProps[];
  totalAmt: number;
}

const CheckoutBtn = ({ products, totalAmt }: Props) => {
  const { currentUser } = store();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const inFlight = useRef(false);
  const canCheckout = !!currentUser?.email && products.length > 0 &&
    products.every((product) => product.isStock) && Number.isFinite(totalAmt) && totalAmt > 0;
  const handleCheckout = async () => {
    if (inFlight.current) return;
    if (!canCheckout || !currentUser?.email) {
      toast.error("Sign in and add products to your cart before checking out.");
      return;
    }
    inFlight.current = true;
    setPending(true);
    setError("");
    try {
      const url = await getCheckoutUrl(`${backendUrl}/checkout`, products, currentUser.email);
      window.location.assign(url);
    } catch (checkoutError) {
      console.error("Unable to start checkout", checkoutError);
      const message = checkoutError instanceof TypeError
        ? "Unable to reach checkout. Check your connection and make sure the backend is running."
        : checkoutError instanceof Error ? checkoutError.message : "Checkout failed. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  };

  return (
    <div className="mt-6">
      {currentUser ? (
        <button
          onClick={handleCheckout}
          type="button"
          disabled={!canCheckout || pending}
          aria-busy={pending}
          className="primary-button w-full"
        >
          {pending ? "Opening secure checkout..." : "Checkout"}
        </button>
      ) : (
        <Link to="/profile" className="primary-button w-full">Sign in to checkout</Link>
      )}
      {error && <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
};

export default CheckoutBtn;
