"use client";
import React, { useState, ChangeEvent, useEffect } from "react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import InfoSection from "./components/InfoSection";
import FAQSection from "./components/FAQSection";
import KoiCard from "./components/KoiCard";
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
import koiFishApi, {
  KoiFishOdata,
  KoiFishQueryParams,
  KoiFish,
} from "@/lib/api/koiFishApi";
import koiBreedApi from "@/lib/api/koiBreedApi";

const ITEMS_PER_PAGE = 9;

const KoiBreedShowcasePage = ({ params }: { params: { breedId: string } }) => {
  const { breedId } = params;

  const [breed, setBreed] = useState<any>(null);
  const [kois, setKois] = useState<KoiFish[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortOption, setSortOption] = useState<string>("newest");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  useEffect(() => {
    const fetchBreedAndKois = async () => {
      try {
        // Fetch breed details
        const breedResponse = await koiBreedApi.getById(parseInt(breedId));
        if (breedResponse.isSuccess) {
          setBreed(breedResponse.data);
        } else {
          setError(breedResponse.message);
        }

        // Fetch available kois for this breed
        const koiParams: KoiFishQueryParams = {
          koiBreedId: parseInt(breedId),
          pageNumber: currentPage,
          pageSize: ITEMS_PER_PAGE,
          searchTerm: searchTerm,
        };
        const koiResponse = await koiFishApi.getAvailableKoiByBreed(koiParams);
        if (koiResponse.isSuccess) {
          setKois(koiResponse.data);
          setTotalPages(koiResponse.metadata?.totalPages || 1);
        } else {
          setError(koiResponse.message);
        }
      } catch (err) {
        setError("An error occurred while fetching data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBreedAndKois();
  }, [breedId, currentPage, searchTerm]);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleSortChange = (value: string) => {
    setSortOption(value);
    setCurrentPage(1); // Reset to first page when sorting
  };

  const filteredKois = kois.filter((koi) =>
    koi.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const sortedKois = [...filteredKois].sort((a, b) => {
    switch (sortOption) {
      case "newest":
        return (
          new Date(b.modifiedAt ?? b.createdAt ?? "").getTime() -
          new Date(a.modifiedAt ?? a.createdAt ?? "").getTime()
        );
      case "price-low-high":
        return a.price - b.price;
      case "price-high-low":
        return b.price - a.price;
      default:
        return 0;
    }
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error || !breed) {
    return <div>Error: {error || "Breed not found"}</div>;
  }

  // Static FAQ data
  const staticFAQs = [
    {
      question: "What are the ideal living conditions for this koi breed?",
      answer:
        "This koi breed thrives in well-maintained ponds with a pH between 6.8-8.2, temperature range of 59-77°F (15-25°C), and good filtration. They require ample space to swim and grow, with at least 250 gallons of water per adult koi.",
    },
    {
      question: "How often should I feed this koi breed?",
      answer:
        "Feed your koi 2-4 times a day during warm months, and reduce feeding to once a day or every other day during colder months. Always provide an amount they can consume within 5 minutes to prevent overfeeding and water pollution.",
    },
    {
      question: "What is the average lifespan of this koi breed?",
      answer:
        "With proper care and optimal living conditions, this koi breed can live between 25-35 years. Some exceptional specimens have been known to live even longer, up to 50 years or more in rare cases.",
    },
  ];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Function to generate page numbers
  const getPageNumbers = () => {
    const pageNumbers = [];
    const totalPageNumbers = 5; // Adjust this number to show more or fewer page numbers

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
    <div className="min-h-screen">
      <div className="bg-[url('https://www.kodamakoifarm.com/wp-content/uploads/2024/01/kodama_menu-bg.jpg')]">
        <div className="container mx-auto max-w-6xl">
          <Breadcrumb className="py-4 text-primary">
            <BreadcrumbList>
              <BreadcrumbItem className="text-primary">
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
                <BreadcrumbSeparator />
              </BreadcrumbItem>
              <BreadcrumbItem className="text-primary">
                <BreadcrumbLink href="/breeds">Breeds</BreadcrumbLink>
                <BreadcrumbSeparator />
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbLink href={`/breed/${breedId}`}>
                  {breed.name}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="container mx-auto mt-2 max-w-6xl pb-8">
        <div className="flex flex-col gap-4 rounded-xl border-2 border-[#F4F0E7] p-6">
          {/* Info Section */}
          <InfoSection title={breed.name} description={breed.content} />

          {/* FAQ Section with static data */}
          <FAQSection faqs={staticFAQs} />
        </div>
        {/* Koi List Section */}
        <div className="koi-list-section mt-8">
          <div className="mb-4 flex items-center justify-between gap-8">
            <input
              type="text"
              placeholder="Search Koi..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="rounded border border-primary bg-white p-2 text-primary"
            />
            <Select value={sortOption} onValueChange={handleSortChange}>
              <SelectTrigger className="max-w-[200px] rounded border border-primary bg-white p-2 text-primary">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-white text-primary">
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-low-high">
                  Price: Low to High
                </SelectItem>
                <SelectItem value="price-high-low">
                  Price: High to Low
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {kois.map((koi) => (
              <KoiCard key={koi.id} koi={koi} />
            ))}
          </div>
          {/* Pagination */}
          <div className="mt-8 flex justify-center">
            <Pagination className="cursor-default">
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
    </div>
  );
};

export default KoiBreedShowcasePage;
