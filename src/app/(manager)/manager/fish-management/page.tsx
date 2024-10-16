"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import koiFishApi, { KoiFish } from "@/lib/api/koiFishApi";
import { Skeleton } from "@/components/ui/skeleton";
import { PencilIcon, PlusIcon, TrashIcon, EyeIcon } from "lucide-react";

export default function KoiFishManagementPage() {
  const router = useRouter(); // Initialize Next.js router for navigation
  const [koiFishes, setKoiFishes] = useState<KoiFish[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  useEffect(() => {
    fetchKoiFishes(currentPage);
  }, [currentPage]);

  const fetchKoiFishes = async (page: number) => {
    setLoading(true);
    const response = await koiFishApi.getAll({ pageNumber: page, pageSize: 6 });
    if (response.isSuccess) {
      setKoiFishes(response.data);
      setTotalPages(response.metadata?.totalPages || 1);
    }
    setLoading(false);
  };

  const handleDeleteFish = async (id: number) => {
    await koiFishApi.delete(id);
    toast({
      title: "Koi fish deleted successfully",
      description: "The koi fish has been deleted successfully",
    });
    fetchKoiFishes(currentPage);
  };

  const handleViewDetails = (fishId: number) => {
    router.push(`/manager/fish-management/${fishId}`); // Navigate to fish details page
  };

  const handleCreateFish = () => {
    router.push(`/manager/fish-management/create`); // Navigate to create fish page
  };

  const handleEditFish = (fishId: number) => {
    router.push(`/manager/fish-management/${fishId}/update`); // Navigate to update fish page
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="container mx-auto p-4">
      <Toaster />
      <div className="mb-6 flex w-full items-center justify-between gap-2">
        <h2 className="flex-1 text-2xl font-bold">Koi Fishes</h2>
        <Button variant="default" onClick={handleCreateFish}>
          <PlusIcon className="mr-2 h-4 w-4" />
          <span>Create Koi Fish</span>
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-60 w-full rounded-md bg-gray-300" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {koiFishes.map((fish) => (
            <div
              key={fish.id}
              className="border rounded-lg shadow-sm p-4 bg-white hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold">{fish.name}</h3>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEditFish(fish.id)}
                    className="h-8 w-8"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDeleteFish(fish.id)}
                    className="h-8 w-8"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => handleViewDetails(fish.id)}
                    className="h-8 w-8"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="mb-4 w-full aspect-video">
               {
                  fish.koiFishImages.length > 0 ? (
                    <img
                    src={fish.koiFishImages[0].imageUrl}
                    alt={fish.name}
                    className="w-full  h-full object-cover rounded-md" />
                  ) : (
                    <div className="flex items-center justify-center w-full  h-full bg-gray-300 rounded dark:bg-gray-700">
                        <svg className="w-10 h-10 text-gray-200 dark:text-gray-600" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
                            <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z"/>
                        </svg>
                    </div>
                  )
               }
              </div>
              <div>
                <p><strong>Origin:</strong> {fish.origin}</p>
                <p><strong>Gender:</strong> {fish.gender}</p>
                <p><strong>Age:</strong> {fish.age} years</p>
                <p><strong>Price:</strong> {fish.price || "N/A"} VND</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <Button
          variant="outline"
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
        >
          Previous
        </Button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="outline"
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
