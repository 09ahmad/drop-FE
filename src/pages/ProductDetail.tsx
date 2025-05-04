import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Product, useProducts } from "@/contexts/ProductContext";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { getProduct } = useProducts();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      const contextProduct = getProduct(id);
      if (contextProduct) {
        setProduct(contextProduct);
        setSelectedImage(
          contextProduct.images?.find(img => img.isPrimary)?.url || 
          contextProduct.images?.[0]?.url || 
          // @ts-ignore
          contextProduct.image || null
        );
        setLoading(false);
      } else {
        const timer = setTimeout(() => {
          const sampleProducts = [
            {
              id: "1",
              name: "Wireless Earbuds",
              price: 49.99,
              images: [
                {
                  id: "1",
                  url: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=500&q=60",
                  altText: "Wireless Earbuds",
                  isPrimary: true
                },
                {
                  id: "2",
                  url: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=500&q=60",
                  altText: "Wireless Earbuds Side View"
                }
              ],
              description: "High quality wireless earbuds with noise cancellation."
            },
          ];
          const foundProduct = sampleProducts.find(p => p.id === id) || null;
          setProduct(foundProduct as any);
          setSelectedImage(
            foundProduct?.images?.find(img => img.isPrimary)?.url || 
            foundProduct?.images?.[0]?.url || 
            null
          );
          setLoading(false);
        }, 500);

        return () => clearTimeout(timer);
      }
    }
  }, [id, getProduct]);

  const handleAddToCart = () => {
    if (product) {
      toast({
        title: "Added to cart",
        description: `${quantity} x ${product.name} has been added to your cart.`,
      });
    }
  };

  const handleBuyNow = () => {
    if (product) {
      const message = `Hello! I'm interested in purchasing ${quantity} x ${product.name} (${formatPrice(product.price)} each).`;
      const encodedMessage = encodeURIComponent(message);
      window.open(`https://wa.me/your-whatsapp-number?text=${encodedMessage}`, '_blank');
    }
  };

  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return numPrice.toFixed(2);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse space-y-8 w-full max-w-4xl">
            <div className="h-72 bg-gray-200 rounded"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <p>Sorry, we couldn't find the product you're looking for.</p>
          <Button asChild className="mt-6">
            <a href="/">Return to Home</a>
          </Button>
        </div>
      </Layout>
    );
  }
// @ts-ignore
  const availableImages = product.images || (product.image ? [{ url: product.image, altText: product.name }] : []);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image Gallery Section */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-md h-96">
              {selectedImage ? (
                <img 
                  src={selectedImage} 
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-400">No image available</span>
                </div>
              )}
            </div>
            
            {/* Thumbnail Gallery */}
            {availableImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {availableImages.map((image, index) => (
                  <button
                    key={image.id || index}
                    onClick={() => setSelectedImage(image.url)}
                    className={`border rounded-md overflow-hidden h-20 transition-all ${
                      selectedImage === image.url ? 'ring-2 ring-brand-500' : 'hover:ring-1 hover:ring-gray-300'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={image.altText || product.name}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Product Info Section */}
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-2xl font-semibold text-brand-600">${formatPrice(product.price)}</p>
            
            <div className="border-t border-b border-gray-200 py-4">
              <p className="text-gray-700 leading-relaxed">
                {product.description}
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <label htmlFor="quantity" className="mr-3 text-sm font-medium text-gray-700">
                  Quantity
                </label>
                <select 
                  id="quantity" 
                  value={quantity} 
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className="rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 text-sm py-2 px-3 border"
                >
                  {[1,2,3,4,5,6,7,8,9,10].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={handleAddToCart} 
                variant="outline" 
                className="flex-1 gap-2"
              >
                <ShoppingCart size={18} />
                Add to Cart
              </Button>
              <Button 
                onClick={handleBuyNow} 
                className="flex-1 bg-brand-600 hover:bg-brand-700"
              >
                Buy Now
              </Button>
            </div>
          </div>
        </div>
        
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Product Details</h2>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="prose max-w-none">
              <p>
                {product.description}
              </p>
              <p className="mt-4">
                Our products come with a premium quality guarantee. If you're not satisfied with your purchase, please contact our customer service team.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetail;