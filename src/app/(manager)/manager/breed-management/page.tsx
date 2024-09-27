"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusIcon, PencilIcon, TrashIcon } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { uploadImage } from "@/lib/configs/firebase";
import koiBreedApi, { KoiBreed } from "@/lib/api/koiBreedApi";
import { Skeleton } from "@/components/ui/skeleton"; // Assuming you have a skeleton component

export default function KoiBreedManagementPage() {
  const [koiBreeds, setKoiBreeds] = useState<KoiBreed[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // For loading skeleton
  const [selectedBreed, setSelectedBreed] = useState<KoiBreed | null>(null);
  const [breedFormData, setBreedFormData] = useState({
    name: "",
    content: "",
    imageUrl: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [openBreedDialog, setOpenBreedDialog] = useState(false);

  useEffect(() => {
    fetchKoiBreeds();
  }, []);

  const fetchKoiBreeds = async () => {
    setLoading(true);
    const response = await koiBreedApi.getAll();
    if (response.isSuccess) {
      const activeBreeds = response.data.filter(breed => !breed.isDeleted); // Filter out deleted breeds
      setKoiBreeds(activeBreeds);
    }
    setLoading(false); // Set loading to false after fetch
  };

  const handleDeleteBreed = async (id: number) => {
    await koiBreedApi.delete(id);
    toast({
      title: "Breed deleted successfully",
      description: "The breed has been deleted successfully",
    });
    fetchKoiBreeds();
  };

  const handleOpenBreedDialog = (breed: KoiBreed | null = null) => {
    setSelectedBreed(breed);
    if (breed) {
      setBreedFormData({
        name: breed.name,
        content: breed.content,
        imageUrl: breed.imageUrl || "",
      });
      setImagePreview(breed.imageUrl || "");
    } else {
      setBreedFormData({ name: "", content: "", imageUrl: "" });
      setImagePreview(null);
    }
    setOpenBreedDialog(true);
  };

  const handleCloseBreedDialog = () => {
    setOpenBreedDialog(false);
    setImagePreview(null);
  };

  const handleBreedFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBreedFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSaveBreed = async () => {
    let imageUrl = breedFormData.imageUrl;

    if (imageFile) {
      try {
        imageUrl = await uploadImage(imageFile);
        toast({
          title: "Image uploaded successfully",
          description: "The image has been uploaded successfully",
        });
      } catch (error: any) {
        toast({
          title: "Image upload failed",
          description: error.message,
        });
        return;
      }
    }

    if (selectedBreed) {
      await koiBreedApi.update(selectedBreed.id, {
        ...breedFormData,
        imageUrl,
      });
      toast({
        title: "Breed updated successfully",
        description: "The breed has been updated successfully",
      });
    } else {
      await koiBreedApi.create({
        ...breedFormData,
        imageUrl,
      });
      toast({
        title: "Breed created successfully",
        description: "The breed has been created successfully",
      });
    }

    handleCloseBreedDialog();
    fetchKoiBreeds();
  };

  return (
    <div className="container mx-auto p-4">
      <Toaster />
      <div className="flex items-center justify-between w-full gap-2 mb-6">
        <h2 className="text-2xl font-bold flex-1">Koi Breeds</h2>
        <Button variant="default" onClick={() => handleOpenBreedDialog(null)}>
          <PlusIcon className="w-4 h-4 mr-2" />
          <span>Create Koi Breed</span>
        </Button>
      </div>
      
      {/* Loading skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="w-full h-60 bg-gray-300 rounded-md" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {koiBreeds.map((breed) => (
            <Card key={breed.id} className="w-full">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>{breed.name}</span>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleOpenBreedDialog(breed)}
                    >
                      <PencilIcon className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDeleteBreed(breed.id)}
                    >
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {breed.imageUrl ? (
                  <img
                    src={breed.imageUrl}
                    alt={breed.name}
                    className="mb-4 w-full h-40 object-cover rounded-sm"
                  />
                ) : (
                  <div className="mb-4 w-full h-40 flex items-center justify-center bg-gray-200 text-gray-500 rounded-sm">
                    <span>No Image Available</span>
                  </div>
                )}
                <p className="text-sm text-gray-600 mb-2">{breed.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={openBreedDialog} onOpenChange={setOpenBreedDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedBreed ? "Update Breed" : "Create Breed"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Input
              id="name"
              name="name"
              value={breedFormData.name}
              onChange={handleBreedFormChange}
              placeholder="Enter breed name"
              className="w-full"
            />
            <Input
              id="content"
              name="content"
              value={breedFormData.content}
              onChange={handleBreedFormChange}
              placeholder="Enter breed content"
              className="w-full"
            />
            <Input id="imageFile" type="file" onChange={handleImageChange} className="w-full" />
            {imagePreview && (
              <img src={imagePreview} alt="Preview" className="mt-4 w-full h-40 object-cover" />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseBreedDialog}>
              Cancel
            </Button>
            <Button variant="default" onClick={handleSaveBreed}>
              {selectedBreed ? "Update Breed" : "Create Breed"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
