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
import { Label } from "@/components/ui/label";
import { CERTIFICATE_TYPES, KoiFishCertificate } from "@/lib/api/koiCertAPI";
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
  length: z.number().min(4, "Fish must be at least 4 cm long"),
  weight: z.number().min(10, "Weight must be at least 10 g"),
  personalityTraits: z.string().optional(),
  dailyFeedAmount: z
    .number()
    .min(0, "Daily feed amount must be positive")
    .nullable(),
  lastHealthCheck: z.string().min(1, "Last health check date is required"),
  koiBreedIds: z
    .array(z.number())
    .min(1, "At least one breed must be selected"),
  price: z.number().min(100000, "Price must be at least 100,000 VND"),
  isAvailableForSale: z.boolean(),
});

export default function CreateKoiFishPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [koiBreeds, setKoiBreeds] = useState<KoiBreed[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [certificateFiles, setCertificateFiles] = useState<
    Array<{
      file: File;
      type: string;
    }>
  >([]);

  const [user, setUser] = useState<any>(null);
  useEffect(() => {
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
      dob: "",
      length: 4,
      weight: 10,
      personalityTraits: "",
      dailyFeedAmount: null,
      lastHealthCheck: "",
      koiBreedIds: [],
      price: 0,
      isAvailableForSale: false,
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

  const handleCertificateChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    certificateType: string,
  ) => {
    const files = e.target.files;
    if (files && files[0]) {
      setCertificateFiles((prev) => [
        ...prev,
        { file: files[0], type: certificateType },
      ]);
    }
  };

  const handleSaveFish = async (values: z.infer<typeof fishSchema>) => {
    if (imageFiles.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please upload at least one image of your koi fish",
        variant: "destructive",
      });
      return;
    }

    try {
      toast({
        title: "Creating Koi Fish",
        description: "Please wait while we create your koi fish...",
      });

      let imageUrlArray: string[] = [];
      let certificateUrlArray: KoiFishCertificate[] = [];

      if (imageFiles.length > 0) {
        try {
          imageUrlArray = await Promise.all(
            imageFiles.map((file) => uploadImage(file)),
          );
        } catch (error: any) {
          toast({
            title: "Image upload failed",
            description: error.message,
            variant: "destructive",
          });
          return;
        }
      }

      if (certificateFiles.length > 0) {
        try {
          const uploadedCertificates = await Promise.all(
            certificateFiles.map(async ({ file, type }) => ({
              certificateUrl: await uploadImage(file),
              certificateType: type,
            })),
          );
          certificateUrlArray = uploadedCertificates as KoiFishCertificate[];
        } catch (error: any) {
          toast({
            title: "Certificate upload failed",
            description: error.message,
            variant: "destructive",
          });
          return;
        }
      }

      if (
        values.length === null ||
        values.weight === null ||
        values.dailyFeedAmount === null
      ) {
        toast({
          title: "Validation Error",
          description: "Please fill in all numeric fields with valid numbers",
          variant: "destructive",
        });
        return;
      }

      const newKoiData: KoiFishCreate = {
        name: values.name,
        origin: values.origin,
        gender: values.gender ? "Male" : "Female",
        dob: values.dob,
        length: values.length || 0,
        weight: values.weight || 0,
        isAvailableForSale: values.isAvailableForSale,
        price: values.price,
        isSold: false,
        personalityTraits: values.personalityTraits || "",
        dailyFeedAmount: values.dailyFeedAmount || 0,
        lastHealthCheck: values.lastHealthCheck,
        koiBreedIds: values.koiBreedIds,
        imageUrls: imageUrlArray,
        ownerId: null,
        certificates: certificateUrlArray,
      };

      const newKoiResponse = await koiFishApi.createByUser(newKoiData);

      if (newKoiResponse.isSuccess) {
        toast({
          title: "Success",
          description: "Koi fish created successfully.",
        });
        router.push("/manager/fish-management");
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
      <div className="mb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/manager">Manager</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/manager/fish-management">
                Fish Management
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Create New Koi Fish</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <h1 className="mb-6 text-2xl font-bold">Create New Koi Fish</h1>

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
                            const roundedValue = Math.round(Number(value));
                            field.onChange(value === "" ? null : roundedValue);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === ".") {
                              e.preventDefault();
                            }
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
                            const roundedValue = Math.round(Number(value));
                            field.onChange(value === "" ? null : roundedValue);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === ".") {
                              e.preventDefault();
                            }
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
                            const roundedValue = Math.round(Number(value));
                            field.onChange(value === "" ? null : roundedValue);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === ".") {
                              e.preventDefault();
                            }
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
                  name="personalityTraits"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Personality Traits</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter fish personality traits"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter fish price"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            const roundedValue = Math.round(Number(value));
                            field.onChange(value === "" ? null : roundedValue);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === ".") {
                              e.preventDefault();
                            }
                          }}
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
                        onValueChange={(value) =>
                          field.onChange(value === "true")
                        }
                        value={field.value ? "true" : "false"}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select availability" />
                        </SelectTrigger>
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
                  name="koiBreedIds"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
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

          {/* Certificates Section */}
          <Card>
            <CardHeader>
              <CardTitle>Certificates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {CERTIFICATE_TYPES.map((type) => (
                  <div key={type}>
                    <Label>{type}</Label>
                    <Input
                      type="file"
                      onChange={(e) => handleCertificateChange(e, type)}
                      accept="image/*"
                      className="mt-1"
                    />
                  </div>
                ))}
              </div>
              {certificateFiles.length > 0 && (
                <div className="mt-4">
                  <Label>Selected Certificates:</Label>
                  <ul className="mt-2 space-y-2">
                    {certificateFiles.map((cert, index) => (
                      <li
                        key={index}
                        className="flex items-center justify-between rounded-md border p-2"
                      >
                        <span>
                          {cert.type}: {cert.file.name}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setCertificateFiles((prev) =>
                              prev.filter((_, i) => i !== index),
                            );
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit">Create Koi Fish</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
