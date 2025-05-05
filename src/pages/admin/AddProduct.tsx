import { useState, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, X } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { useToast } from "@/components/ui/use-toast";
import { useProducts } from "@/contexts/ProductContext"; 

const currencies = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
  { code: "KWD", symbol: "د.ك", name: "Kuwaiti Dinar" },
];

const categories = [
  "Electronics",
  "Clothing",
  "Home & Kitchen",
  "Beauty",
  "Toys",
  "Sports",
  "Books",
  "Food",
  "Other",
];

const AddProduct = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addProduct } = useProducts(); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    currency: "USD",
    category: "",
    stock: "",
  });
  const [images, setImages] = useState<Array<{ file: File; preview: string }>>([]);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);
    if (files.length + images.length > 8) {
      toast({
        title: "Too many images",
        description: "You can upload up to 8 images maximum",
        variant: "destructive",
      });
      return;
    }

    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages([...images, ...newImages]);
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    URL.revokeObjectURL(newImages[index].preview);
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (images.length === 0) {
      toast({
        title: "Images required",
        description: "Please upload at least one product image",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      
      // Append product data
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("currency", formData.currency);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("stock", formData.stock);
      
      // Append images
      images.forEach((image) => {
        formDataToSend.append("images", image.file);
      });

      await addProduct(formDataToSend);

      toast({
        title: "Product added successfully",
        description: `${formData.name} has been added to your store.`,
      });
      navigate("/admin/dashboard");
    } catch (err) {
      console.error("Error adding product:", err);
      setError("Failed to add product. Please try again.");
      toast({
        title: "Error adding product",
        description: error || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Add New Product</h1>
        <Button variant="outline" onClick={() => navigate("/admin/dashboard")}>
          Cancel
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 text-sm text-red-700 bg-red-100 rounded-md">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Wireless Earbuds"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price *</Label>
                <div className="flex gap-2">
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => handleSelectChange("currency", value)}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          <div className="flex items-center gap-2">
                            <span>{currency.symbol}</span>
                            <span>{currency.code}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder={`e.g. 49.99`}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    handleSelectChange("category", value)
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock">Stock Quantity *</Label>
                <Input
                  id="stock"
                  name="stock"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.stock}
                  onChange={handleChange}
                  placeholder="e.g. 100"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Product Description *</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your product in detail..."
                className="min-h-[120px]"
                required
              />
            </div>

            <div className="space-y-4">
              <Label>Product Images *</Label>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div
                    key={index}
                    className="relative rounded-md overflow-hidden border h-32"
                  >
                    <img
                      src={image.preview}
                      alt={`Product preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-sm hover:bg-gray-100"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}

                {images.length < 8 && (
                  <label className="border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center h-32 cursor-pointer hover:bg-gray-50">
                    <Upload size={24} className="text-gray-400" />
                    <span className="mt-2 text-sm text-gray-500">
                      Upload Image
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                      multiple
                    />
                  </label>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Upload up to 8 images. First image will be used as the product
                thumbnail.
              </p>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Adding Product..." : "Add Product"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AddProduct;