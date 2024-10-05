"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation"; // Use router for navigation and params
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { uploadImage } from "@/lib/configs/firebase";
import koiFishApi, { KoiFishImage } from "@/lib/api/koiFishApi";
import koiBreedApi, { KoiBreed } from "@/lib/api/koiBreedApi";

export default function UpdateKoiFishPage() {
  const router = useRouter();
  const { fishId } = useParams(); // Fetch fishId from the URL params
  const [koiBreeds, setKoiBreeds] = useState<KoiBreed[]>([]); // To store available Koi Breeds
  const [fishFormData, setFishFormData] = useState<any>({
    name: "",
    origin: "",
    gender: "",
    age: 0,
    length: 0,
    weight: 0,
    personalityTraits: "",
    dailyFeedAmount: 0,
    lastHealthCheck: "",
    koiBreedIds: [], // Array of selected KoiBreed IDs
    imageUrl: [], // Array of image URLs
  });
  const [selectedBreeds, setSelectedBreeds] = useState<KoiBreed[]>([]); // For selected breed details
  const [imageFiles, setImageFiles] = useState<File[]>([]); // To hold multiple images
  const [imagePreviews, setImagePreviews] = useState<string[]>([]); // Array of image previews
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchKoiBreeds(); // Fetch available breeds
    fetchFishDetails(); // Fetch fish details for the given fishId
  }, [fishId]);

  // Fetch available breeds
  const fetchKoiBreeds = async () => {
    const response = await koiBreedApi.getAll();
    if (response.isSuccess) {
      setKoiBreeds(response.data);
    }
  };

  // Fetch fish details
  const fetchFishDetails = async () => {
    setLoading(true);
    const response = await koiFishApi.getById(+fishId);
    if (response.isSuccess) {
      const fishData = response.data;
      setFishFormData({
        name: fishData.name,
        origin: fishData.origin,
        gender: fishData.gender,
        age: fishData.age,
        length: fishData.length,
        weight: fishData.weight,
        personalityTraits: fishData.personalityTraits,
        dailyFeedAmount: fishData.dailyFeedAmount,
        lastHealthCheck: new Date(fishData.lastHealthCheck)
          .toISOString()
          .slice(0, 16), // Format to input datetime-local
        koiBreedIds: fishData.koiBreeds.map(
          (breed: { id: number; name: string }) => breed.id,
        ),
        imageUrl: fishData.koiFishImages || [],
      });
      setImagePreviews(
        fishData.koiFishImages.map((image: KoiFishImage) => image.imageUrl),
      );
      setSelectedBreeds(
        koiBreeds.filter((breed) =>
          fishData.koiBreeds
            .map((b: { id: number }) => b.id)
            .includes(breed.id),
        ),
      );
    }
    setLoading(false);
  };

  const handleFishFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFishFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleKoiBreedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions);
    const selectedBreedIds = selectedOptions.map((option) =>
      parseInt(option.value),
    );
    setFishFormData((prev: any) => ({
      ...prev,
      koiBreedIds: selectedBreedIds,
    }));

    const selectedBreeds = koiBreeds.filter((breed) =>
      selectedBreedIds.includes(breed.id),
    );
    setSelectedBreeds(selectedBreeds);
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

  const handleSaveFish = async () => {
    let imageUrlArray = fishFormData.imageUrl;

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
        });
        return;
      }
    }

    // Update the fish
    await koiFishApi.update(+fishId, {
      ...fishFormData,
      imageUrl: imageUrlArray,
    });
    toast({
      title: "Koi fish updated successfully",
      description: "The koi fish has been updated successfully",
    });

    // Redirect back to the list page after update
    router.push("/manager/fish-management");
  };

  if (loading) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Toaster />
      <h1 className="mb-6 text-2xl font-bold">Update Koi Fish</h1>
      <div className="space-y-4">
        {/* Form Fields */}
        <label htmlFor="name" className="block font-semibold">
          Fish Name
        </label>
        <Input
          id="name"
          name="name"
          value={fishFormData.name}
          onChange={handleFishFormChange}
          placeholder="Enter fish name"
          className="w-full"
        />

        <label htmlFor="origin" className="block font-semibold">
          Origin
        </label>
        <Input
          id="origin"
          name="origin"
          value={fishFormData.origin}
          onChange={handleFishFormChange}
          placeholder="Enter fish origin"
          className="w-full"
        />

        <label htmlFor="gender" className="block font-semibold">
          Gender
        </label>
        <Input
          id="gender"
          name="gender"
          value={fishFormData.gender}
          onChange={handleFishFormChange}
          placeholder="Enter fish gender"
          className="w-full"
        />

        <label htmlFor="age" className="block font-semibold">
          Age
        </label>
        <Input
          id="age"
          name="age"
          type="number"
          value={fishFormData.age}
          onChange={handleFishFormChange}
          placeholder="Enter fish age"
          className="w-full"
        />

        <label htmlFor="length" className="block font-semibold">
          Length (cm)
        </label>
        <Input
          id="length"
          name="length"
          type="number"
          value={fishFormData.length}
          onChange={handleFishFormChange}
          placeholder="Enter fish length (cm)"
          className="w-full"
        />

        <label htmlFor="weight" className="block font-semibold">
          Weight (g)
        </label>
        <Input
          id="weight"
          name="weight"
          type="number"
          value={fishFormData.weight}
          onChange={handleFishFormChange}
          placeholder="Enter fish weight (g)"
          className="w-full"
        />

        <label htmlFor="dailyFeedAmount" className="block font-semibold">
          Daily Feed Amount (g)
        </label>
        <Input
          id="dailyFeedAmount"
          name="dailyFeedAmount"
          type="number"
          value={fishFormData.dailyFeedAmount}
          onChange={handleFishFormChange}
          placeholder="Enter daily feed amount (g)"
          className="w-full"
        />

        <label htmlFor="personalityTraits" className="block font-semibold">
          Personality Traits
        </label>
        <Input
          id="personalityTraits"
          name="personalityTraits"
          value={fishFormData.personalityTraits}
          onChange={handleFishFormChange}
          placeholder="Enter personality traits"
          className="w-full"
        />

        <label htmlFor="lastHealthCheck" className="block font-semibold">
          Last Health Check
        </label>
        <Input
          id="lastHealthCheck"
          name="lastHealthCheck"
          type="datetime-local"
          value={fishFormData.lastHealthCheck}
          onChange={handleFishFormChange}
          className="w-full"
        />

        {/* Select Breeds */}
        <label className="block font-semibold">Select Koi Breeds</label>
        <select
          title="Select Koi Breeds"
          multiple
          value={fishFormData.koiBreedIds}
          onChange={handleKoiBreedChange}
          className="block w-full rounded-md border p-2"
        >
          {koiBreeds.map((breed) => (
            <option key={breed.id} value={breed.id}>
              {breed.name}
            </option>
          ))}
        </select>

        {/* Display selected breeds with image and name */}
        {selectedBreeds.length > 0 && (
          <div className="mt-4">
            <h4 className="font-bold">Selected Breeds</h4>
            <div className="mt-2 grid grid-cols-2 gap-4">
              {selectedBreeds.map((breed) => (
                <div key={breed.id} className="flex items-center">
                  {breed.imageUrl ? (
                    <img
                      src={breed.imageUrl}
                      alt={breed.name}
                      className="mr-4 h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="mr-4 h-12 w-12 rounded-full bg-gray-200" />
                  )}
                  <span>{breed.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload New Images */}
        <label htmlFor="imageFile" className="block font-semibold">
          Fish Images
        </label>
        <Input
          id="imageFile"
          type="file"
          onChange={handleImageChange}
          className="w-full"
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

        {/* Save Button */}
        <div className="mt-4 flex space-x-4">
          <Button
            variant="outline"
            onClick={() => router.push("/manager/fish-management")}
          >
            Cancel
          </Button>
          <Button variant="default" onClick={handleSaveFish}>
            Update Koi Fish
          </Button>
        </div>
      </div>
    </div>
  );
}
