import Container from "../ui/Container";
import { Link } from "react-router-dom";
import { FiHeart } from "react-icons/fi";
import { store } from "../lib/store";
import ProductCard from "../ui/ProductCard";
import Title from "../ui/Title";

const Favorite = () => {
  const favorites = store((state) => state.favoriteProduct);
  return (
    <Container>
      <div className="section-heading"><Title text="Your wishlist" /><p className="text-sm text-subtle">{favorites.length} saved products</p></div>
      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 min-[380px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {favorites.map((item) => <ProductCard key={item._id} item={item} />)}
        </div>
      ) : (
        <div className="panel flex flex-col items-center gap-4 px-6 py-16 text-center">
          <span className="rounded-2xl bg-indigo-500/10 p-5 text-indigo-500"><FiHeart size={32} /></span>
          <h2 className="text-xl font-semibold">Keep your favorites close</h2>
          <p className="max-w-sm text-sm text-subtle">Save products you love and find them here whenever you are ready.</p>
          <Link to="/product" className="primary-button">Discover products</Link>
        </div>
      )}
    </Container>
  );
};

export default Favorite;
