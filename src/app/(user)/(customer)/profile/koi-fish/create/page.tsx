"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import koiFishApi, { KoiFishCreate } from "@/lib/api/koiFishApi";
import koiBreedApi, { KoiBreed } from "@/lib/api/koiBreedApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { uploadImage } from "@/lib/configs/firebase";

const fishSchema = z.object({
  name: z.string().min(1, "Fish name is required"),
  origin: z.string().min(1, "Origin is required"),
  gender: z.boolean(),
  age: z.number().min(0, "Age must be a positive number"),
  length: z.number().min(0, "Length must be a positive number"),
  weight: z.number().min(0, "Weight must be a positive number"),
  personalityTraits: z.string().optional(),
  dailyFeedAmount: z.number().min(0, "Daily feed amount must be positive"),
  lastHealthCheck: z.string().min(1, "Last health check date is required"),
  koiBreedIds: z
    .array(z.number())
    .min(1, "At least one breed must be selected"),
});

export default function CreateKoiFishPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [koiBreeds, setKoiBreeds] = useState<KoiBreed[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    // console.log("User", localStorage.getItem("user"));
    if (localStorage.getItem("user") != null) {
      setUser(JSON.parse(localStorage.getItem("user") as string));
    }
  }, []);

  const form = useForm({
    resolver: zodResolver(fishSchema),
    defaultValues: {
      name: "",
      origin: "",
      gender: true,
      age: 0,
      length: 0,
      weight: 0,
      personalityTraits: "",
      dailyFeedAmount: 0,
      lastHealthCheck: "",
      koiBreedIds: [],
    },
  });

  useEffect(() => {
    fetchKoiBreeds();
  }, []);

  const fetchKoiBreeds = async () => {
    const response = await koiBreedApi.getAll();
    if (response.isSuccess) {
      setKoiBreeds(response.data);
    }
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

  const handleSaveFish = async (values: z.infer<typeof fishSchema>) => {
    try {
      let imageUrlArray: string[] = [];

      if (imageFiles.length > 0) {
        try {
          const uploadedImageUrls = await Promise.all(
            imageFiles.map((file) => uploadImage(file)),
          );
          imageUrlArray = uploadedImageUrls;
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

      const newKoiData: KoiFishCreate = {
        name: values.name,
        origin: values.origin,
        gender: values.gender ? "Male" : "Female",
        age: values.age,
        length: values.length,
        weight: values.weight,
        isAvailableForSale: false,
        price: 0,
        isSold: false,
        personalityTraits: values.personalityTraits || "",
        dailyFeedAmount: values.dailyFeedAmount,
        lastHealthCheck: values.lastHealthCheck,
        koiBreedIds: values.koiBreedIds,
        imageUrls: imageUrlArray,
        ownerId: user.id,
      };

      const newKoiResponse = await koiFishApi.createByUser(newKoiData);

      if (newKoiResponse.isSuccess) {
        toast({
          title: "Success",
          description: "Koi fish created successfully.",
        });
        router.push("/profile/koi-fish");
      } else {
        throw new Error(newKoiResponse.message);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.message || "Failed to create koi fish. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-6 text-2xl font-bold">Create New Koi Fish</h1>
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
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
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
            name="age"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Age</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter fish age"
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
                <Select
                  onValueChange={(value) =>
                    field.onChange([...field.value, parseInt(value)])
                  }
                  value={(
                    field.value[field.value.length - 1] as string
                  )?.toString()}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select breeds" />
                  </SelectTrigger>
                  <SelectContent>
                    {koiBreeds.map((breed) => (
                      <SelectItem key={breed.id} value={breed.id.toString()}>
                        {breed.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="mt-2">
                  {field.value.map((breedId) => (
                    <span
                      key={breedId}
                      className="mr-2 inline-block rounded-full bg-gray-200 px-3 py-1 text-sm font-semibold text-gray-700"
                    >
                      {koiBreeds.find((b) => b.id === breedId)?.name}
                      <button
                        type="button"
                        onClick={() =>
                          field.onChange(
                            field.value.filter((id) => id !== breedId),
                          )
                        }
                        className="ml-2 text-red-500"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormItem>
            <FormLabel>Fish Images</FormLabel>
            <FormControl>
              <Input
                id="imageFile"
                type="file"
                onChange={handleImageChange}
                multiple
                accept="image/*"
              />
            </FormControl>
            {imagePreviews.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {imagePreviews.map((preview, index) => (
                  <img
                    key={index}
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="h-24 w-full rounded-sm object-cover"
                  />
                ))}
              </div>
            )}
            <FormMessage />
          </FormItem>

          <Button type="submit">Create Koi Fish</Button>
        </form>
      </Form>
    </div>
  );
}
