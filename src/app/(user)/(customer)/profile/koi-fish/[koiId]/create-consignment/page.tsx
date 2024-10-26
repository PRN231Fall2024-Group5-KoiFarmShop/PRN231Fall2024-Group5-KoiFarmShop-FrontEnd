"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import koiFishApi from "@/lib/api/koiFishApi";
import koiDietApi from "@/lib/api/koiDiet";
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

function KoiFishCreateConsignment() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const koiFishId = Number(params.koiId);

  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedDietId, setSelectedDietId] = useState<number>(0);
  const [note, setNote] = useState<string>("");

  const { data: koiFish, isLoading: isLoadingKoi } = useQuery({
    queryKey: ["koiFish", koiFishId],
    queryFn: () => koiFishApi.getById(koiFishId),
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
        router.push("/profile/consignment");
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

  if (isLoadingKoi || isLoadingDiets) {
    return <div>Loading...</div>;
  }

  if (!koiFish?.data || !diets?.data) {
    return <div>Error loading data</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">
        Create Consignment for {koiFish.data.name}
      </h1>
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
          <p>Estimated Price: {formatPriceVND(calculateConsignmentPrice())}</p>
        </div>
        <Button type="submit">Create Consignment</Button>
      </form>
    </div>
  );
}

export default KoiFishCreateConsignment;
