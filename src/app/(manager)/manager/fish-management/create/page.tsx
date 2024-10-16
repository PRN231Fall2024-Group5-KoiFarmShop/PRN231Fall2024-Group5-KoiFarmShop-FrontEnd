'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Use router for navigation
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { uploadImage } from '@/lib/configs/firebase';
import koiFishApi from '@/lib/api/koiFishApi';
import koiBreedApi, { KoiBreed } from '@/lib/api/koiBreedApi';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';

// Define Zod schema for validation
const fishSchema = z.object({
  name: z.string().min(1, 'Fish name is required'),
  origin: z.string().min(1, 'Origin is required'),
  gender: z.boolean(),
  age: z.number().min(0, 'Age must be a positive number'),
  length: z.number().min(0, 'Length must be a positive number'),
  weight: z.number().min(0, 'Weight must be a positive number'),
  personalityTraits: z.string().optional(),
  dailyFeedAmount: z.number().min(0, 'Daily feed amount must be positive'),
  lastHealthCheck: z.string().min(1, 'Last health check date is required'),
  koiBreedIds: z.array(z.number()).min(1, 'At least one breed must be selected'),
  imageUrl: z.array(z.string()).optional(),
});

export default function CreateKoiFishPage() {
  const router = useRouter();
  const [koiBreeds, setKoiBreeds] = useState<KoiBreed[]>([]); // To store available Koi Breeds
  const [imageFiles, setImageFiles] = useState<File[]>([]); // To hold multiple images
  const [imagePreviews, setImagePreviews] = useState<string[]>([]); // Array of image previews

  // Initialize form with react-hook-form and zod schema
  const form = useForm({
    resolver: zodResolver(fishSchema),
    defaultValues: {
      name: '',
      origin: '',
      gender: true,
      age: 0,
      length: 0,
      weight: 0,
      personalityTraits: '',
      dailyFeedAmount: 0,
      lastHealthCheck: '',
      koiBreedIds: [] as number[],
      imageUrl: [] as string[],
    },
  });

  useEffect(() => {
    fetchKoiBreeds(); // Fetch Koi Breeds when the component is mounted
  }, []);

  const fetchKoiBreeds = async () => {
    const response = await koiBreedApi.getAll();
    if (response.isSuccess) {
      setKoiBreeds(response.data); // Store the available Koi Breeds
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

  const handleSaveFish = async (values: any) => {
    let imageUrlArray = values.imageUrl;

    if (imageFiles.length > 0) {
      try {
        const uploadedImageUrls = await Promise.all(
          imageFiles.map((file) => uploadImage(file))
        );
        imageUrlArray = [...imageUrlArray, ...uploadedImageUrls];
        toast({
          title: 'Images uploaded successfully',
          description: 'The images have been uploaded successfully',
        });
      } catch (error: any) {
        toast({
          title: 'Image upload failed',
          description: error.message,
        });
        return;
      }
    }

    await koiFishApi.create({
      ...values,
      imageUrl: imageUrlArray,
    });
    toast({
      title: 'Koi fish created successfully',
      description: 'The koi fish has been created successfully',
    });

    // After creation, redirect to the list page
    router.push('/manager/fish-management');
  };

  return (
    <div className="container mx-auto p-4">
      <Toaster />
      <h1 className="mb-6 text-2xl font-bold">Create Koi Fish</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Image Previews */}
        <div className="space-y-4">
          <label className="block font-semibold">Fish Images</label>
          <Input id="imageFile" type="file" onChange={handleImageChange} multiple />
          {imagePreviews.length > 0 && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          <form onSubmit={form.handleSubmit(handleSaveFish)} className="space-y-4">
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
                  <select
                    className="block w-full p-2 border rounded-md"
                    onChange={(e) => field.onChange(e.target.value === 'true')}
                    defaultValue={field.value ? "true" : "false"}
                  >
                    <option value="true">Male</option>
                    <option value="false">Female</option>
                  </select>
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
                    <Input type="number" placeholder="Enter fish age" {...field}
                      value={
                        +field.value
                      }
                      onChange={(e) => 
                        +e.target.value
                      }
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
                    <Input type="number" placeholder="Enter fish length (cm)" {...field} 
                    
                    value={
                      +field.value
                    }
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
                    <Input type="number" placeholder="Enter fish weight (g)" {...field}
                    value={
                      +field.value
                    }
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
                    <Input type="number" placeholder="Enter daily feed amount (g)" {...field} 
                    value={
                      +field.value
                    }
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
                    <Input type="datetime-local" {...field} />
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
                  <select
                    multiple
                    value={field.value.map(String)}
                    onChange={(e) => {
                      const selectedOptions = Array.from(e.target.selectedOptions, (option) =>
                        parseInt(option.value)
                      );
                      field.onChange(selectedOptions);
                    }}
                    className="block w-full p-2 border rounded-md"
                  >
                    {koiBreeds.map((breed) => (
                      <option key={breed.id} value={breed.id}>
                        {breed.name}
                      </option>
                    ))}
                  </select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="mt-4 flex space-x-4">
              <Button variant="outline" onClick={() => router.push('/manager/fish-management')}>
                Cancel
              </Button>
              <Button type="submit" variant="default">
                Create Koi Fish
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
