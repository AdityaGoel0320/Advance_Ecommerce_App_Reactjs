import { useState } from "react";
import ReactPaginate from "react-paginate";
import ProductCard from "./ProductCard";
import { ProductProps } from "../../type";

interface ItemsProps {
  currentItems: ProductProps[];
}

interface PaginationProps {
  items: ProductProps[];
  itemsPerPage: number;
}

function Items({ currentItems }: ItemsProps) {
  return (
    <div className="grid grid-cols-1 min-[380px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {currentItems &&
        currentItems.map((item: ProductProps) => (
          <ProductCard key={item._id} item={item} />
        ))}
    </div>
  );
}
const Pagination = ({ items, itemsPerPage }: PaginationProps) => {
  const [itemOffset, setItemOffset] = useState(0);
  const [itemStart, setItemStart] = useState(1);
  const endOffset = itemOffset + itemsPerPage;
  // console.log(`Loading items from ${itemOffset} to ${endOffset}`);
  const currentItems = items.slice(itemOffset, endOffset);
  const pageCount = Math.ceil(items.length / itemsPerPage);

  const handlePageClick = (event: any) => {
    const newOffset = (event.selected * itemsPerPage) % items.length;
    const newStart = newOffset + 1;
    // console.log(
    //   `User requested page number ${event.selected}, which is offset ${newOffset}`
    // );
    setItemOffset(newOffset);
    setItemStart(newStart);
  };

  return (
    <>
      <Items currentItems={currentItems} />
      <div className="flex flex-col md:flex-row justify-center md:justify-between items-center">
        <ReactPaginate
          nextLabel=""
          onPageChange={handlePageClick}
          pageRangeDisplayed={3}
          marginPagesDisplayed={2}
          pageCount={pageCount}
          previousLabel=""
          pageLinkClassName="w-11 h-11 rounded-xl border border-line hover:border-indigo-500 duration-200 flex justify-center items-center"
          pageClassName="rounded-xl"
          containerClassName="flex flex-wrap gap-2 text-sm font-semibold py-8"
          activeClassName="bg-indigo-600 text-white"
        />

        <p className="text-base font-normal text-lightText">
          Products from {items.length === 0 ? 0 : itemStart} to {Math.min(endOffset, items.length)} of{" "}
          {items.length}
        </p>
      </div>
    </>
  );
};

export default Pagination;
