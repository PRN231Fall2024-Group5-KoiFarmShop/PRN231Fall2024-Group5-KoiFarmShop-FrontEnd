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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import requestForSaleApi, {
  RequestForSale,
  REQUEST_FOR_SALE_STATUS,
} from "@/lib/api/requestForSaleAPI";
import koiFishApi, { KoiFish } from "@/lib/api/koiFishApi";
import { useParams, useRouter } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import Image from "next/image";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const getValidImageUrl = (url: string | null | undefined): string => {
  if (!url) return "/images/no-image.png";
  if (url.startsWith("http") || url.startsWith("/")) return url;
  return `/images/${url}`;
};

// Add this type for the update request
type UpdateRequestData = {
  id: number;
  priceDealed: number;
  note?: string;
};

function KoiFishRequestForSale() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const koiId = Number(params.koiId);

  const [koiFish, setKoiFish] = useState<KoiFish | null>(null);
  const [requests, setRequests] = useState<RequestForSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [priceDealed, setPriceDealed] = useState("");
  const [note, setNote] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<RequestForSale | null>(
    null,
  );
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [requestToCancel, setRequestToCancel] = useState<number | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch koi fish details
      const koiResponse = await koiFishApi.getMyKoiFishDetailById(koiId);
      if (koiResponse.isSuccess) {
        setKoiFish(koiResponse.data);
      }

      // Fetch sale requests for this fish
      const requestsResponse = await requestForSaleApi.getMyRequestForSales({
        koiFishId: koiId,
      });

      console.log(requestsResponse.value.sort((a, b) => b.id - a.id));

      setRequests(requestsResponse.value.sort((a, b) => b.id - a.id));
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [koiId]);

  const handleCreateRequest = async () => {
    if (!priceDealed || isNaN(Number(priceDealed))) {
      toast({
        title: "Error",
        description: "Please enter a valid price",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await requestForSaleApi.create({
        koiFishId: koiId,
        priceDealed: Number(priceDealed),
        userId: 0, // This will be handled by the backend
        note: note.trim() || undefined,
      });

      if (response.isSuccess) {
        toast({
          title: "Success",
          description: "Sale request created successfully",
        });
        setCreateDialogOpen(false);
        setPriceDealed("");
        setNote("");
        fetchData();
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
        description: "Failed to create sale request",
        variant: "destructive",
      });
    }
  };

  const handleUpdateRequest = async () => {
    if (!priceDealed || isNaN(Number(priceDealed))) {
      toast({
        title: "Error",
        description: "Please enter a valid price",
        variant: "destructive",
      });
      return;
    }

    try {
      const updatedNote = newNote.trim()
        ? `${note}\n[${new Date().toLocaleDateString()}] ${newNote.trim()}`
        : note;

      const updateData: UpdateRequestData = {
        id: selectedRequest!.id,
        priceDealed: Number(priceDealed),
        note: updatedNote,
      };

      const response = await requestForSaleApi.update(
        selectedRequest!.id,
        updateData,
      );

      if (response.isSuccess) {
        toast({
          title: "Success",
          description: "Sale request updated successfully",
        });
        setCreateDialogOpen(false);
        setPriceDealed("");
        setNote("");
        setNewNote("");
        setSelectedRequest(null);
        setIsUpdateMode(false);
        fetchData();
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
        description: "Failed to update sale request",
        variant: "destructive",
      });
    }
  };

  const handleReviseRequest = (request: RequestForSale) => {
    setSelectedRequest(request);
    setPriceDealed(request.priceDealed.toString());
    setNote(request.note || "");
    setNewNote("");
    setIsUpdateMode(true);
    setCreateDialogOpen(true);
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

  // Add handleCancelRequest function after handleReviseRequest
  const handleCancelRequest = async () => {
    if (!requestToCancel) return;

    try {
      const response = await requestForSaleApi.cancel(requestToCancel);

      if (response.isSuccess) {
        toast({
          title: "Success",
          description: "Sale request canceled successfully",
        });
        fetchData();
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
        description: "Failed to cancel sale request",
        variant: "destructive",
      });
    } finally {
      setRequestToCancel(null);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!koiFish) return <div>Fish not found</div>;

  const canCreateRequest = requests.every(
    (request) => request.requestStatus === REQUEST_FOR_SALE_STATUS.APPROVED,
  );

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/profile">Profile</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/profile/koi-fish">
                My Koi Fish
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/profile/koi-fish/${koiId}/detail`}>
                {koiFish?.name || "Koi Details"}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Sale Requests</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Koi Fish Information</h2>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() =>
                    router.push(`/profile/koi-fish/${koiId}/detail`)
                  }
                >
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    router.push(`/profile/koi-fish/${koiId}/update`)
                  }
                >
                  Update Koi
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    router.push(`/profile/koi-fish/${koiId}/certificate`)
                  }
                >
                  Manage Certificates
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="space-y-1">
              <Label className="text-muted-foreground">Name</Label>
              <p className="font-medium">{koiFish.name}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground">Breeds</Label>
              <div className="flex flex-wrap gap-1">
                {koiFish.koiBreeds?.map((breed) => (
                  <Badge key={breed.id} variant="secondary">
                    {breed.name}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground">DoB</Label>
              <p className="font-medium">
                {new Date(koiFish.dob!).toLocaleDateString()}
              </p>
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground">Gender</Label>
              <p className="font-medium">{koiFish.gender}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mb-4">
        <Button
          onClick={() => setCreateDialogOpen(true)}
          disabled={!canCreateRequest}
        >
          Create Sale Request
        </Button>
        {!canCreateRequest && (
          <p className="mt-2 text-sm text-gray-500">
            You already have a pending request for this fish
          </p>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Request ID</TableHead>
              <TableHead>Price Offered ($)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Last Modified</TableHead>
              <TableHead>Note</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>{request.id}</TableCell>
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
                <TableCell>
                  {request.modifiedAt
                    ? new Date(request.modifiedAt).toLocaleDateString()
                    : "-"}
                </TableCell>
                <TableCell>{request.note || "-"}</TableCell>
                <TableCell>
                  {request.requestStatus ===
                    REQUEST_FOR_SALE_STATUS.PENDING && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setRequestToCancel(request.id)}
                      className="mr-2"
                    >
                      Cancel
                    </Button>
                  )}
                  {(request.requestStatus ===
                    REQUEST_FOR_SALE_STATUS.REJECTED ||
                    request.requestStatus ===
                      REQUEST_FOR_SALE_STATUS.CANCELED) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReviseRequest(request)}
                    >
                      Revise Request
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {requests.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No sale requests found for this fish
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isUpdateMode ? "Update Sale Request" : "Create Sale Request"}
            </DialogTitle>
            <DialogDescription>
              {isUpdateMode
                ? "Update your offered price and add additional notes for this koi fish."
                : "Enter your offered price and note for this koi fish."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="price" className="text-right">
                Price ($)
              </label>
              <Input
                id="price"
                type="number"
                value={priceDealed}
                onChange={(e) => setPriceDealed(e.target.value)}
                className="col-span-3"
                placeholder="Enter your offered price"
              />
            </div>
            {isUpdateMode ? (
              <>
                <div className="grid grid-cols-4 items-start gap-4">
                  <label className="text-right">Previous Notes</label>
                  <div className="col-span-3 rounded-md border p-2 text-sm">
                    {note || "No previous notes"}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="newNote" className="text-right">
                    Additional Note
                  </label>
                  <Input
                    id="newNote"
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="col-span-3"
                    placeholder="Add new note to this request"
                  />
                </div>
              </>
            ) : (
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="note" className="text-right">
                  Note
                </label>
                <Input
                  id="note"
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="col-span-3"
                  placeholder="Optional note for your request"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCreateDialogOpen(false);
                setIsUpdateMode(false);
                setSelectedRequest(null);
                setPriceDealed("");
                setNote("");
                setNewNote("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={isUpdateMode ? handleUpdateRequest : handleCreateRequest}
            >
              {isUpdateMode ? "Update Request" : "Create Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!requestToCancel}
        onOpenChange={() => setRequestToCancel(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Sale Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this sale request? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, keep request</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelRequest}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, cancel request
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default KoiFishRequestForSale;
