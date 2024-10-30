"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";

import requestForSaleApi, {
  RequestForSale,
  REQUEST_FOR_SALE_STATUS,
} from "@/lib/api/requestForSaleAPI";
import { useToast } from "@/hooks/use-toast";

function RequestForSalePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [requests, setRequests] = useState<RequestForSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RequestForSale | null>(
    null,
  );

  const fetchRequests = async (params: {
    pageNumber?: number;
    searchTerm?: string;
    status?: string;
  }) => {
    setLoading(true);
    try {
      const response = await requestForSaleApi.getMyRequestForSales({
        pageNumber: params.pageNumber || 1,
        pageSize: 10,
        searchTerm: params.searchTerm,
        status: params.status,
        sortBy: "CreatedAt desc",
      });
      setRequests(response.value);
      const totalCount = response["@odata.count"] || response.value.length;
      setTotalPages(Math.ceil(totalCount / 10));
    } catch (err) {
      setError("An error occurred while fetching requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests({
      pageNumber: currentPage,
      searchTerm,
      status: selectedStatus,
    });
  }, [currentPage, selectedStatus]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchRequests({ pageNumber: 1, searchTerm, status: selectedStatus });
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING":
        return "bg-yellow-500";
      case "APPROVED":
        return "bg-green-500";
      case "REJECTED":
        return "bg-red-500";
      case "CANCELED":
        return "bg-gray-500";
      default:
        return "bg-blue-500";
    }
  };

  const handleViewKoi = (koiFishId: number) => {
    router.push(`/profile/koi-fish/${koiFishId}/detail`);
  };

  const handleCancelRequest = async () => {
    if (!selectedRequest) return;

    try {
      const response = await requestForSaleApi.cancel(selectedRequest.id);
      if (response.isSuccess) {
        toast({
          title: "Success",
          description: "Request canceled successfully",
        });
        // Refresh the requests list
        fetchRequests({
          pageNumber: currentPage,
          searchTerm,
          status: selectedStatus,
        });
      } else {
        toast({
          title: "Error",
          description: response.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel request",
        variant: "destructive",
      });
    } finally {
      setCancelDialogOpen(false);
      setSelectedRequest(null);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">My Sale Requests</h1>

      <div className="mb-4 flex gap-4">
        {/* <div className="flex w-1/2 flex-1 items-center">
          <Input
            type="text"
            placeholder="Search by note"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mr-2"
          />
          <Button onClick={handleSearch} variant="outline">
            Search
          </Button>
        </div> */}

        {/* <Select value={selectedStatus} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(REQUEST_FOR_SALE_STATUS).map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select> */}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Request ID</TableHead>
            <TableHead>Koi Fish</TableHead>
            <TableHead>Price Offered ($)</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Last Modified</TableHead>
            <TableHead>Note</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id}>
              <TableCell>{request.id}</TableCell>
              <TableCell>
                {request.koiFish ? (
                  <div>
                    <div>{request.koiFish.name}</div>
                    <div className="text-sm text-gray-500">
                      {request.koiFish.gender} • {request.koiFish.length}cm •{" "}
                      {request.koiFish.weight}g
                    </div>
                  </div>
                ) : (
                  request.koiFishId
                )}
              </TableCell>
              <TableCell>
                {request.priceDealed?.toLocaleString() || "-"}
              </TableCell>
              <TableCell>
                <Badge
                  className={`${getStatusColor(request.requestStatus)} text-white`}
                >
                  {request.requestStatus}
                </Badge>
              </TableCell>
              <TableCell>
                {new Date(request.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {request.modifiedAt
                  ? new Date(request.modifiedAt).toLocaleDateString()
                  : "-"}
              </TableCell>
              <TableCell>{request.note || "-"}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleViewKoi(request.koiFishId)}
                    >
                      View Fish
                    </DropdownMenuItem>
                    {request.requestStatus ===
                      REQUEST_FOR_SALE_STATUS.PENDING && (
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedRequest(request);
                          setCancelDialogOpen(true);
                        }}
                        className="text-red-600"
                      >
                        Cancel Request
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
          {requests.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center">
                No sale requests found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="mt-4 flex justify-center">
        <Pagination>
          <PaginationContent>
            {currentPage > 1 && (
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage(currentPage - 1)}
                />
              </PaginationItem>
            )}

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => setCurrentPage(page)}
                  isActive={currentPage === page}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}

            {currentPage < totalPages && (
              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage(currentPage + 1)}
                />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      </div>

      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this request? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleCancelRequest}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default RequestForSalePage;
