import { ProductProps } from "../../type";

export async function getCheckoutUrl(endpoint: string, items: ProductProps[], email: string) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items, email, origin: window.location.origin }),
  });
  const data: unknown = await response.json();
  if (!response.ok) {
    const message = data && typeof data === "object" && "error" in data && typeof data.error === "string"
      ? data.error
      : "Checkout could not be started. Please try again.";
    throw new Error(message);
  }
  if (!data || typeof data !== "object" || !("url" in data) || typeof data.url !== "string") {
    throw new Error("The payment service did not return a checkout link.");
  }
  const url = new URL(data.url);
  if (url.protocol !== "https:" || url.hostname !== "checkout.stripe.com") {
    throw new Error("The payment service returned an invalid checkout link.");
  }
  return url.href;
}
