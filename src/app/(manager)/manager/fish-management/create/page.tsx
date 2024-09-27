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

export default function CreateKoiFishPage() {
  const router = useRouter();
  const [koiBreeds, setKoiBreeds] = useState<KoiBreed[]>([]); // To store available Koi Breeds
  const [fishFormData, setFishFormData] = useState<any>({
    name: '',
    origin: '',
    gender: '',
    age: 0,
    length: 0,
    weight: 0,
    personalityTraits: '',
    dailyFeedAmount: 0,
    lastHealthCheck: '',
    koiBreedIds: [], // Array of selected KoiBreed IDs
    imageUrl: [], // Array of image URLs
  });
  const [selectedBreeds, setSelectedBreeds] = useState<KoiBreed[]>([]); // For selected breed details
  const [imageFiles, setImageFiles] = useState<File[]>([]); // To hold multiple images
  const [imagePreviews, setImagePreviews] = useState<string[]>([]); // Array of image previews

  useEffect(() => {
    fetchKoiBreeds(); // Fetch Koi Breeds when the component is mounted
  }, []);

  const fetchKoiBreeds = async () => {
    const response = await koiBreedApi.getAll();
    if (response.isSuccess) {
      setKoiBreeds(response.data); // Store the available Koi Breeds
    }
  };

  const handleFishFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFishFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleKoiBreedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions);
    const selectedBreedIds = selectedOptions.map(option => parseInt(option.value));
    setFishFormData((prev: any) => ({ ...prev, koiBreedIds: selectedBreedIds }));

    // Show selected breed information
    const selectedBreeds = koiBreeds.filter(breed => selectedBreedIds.includes(breed.id));
    setSelectedBreeds(selectedBreeds);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      setImageFiles(fileArray);

      const previewUrls = fileArray.map(file => URL.createObjectURL(file));
      setImagePreviews(previewUrls);
    }
  };

  const handleSaveFish = async () => {
    let imageUrlArray = fishFormData.imageUrl;

    if (imageFiles.length > 0) {
      try {
        const uploadedImageUrls = await Promise.all(
          imageFiles.map(file => uploadImage(file))
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
      ...fishFormData,
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
      <h1 className="text-2xl font-bold mb-6">Create Koi Fish</h1>
      <div className="space-y-4">

        {/* Full width fields */}
        <label htmlFor="name" className="block font-semibold">Fish Name</label>
        <Input
          id="name"
          name="name"
          value={fishFormData.name}
          onChange={handleFishFormChange}
          placeholder="Enter fish name"
          className="w-full"
        />

        <label htmlFor="origin" className="block font-semibold">Origin</label>
        <Input
          id="origin"
          name="origin"
          value={fishFormData.origin}
          onChange={handleFishFormChange}
          placeholder="Enter fish origin"
          className="w-full"
        />

        <label htmlFor="gender" className="block font-semibold">Gender</label>
        <Input
          id="gender"
          name="gender"
          value={fishFormData.gender}
          onChange={handleFishFormChange}
          placeholder="Enter fish gender"
          className="w-full"
        />

        {/* Grouped fields (2 or 3 columns for shorter fields) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label htmlFor="age" className="block font-semibold">Age</label>
            <Input
              id="age"
              name="age"
              type="number"
              value={fishFormData.age}
              onChange={handleFishFormChange}
              placeholder="Enter fish age"
              className="w-full"
            />
          </div>
          <div>
            <label htmlFor="length" className="block font-semibold">Length (cm)</label>
            <Input
              id="length"
              name="length"
              type="number"
              value={fishFormData.length}
              onChange={handleFishFormChange}
              placeholder="Enter fish length (cm)"
              className="w-full"
            />
          </div>
          <div>
            <label htmlFor="weight" className="block font-semibold">Weight (g)</label>
            <Input
              id="weight"
              name="weight"
              type="number"
              value={fishFormData.weight}
              onChange={handleFishFormChange}
              placeholder="Enter fish weight (g)"
              className="w-full"
            />
          </div>
          <div>
            <label htmlFor="dailyFeedAmount" className="block font-semibold">Daily Feed Amount (g)</label>
            <Input
              id="dailyFeedAmount"
              name="dailyFeedAmount"
              type="number"
              value={fishFormData.dailyFeedAmount}
              onChange={handleFishFormChange}
              placeholder="Enter daily feed amount (g)"
              className="w-full"
            />
          </div>
          <div>
            <label htmlFor="lastHealthCheck" className="block font-semibold">Last Health Check</label>
            <Input
              id="lastHealthCheck"
              name="lastHealthCheck"
              type="datetime-local"
              value={fishFormData.lastHealthCheck}
              onChange={handleFishFormChange}
              className="w-full"
            />
          </div>
        </div>

        {/* Full width fields */}
        <label htmlFor="personalityTraits" className="block font-semibold">Personality Traits</label>
        <Input
          id="personalityTraits"
          name="personalityTraits"
          value={fishFormData.personalityTraits}
          onChange={handleFishFormChange}
          placeholder="Enter personality traits"
          className="w-full"
        />

        <label className="block font-semibold">Select Koi Breeds</label>
        <select
          multiple
          value={fishFormData.koiBreedIds}
          onChange={handleKoiBreedChange}
          className="block w-full p-2 border rounded-md"
        >
          {koiBreeds.map(breed => (
            <option key={breed.id} value={breed.id}>
              {breed.name}
            </option>
          ))}
        </select>

        {/* Display selected breeds with image and name */}
        {selectedBreeds.length > 0 && (
          <div className="mt-4">
            <h4 className="font-bold">Selected Breeds</h4>
            <div className="grid grid-cols-2 gap-4 mt-2">
              {selectedBreeds.map(breed => (
                <div key={breed.id} className="flex items-center">
                  {breed.imageUrl ? (
                    <img src={breed.imageUrl} alt={breed.name} className="w-12 h-12 object-cover rounded-full mr-4" />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded-full mr-4" />
                  )}
                  <span>{breed.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <label htmlFor="imageFile" className="block font-semibold">Fish Images</label>
        <Input id="imageFile" type="file" onChange={handleImageChange} className="w-full" multiple />
        {imagePreviews.length > 0 && (
          <div className="grid grid-cols-2 gap-4 mt-4">
            {imagePreviews.map((preview, index) => (
              <img key={index} src={preview} alt={`Preview ${index}`} className="w-full h-40 object-cover rounded-sm" />
            ))}
          </div>
        )}

        <div className="flex space-x-4 mt-4">
          <Button variant="outline" onClick={() => router.push('/manager/fish-management')}>
            Cancel
          </Button>
          <Button variant="default" onClick={handleSaveFish}>
            Create Koi Fish
          </Button>
        </div>
      </div>
    </div>
  );
}
