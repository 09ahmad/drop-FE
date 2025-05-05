import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingBag, Users, Plus, Edit, Trash2 } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { useProducts } from "@/contexts/ProductContext";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { config } from "@/config";

const Dashboard = () => {
  const navigate = useNavigate();
  const { products, loading, error, fetchProducts } = useProducts();
  const { toast } = useToast();
  const { getToken } = useAuth();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0
  });

  useEffect(() => {
    fetchProducts();
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = await getToken();
      // In a real app, you would fetch these from your API
      setStats({
        totalProducts: products.length,
        totalOrders: 25, // Replace with actual API call
        totalCustomers: 12 // Replace with actual API call
      });
    } catch (err) {
      console.error("Error fetching stats:", err);
      toast({
        title: "Error",
        description: "Failed to load dashboard statistics",
        variant: "destructive",
      });
    }
  };

  const handleEditProduct = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/admin/edit-product/${id}`);
  };

  const handleDeleteProduct = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        const token = await getToken();
        await fetch(`${config.apiBaseUrl}/item/delete-products/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Refresh the product list
        await fetchProducts();
        
        toast({
          title: "Success",
          description: "Product deleted successfully",
        });
      } catch (err) {
        console.error("Error deleting product:", err);
        toast({
          title: "Error",
          description: "Failed to delete product",
          variant: "destructive",
        });
      }
    }
  };

  if (loading && products.length === 0) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="p-4 text-red-700 bg-red-100 rounded-md">
          Error loading products: {error}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button asChild>
          <Link to="/admin/add-product">
            <Plus className="mr-2 h-4 w-4" /> Add New Product
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-gray-500">+2 from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-gray-500">+5 from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
            <p className="text-xs text-gray-500">+3 from last week</p>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-bold mb-4">Products</h2>
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full whitespace-nowrap">
          <thead>
            <tr className="text-left font-medium border-b">
              <th className="px-6 py-3">Product</th>
              <th className="px-6 py-3">Price</th>
              <th className="px-6 py-3">Category</th>
              <th className="px-6 py-3">Stock</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const primaryImage = product.images?.find(img => img.isPrimary)?.url || 
                                 product.images?.[0]?.url;
              return (
                <tr 
                  key={product.id} 
                  className="border-b hover:bg-gray-50 cursor-pointer"
                  onClick={() => window.open(`/product/${product.id}`, '_blank')}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 h-10 w-10">
                        {primaryImage ? (
                          <img 
                            className="h-10 w-10 rounded-md object-cover" 
                            src={primaryImage} 
                            alt={product.name} 
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center">
                            <Package className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{product.name}</div>
                        <div className="text-gray-500 text-sm truncate max-w-xs">
                          {product.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    ${typeof product.price === 'string' ? 
                      parseFloat(product.price).toFixed(2) : 
                      product.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">{product.category || 'Uncategorized'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      product.stock > 10 ? 'bg-green-100 text-green-800' : 
                      product.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-2" onClick={(e) => e.stopPropagation()}>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={(e) => handleEditProduct(product.id, e)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="text-red-600 hover:text-red-900"
                        onClick={(e) => handleDeleteProduct(product.id, e)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;