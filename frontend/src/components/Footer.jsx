import { Link } from "react-router-dom";
import { Home, List, Phone, User } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Brand */}
        <div>
          <h3 className="text-white text-xl font-bold mb-4">Estatera</h3>
          <p className="text-sm leading-relaxed">
            Your trusted partner in finding premium land and residential
            properties since 2010.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-bold mb-4">Quick Links</h4>

          <ul className="space-y-3 text-sm">
            <li>
              <Link
                to="/"
                className="flex items-center gap-2 hover:text-white transition"
              >
                <Home size={16} /> Home
              </Link>
            </li>

            <li>
              <Link
                to="/listings"
                className="flex items-center gap-2 hover:text-white transition"
              >
                <List size={16} /> All Properties
              </Link>
            </li>

            <li>
              <Link
                to="/contact"
                className="flex items-center gap-2 hover:text-white transition"
              >
                <Phone size={16} /> Contact
              </Link>
            </li>

            <li>
              <Link
                to="/profile"
                className="flex items-center gap-2 hover:text-white transition"
              >
                <User size={16} /> My Account
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-white font-bold mb-4">Contact Us</h4>

          <div className="space-y-2 text-sm">
            <p>123 Real Estate Way, Suite 100</p>
            <p>Email: info@estatera.com</p>
            <p>Phone: +91 9791674849</p>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-slate-800 mt-10 pt-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Estatera. All rights reserved.
      </div>
    </footer>
  );
}
