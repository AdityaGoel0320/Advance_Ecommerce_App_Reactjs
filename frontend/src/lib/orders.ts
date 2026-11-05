import { doc, getDoc, runTransaction } from "firebase/firestore";
import { OrderTypes } from "../../type";
import { db } from "./firebase";

function isOrder(value: unknown): value is OrderTypes {
  if (!value || typeof value !== "object") return false;
  return "paymentId" in value && typeof value.paymentId === "string" &&
    (!("totalAmount" in value) || (typeof value.totalAmount === "number" && Number.isFinite(value.totalAmount) && value.totalAmount > 0)) &&
    "paymentMethod" in value && typeof value.paymentMethod === "string" &&
    "userEmail" in value && typeof value.userEmail === "string" &&
    "orderItems" in value && Array.isArray(value.orderItems) && value.orderItems.length > 0 &&
    value.orderItems.every((item: unknown) => !!item && typeof item === "object" &&
      "_id" in item && typeof item._id === "number" &&
      "quantity" in item && typeof item.quantity === "number" && item.quantity > 0 &&
      "discountedPrice" in item && typeof item.discountedPrice === "number" &&
      "name" in item && typeof item.name === "string" &&
      "description" in item && typeof item.description === "string" &&
      "images" in item && Array.isArray(item.images) && item.images.every((image: unknown) => typeof image === "string"));
}

function parseOrders(value: unknown): OrderTypes[] {
  if (!Array.isArray(value) || !value.every(isOrder)) {
    throw new Error("Your saved order data could not be read. Please contact support.");
  }
  return value;
}

export async function loadOrders(email: string): Promise<OrderTypes[]> {
  const snapshot = await getDoc(doc(db, "orders", email));
  return snapshot.exists() ? parseOrders(snapshot.data().orders) : [];
}

export async function confirmAndSaveOrder(endpoint: string, sessionId: string, email: string): Promise<{ order: OrderTypes; newlySaved: boolean }> {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, email }),
  });
  const data: unknown = await response.json();
  if (!response.ok) {
    const message = data && typeof data === "object" && "error" in data && typeof data.error === "string"
      ? data.error : "Unable to verify payment. Please retry.";
    throw new Error(message);
  }
  if (!data || typeof data !== "object" || !("order" in data) || !isOrder(data.order) ||
      data.order.paymentId !== sessionId || data.order.userEmail !== email) {
    throw new Error("The payment service returned invalid order details.");
  }
  const order = data.order;
  const orderRef = doc(db, "orders", email);
  const newlySaved = await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(orderRef);
    const orders = snapshot.exists() ? parseOrders(snapshot.data().orders) : [];
    if (!orders.some((saved) => saved.paymentId === sessionId)) {
      transaction.set(orderRef, { orders: [...orders, order] }, { merge: true });
      return true;
    }
    return false;
  });
  return { order, newlySaved };
}
