import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useProducts } from "@/contexts/ProductContext";
import { Product } from "@/contexts/ProductContext";

const Index = () => {
  const { products } = useProducts();
  console.log("Product coming from ProductContext:", products);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);
  console.log("Filtered Products are", filteredProducts);

  useEffect(() => {
    setFilteredProducts(products);
  }, [products]);

  const handleSearch = () => {
    const filtered = products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  const handleAddToCart = (product: any) => {
    console.log("Added to cart:", product);
    // In a real app, this would update cart state or context
  };

  return (
    <Layout>
      <section className="relative bg-gradient-to-r from-blue-600 to-indigo-700 py-20 rounded-lg mb-8">
        <div className="container px-4 mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Premium Products for Your Lifestyle
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Discover high-quality products delivered straight to your
              doorstep.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-blue-700 hover:bg-blue-50"
              >
                Shop Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-white text-blue-700 hover:bg-blue-50"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 bg-blue-800 opacity-10 pattern-dots" />
      </section>

      <section className="mb-12">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Featured Products</h2>
          <div className="flex w-full max-w-md items-center space-x-2">
            <Input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button type="submit" onClick={handleSearch}>
              <Search className="h-4 w-4 mr-1" />
              Search
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              // @ts-ignore
              product={{
                ...product,
                price: Number(product.price), 
              }}
              // @ts-ignore
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
        {filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <h3 className="text-xl font-medium mb-2">No products found</h3>
            <p className="text-gray-500">
              Try a different search term or browse all products.
            </p>
          </div>
        )}
      </section>

      <section className="bg-gray-50 p-8 rounded-lg mb-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Why Choose Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="flex flex-col items-center p-4">
              <div className="bg-blue-100 p-3 rounded-full mb-4">
                <svg
                  className="w-6 h-6 text-brand-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Quality Products</h3>
              <p className="text-gray-600 text-center">
                We source only the best quality products from trusted suppliers.
              </p>
            </div>
            <div className="flex flex-col items-center p-4">
              <div className="bg-blue-100 p-3 rounded-full mb-4">
                <svg
                  className="w-6 h-6 text-brand-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Fast Delivery</h3>
              <p className="text-gray-600 text-center">
                Quick processing and shipping to minimize wait times.
              </p>
            </div>
            <div className="flex flex-col items-center p-4">
              <div className="bg-blue-100 p-3 rounded-full mb-4">
                <svg
                  className="w-6 h-6 text-brand-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Secure Checkout</h3>
              <p className="text-gray-600 text-center">
                Your personal and payment information is always protected.
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
