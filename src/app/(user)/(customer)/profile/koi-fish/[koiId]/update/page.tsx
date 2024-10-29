"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
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
import koiFishApi, { KoiFishUpdate } from "@/lib/api/koiFishApi";
import koiBreedApi, { KoiBreed } from "@/lib/api/koiBreedApi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const fishSchema = z.object({
  name: z.string().min(1, "Fish name is required"),
  origin: z.string().min(1, "Origin is required"),
  gender: z.boolean(),
  dob: z.string().min(1, "Date of birth is required"),
  length: z.number().min(0, "Length must be a positive number").nullable(),
  weight: z.number().min(0, "Weight must be a positive number").nullable(),
  personalityTraits: z.string().optional(),
  dailyFeedAmount: z
    .number()
    .min(0, "Daily feed amount must be positive")
    .nullable(),
  lastHealthCheck: z.string().min(1, "Last health check date is required"),
  koiBreedIds: z
    .array(z.number())
    .min(1, "At least one breed must be selected"),
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
          title: "Success",
          description: "Koi fish updated successfully.",
        });
        router.push("/profile/koi-fish");
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      toast({
        title: "Error",
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
      <div className="mb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/profile">Profile</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/profile/koi-fish">
                My Koi Fish
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/profile/koi-fish/${koiId}/detail`}>
                {form.getValues("name") || "Koi Details"}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Update Koi Fish</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <h1 className="mb-6 text-2xl font-bold">Update Koi Fish</h1>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSaveFish)}
          className="space-y-8"
        >
          {/* Basic Information Section */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                        onValueChange={(value) =>
                          field.onChange(value === "true")
                        }
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
                          placeholder="Enter fish length"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value === "" ? null : Number(value));
                          }}
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
                          placeholder="Enter fish weight"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value === "" ? null : Number(value));
                          }}
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
                          placeholder="Enter daily feed amount"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value === "" ? null : Number(value));
                          }}
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
                    <FormItem className="col-span-2">
                      <FormLabel>Koi Breeds</FormLabel>
                      <Select
                        onValueChange={(value) =>
                          field.onChange([...field.value, parseInt(value)])
                        }
                        value={field.value[field.value.length - 1]?.toString()}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select breeds" />
                        </SelectTrigger>
                        <SelectContent>
                          {koiBreeds.map((breed) => (
                            <SelectItem
                              key={breed.id}
                              value={breed.id.toString()}
                            >
                              {breed.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="mt-2">
                        {field.value.map((breedId) => (
                          <Badge
                            key={breedId}
                            variant="secondary"
                            className="mb-2 mr-2"
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
                          </Badge>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Images Section */}
          <Card>
            <CardHeader>
              <CardTitle>Fish Images</CardTitle>
            </CardHeader>
            <CardContent>
              <FormItem>
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
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/profile/koi-fish/${koiId}/detail`)}
            >
              Cancel
            </Button>
            <Button type="submit">Update Koi Fish</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
