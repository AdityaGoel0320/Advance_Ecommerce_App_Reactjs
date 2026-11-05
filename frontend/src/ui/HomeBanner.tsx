import { FiArrowRight, FiCheck, FiShoppingBag, FiTruck, FiShield } from "react-icons/fi";
import { Link } from "react-router-dom";
import featuredAudio from "../assets/bannerOne.webp";
import Container from "./Container";

const HomeBanner = () => {
  return (
    <Container className="pb-4 pt-6">
      <section className="relative isolate overflow-hidden rounded-3xl border border-line bg-surface">
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-indigo-500/15 blur-3xl" />
        <div className="relative grid items-center gap-8 p-6 sm:p-10 lg:grid-cols-2 lg:p-14">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-300">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" /> A better way to shop
            </span>
            <h1 className="mt-6 max-w-xl text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              Upgrade your<br />everyday<span className="text-indigo-500">.</span>
            </h1>
            <p className="mt-5 max-w-md text-base leading-7 text-subtle">
              Discover standout tech and everyday essentials. Your favorites, your style, all in one place.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/product" className="primary-button">Explore products <FiArrowRight /></Link>
              <Link to="/favorite" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-line px-5 py-3 text-sm font-semibold transition hover:bg-muted">Your wishlist</Link>
            </div>
            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-subtle">
              <span className="inline-flex items-center gap-1.5"><FiCheck className="text-emerald-500" /> Curated collections</span>
              <span className="inline-flex items-center gap-1.5"><FiShield className="text-emerald-500" /> Secure checkout</span>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-md py-8">
            <div className="absolute inset-8 rounded-full bg-gradient-to-br from-indigo-500/20 to-violet-500/10" />
            <div className="relative aspect-square overflow-hidden rounded-3xl border border-indigo-500/10 bg-[#ead8c7]">
              <img src={featuredAudio} alt="Sony headphones from our audio collection" className="h-full w-full object-cover object-right motion-safe:animate-float" />
            </div>
            <div className="panel absolute left-0 top-5 flex items-center gap-3 p-3 sm:-left-4 sm:p-4">
              <span className="rounded-xl bg-indigo-500/10 p-3 text-indigo-500"><FiShoppingBag size={20} /></span>
              <div><p className="text-xs text-subtle">Thoughtfully selected</p><p className="text-sm font-semibold">Made for your everyday</p></div>
            </div>
            <div className="panel absolute bottom-3 right-0 flex items-center gap-3 p-3 sm:-right-4 sm:p-4">
              <span className="rounded-xl bg-emerald-500/10 p-3 text-emerald-500"><FiTruck size={20} /></span>
              <div><p className="text-sm font-semibold">From cart to doorstep</p><p className="text-xs text-subtle">Simple. Seamless. Secure.</p></div>
            </div>
          </div>
        </div>
      </section>
    </Container>
  );
};

export default HomeBanner;
