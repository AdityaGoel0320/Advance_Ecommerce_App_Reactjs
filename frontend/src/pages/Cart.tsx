import { FaQuestionCircle } from "react-icons/fa";
import { store } from "../lib/store";
import Container from "../ui/Container";
import CartProduct from "../ui/cart/CartProduct";
import FormattedPrice from "../ui/FormattedPrice";
import { useEffect, useState } from "react";
import CheckoutBtn from "../ui/cart/CheckoutBtn";
import { Link } from "react-router-dom";
import charges from "../../../shared/checkoutCharges.json";

const Cart = () => {
  const [totalAmt, setTotalAmt] = useState({ regular: 0, discounted: 0 });
  const shippingAmt = charges.shipping;
  const taxAmt = charges.tax;
  const { cartProduct } = store();

  useEffect(() => {
    const totals = cartProduct.reduce(
      (sum, product) => {
        sum.regular += product?.regularPrice * product?.quantity;
        sum.discounted += product?.discountedPrice * product?.quantity;
        return sum;
      },
      { regular: 0, discounted: 0 }
    );

    setTotalAmt(totals);
  }, [cartProduct]);
  return (
    <Container>
      {cartProduct?.length > 0 ? (
        <>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Shopping Cart
          </h1>
          <div className="mt-10 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
            <section aria-labelledby="cart-heading" className="lg:col-span-7">
              <h2 id="cart-heading" className="sr-only">
                Items in your shopping cart
              </h2>

              <div className="divide-y divide-gray-200 border-b border-t border-gray-200">
                {cartProduct.map((product) => (
                  <CartProduct product={product} key={product?._id} />
                ))}
              </div>
            </section>

            {/* Order summary */}
            <section
              aria-labelledby="summary-heading"
              className="panel mt-8 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:sticky lg:top-44 lg:p-8"
            >
              <h2
                id="summary-heading"
                className="text-lg font-medium text-gray-900"
              >
                Order summary
              </h2>

              <dl className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-gray-600">Subtotal</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    <FormattedPrice amount={totalAmt?.regular} />
                  </dd>
                </div>
                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                  <dt className="flex items-center text-sm text-gray-600">
                    <span>Shipping estimate</span>

                    <FaQuestionCircle
                      className="h-5 w-5 text-gray-400 ml-2"
                      aria-hidden="true"
                    />
                  </dt>
                  <dd className="text-sm font-medium text-gray-900">
                    <FormattedPrice amount={shippingAmt} />
                  </dd>
                </div>
                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                  <dt className="flex text-sm text-gray-600">
                    <span>Tax estimate</span>

                    <FaQuestionCircle
                      className="h-5 w-5 text-gray-400 ml-2"
                      aria-hidden="true"
                    />
                  </dt>
                  <dd className="text-sm font-medium text-gray-900">
                    <FormattedPrice amount={taxAmt} />
                  </dd>
                </div>
                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                  <dt className="text-base font-medium text-gray-900">
                    Total Discount
                  </dt>
                  <dd className="text-base font-medium text-gray-500">
                    <FormattedPrice
                      amount={totalAmt?.regular - totalAmt?.discounted}
                    />
                  </dd>
                </div>
                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                  <dt className="text-base font-medium text-gray-900">
                    Order total
                  </dt>
                  <dd className="text-lg font-bold text-gray-900">
                    <FormattedPrice
                      amount={totalAmt?.discounted + shippingAmt + taxAmt}
                    />
                  </dd>
                </div>
              </dl>

              <CheckoutBtn
                products={cartProduct}
                totalAmt={totalAmt?.discounted + shippingAmt + taxAmt}
              />
            </section>
          </div>
        </>
      ) : (
        <div className="panel flex flex-col gap-4 items-center justify-center px-6 py-16 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Shopping Cart
          </h1>
          <p className="text-lg max-w-[600px] text-center text-gray-600 tracking-wide leading-6">
            Your cart is empty. Discover something you love and add it here when you are ready.
          </p>
          <Link to="/product">
            <button className="primary-button">
              go to shopping
            </button>
          </Link>
        </div>
      )}
    </Container>
  );
};

export default Cart;
