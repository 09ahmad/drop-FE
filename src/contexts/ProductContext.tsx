import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
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
  addProduct: (product: FormData) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
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
      const response = await axios.get("http://localhost:3000/api/v1/item/product-details", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProducts(response.data.productDetails);
    } catch (err) {
      setError("Failed to fetch products");
      console.error("Error fetching products:", err);
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
      const response = await axios.post("http://localhost:3000/api/v1/item/add-products", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setProducts([...products, response.data]);
    } catch (err) {
      setError("Failed to add product");
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
      const response = await axios.put(`http://localhost:3000/api/v1/item/update-products/${id}`, updatedFields, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProducts(
        products.map((product) =>
          product.id === id ? response.data.updatedProduct : product
        )
      );
    } catch (err) {
      setError("Failed to update product");
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
      await axios.delete(`http://localhost:3000/api/v1/item/delete-products/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProducts(products.filter((product) => product.id !== id));
    } catch (err) {
      setError("Failed to delete product");
      console.error("Error deleting product:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getProduct = (id: string) => {
    return products.find((product) => product.id === id);
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