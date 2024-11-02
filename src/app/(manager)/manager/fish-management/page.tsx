"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import koiFishApi, {
  KoiFish,
  KoiFishManagerQueryParams,
} from "@/lib/api/koiFishApi";
import koiBreedApi, { KoiBreed } from "@/lib/api/koiBreedApi";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PencilIcon,
  PlusIcon,
  TrashIcon,
  EyeIcon,
  TableIcon,
  LayoutGridIcon,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import Image from "next/image";

export default function KoiFishManagementPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [koiFishes, setKoiFishes] = useState<KoiFish[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [viewMode, setViewMode] = useState<"table" | "gallery">("gallery");
  const [searchTerm, setSearchTerm] = useState("");
  const [koiBreeds, setKoiBreeds] = useState<KoiBreed[]>([]);
  const [selectedBreed, setSelectedBreed] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("");
  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    isAvailableForSale: "",
    isSold: "",
    isConsigned: "",
    showFarmOwned: true,
  });
  const [pageSize] = useState(6); // Fixed page size
  const [allKoiFish, setAllKoiFish] = useState<KoiFish[]>([]); // Store all fish
  const [pageLoading, setPageLoading] = useState(false);

  useEffect(() => {
    fetchKoiBreeds();
    fetchAllKoiFish();
  }, [searchTerm, selectedBreed, sortBy, filters]); // Remove currentPage from dependencies

  const fetchKoiBreeds = async () => {
    const response = await koiBreedApi.getAll();
    if (response.isSuccess) {
      setKoiBreeds(response.data);
    }
  };

  const fetchAllKoiFish = async () => {
    setLoading(true);
    const queryParams: KoiFishManagerQueryParams = {
      searchTerm: searchTerm || undefined,
      koiBreedId: selectedBreed ? parseInt(selectedBreed) : undefined,
      sortBy: sortBy || undefined,
      minPrice: filters.minPrice ? parseInt(filters.minPrice) : undefined,
      maxPrice: filters.maxPrice ? parseInt(filters.maxPrice) : undefined,
      isAvailableForSale: filters.isAvailableForSale
        ? filters.isAvailableForSale === "true"
        : undefined,
      isSold: filters.isSold ? filters.isSold === "true" : undefined,
      isConsigned: filters.isConsigned
        ? filters.isConsigned === "true"
        : undefined,
      showFarmOwned: filters.showFarmOwned,
    };

    const response = await koiFishApi.getKoiFishForManager(queryParams);
    if (response.isSuccess) {
      setAllKoiFish(response.data);
      setTotalPages(Math.ceil(response.data.length / pageSize));
    }
    setLoading(false);
  };

  const handleDeleteFish = async (id: number) => {
    try {
      await koiFishApi.delete(id);
      toast({
        title: "Success",
        description: "Koi fish deleted successfully",
      });
      fetchAllKoiFish();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete koi fish",
        variant: "destructive",
      });
    }
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

  const handlePageChange = async (newPage: number) => {
    setPageLoading(true);
    setCurrentPage(newPage);

    // Add delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    setPageLoading(false);
  };

  const getCurrentPageItems = (): KoiFish[] => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return allKoiFish.slice(startIndex, endIndex);
  };

  const handleCertificateManagement = (fishId: number) => {
    router.push(`/manager/fish-management/${fishId}/certificate`);
  };

  const renderTableView = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fish</TableHead>
          <TableHead>Breed</TableHead>
          <TableHead>Origin</TableHead>
          <TableHead>Gender</TableHead>
          <TableHead>Length (cm)</TableHead>
          <TableHead>Weight (g)</TableHead>
          <TableHead>Price (VND)</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {getCurrentPageItems().map((fish) => (
          <TableRow key={fish.id}>
            <TableCell className="flex items-center gap-2">
              {fish.koiFishImages?.[0]?.imageUrl?.length > 0 &&
                fish.koiFishImages?.[0]?.imageUrl?.startsWith("https://") && (
                  <Image
                    src={fish.koiFishImages?.[0]?.imageUrl}
                    alt={fish.name}
                    width={50}
                    height={50}
                  />
                )}
              {fish.name}
            </TableCell>
            <TableCell>
              {fish.koiBreeds.map((breed) => breed.name).join(", ")}
            </TableCell>
            <TableCell>{fish.origin}</TableCell>
            <TableCell>{fish.gender}</TableCell>
            <TableCell>{fish.length}</TableCell>
            <TableCell>{fish.weight}</TableCell>
            <TableCell>{fish.price}</TableCell>
            <TableCell>
              {fish.isAvailableForSale
                ? "For Sale"
                : fish.isSold
                  ? "Sold"
                  : fish.isConsigned
                    ? "Consigned"
                    : "Not Available"}
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleViewDetails(fish.id)}>
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleEditFish(fish.id)}>
                    Edit Fish
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleCertificateManagement(fish.id)}
                  >
                    Manage Certificates
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDeleteFish(fish.id)}>
                    Delete Fish
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderGalleryView = () => (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {getCurrentPageItems().map((fish) => (
        <div
          key={fish.id}
          className="rounded-lg border bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="mb-4 flex items-start justify-between">
            <h3 className="text-lg font-bold">{fish.name}</h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleViewDetails(fish.id)}>
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleEditFish(fish.id)}>
                  Edit Fish
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleCertificateManagement(fish.id)}
                >
                  Manage Certificates
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDeleteFish(fish.id)}>
                  Delete Fish
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="mb-4 aspect-video w-full">
            {fish.koiFishImages.length > 0 ? (
              <img
                src={fish.koiFishImages[0].imageUrl}
                alt={fish.name}
                className="h-full w-full rounded-md object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded bg-gray-300 dark:bg-gray-700">
                <svg
                  className="h-10 w-10 text-gray-200 dark:text-gray-600"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 18"
                >
                  <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z" />
                </svg>
              </div>
            )}
          </div>
          <div>
            <p>
              <strong>Origin:</strong> {fish.origin}
            </p>
            <p>
              <strong>Gender:</strong> {fish.gender}
            </p>
            <p>
              <strong>DoB:</strong>{" "}
              {fish.dob ? new Date(fish.dob).toLocaleDateString() : "N/A"}
            </p>
            <p>
              <strong>Price:</strong> {fish.price || "N/A"} VND
            </p>
          </div>
        </div>
      ))}
    </div>
  );

  // Add this function to get page numbers
  const getPageNumbers = () => {
    const pageNumbers = [];
    const totalPageNumbers = 5;

    if (totalPages <= totalPageNumbers) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      let startPage = Math.max(
        1,
        currentPage - Math.floor(totalPageNumbers / 2),
      );
      let endPage = Math.min(totalPages, startPage + totalPageNumbers - 1);

      if (endPage - startPage + 1 < totalPageNumbers) {
        startPage = Math.max(1, endPage - totalPageNumbers + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      if (startPage > 1) {
        pageNumbers.unshift("...");
      }
      if (endPage < totalPages) {
        pageNumbers.push("...");
      }
    }

    return pageNumbers;
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Koi Fishes</h2>
          <div className="flex items-center gap-2">
            <Button
              variant={filters.showFarmOwned ? "default" : "outline"}
              onClick={() =>
                setFilters((prev) => ({ ...prev, showFarmOwned: true }))
              }
            >
              Farm Owned
            </Button>
            <Button
              variant={!filters.showFarmOwned ? "default" : "outline"}
              onClick={() =>
                setFilters((prev) => ({ ...prev, showFarmOwned: false }))
              }
            >
              Customer Owned
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "outline"}
              onClick={() => setViewMode("table")}
              size="icon"
            >
              <TableIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "gallery" ? "default" : "outline"}
              onClick={() => setViewMode("gallery")}
              size="icon"
            >
              <LayoutGridIcon className="h-4 w-4" />
            </Button>
            <Button variant="default" onClick={handleCreateFish}>
              <PlusIcon className="mr-2 h-4 w-4" />
              Create Koi Fish
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Input
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select value={selectedBreed} onValueChange={setSelectedBreed}>
            <SelectTrigger>
              <SelectValue placeholder="Select breed" />
            </SelectTrigger>
            <SelectContent>
              {/* <SelectItem value="">All Breeds</SelectItem> */}
              {koiBreeds.map((breed) => (
                <SelectItem key={breed.id} value={breed.id.toString()}>
                  {breed.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {/* <SelectItem value="">Default</SelectItem> */}
              <SelectItem value="Price asc">Price (Low to High)</SelectItem>
              <SelectItem value="Price desc">Price (High to Low)</SelectItem>
              <SelectItem value="Name asc">Name (A-Z)</SelectItem>
              <SelectItem value="Name desc">Name (Z-A)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading || pageLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(pageSize)].map((_, i) => (
            <Skeleton key={i} className="h-60 w-full rounded-md bg-gray-300" />
          ))}
        </div>
      ) : viewMode === "table" ? (
        renderTableView()
      ) : (
        renderGalleryView()
      )}

      {!loading && allKoiFish.length > 0 && (
        <div className="mt-8 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                {currentPage !== 1 && (
                  <PaginationPrevious
                    onClick={() => handlePageChange(currentPage - 1)}
                    // disabled={pageLoading}
                  />
                )}
              </PaginationItem>
              {getPageNumbers().map((pageNumber, index) => (
                <PaginationItem key={index}>
                  {pageNumber === "..." ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      onClick={() => handlePageChange(pageNumber as number)}
                      isActive={currentPage === pageNumber}
                      // disabled={pageLoading}
                    >
                      {pageNumber}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}
              <PaginationItem>
                {currentPage !== totalPages && (
                  <PaginationNext
                    onClick={() => handlePageChange(currentPage + 1)}
                    // disabled={pageLoading}
                  />
                )}
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
