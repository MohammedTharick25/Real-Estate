import { Link } from "react-router-dom";
import { Home, List, Phone, User } from "lucide-react";
export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-white text-xl font-bold mb-4">Estatera</h3>
          <p>
            Your trusted partner in finding premium land and residential
            properties since 2010.
          </p>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4">Quick Links</h4>
          <ul className="space-y-2">
            <li>
              <Link to="/listings">All Properties</Link>
            </li>
            <li>
              <Link to="/contact">Privacy Policy</Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4">Contact Us</h4>
          <p>123 Real Estate Way, Suite 100</p>
          <p>Email: info@estatera.com</p>
          <p>Phone: +91 9791674849</p>
        </div>
      </div>
    </footer>
  );
}
