"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { uploadImage } from "@/lib/configs/firebase";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import koiFishApi, {
  KoiFish,
  KoiFishImage,
  KoiFishUpdate,
} from "@/lib/api/koiFishApi";
import koiBreedApi, { KoiBreed } from "@/lib/api/koiBreedApi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const fishSchema = z.object({
  name: z.string().min(1, "Fish name is required"),
  origin: z.string().min(1, "Origin is required"),
  gender: z.boolean(),
  dob: z.string().min(1, "Date of birth is required"),
  length: z.number().min(0, "Length must be a positive number"),
  weight: z.number().min(0, "Weight must be a positive number"),
  isAvailableForSale: z.boolean(),
  price: z.number().min(0, "Price must be a positive number"),
  isSold: z.boolean(),
  isDeleted: z.boolean(),
  personalityTraits: z.string().optional(),
  dailyFeedAmount: z.number().min(0, "Daily feed amount must be positive"),
  lastHealthCheck: z.string().min(1, "Last health check date is required"),
  koiBreedIds: z.array(z.number()),
  imageUrls: z.array(z.string()).optional(),
});

export default function UpdateKoiFishPage() {
  const router = useRouter();
  const { koiId } = useParams();
  const { toast } = useToast();
  const [koiBreeds, setKoiBreeds] = useState<KoiBreed[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const form = useForm<KoiFishUpdate>({
    resolver: zodResolver(fishSchema),
    defaultValues: {
      name: "",
      origin: "",
      gender: true,
      dob: "",
      length: 0,
      weight: 0,
      isAvailableForSale: false,
      price: 0,
      isSold: false,
      isDeleted: false,
      personalityTraits: "",
      dailyFeedAmount: 0,
      lastHealthCheck: "",
      koiBreedIds: [],
      imageUrls: [],
    },
  });

  useEffect(() => {
    fetchKoiBreeds();
    fetchFishDetails();
  }, [koiId]);

  const fetchKoiBreeds = async () => {
    const response = await koiBreedApi.getAll();
    if (response.isSuccess) {
      setKoiBreeds(response.data);
    }
  };

  const fetchFishDetails = async () => {
    setLoading(true);
    const response = await koiFishApi.getMyKoiFishDetailById(Number(koiId));
    if (response.isSuccess && response.data) {
      const fishData = response.data;
      form.reset({
        name: fishData.name,
        origin: fishData.origin,
        gender: fishData.gender === "Male",
        dob: fishData.dob || "",
        length: fishData.length,
        weight: fishData.weight,
        isAvailableForSale: fishData.isAvailableForSale || false,
        price: fishData.price,
        isSold: fishData.isSold || false,
        isDeleted: fishData.isDeleted || false,
        personalityTraits: fishData.personalityTraits,
        dailyFeedAmount: fishData.dailyFeedAmount,
        lastHealthCheck: new Date(fishData.lastHealthCheck)
          .toISOString()
          .slice(0, 10),
        koiBreedIds: fishData.koiBreeds.map((breed) => breed.id),
        imageUrls: fishData.koiFishImages.map((img) => img.imageUrl),
      });
      setImagePreviews(fishData.koiFishImages.map((image) => image.imageUrl));
    }
    setLoading(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      setImageFiles(fileArray);
      const previewUrls = fileArray.map((file) => URL.createObjectURL(file));
      setImagePreviews(previewUrls);
    }
  };

  const handleSaveFish = async (values: KoiFishUpdate) => {
    let imageUrlArray = values.imageUrls || [];

    if (imageFiles.length > 0) {
      try {
        const uploadedImageUrls = await Promise.all(
          imageFiles.map((file) => uploadImage(file)),
        );
        imageUrlArray = [...imageUrlArray, ...uploadedImageUrls];
        toast({
          title: "Images uploaded successfully",
          description: "The images have been uploaded successfully",
        });
      } catch (error: any) {
        toast({
          title: "Image upload failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
    }

    const updateData: KoiFishUpdate = {
      ...values,
      imageUrls: imageUrlArray,
    };

    try {
      const response = await koiFishApi.updateByUser(Number(koiId), updateData);
      if (response.isSuccess) {
        toast({
          title: "Koi fish updated successfully",
          description: "Your koi fish has been updated successfully",
        });
        router.push("/profile/koi-fish");
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      toast({
        title: "Update failed",
        description:
          error.message || "Failed to update koi fish. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Toaster />
      <h1 className="mb-6 text-2xl font-bold">Update Koi Fish</h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Left: Image Previews */}
        <div className="space-y-4">
          <label className="block font-semibold">Fish Images</label>
          <Input
            id="imageFile"
            type="file"
            onChange={handleImageChange}
            multiple
          />
          {imagePreviews.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              {imagePreviews.map((preview, index) => (
                <img
                  key={index}
                  src={preview}
                  alt={`Preview ${index}`}
                  className="h-40 w-full rounded-sm object-cover"
                />
              ))}
            </div>
          )}
        </div>

        {/* Right: Form Fields */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSaveFish)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fish Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter fish name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="origin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Origin</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter fish origin" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value === "true")}
                    value={field.value ? "true" : "false"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="true">Male</SelectItem>
                      <SelectItem value="false">Female</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dob"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="length"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Length (cm)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter fish length (cm)"
                      {...field}
                      onChange={(e) => field.onChange(+e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weight (g)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter fish weight (g)"
                      {...field}
                      onChange={(e) => field.onChange(+e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isAvailableForSale"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Available for Sale</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value === "true")}
                    value={field.value ? "true" : "false"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Is the fish available for sale?" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter price"
                      {...field}
                      onChange={(e) => field.onChange(+e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isSold"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Is Sold</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value === "true")}
                    value={field.value ? "true" : "false"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Has the fish been sold?" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dailyFeedAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Daily Feed Amount (g)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter daily feed amount (g)"
                      {...field}
                      onChange={(e) => field.onChange(+e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastHealthCheck"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Health Check</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="koiBreedIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Koi Breeds</FormLabel>
                  <FormControl>
                    <select
                      title="Koi Breeds"
                      multiple
                      value={field.value.map(String)}
                      onChange={(e) => {
                        const selectedOptions = Array.from(
                          e.target.selectedOptions,
                          (option) => parseInt(option.value),
                        );
                        field.onChange(selectedOptions);
                      }}
                      className="block w-full rounded-md border p-2"
                    >
                      {koiBreeds.map((breed) => (
                        <option key={breed.id} value={breed.id}>
                          {breed.name}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="mt-4 flex space-x-4">
              <Button
                variant="outline"
                onClick={() => router.push("/profile/koi-fish")}
              >
                Cancel
              </Button>
              <Button type="submit" variant="default">
                Update Koi Fish
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
