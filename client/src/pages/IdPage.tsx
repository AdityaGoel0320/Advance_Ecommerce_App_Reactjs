import { Link,  useNavigate , useParams} from "react-router-dom";
import Container from "../ui/Container";
import { useEffect, useState } from "react";
import { store } from "../lib/store";
import {
  // DocumentSnapshot,
  arrayUnion,
  doc,
  getDoc,
  // serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import toast from "react-hot-toast";
import Loading from "../ui/Loading";
const IdPage = () => {
  const { currentUser, cartProduct, resetCart } = store();
  // const location = useLocation();
  const {sessionId} = useParams();
  console.log(sessionId)
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    if (!sessionId) {
      console.log(sessionId)
      navigate("/");
    } else if (cartProduct.length > 0) {
      const saveOrder = async () => {
        try {
          setLoading(true);

          const orderRef = doc(db, "orders", currentUser?.email!);
          const docSnap = await getDoc(orderRef);

          if (docSnap.exists()) {
            // Document exists, update the orderItems array
            await updateDoc(orderRef, {
              orders: arrayUnion({
                userEmail: currentUser?.email,
                paymentId: sessionId,
                orderItems: cartProduct,
                paymentMethod: "stripe",
                userId: currentUser?.id,
              }), // Use arrayUnion to append new items to existing array
            });
          } else {
            // Document doesn't exist, create a new one
            await setDoc(orderRef, {
              orders: [
                {
                  userEmail: currentUser?.email,
                  paymentId: sessionId,
                  orderItems: cartProduct,
                  paymentMethod: "stripe",
                },
              ],
            });
          }
          // await setDoc(doc(db, "orders", currentUser?.id!), {
          //   userEmail: currentUser?.email,
          //   paymentId: sessionId,
          //   orderItems: cartProduct,
          //   paymentMethod: "stripe",
          //   paymentTime: serverTimestamp(),
          // });
          toast.success("Payment accepted successfully & order saved!");
          resetCart();
        } catch (error) {
          console.log("Error saving order data", error);
        } finally {
          setLoading(false);
        }
      };
      saveOrder();
    }
  }, [sessionId, navigate, currentUser, cartProduct]);

  return (
    <>
       <Container>
      {loading && <Loading />}
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-y-5">
        <h2 className="text-2xl md:text-4xl font-bold text-center">
          {loading
            ? "Your order payment is processing..."
            : "Your Payment Accepted by ecommercepro.com"}
        </h2>
        <p>
          {loading ? "Once done" : "Now"} you can view your Orders or continue
          Shopping with us
        </p>
        <div className="flex items-center gap-x-5">
          <Link to={"/orders"}>
            <button className="bg-black text-slate-100 w-52 h-12 rounded-full text-base font-semibold hover:bg-primeColor duration-300">
              View Orders
            </button>
          </Link>
          <Link to={"/"}>
            <button className="bg-black text-slate-100 w-52 h-12 rounded-full text-base font-semibold hover:bg-primeColor duration-300">
              Continue Shopping
            </button>
          </Link>
        </div>
      </div>
    </Container>
    </>
  )
}

export default IdPage