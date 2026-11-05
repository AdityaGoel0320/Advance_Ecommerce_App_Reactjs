import { payment } from "../assets";
import Container from "./Container";
import FooterTop from "./FooterTop";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="mt-10">
      <FooterTop />
      <Container className="flex flex-col md:flex-row items-center gap-5 justify-between py-6 text-xs text-subtle">
        <div><Link to="/" className="text-lg font-bold text-ink">commerce<span className="text-indigo-500">.</span></Link><p className="mt-1">&copy; {new Date().getFullYear()} Commerce. All rights reserved.</p></div>
        <nav aria-label="Footer navigation" className="flex gap-5">
          <Link to="/product" className="hover:text-indigo-500">Discover</Link>
          <Link to="/orders" className="hover:text-indigo-500">Orders</Link>
          <Link to="/profile" className="hover:text-indigo-500">Account</Link>
        </nav>
        <img src={payment} alt="Accepted payment methods" className="max-w-[240px] rounded-lg bg-white p-2" />
      </Container>
    </footer>
  );
};

export default Footer;
