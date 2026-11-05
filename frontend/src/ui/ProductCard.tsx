import { MdOutlineStarOutline } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { ProductProps } from "../../type";
import AddToCardBtn from "./AddToCardBtn";
import ProductCardSideView from "./ProductCardSideView";
import { useState } from "react";
import {
  Button,
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import FormattedPrice from "./FormattedPrice";
interface Props {
  item: ProductProps;
  setSearchText?: (text: string) => void;
}

const ProductCard = ({ item, setSearchText }: Props) => {
  const navigation = useNavigate();

  const handleProduct = () => {
    navigation(`/product/${item?._id}`);
    setSearchText && setSearchText("");
  };

  const percentage =
    item.regularPrice > 0
      ? ((item.regularPrice - item.discountedPrice) / item.regularPrice) * 100
      : 0;

  const [isOpen, setIsOpen] = useState(false);

  function open() {
    setIsOpen(true);
  }

  function close() {
    setIsOpen(false);
  }
  return (
    <article className="panel group flex h-full min-w-0 flex-col overflow-hidden p-2 transition duration-300 hover:-translate-y-1 hover:border-indigo-400/60">
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-white">
        {percentage > 0 && <button
          type="button"
          onClick={open}
          aria-label={`Save ${percentage.toFixed(0)} percent on ${item.name}`}
          className="absolute left-2 top-2 z-10 rounded-lg bg-indigo-600 px-2.5 py-1.5 text-[10px] font-bold text-white sm:text-xs"
        >
          -{percentage.toFixed(0)}%
        </button>}
        <button type="button" onClick={handleProduct} aria-label={`View ${item.name}`} className="block h-full w-full p-4 sm:p-6">
          <img
            src={item?.images[0]}
            alt={item.name}
            loading="lazy"
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
          />
        </button>
        <ProductCardSideView product={item} />
      </div>
      <div className="flex flex-1 flex-col gap-3 px-2 pb-2 pt-4 sm:px-3">
        <p className="line-clamp-1 text-[10px] uppercase font-semibold tracking-wider text-subtle sm:text-xs">
          {item?.overView}
        </p>
        <h2 className="min-h-10 text-sm font-semibold leading-5 sm:min-h-12 sm:text-base sm:leading-6">
          <button type="button" onClick={handleProduct} className="line-clamp-2 text-left hover:text-indigo-500">{item?.name}</button>
        </h2>
        <div className="text-sm text-amber-500 flex items-center" aria-label={`${item.reviews} reviews`}>
          <MdOutlineStarOutline />
          <MdOutlineStarOutline />
          <MdOutlineStarOutline />
          <MdOutlineStarOutline />
          <MdOutlineStarOutline />
          <span className="ml-2 text-[10px] text-subtle sm:text-xs">({item.reviews})</span>
        </div>

        <div className="mt-auto flex flex-col gap-3"><AddToCardBtn product={item} /></div>
      </div>
      <Transition appear show={isOpen}>
        <Dialog
          as="div"
          className="relative z-[70] focus:outline-none"
          onClose={close}
        >
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" aria-hidden="true" />
          <div className="fixed inset-0 z-10 w-full overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <TransitionChild
                enter="ease-out duration-300"
                enterFrom="opacity-0 transform-[scale(95%)]"
                enterTo="opacity-100 transform-[scale(100%)]"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 transform-[scale(100%)]"
                leaveTo="opacity-0 transform-[scale(95%)]"
              >
                <DialogPanel className="panel w-full max-w-md p-6">
                  <DialogTitle
                    as="h3"
                    className="text-lg font-semibold text-ink"
                  >
                    Hurry up!
                  </DialogTitle>
                  <p className="mt-2 text-sm/6 text-subtle">
                    You are going to save{" "}
                    <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                      <FormattedPrice
                        amount={item?.regularPrice - item?.discountedPrice}
                      />{" "}
                    </span>
                    from this product.
                  </p>
                  <p className="text-sm/6 text-subtle">The discount is already included in the product price.</p>
                  <div className="mt-4">
                    <Button
                      className="primary-button"
                      onClick={close}
                    >
                      Got it, thanks!
                    </Button>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>
    </article>
  );
};

export default ProductCard;
