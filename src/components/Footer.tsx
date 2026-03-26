import { Logo } from "@/components/Logo";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-foreground text-primary-foreground py-12">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-2 md:col-span-1">
            <div className="mb-4 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate("/")}>
              <Logo size="md" className="text-primary-foreground" />
            </div>
            <p className="text-sm text-primary-foreground/60 leading-relaxed">
              Connecting farmers directly with buyers. Fair prices, fresh produce, zero middlemen.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Categories</h4>
            <ul className="space-y-2">
              {[
                { label: "Primary Farming", path: "/category/primary-farming" },
                { label: "Agro Processing", path: "/category/agro-processing" },
                { label: "Butchery", path: "/category/butchery" },
                { label: "Auctions", path: "/auction-house" },
              ].map((item) => (
                <li key={item.label}>
                  <button onClick={() => navigate(item.path)} className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors">{item.label}</button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Sellers</h4>
            <ul className="space-y-2">
              {[
                { label: "Become a Seller", path: "/become-seller" },
                { label: "Seller Dashboard", path: "/seller-dashboard" },
                { label: "Pricing & MOQ", path: "/pricing" },
                { label: "Seller FAQ", path: "/faq" },
              ].map((item) => (
                <li key={item.label}>
                  <button onClick={() => navigate(item.path)} className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors">{item.label}</button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Company</h4>
            <ul className="space-y-2">
              {[
                { label: "About", path: "/about" },
                { label: "Careers", path: "/careers" },
                { label: "Contact", path: "/contact" },
                { label: "Blog", path: "/blog" },
              ].map((item) => (
                <li key={item.label}>
                  <button onClick={() => navigate(item.path)} className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors">{item.label}</button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-primary-foreground/10 pt-6 text-center text-xs text-primary-foreground/40">
          © 2026 AgriBid. All rights reserved. Farm-to-table, powered by trust.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
