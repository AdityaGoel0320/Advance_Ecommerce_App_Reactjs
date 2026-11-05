import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { ProductProps } from "../../type";

const ProductFeatures = ({ product }: { product: ProductProps }) => (
  <section className="panel mt-6 w-full min-w-0 p-5 sm:p-6 md:col-span-2">
    <TabGroup>
      <TabList className="flex gap-6 overflow-x-auto border-b border-line">
        {["Product details", "Before you order", "Delivery & support"].map((title) => (
          <Tab key={title} className="whitespace-nowrap border-b-2 border-transparent py-4 text-sm font-semibold text-subtle data-[selected]:border-indigo-500 data-[selected]:text-indigo-500">{title}</Tab>
        ))}
      </TabList>
      <TabPanels className="py-5 text-sm leading-7 text-subtle">
        <TabPanel>
          <h2 className="mb-3 text-lg font-semibold text-ink">{product.name}</h2>
          <p>{product.description}</p>
          <dl className="mt-5 grid gap-3 sm:grid-cols-2">
            <div><dt className="font-medium text-ink">Category</dt><dd>{product.category}</dd></div>
            <div><dt className="font-medium text-ink">Collection</dt><dd>{product.brand}</dd></div>
            <div><dt className="font-medium text-ink">Product code</dt><dd>COM-{product._id}</dd></div>
            <div><dt className="font-medium text-ink">Availability</dt><dd>{product.isStock ? "In stock" : "Currently unavailable"}</dd></div>
          </dl>
        </TabPanel>
        <TabPanel>
          <h2 className="mb-3 text-lg font-semibold text-ink">Choose with confidence</h2>
          <p>Check the product description and device compatibility before ordering. Images are category-matched demo photos or illustrations, not verified manufacturer photography.</p>
          <p className="mt-3">This is a demo catalog. Prices are realistic illustrative INR amounts, not live retailer quotations. Ratings and review counts are sample catalog data; no verified customer reviews have been collected.</p>
        </TabPanel>
        <TabPanel>
          <h2 className="mb-3 text-lg font-semibold text-ink">Checkout and your order</h2>
          <p>Your cart displays item totals, delivery and tax estimates before payment. Payments use Stripe test mode; use test card details only.</p>
          <p className="mt-3">After checkout, visit Orders in your account to view saved purchase details. Delivery availability, warranty and return terms must be confirmed with a real seller before this demo is used commercially.</p>
        </TabPanel>
      </TabPanels>
    </TabGroup>
  </section>
);

export default ProductFeatures;
