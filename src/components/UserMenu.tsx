
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, ShoppingCart, LogOut, Settings, Package, ShieldAlert } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function UserMenu() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  if (!user) {
    return (
      <div className="flex gap-4">
        <Link to="/login">
          <Button variant="ghost">User Login</Button>
        </Link>
        <Link to="/admin/login">
          <Button variant="outline" className="flex items-center gap-1 border-amber-200 bg-amber-50 text-amber-700">
            <ShieldAlert size={16} />
            Admin
          </Button>
        </Link>
        <Link to="/signup">
          <Button>Sign Up</Button>
        </Link>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <User className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
            <p className="text-xs font-medium mt-1 text-brand-600">
              {user.role === "admin" ? "Administrator" : "Customer"}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {user.role === "client" && (
            <DropdownMenuItem>
              <Link to="/cart" className="flex items-center w-full">
                <ShoppingCart className="mr-2 h-4 w-4" />
                <span>Cart</span>
              </Link>
            </DropdownMenuItem>
          )}
          
          {isAdmin() && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Admin</DropdownMenuLabel>
              <DropdownMenuItem>
                <Link to="/admin/dashboard" className="flex items-center w-full">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link to="/admin/add-product" className="flex items-center w-full">
                  <Package className="mr-2 h-4 w-4" />
                  <span>Add Product</span>
                </Link>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
