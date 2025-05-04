import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
import { config } from "../config";

export interface ProductImage {
  id: string;
  url: string;
  altText?: string;
  isPrimary?: boolean;
  productId: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number | string;
  category: string | null;
  stock: number;
  images: ProductImage[];
}

interface ProductContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  addProduct: (product: FormData) => Promise<Product>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>;
  getProduct: (id: string) => Product | undefined;
  fetchProducts: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Authentication required");
      }
      
      const response = await axios.get(`${config.apiBaseUrl}/item/product-details`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.data?.productDetails) {
        setProducts(response.data.productDetails);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      const errorMessage = axios.isAxiosError(err) 
        ? err.response?.data?.message || "Failed to fetch products"
        : "Failed to fetch products";
      setError(errorMessage);
      console.error("Error fetching products:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const addProduct = async (formData: FormData) => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Authentication required");
      }
      
      const response = await axios.post(
        `${config.apiBaseUrl}/item/add-products`, 
        formData, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      
      if (response.data) {
        setProducts(prev => [...prev, response.data]);
        return response.data;
      }
      throw new Error("Invalid response format");
    } catch (err) {
      const errorMessage = axios.isAxiosError(err) 
        ? err.response?.data?.message || "Failed to add product"
        : "Failed to add product";
      setError(errorMessage);
      console.error("Error adding product:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (id: string, updatedFields: Partial<Product>) => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Authentication required");
      }
      
      const response = await axios.put(
        `${config.apiBaseUrl}/item/update-products/${id}`,
        updatedFields,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (response.data?.updatedProduct) {
        setProducts(prev => 
          prev.map(product => 
            product.id === id ? response.data.updatedProduct : product
          )
        );
        return response.data.updatedProduct;
      }
      throw new Error("Invalid response format");
    } catch (err) {
      const errorMessage = axios.isAxiosError(err) 
        ? err.response?.data?.message || "Failed to update product"
        : "Failed to update product";
      setError(errorMessage);
      console.error("Error updating product:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Authentication required");
      }
      
      await axios.delete(
        `${config.apiBaseUrl}/item/delete-products/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      setProducts(prev => prev.filter(product => product.id !== id));
    } catch (err) {
      const errorMessage = axios.isAxiosError(err) 
        ? err.response?.data?.message || "Failed to delete product"
        : "Failed to delete product";
      setError(errorMessage);
      console.error("Error deleting product:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getProduct = (id: string) => {
    return products.find(product => product.id === id);
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        loading,
        error,
        addProduct,
        updateProduct,
        deleteProduct,
        getProduct,
        fetchProducts,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error("useProducts must be used within a ProductProvider");
  }
  return context;
};