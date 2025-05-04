
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import Layout from "@/components/Layout";

const Products = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  
  useEffect(() => {
    // Check if user is logged in and redirect based on role
    if (user) {
      if (isAdmin()) {
        toast.info("Redirecting to admin dashboard");
        navigate("/admin/dashboard");
      } else {
        toast.error("Regular users don't have access to products management yet");
        // In a real app, we would show products list for regular users
        navigate("/");
      }
    } else {
      toast.error("Please login to view products");
      navigate("/login");
    }
  }, [navigate, user, isAdmin]);
  
  return (
    <Layout>
      <div className="flex items-center justify-center h-[70vh]">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Redirecting...</h1>
          <p>Please wait while we redirect you.</p>
        </div>
      </div>
    </Layout>
  );
};

export default Products;
