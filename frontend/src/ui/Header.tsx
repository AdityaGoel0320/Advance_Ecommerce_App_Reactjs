import { useEffect, useState } from "react";
import { FiArrowUpRight, FiGrid, FiHeart, FiMenu, FiShoppingBag, FiUser, FiX } from "react-icons/fi";
import { IoSearchOutline } from "react-icons/io5";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { CategoryProps, ProductProps } from "../../type";
import { backendUrl } from "../assets/FrontendUtils";
import { getData, getProducts } from "../lib";
import { store } from "../lib/store";
import ProductCard from "./ProductCard";
import ThemeToggle from "./ThemeToggle";

const navigation = [
  { title: "Overview", link: "/" },
  { title: "Discover", link: "/product" },
  { title: "Favorites", link: "/favorite" },
  { title: "Orders", link: "/orders" },
];

const Header = () => {
  const [searchText, setSearchText] = useState("");
  const [products, setProducts] = useState<ProductProps[]>([]);
  const [categories, setCategories] = useState<CategoryProps[]>([]);
  const [searchError, setSearchError] = useState(false);
  const [searchLoading, setSearchLoading] = useState(true);
  const [categoryError, setCategoryError] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { currentUser, cartProduct } = store();
  const { pathname } = useLocation();

  useEffect(() => {
    setMobileOpen(false);
    setSearchText("");
  }, [pathname]);

  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
        setSearchText("");
      }
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, []);

  useEffect(() => {
    let active = true;
    getProducts()
      .then(({ data }) => { if (active) setProducts(data); })
      .catch((error) => {
        console.error("Error loading search products", error);
        if (active) setSearchError(true);
      })
      .finally(() => { if (active) setSearchLoading(false); });
    getData(`${backendUrl}/categories`)
      .then((data) => { if (active) setCategories(data); })
      .catch((error) => {
        console.error("Error loading navigation categories", error);
        if (active) setCategoryError(true);
      });
    return () => { active = false; };
  }, []);

  const filteredProducts = products.filter((item) =>
    item.name.toLowerCase().includes(searchText.trim().toLowerCase())
  );

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-surface/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-screen-xl flex-wrap items-center gap-3 px-4 py-4 sm:px-6 lg:gap-8 lg:px-8">
        <Link to="/" aria-label="Commerce home" className="flex shrink-0 items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/20">
            <FiShoppingBag size={21} />
          </span>
          <span className="text-xl font-bold tracking-tight">commerce<span className="text-indigo-500">.</span></span>
        </Link>
        <div className="relative order-3 w-full lg:order-none lg:flex-1">
          <label htmlFor="product-search" className="sr-only">Search products</label>
          <IoSearchOutline className="pointer-events-none absolute left-4 top-3.5 text-lg text-subtle" />
          <input id="product-search" type="search" autoComplete="off" value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Search your next favorite..."
            className="h-11 w-full rounded-xl border border-line bg-muted/60 pl-11 pr-11 text-sm text-ink placeholder:text-subtle focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
          {searchText && (
            <button type="button" aria-label="Clear search" onClick={() => setSearchText("")}
              className="absolute right-1 top-1 flex h-9 w-9 items-center justify-center rounded-lg text-subtle hover:bg-surface">
              <FiX />
            </button>
          )}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <Link to="/profile" aria-label="My account" className="icon-button hidden sm:inline-flex">
            {currentUser?.avatar ? <img src={currentUser.avatar} alt="" className="h-7 w-7 rounded-full object-cover" /> : <FiUser size={19} />}
          </Link>
          <Link to="/cart" aria-label={`Shopping cart, ${cartProduct.length} items`} className="icon-button relative">
            <FiShoppingBag size={19} />
            {cartProduct.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-bold text-white">
                {cartProduct.length}
              </span>
            )}
          </Link>
          <button type="button" aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={mobileOpen} aria-controls="mobile-navigation"
            onClick={() => setMobileOpen(!mobileOpen)} className="icon-button md:hidden">
            {mobileOpen ? <FiX size={19} /> : <FiMenu size={19} />}
          </button>
        </div>
      </div>
      <div className="border-t border-line">
        <nav aria-label="Main navigation" className="mx-auto flex max-w-screen-xl items-center gap-6 px-4 py-2 sm:px-6 lg:px-8">
          <Menu>
            <MenuButton className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-muted px-3 text-sm font-semibold text-ink transition hover:bg-indigo-500/10">
              <FiGrid /> Categories
            </MenuButton>
            <MenuItems anchor="bottom start" className="z-[60] max-h-80 w-64 overflow-y-auto rounded-xl border border-line bg-surface p-2 text-sm text-ink shadow-panel [--anchor-gap:8px]">
              {categoryError && <p role="alert" className="px-3 py-2 text-subtle">Categories could not be loaded.</p>}
              {!categoryError && categories.length === 0 && <p className="px-3 py-2 text-subtle">Loading categories...</p>}
              {categories.map((item) => (
                <MenuItem key={item._id}>
                  <Link to={`/category/${item._base}`} className="flex items-center gap-3 rounded-lg px-3 py-2.5 data-[focus]:bg-muted">
                    <img src={item.image} alt="" className="h-8 w-8 rounded-lg bg-white object-contain" />
                    {item.name}
                  </Link>
                </MenuItem>
              ))}
            </MenuItems>
          </Menu>
          <div className="hidden items-center gap-1 md:flex">
            {navigation.map(({ title, link }) => (
              <NavLink key={link} to={link} end={link === "/"}
                className={({ isActive }) => `rounded-lg px-4 py-2.5 text-sm font-medium transition ${isActive ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" : "text-subtle hover:bg-muted hover:text-ink"}`}>
                {title}
              </NavLink>
            ))}
          </div>
          <Link to="/product" className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-subtle hover:text-indigo-500 sm:text-sm">
            Explore collection <FiArrowUpRight />
          </Link>
        </nav>
        {mobileOpen && (
          <nav id="mobile-navigation" aria-label="Mobile navigation" className="grid grid-cols-2 gap-2 border-t border-line p-4 motion-safe:animate-reveal md:hidden">
            {[...navigation, { title: "My account", link: "/profile" }, { title: "Shopping cart", link: "/cart" }].map(({ title, link }) => (
              <NavLink key={link} to={link} end={link === "/"} onClick={() => setMobileOpen(false)}
                className={({ isActive }) => `rounded-xl px-4 py-3 text-sm font-semibold ${isActive ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" : "bg-muted text-ink"}`}>
                {title === "Favorites" && <FiHeart className="mr-2 inline" />}{title}
              </NavLink>
            ))}
          </nav>
        )}
      </div>
      {searchText.trim() && (
        <section aria-label="Search results" className="absolute left-0 right-0 top-full max-h-[65vh] overflow-y-auto border-b border-line bg-surface p-4 shadow-panel sm:p-6">
          <div className="mx-auto max-w-screen-xl">
            <p role="status" className="mb-4 text-sm text-subtle">
              {searchLoading ? "Searching products..." : searchError ? "Search is unavailable. Please refresh to try again." : `${filteredProducts.length} results for "${searchText}"`}
            </p>
            {!searchLoading && !searchError && (
              filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 min-[380px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                  {filteredProducts.map((item) => <ProductCard key={item._id} item={item} setSearchText={setSearchText} />)}
                </div>
              ) : <p className="rounded-xl bg-muted p-6 text-center text-subtle">No products found. Try another search.</p>
            )}
          </div>
        </section>
      )}
    </header>
  );
};

export default Header;
