
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Menu, X, ShieldAlert } from "lucide-react";
import { UserMenu } from "./UserMenu";
import { useAuth } from "@/contexts/AuthContext";

const NavbarWithAuth = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate("/");
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="font-bold text-xl text-brand-600">
            DropShop
          </Link>

          {/* Desktop navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <Link to="/" className="text-gray-600 hover:text-brand-600 px-3 py-2 text-sm font-medium">
              Home
            </Link>
            <Link to="/products" className="text-gray-600 hover:text-brand-600 px-3 py-2 text-sm font-medium">
              Products
            </Link>
          </div>

          <div className="hidden md:flex md:items-center md:space-x-4">
            {user && (
              <Link to="/cart">
                <Button variant="ghost" size="icon">
                  <ShoppingCart className="h-5 w-5" />
                </Button>
              </Link>
            )}
            <UserMenu />
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open menu"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" className="block px-3 py-2 text-gray-600 hover:text-brand-600">
              Home
            </Link>
            <Link to="/products" className="block px-3 py-2 text-gray-600 hover:text-brand-600">
              Products
            </Link>
            {user && (
              <Link to="/cart" className="block px-3 py-2 text-gray-600 hover:text-brand-600">
                Cart
              </Link>
            )}
            {user && user.role === "admin" && (
              <>
                <div className="mt-4 mb-2 px-3 text-xs font-semibold text-gray-400 uppercase">
                  Admin
                </div>
                <Link to="/admin/dashboard" className="block px-3 py-2 text-gray-600 hover:text-brand-600">
                  Dashboard
                </Link>
                <Link to="/admin/add-product" className="block px-3 py-2 text-gray-600 hover:text-brand-600">
                  Add Product
                </Link>
              </>
            )}
            {user ? (
              <Button 
                variant="ghost"
                onClick={handleLogout}
                className="w-full justify-start px-3 py-2 text-gray-600 hover:text-brand-600"
              >
                Log out
              </Button>
            ) : (
              <div className="mt-4 space-y-2 px-3">
                <Link to="/login">
                  <Button variant="outline" className="w-full">User Login</Button>
                </Link>
                <Link to="/admin/login" className="flex items-center">
                  <Button variant="outline" className="w-full bg-amber-50 border-amber-200 text-amber-700 flex items-center">
                    <ShieldAlert className="h-4 w-4 mr-2" />
                    Admin Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="w-full">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavbarWithAuth;
