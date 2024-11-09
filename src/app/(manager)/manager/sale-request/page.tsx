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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import requestForSaleApi, {
  RequestForSale,
  REQUEST_FOR_SALE_STATUS,
} from "@/lib/api/requestForSaleAPI";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, MoreHorizontalIcon } from "lucide-react";
import { Label } from "@/components/ui/label";

interface RejectDialogState {
  open: boolean;
  request: RequestForSale | null;
  reason: string;
}

export default function SaleRequestPage() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<RequestForSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: "approve" | "reject" | null;
    request: RequestForSale | null;
  }>({ open: false, type: null, request: null });
  const [rejectDialog, setRejectDialog] = useState<RejectDialogState>({
    open: false,
    request: null,
    reason: "",
  });

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await requestForSaleApi.getAllRequestForSales({
        pageNumber: currentPage,
        pageSize: 8,
        searchTerm,
        status: selectedStatus,
        sortBy: "ModifiedAt desc",
      });
      setRequests(response.value);
      const totalCount = response["@odata.count"] || response.value.length;
      setTotalPages(Math.ceil(totalCount / 8));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [currentPage, selectedStatus]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchRequests();
  };

  const handleAction = async (type: "approve" | "reject") => {
    if (!confirmDialog.request) return;

    try {
      const response =
        type === "approve"
          ? await requestForSaleApi.approve(confirmDialog.request.id)
          : await requestForSaleApi.reject(
              confirmDialog.request.id,
              rejectDialog.reason,
            );

      if (response.isSuccess) {
        toast({
          title: "Success",
          description: `Request ${type}d successfully`,
        });
        fetchRequests();
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
        description: `Failed to ${type} request`,
        variant: "destructive",
      });
    } finally {
      setConfirmDialog({ open: false, type: null, request: null });
    }
  };

  const handleReject = async () => {
    if (
      !rejectDialog.request
      // || !rejectDialog.reason.trim()
    ) {
      toast({
        title: "Error",
        description: "Please provide a reason for rejection",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await requestForSaleApi.reject(
        rejectDialog.request.id,
        rejectDialog.reason,
      );

      if (response.isSuccess) {
        toast({
          title: "Success",
          description: "Request rejected successfully",
        });
        fetchRequests();
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
        description: "Failed to reject request",
        variant: "destructive",
      });
    } finally {
      setRejectDialog({ open: false, request: null, reason: "" });
    }
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

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">Sale Requests</h1>

      <div className="mb-4 flex gap-4">
        <div className="flex flex-1 items-center">
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
        </div>

        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {/* <SelectItem value="">All Status</SelectItem> */}
            {Object.values(REQUEST_FOR_SALE_STATUS).map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Request ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Koi Fish</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Note</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id}>
              <TableCell>{request.id}</TableCell>
              <TableCell>{request.user?.fullName || request.userId}</TableCell>
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
              <TableCell>{request.priceDealed.toLocaleString()}</TableCell>
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
              <TableCell>{request.note || "-"}</TableCell>
              <TableCell>
                {request.requestStatus === REQUEST_FOR_SALE_STATUS.PENDING && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontalIcon className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() =>
                          setConfirmDialog({
                            open: true,
                            type: "approve",
                            request,
                          })
                        }
                      >
                        Approve Request
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          setRejectDialog({
                            open: true,
                            request,
                            reason: "",
                          })
                        }
                        className="text-red-600"
                      >
                        Reject Request
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </TableCell>
            </TableRow>
          ))}
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

      <Dialog
        open={confirmDialog.open}
        onOpenChange={(open) =>
          setConfirmDialog({ open, type: null, request: null })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmDialog.type === "approve"
                ? "Approve Request"
                : "Reject Request"}
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to{" "}
              {confirmDialog.type === "approve" ? "approve" : "reject"} this
              request?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setConfirmDialog({ open: false, type: null, request: null })
              }
            >
              Cancel
            </Button>
            <Button
              variant={
                confirmDialog.type === "approve" ? "default" : "destructive"
              }
              onClick={() => handleAction(confirmDialog.type!)}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={rejectDialog.open}
        onOpenChange={(open) =>
          setRejectDialog({ open, request: null, reason: "" })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this request.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reason">Reason for Rejection</Label>
              <Input
                id="reason"
                value={rejectDialog.reason}
                onChange={(e) =>
                  setRejectDialog({ ...rejectDialog, reason: e.target.value })
                }
                placeholder="Enter the reason for rejection"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setRejectDialog({ open: false, request: null, reason: "" })
              }
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              // disabled={!rejectDialog.reason.trim()}
            >
              Reject Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
