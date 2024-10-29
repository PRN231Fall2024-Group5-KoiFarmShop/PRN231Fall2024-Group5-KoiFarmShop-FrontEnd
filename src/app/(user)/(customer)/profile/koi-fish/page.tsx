"use client";

import React, { useEffect, useState } from "react";
import koiFishApi, { KoiFish, KoiFishQueryParams } from "@/lib/api/koiFishApi";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

function MyKoiFishPage() {
  const [koiFishes, setKoiFishes] = useState<KoiFish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchKoiFishes = async (params: KoiFishQueryParams) => {
    setLoading(true);
    try {
      const response = await koiFishApi.getMyKoiFish(params);
      if (response.isSuccess) {
        setKoiFishes(response.data);
        setTotalPages(response.metadata?.totalPages || 1);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError("An error occurred while fetching koi fishes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKoiFishes({ pageNumber: currentPage, pageSize: 10 });
  }, [currentPage]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchKoiFishes({ pageNumber: 1, pageSize: 10, searchTerm });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchKoiFishes({ pageNumber: page, pageSize: 10, searchTerm });
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

  const router = useRouter();

  const handleConsignKoi = (fishId: number) => {
    // Implement consign logic here
    router.push(`/profile/koi-fish/${fishId}/consignment`);
  };

  const handleUpdateKoi = (fishId: number) => {
    // Implement update logic here
    router.push(`/profile/koi-fish/${fishId}/update`);
  };

  const handleViewKoi = (fishId: number) => {
    // Implement view logic here
    router.push(`/profile/koi-fish/${fishId}/detail`);
  };

  const getConsignmentStatus = (fish: KoiFish) => {
    if (!fish.consignments || fish.consignments.length === 0) {
      return "Not Consigned";
    }
    // Assuming the most recent consignment is the last one in the array
    const latestConsignment = fish.consignments[fish.consignments.length - 1];
    return latestConsignment.consignmentStatus;
  };

  const getConsignmentStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING":
        return "bg-yellow-500";
      case "ACTIVE":
        return "bg-green-500";
      case "COMPLETED":
        return "bg-blue-500";
      case "CANCELLED":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">My Koi Fish</h1>
      <div className="mb-4 flex">
        <div className="flex items-center">
          <Input
            type="text"
            placeholder="Search by name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mr-2"
          />
          <Button onClick={handleSearch} variant={"outline"}>
            Search
          </Button>
        </div>
        <Button
          variant="default"
          className="ml-auto"
          onClick={() => router.push("/profile/koi-fish/create")}
        >
          Add Koi
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Breed</TableHead>
            <TableHead>Dob</TableHead>
            <TableHead>Length (cm)</TableHead>
            <TableHead>Weight (g)</TableHead>
            <TableHead>Price ($)</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Consignment Status</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {koiFishes.map((fish) => (
            <TableRow key={fish.id}>
              <TableCell>{fish.name}</TableCell>
              <TableCell>
                {fish.koiBreeds.map((breed) => breed.name).join(", ")}
              </TableCell>
              <TableCell>
                {fish.dob ? new Date(fish.dob).toLocaleDateString() : ""}
              </TableCell>
              <TableCell>{fish.length}</TableCell>
              <TableCell>{fish.weight}</TableCell>
              <TableCell>{fish.price}</TableCell>
              <TableCell>
                {fish.isAvailableForSale
                  ? "For Sale"
                  : fish.isConsigned
                    ? "Consigned"
                    : "Not for Sale"}
              </TableCell>
              <TableCell>
                <Badge
                  className={`${getConsignmentStatusColor(
                    getConsignmentStatus(fish),
                  )} text-white`}
                >
                  {getConsignmentStatus(fish)}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleViewKoi(fish.id)}>
                      View Koi
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleConsignKoi(fish.id)}>
                      Consign Koi
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleUpdateKoi(fish.id)}>
                      Update Koi
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
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
  );
}

export default MyKoiFishPage;
