"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import KoiCard from "../breed/[breedId]/components/KoiCard";
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
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import koiFishApi, { KoiFish, KoiFishQueryParams } from "@/lib/api/koiFishApi";
import koiBreedApi, { KoiBreed } from "@/lib/api/koiBreedApi";

const ITEMS_PER_PAGE = 9;

const SearchPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState<string>(
    searchParams.get("q") || "",
  );
  const [currentSearchTerm, setCurrentSearchTerm] =
    useState<string>(searchTerm);
  const [sortOption, setSortOption] = useState<string>(
    searchParams.get("sort") || "Name",
  );
  const [selectedBreed, setSelectedBreed] = useState<string>(
    searchParams.get("breed") || "all",
  );
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({
    min: parseInt(searchParams.get("minPrice") || "0"),
    max: parseInt(searchParams.get("maxPrice") || "10000000"),
  });
  const [currentPage, setCurrentPage] = useState<number>(
    parseInt(searchParams.get("page") || "1"),
  );

  const [kois, setKois] = useState<KoiFish[]>([]);
  const [breeds, setBreeds] = useState<KoiBreed[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBreeds = async () => {
      try {
        const response = await koiBreedApi.getAll();
        if (response.isSuccess) {
          setBreeds(response.data);
        }
      } catch (err) {
        console.error("Error fetching breeds:", err);
      }
    };

    fetchBreeds();
  }, []);

  useEffect(() => {
    const fetchKois = async () => {
      setIsLoading(true);
      try {
        let filter = "";
        if (selectedBreed !== "all") {
          filter += `KoiBreeds/any(kb: kb/Id eq ${selectedBreed})`;
        }
        if (searchTerm) {
          filter += filter ? " and " : "";
          filter += `contains(Name, '${searchTerm}')`;
        }
        filter += filter ? " and " : "";
        filter += `Price ge ${priceRange.min} and Price le ${priceRange.max}`;

        const params: KoiFishQueryParams = {
          pageNumber: currentPage,
          pageSize: ITEMS_PER_PAGE,
          sortBy: sortOption,
          searchTerm: filter,
        };

        const response = await koiFishApi.getAvailableKoi(params);

        if (response.isSuccess) {
          setKois(response.data);
          setTotalPages(response.metadata?.totalPages || 1);
        } else {
          setError(response.message);
        }
      } catch (err) {
        setError("An error occurred while fetching data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchKois();
  }, [searchTerm, sortOption, selectedBreed, priceRange, currentPage]);

  const updateQueryParams = (newParams: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    router.push(`/search?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(currentSearchTerm);
    updateQueryParams({ q: currentSearchTerm, page: "1" });
  };

  const handleSortChange = (value: string) => {
    setSortOption(value);
    updateQueryParams({ sort: value, page: "1" });
  };

  const handleBreedChange = (value: string) => {
    setSelectedBreed(value);
    updateQueryParams({ breed: value, page: "1" });
  };

  const handlePriceRangeChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "min" | "max",
  ) => {
    const value = e.target.value;
    setPriceRange((prev) => ({ ...prev, [type]: parseInt(value) || 0 }));
    updateQueryParams({
      [type === "min" ? "minPrice" : "maxPrice"]: value,
      page: "1",
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateQueryParams({ page: page.toString() });
  };

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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="min-h-screen">
      <div className="bg-[url('https://www.kodamakoifarm.com/wp-content/uploads/2024/01/kodama_menu-bg.jpg')]">
        <div className="container mx-auto max-w-6xl">
          <Breadcrumb className="py-4 text-primary">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
                <BreadcrumbSeparator />
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbLink href="/search">Search</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="container mx-auto mt-8 max-w-6xl pb-8">
        <h1 className="mb-6 text-3xl font-bold">Search Results</h1>
        <div className="mb-6 rounded-lg bg-[#F4F0E7] p-6">
          <form
            onSubmit={handleSearchSubmit}
            className="mb-4 flex flex-wrap items-center gap-4"
          >
            <input
              type="text"
              placeholder="Search Koi..."
              value={currentSearchTerm}
              onChange={(e) => setCurrentSearchTerm(e.target.value)}
              className="flex-grow rounded border border-primary bg-white p-2 text-primary"
            />
            <button
              type="submit"
              className="rounded bg-primary px-4 py-2 text-white"
            >
              Search
            </button>
            <Select value={sortOption} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[200px] rounded border border-primary bg-white p-2 text-primary">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-white text-primary">
                <SelectItem value="Name">Name</SelectItem>
                <SelectItem value="Price asc">Price: Low to High</SelectItem>
                <SelectItem value="Price desc">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedBreed} onValueChange={handleBreedChange}>
              <SelectTrigger className="w-[200px] rounded border border-primary bg-white p-2 text-primary">
                <SelectValue placeholder="Select Breed" />
              </SelectTrigger>
              <SelectContent className="bg-white text-primary">
                <SelectItem value="all">All Breeds</SelectItem>
                {breeds.map((breed) => (
                  <SelectItem key={breed.id} value={breed.id.toString()}>
                    {breed.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </form>
          <div className="flex items-center gap-4">
            <span>Price Range (VND):</span>
            <input
              type="number"
              placeholder="Min"
              value={priceRange.min}
              onChange={(e) => handlePriceRangeChange(e, "min")}
              className="w-32 rounded border border-primary bg-white p-2 text-primary"
            />
            <span>-</span>
            <input
              type="number"
              placeholder="Max"
              value={priceRange.max}
              onChange={(e) => handlePriceRangeChange(e, "max")}
              className="w-32 rounded border border-primary bg-white p-2 text-primary"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {kois.map((koi) => (
            <KoiCard key={koi.id} koi={koi} />
          ))}
        </div>
        {/* Pagination */}
        <div className="mt-8 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                {currentPage !== 1 && (
                  <PaginationPrevious
                    onClick={() => handlePageChange(currentPage - 1)}
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
                  />
                )}
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
