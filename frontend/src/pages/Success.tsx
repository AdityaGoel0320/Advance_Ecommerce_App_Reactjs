import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Container from "../ui/Container";
import Loading from "../ui/Loading";
import { store } from "../lib/store";
import { confirmAndSaveOrder } from "../lib/orders";
import { backendUrl } from "../assets/FrontendUtils";

const Success = () => {
  const { currentUser, isLoading, resetCart } = store();
  const { sessionId } = useParams();
  const email = currentUser?.email;
  const [status, setStatus] = useState<"pending" | "saved" | "error">("pending");
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (isLoading || !email || !sessionId) return;
    let active = true;
    setStatus("pending");
    setError("");
    confirmAndSaveOrder(`${backendUrl}/checkout/confirm`, sessionId, email)
      .then(({ order, newlySaved }) => {
        const state = store.getState();
        const matchesPurchase = state.cartProduct.length === order.orderItems.length &&
          state.cartProduct.every((item) => order.orderItems.some((paid) =>
            paid._id === item._id && paid.quantity === item.quantity && paid.discountedPrice === item.discountedPrice));
        if (newlySaved && state.currentUser?.email === email && matchesPurchase) resetCart();
        if (!active) return;
        setStatus("saved");
        toast.success("Payment confirmed and order saved!");
      })
      .catch((saveError: unknown) => {
        console.error("Unable to confirm and save order", saveError);
        if (!active) return;
        const message = saveError instanceof Error ? saveError.message : "Unable to save your order. Please retry.";
        setError(message);
        setStatus("error");
        toast.error(message);
      });
    return () => { active = false; };
  }, [isLoading, email, sessionId, resetCart, attempt]);

  const pending = isLoading || (!!email && !!sessionId && status === "pending");
  return (
    <Container>
      <div className="panel min-h-[400px] p-6 text-center flex flex-col items-center justify-center gap-y-5">
        {pending && <Loading compact />}
        <h2 className="text-2xl md:text-4xl font-bold">
          {!sessionId ? "Missing payment confirmation" : pending ? "Confirming your payment and saving your order..."
            : !email ? "Sign in to finish saving your order"
              : status === "saved" ? "Payment confirmed - your order is saved" : "Your order could not be saved"}
        </h2>
        {error && <p role="alert" className="text-red-600 dark:text-red-400">{error}</p>}
        {sessionId && <p className="text-sm text-subtle break-all">Payment reference: {sessionId}</p>}
        {!isLoading && !email && <p>Sign in with your checkout email, then return to this confirmation link.</p>}
        {status === "error" && email && <button type="button" className="primary-button" onClick={() => setAttempt((value) => value + 1)}>Retry saving order</button>}
        <div className="flex flex-wrap justify-center items-center gap-3">
          {!isLoading && !email && <Link to="/profile" className="primary-button">Sign in</Link>}
          {status === "saved" && <Link to="/orders" className="primary-button w-52">View Orders</Link>}
          <Link to="/" className="secondary-button w-52">Continue Shopping</Link>
        </div>
      </div>
    </Container>
  );
};

export default Success;
