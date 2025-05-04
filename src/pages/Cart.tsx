import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, totalItems } = useCart();
  const { toast } = useToast();
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Calculate total cost
  const subtotal = cartItems.reduce(
    (total, item) => {
      const price = typeof item.product.price === "string" 
        ? parseFloat(item.product.price) 
        : item.product.price;
      return total + price * item.quantity;
    }, 
    0
  );

  const handleRemoveItem = (productId: string, productName: string) => {
    removeFromCart(productId);
    toast({
      title: "Item removed",
      description: `${productName} has been removed from your cart.`,
    });
  };

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    updateQuantity(productId, newQuantity);
  };

  const handleCheckout = () => {
    setCheckoutLoading(true);
    
    // Build WhatsApp message with cart details
    const itemsList = cartItems
      .map((item) => `${item.quantity}x ${item.product.name} ($${
        typeof item.product.price === "string"
          ? parseFloat(item.product.price).toFixed(2)
          : item.product.price.toFixed(2)
      } each)`)
      .join("\n");

    const message = `Hello, I would like to place an order:\n\n${itemsList}\n\nTotal: $${subtotal.toFixed(2)}`;
    
    // Open WhatsApp with the pre-filled message
    window.open(
      `https://wa.me/your-whatsapp-number?text=${encodeURIComponent(message)}`,
      "_blank"
    );
    
    // Clear cart after successful checkout
    clearCart();
    toast({
      title: "Checkout completed",
      description: "Your order has been sent to WhatsApp. Your cart has been cleared.",
    });
    
    setCheckoutLoading(false);
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>
      
      {totalItems === 0 ? (
        <div className="text-center py-12">
          <ShoppingBag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-xl font-medium text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Looks like you haven't added any products to your cart yet.</p>
          <Link to="/products">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="md:col-span-2 bg-white rounded-lg shadow-md p-6">
            <ul className="divide-y divide-gray-200">
              {cartItems.map((item) => (
                <li key={item.product.id} className="py-6 flex flex-col sm:flex-row">
                  <div className="flex-shrink-0 w-24 h-24 border rounded-md overflow-hidden">
                    {item.product.images && item.product.images.length > 0 ? (
                      <img
                        src={item.product.images[0].url}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://via.placeholder.com/300?text=Image+Not+Available";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <span className="text-gray-400">No image</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 ml-0 sm:ml-6 mt-4 sm:mt-0">
                    <div className="flex justify-between">
                      <h3 className="text-lg font-medium text-gray-900">
                        <Link to={`/product/${item.product.id}`} className="hover:text-brand-600">
                          {item.product.name}
                        </Link>
                      </h3>
                      <p className="text-lg font-medium text-gray-900">
                        ${typeof item.product.price === "string"
                          ? parseFloat(item.product.price).toFixed(2)
                          : item.product.price.toFixed(2)}
                      </p>
                    </div>
                    
                    <div className="mt-4 flex justify-between items-center">
                      <div className="flex items-center border rounded-md">
                        <button
                          onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                          className="p-2 hover:bg-gray-100"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="px-4">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                          className="p-2 hover:bg-gray-100"
                          aria-label="Increase quantity"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      
                      <button
                        onClick={() => handleRemoveItem(item.product.id, item.product.name)}
                        className="text-red-500 hover:text-red-700 flex items-center"
                        aria-label="Remove item"
                      >
                        <Trash2 size={18} className="mr-1" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            
            <div className="flex justify-between mt-6 pt-6 border-t border-gray-200">
              <Button variant="outline" onClick={clearCart}>
                Clear Cart
              </Button>
              <Link to="/products">
                <Button variant="outline">Continue Shopping</Button>
              </Link>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-md p-6 h-fit">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="flex justify-between py-2">
              <span>Subtotal ({totalItems} items)</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="border-t border-gray-200 my-4"></div>
            <div className="flex justify-between py-2 font-semibold">
              <span>Total</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <Button
              className="w-full mt-6"
              onClick={handleCheckout}
              disabled={checkoutLoading}
            >
              {checkoutLoading ? "Processing..." : "Checkout via WhatsApp"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;