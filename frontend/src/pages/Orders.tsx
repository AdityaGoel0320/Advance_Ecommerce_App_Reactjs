import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { FaMinus, FaPlus } from "react-icons/fa6";
import { OrderTypes, ProductProps } from "../../type";
import { db } from "../lib/firebase";
import { store } from "../lib/store";
import Container from "../ui/Container";
import Loading from "../ui/Loading";
import FormattedPrice from "../ui/FormattedPrice";
import { Link } from "react-router-dom";
import { resolveCatalogImage } from "../lib/catalogImage";

const Orders = () => {
  const { currentUser } = store();
  const [orders, setOrders] = useState<OrderTypes[]>([]);
  const [loading, setLoading] = useState(false);
  // const navigate = useNavigate();

  useEffect(() => {
    const getData = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, "orders", currentUser?.email!);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const orderData = docSnap?.data()?.orders;
          setOrders(orderData);
        } else {
          console.log("No orders yet!");
        }
      } catch (error) {
        console.log("Data fetching error", error);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, []);

  // const handleNavigate = (props: number) => {
  //   navigate(`/product/${props}`);
  // };

  return (
    <Container>
      {loading ? (
        <Loading />
      ) : orders?.length > 0 ? (
        <div className="panel max-w-5xl mx-auto p-5 sm:p-8 break-words">
          <h2 className="text-3xl font-bold mt-1">Customer order details</h2>
          <p className="text-gray-600">
            Customer Name:{" "}
            <span className="text-black font-semibold">
              {currentUser?.firstName} {currentUser?.lastName}
            </span>
          </p>
          <p className="text-gray-600">
            Total Orders:{" "}
            <span className="text-black font-semibold">{orders?.length}</span>
          </p>
          <p className="text-sm max-w-[600px] tracking-wide text-gray-500">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Autem iste
            nostrum voluptate, accusantium cum officia aliquid? Laboriosam
            dolores neque est?
          </p>
          <div className="flex flex-col gap-3">
            <div className="space-y-6 divide-y divide-gray-900/10">
              {orders.map((order: OrderTypes) => {
                const totalAmount = order?.orderItems.reduce(
                  (acc, item) =>
                    acc + (item.discountedPrice * item?.quantity || 0),
                  0
                );
                return (
                  <Disclosure as="div" key={order?.paymentId} className="pt-6">
                    {({ open }) => (
                      <>
                        <dt>
                          <DisclosureButton className="flex w-full items-start justify-between text-left text-gray-900">
                            <span className="text-base font-semibold leading-7">
                              Tracking number :{" "}
                              <span className="font-normal">
                                {order?.paymentId}
                              </span>
                            </span>
                            <span className="ml-6 flex h-7 items-center">
                              {open ? (
                                <FaMinus
                                  className="h-6 w-6"
                                  aria-hidden="true"
                                />
                              ) : (
                                <FaPlus
                                  className="h-6 w-6"
                                  aria-hidden="true"
                                />
                              )}
                            </span>
                          </DisclosureButton>
                        </dt>
                        <DisclosurePanel as="dd" className="mt-5">
                          <div className="flex flex-col gap-2 bg-muted rounded-xl p-4 sm:p-5 border border-line">
                            <p className="text-base font-semibold">
                              Your order{" "}
                              <span className="text-skyText">
                                #{order?.paymentId.substring(0, 20)}...
                              </span>{" "}
                              has shipped and will be with you soon.
                            </p>
                            <div className="flex flex-col gap-1">
                              <p className="text-gray-600">
                                Order Item Count:{" "}
                                <span className="text-black font-medium">
                                  {order?.orderItems?.length}
                                </span>
                              </p>
                              <p className="text-gray-600">
                                Payment Status:{" "}
                                <span className="text-black font-medium">
                                  Paid by Stripe
                                </span>
                              </p>
                              <p className="text-gray-600">
                                Order Amount:{" "}
                                <span className="text-black font-medium">
                                  <FormattedPrice amount={totalAmount} />
                                </span>
                              </p>
                            </div>
                            {order?.orderItems.map((item: ProductProps) => (
                              <div
                                key={item?._id}
                                className="flex space-x-6 border-b border-gray-200 py-3"
                              >
                                <Link
                                  to={`/product/${item?._id}`}
                                  className="h-16 w-16 flex-none sm:h-32 sm:w-32 rounded-xl bg-white border border-line hover:border-indigo-500 overflow-hidden"
                                >
                                  <img
                                    src={resolveCatalogImage(item.images[0], item._base, import.meta.env.BASE_URL)}
                                    alt="productImage"
                                    className="h-full w-full object-cover object-center hover:scale-110 duration-300"
                                  />
                                </Link>
                                <div className="flex min-w-0 flex-auto flex-col">
                                  <div>
                                    <h4 className="font-medium text-gray-900">
                                      <Link to={`/product/${item?._id}`}>
                                        {item?.name}
                                      </Link>
                                    </h4>
                                    <p className="mt-2 text-sm text-gray-600">
                                      {item?.description}
                                    </p>
                                  </div>
                                  <div className="mt-6 flex flex-1 items-end">
                                    <dl className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
                                      <div className="flex">
                                        <dt className="font-medium text-gray-900">
                                          Quantity
                                        </dt>
                                        <dd className="ml-2 text-gray-700">
                                          {item?.quantity}
                                        </dd>
                                      </div>
                                      <div className="flex">
                                        <dt className="text-black font-bold">
                                          Price
                                        </dt>
                                        <dd className="ml-2 text-gray-700">
                                          <span className="text-black font-bold">
                                            <FormattedPrice
                                              amount={item?.discountedPrice}
                                            />
                                          </span>
                                        </dd>
                                      </div>
                                      <div className="flex">
                                        <dt className="font-medium text-gray-900">
                                          SubTotal
                                        </dt>
                                        <dd className="ml-2 text-gray-700">
                                          <span className="text-black font-bold">
                                            <FormattedPrice
                                              amount={
                                                item?.discountedPrice *
                                                item?.quantity
                                              }
                                            />
                                          </span>
                                        </dd>
                                      </div>
                                    </dl>
                                  </div>
                                </div>
                              </div>
                              // <div
                              //   key={item?._id}
                              //   className="flex items-start gap-x-3"
                              // >
                              //   <div
                              //     onClick={() => handleNavigate(item?._id)}
                              //     className="w-32 h-20 border border-gray-300 p-1 rounded-md hover:border-skyText duration-200 cursor-pointer"
                              //   >
                              //     <img
                              //       src={item?.images[0]}
                              //       className="w-full h-full object-cover hover:scale-110 duration-200"
                              //       alt="product-image"
                              //     />
                              //   </div>
                              //   <div>
                              //     <div className="flex items-center justify-between text-sm font-medium mb-1">
                              //       <h3>{item?.name}</h3>
                              //       <p>${item?.discountedPrice}</p>
                              //     </div>
                              //     <p className="text-xs text-gray-500">
                              //       {item?.description}
                              //     </p>
                              //   </div>
                              // </div>
                            ))}
                          </div>
                        </DisclosurePanel>
                      </>
                    )}
                  </Disclosure>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="panel flex flex-col gap-3 items-center px-6 py-16 text-center">
          <p className="text-2xl font-semibold">No orders yet</p>
          <p>You did not create any purchase from us</p>
          <Link
            to={"/product"}
            className="primary-button mt-2"
          >
            Go to Shopping
          </Link>
        </div>
      )}
    </Container>
  );
};

export default Orders;
