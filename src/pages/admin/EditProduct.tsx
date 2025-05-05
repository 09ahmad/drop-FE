import { useState, useEffect, ChangeEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import { config } from "@/config";

interface ProductImage {
  id: string;
  url: string;
  altText?: string;
  isPrimary?: boolean;
}

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getToken } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
  });
  const [images, setImages] = useState<
    Array<{ file?: File; preview: string; id?: string }>
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const token = await getToken();
        const response = await axios.get(
          `${config.apiBaseUrl}/item/item-details/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Validate response structure
        if (!response.data?.productDetails) {
          throw new Error("Invalid API response structure");
        }

        const product = response.data.productDetails;

        setFormData({
          name: product.name || "",
          description: product.description || "",
          price: product.price?.toString() || "",
          category: product.category || "",
          stock: product.stock?.toString() || "",
        });

        // Safely handle images array
        setImages(
          (product.images || []).map((img: ProductImage) => ({
            preview: img.url,
            id: img.id,
            isPrimary: img.isPrimary,
          }))
        );
      } catch (err) {
        console.error("Error fetching product:", err);
        toast({
          title: "Error",
          description: "Failed to load product data",
          variant: "destructive",
        });
        navigate("/admin/dashboard");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    } else {
      navigate("/admin/dashboard");
    }
  }, [id]);
  
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
    const removedImage = newImages[index];

    // If this was an existing image (has an ID), mark it for deletion
    if (removedImage.id) {
      setImagesToDelete([...imagesToDelete, removedImage.id]);
    }

    URL.revokeObjectURL(removedImage.preview);
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
      const token = await getToken();
      const formDataToSend = new FormData();

      // Append product data
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("stock", formData.stock);

      // Append images to delete
      if (imagesToDelete.length > 0) {
        formDataToSend.append("imagesToDelete", JSON.stringify(imagesToDelete));
      }

      // Append new images
      images.forEach((image) => {
        if (image.file) {
          formDataToSend.append("images", image.file);
        }
      });

      const response = await axios.put(
        `${config.apiBaseUrl}/item/update-products/${id}`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast({
        title: "Product updated successfully",
        description: `${formData.name} has been updated.`,
      });
      navigate("/admin/dashboard");
    } catch (err) {
      console.error("Error updating product:", err);
      setError("Failed to update product. Please try again.");
      toast({
        title: "Error updating product",
        description: error || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edit Product</h1>
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
                <Label htmlFor="price">Price ($) *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="e.g. 49.99"
                  required
                />
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
                    key={image.id || index}
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
                    {/* @ts-ignore */}
                    {image.isPrimary && (
                      <span className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                        Primary
                      </span>
                    )}
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
              {isSubmitting ? "Updating Product..." : "Update Product"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default EditProduct;
