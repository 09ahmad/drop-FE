
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Package, Users, Settings, LogOut, Menu, X, Home } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const AdminNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    toast.success("Admin logged out successfully");
    navigate("/admin/login");
  };

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/admin/dashboard" className="font-bold text-xl text-brand-700">
              Admin Dashboard
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900"
              aria-controls="admin-mobile-menu"
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">Open admin menu</span>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <Link to="/" className="text-gray-600 hover:text-brand-600 px-3 py-2 text-sm font-medium flex items-center">
              <Home size={16} className="mr-1" />
              Store
            </Link>
            <Link to="/admin/dashboard" className="text-gray-600 hover:text-brand-600 px-3 py-2 text-sm font-medium flex items-center">
              <Package size={16} className="mr-1" />
              Products
            </Link>
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-red-600 flex items-center" onClick={handleLogout}>
              <LogOut size={16} className="mr-1" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden" id="admin-mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-brand-600 flex items-center">
              <Home size={16} className="mr-2" />
              Store
            </Link>
            <Link to="/admin/dashboard" className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-brand-600 flex items-center">
              <Package size={16} className="mr-2" />
              Products
            </Link>
            <Link to="/admin/customers" className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-brand-600 flex items-center">
              <Users size={16} className="mr-2" />
              Customers
            </Link>
            <Link to="/admin/settings" className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-brand-600 flex items-center">
              <Settings size={16} className="mr-2" />
              Settings
            </Link>
            <button 
              className="w-full text-left block px-3 py-2 text-base font-medium text-gray-600 hover:text-red-600 flex items-center"
              onClick={handleLogout}
            >
              <LogOut size={16} className="mr-2" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNavbar;
