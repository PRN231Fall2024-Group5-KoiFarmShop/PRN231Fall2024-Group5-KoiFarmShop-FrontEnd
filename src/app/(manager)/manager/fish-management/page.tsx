"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import koiFishApi, { KoiFish } from "@/lib/api/koiFishApi";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@/components/ui/table";
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
    const response = await koiFishApi.getAll({ pageNumber: page });
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
        <div>
          <Table className="min-w-full table-auto leading-normal">
            <TableRow className="bg-gray-100 text-left">
              <TableCell className="p-4">Koi Name</TableCell>
              <TableCell className="p-4">Origin</TableCell>
              <TableCell className="p-4">Gender</TableCell>
              <TableCell className="p-4">Age</TableCell>
              <TableCell className="p-4">Price</TableCell>
              <TableCell className="p-4 text-center">Actions</TableCell>
            </TableRow>
            <TableBody>
              {koiFishes.map((fish) => (
                <TableRow key={fish.id} className="hover:bg-gray-50">
                  <TableCell className="p-4">{fish.name}</TableCell>
                  <TableCell className="p-4">{fish.origin}</TableCell>
                  <TableCell className="p-4">
                    {fish.gender ? "Male" : "Female"}
                  </TableCell>
                  <TableCell className="p-4">{fish.age}</TableCell>
                  <TableCell className="p-4">{fish.price} VND</TableCell>
                  <TableCell className="flex justify-center space-x-2 p-4">
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

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
      )}
    </div>
  );
}
