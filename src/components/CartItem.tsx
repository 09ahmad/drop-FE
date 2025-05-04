
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Product } from "./ProductCard";

interface CartItemProps {
  item: { product: Product; quantity: number };
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

const CartItem = ({ item, onUpdateQuantity, onRemove }: CartItemProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { product, quantity } = item;

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) return;
    setIsLoading(true);
    // In a real app, you might want to debounce this or handle optimistic UI updates
    try {
      onUpdateQuantity(product.id, newQuantity);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = () => {
    onRemove(product.id);
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center py-4 border-b border-gray-200">
      <div className="flex-shrink-0 w-full sm:w-24 h-24 mb-3 sm:mb-0">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover rounded"
        />
      </div>

      <div className="flex-1 px-4">
        <h3 className="font-medium text-gray-900">{product.name}</h3>
        <p className="text-sm text-gray-500 line-clamp-1">{product.description}</p>
        <p className="text-brand-600 font-medium mt-1">${product.price.toFixed(2)}</p>
      </div>

      <div className="flex items-center mt-3 sm:mt-0">
        <div className="flex items-center border rounded">
          <Button 
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-none"
            onClick={() => handleQuantityChange(quantity - 1)}
            disabled={quantity <= 1 || isLoading}
          >
            <Minus size={16} />
          </Button>
          <span className="w-8 text-center">{quantity}</span>
          <Button 
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-none"
            onClick={() => handleQuantityChange(quantity + 1)}
            disabled={isLoading}
          >
            <Plus size={16} />
          </Button>
        </div>
        <Button 
          type="button"
          variant="ghost" 
          size="icon"
          className="ml-2 text-gray-500 hover:text-red-600"
          onClick={handleRemove}
          disabled={isLoading}
        >
          <Trash2 size={18} />
        </Button>
      </div>
    </div>
  );
};

export default CartItem;
