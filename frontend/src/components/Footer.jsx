import { Link } from "react-router-dom";
import { Home, List, Phone, User } from "lucide-react";
import { t } from "@lingui/macro";
import { useLingui } from "@lingui/react";

export default function Footer() {
  useLingui();

  return (
    <footer className="bg-slate-900 text-slate-300 py-12">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Brand */}
        <div>
          <h3 className="text-white text-xl font-bold mb-4">Estatera</h3>
          <p className="text-sm leading-relaxed">
            {t`Discover verified premium lands and architecturally stunning homes designed for your future.`}
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-bold mb-4">{t`Browse Properties`}</h4>

          <ul className="space-y-3 text-sm">
            <li>
              <Link
                to="/"
                className="flex items-center gap-2 hover:text-white transition"
              >
                <Home size={16} /> {t`Home`}
              </Link>
            </li>
            <li>
              <Link
                to="/listings"
                className="flex items-center gap-2 hover:text-white transition"
              >
                <List size={16} /> {t`Available Listings`}
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className="flex items-center gap-2 hover:text-white transition"
              >
                <Phone size={16} /> {t`Call Us`}
              </Link>
            </li>
            <li>
              <Link
                to="/profile"
                className="flex items-center gap-2 hover:text-white transition"
              >
                <User size={16} /> {t`Edit Profile`}
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-white font-bold mb-4">{t`Contact Our Experts`}</h4>

          <div className="space-y-2 text-sm">
            <p>{t`Office Address`}: Pudupattinam, Kalpakkam</p>
            <p>{t`Email Us`}: estatera@gmail.com</p>
            <p>{t`Call Us`}: +91 97916 74849</p>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-slate-800 mt-10 pt-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Estatera. {t`Luxury Living`} {t`Redefined`}
      </div>
    </footer>
  );
}
