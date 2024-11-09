"use client";

import React, { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import koiFishApi from "@/lib/api/koiFishApi";
import koiDietApi from "@/lib/api/koiDietAPI";
import consignmentAPI from "@/lib/api/consignmentAPI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DateRange } from "react-day-picker";
import { differenceInDays } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatPriceVND } from "@/lib/utils";
import { DateRangePicker } from "@/app/(user)/(guest)/cart/components/date-range-picker";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

function KoiFishCreateConsignment() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const koiFishId = Number(params.koiId);

  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedDietId, setSelectedDietId] = useState<number>(0);
  const [note, setNote] = useState<string>("");
  const queryClient = useQueryClient();
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  const { data: koiFish, isLoading: isLoadingKoi } = useQuery({
    queryKey: ["koiFish", koiFishId],
    queryFn: () => koiFishApi.getMyKoiFishDetailById(koiFishId),
  });

  const { data: diets, isLoading: isLoadingDiets } = useQuery({
    queryKey: ["diets"],
    queryFn: () => koiDietApi.getDietList(),
  });

  const calculateConsignmentDuration = (dateRange: DateRange | undefined) => {
    if (!dateRange?.from || !dateRange?.to) return 0;
    return differenceInDays(dateRange.to, dateRange.from) + 1;
  };

  const calculateConsignmentPrice = () => {
    if (!selectedDietId || !dateRange) return 0;
    const duration = calculateConsignmentDuration(dateRange);
    const diet = diets?.data.find((d) => d.id === selectedDietId);
    if (!diet) return 0;
    return diet.dietCost * duration;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dateRange?.from || !dateRange?.to || !selectedDietId) {
      toast({
        title: "Incomplete Form",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const consignmentData = {
      koiFishId,
      dietId: selectedDietId,
      startDate: dateRange.from.toISOString(),
      endDate: dateRange.to.toISOString(),
      note: note || undefined,
    };

    try {
      const response = await consignmentAPI.createConsignment(consignmentData);
      if (response.isSuccess) {
        toast({
          title: "Success",
          description: "Consignment created successfully.",
        });
        queryClient.invalidateQueries({ queryKey: ["koiFish", koiFishId] });
        router.push(`/profile/koi-fish/${koiFishId}/detail`);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create consignment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancelConsignment = async () => {
    if (!koiFish?.data?.consignments?.length) return;
    if (!activeConsignment?.data?.id) return;

    try {
      const response = await consignmentAPI.cancelConsignment(
        activeConsignment?.data?.id || 0,
      );
      if (response.isSuccess) {
        toast({
          title: "Success",
          description: "Consignment cancelled successfully.",
        });
        queryClient.invalidateQueries({ queryKey: ["koiFish", koiFishId] });
        router.push(`/profile/koi-fish/${koiFishId}/detail`);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel consignment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConfirmDialogOpen(false);
    }
  };

  const activeConsignment = useMemo(() => {
    if (!koiFish?.data?.consignments?.length) return null;

    // Find the most recent active consignment (PENDING or IN_PROGRESS)
    const activeConsignment = koiFish.data.consignments.find(
      (c) =>
        c.consignmentStatus === "PENDING" ||
        c.consignmentStatus === "IN_PROGRESS",
    );

    if (!activeConsignment) return null;

    return {
      data: {
        id: activeConsignment.id,
        startDate: activeConsignment.startDate,
        endDate: activeConsignment.endDate,
        consignmentStatus: activeConsignment.consignmentStatus,
        totalDays: activeConsignment.totalDays,
        projectedCost: activeConsignment.projectedCost,
        note: activeConsignment.note,
      },
    };
  }, [koiFish?.data?.consignments]);

  if (isLoadingKoi || isLoadingDiets) {
    return <div>Loading...</div>;
  }

  if (!koiFish?.data || !diets?.data) {
    return <div>Error loading data</div>;
  }

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
              <BreadcrumbLink href={`/profile/koi-fish/${koiFishId}/detail`}>
                {koiFish?.data?.name || "Koi Details"}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>
                {activeConsignment
                  ? "Consignment Details"
                  : "Create Consignment"}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {koiFish?.data && (
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
                      router.push(`/profile/koi-fish/${koiFishId}/detail`)
                    }
                  >
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      router.push(`/profile/koi-fish/${koiFishId}/update`)
                    }
                  >
                    Update Koi
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      router.push(`/profile/koi-fish/${koiFishId}/certificate`)
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
                <p className="font-medium">{koiFish.data.name}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Breeds</Label>
                <div className="flex flex-wrap gap-1">
                  {koiFish.data.koiBreeds.map((breed) => (
                    <Badge key={breed.id} variant="secondary">
                      {breed.name}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">DoB</Label>
                <p className="font-medium">
                  {new Date(koiFish.data.dob!).toLocaleDateString()}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Gender</Label>
                <p className="font-medium">{koiFish.data.gender}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <h1 className="mb-4 text-2xl font-bold">Consignment Details</h1>

      {activeConsignment ? (
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Active Consignment</h2>
                <Badge
                  variant={
                    activeConsignment.data.consignmentStatus === "PENDING"
                      ? "secondary"
                      : "default"
                  }
                >
                  {activeConsignment.data.consignmentStatus}
                </Badge>
              </div>
              <div className="grid gap-2">
                <div>
                  <Label className="text-muted-foreground">Period</Label>
                  <p className="font-medium">
                    {new Date(
                      activeConsignment.data.startDate,
                    ).toLocaleDateString()}{" "}
                    -{" "}
                    {new Date(
                      activeConsignment.data.endDate,
                    ).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Total Days</Label>
                  <p className="font-medium">
                    {activeConsignment.data.totalDays} days
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">
                    Projected Cost
                  </Label>
                  <p className="font-medium">
                    {formatPriceVND(activeConsignment.data.projectedCost)}
                  </p>
                </div>
                {activeConsignment.data.note && (
                  <div>
                    <Label className="text-muted-foreground">Note</Label>
                    <p className="font-medium">{activeConsignment.data.note}</p>
                  </div>
                )}
              </div>
              {activeConsignment.data.consignmentStatus === "PENDING" && (
                <AlertDialog
                  open={isConfirmDialogOpen}
                  onOpenChange={setIsConfirmDialogOpen}
                >
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="mt-4">
                      Cancel Consignment
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancel Consignment</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to cancel this consignment? This
                        action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>No, keep it</AlertDialogCancel>
                      <AlertDialogAction onClick={handleCancelConsignment}>
                        Yes, cancel it
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block">Select Diet</label>
            <Select
              value={selectedDietId.toString()}
              onValueChange={(value) => setSelectedDietId(Number(value))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a diet" />
              </SelectTrigger>
              <SelectContent>
                {diets.data.map((diet) => (
                  <SelectItem key={diet.id} value={diet.id.toString()}>
                    {diet.name} - {formatPriceVND(diet.dietCost)}/day
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-2 block">Consignment Period</label>
            <DateRangePicker
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
            />
          </div>
          <div>
            <label className="mb-2 block">Note (optional)</label>
            <Input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note for this consignment"
            />
          </div>
          <div>
            <p>Duration: {calculateConsignmentDuration(dateRange)} days</p>
            <p>
              Estimated Price: {formatPriceVND(calculateConsignmentPrice())}
            </p>
          </div>
          <Button type="submit">Create Consignment</Button>
        </form>
      )}
    </div>
  );
}

export default KoiFishCreateConsignment;
