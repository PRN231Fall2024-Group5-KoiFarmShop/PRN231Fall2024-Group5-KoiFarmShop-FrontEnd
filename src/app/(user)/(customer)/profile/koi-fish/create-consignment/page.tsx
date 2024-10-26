"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import koiFishApi from "@/lib/api/koiFishApi";
import koiDietApi from "@/lib/api/koiDiet";
import koiBreedApi, { KoiBreed } from "@/lib/api/koiBreedApi";
import consignmentAPI from "@/lib/api/consignmentAPI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

const fishSchema = z.object({
  name: z.string().min(1, "Fish name is required"),
  origin: z.string().min(1, "Origin is required"),
  gender: z.boolean(),
  age: z.number().min(0, "Age must be a positive number"),
  length: z.number().min(0, "Length must be a positive number"),
  weight: z.number().min(0, "Weight must be a positive number"),
  personalityTraits: z.string().optional(),
  dailyFeedAmount: z.number().min(0, "Daily feed amount must be positive"),
  lastHealthCheck: z.string().min(1, "Last health check date is required"),
  koiBreedIds: z
    .array(z.number())
    .min(1, "At least one breed must be selected"),
});

const consignmentSchema = z.object({
  dietId: z.number().min(1, "Diet is required"),
  startDate: z.date(),
  endDate: z.date(),
  note: z.string().optional(),
});

const schema = z.object({
  fish: fishSchema,
  consignment: consignmentSchema,
});

export default function CreateConsignmentPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [koiBreeds, setKoiBreeds] = useState<KoiBreed[]>([]);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      fish: {
        name: "",
        origin: "",
        gender: true,
        age: 0,
        length: 0,
        weight: 0,
        personalityTraits: "",
        dailyFeedAmount: 0,
        lastHealthCheck: "",
        koiBreedIds: [],
      },
      consignment: {
        dietId: 0,
        startDate: new Date(),
        endDate: new Date(),
        note: "",
      },
    },
  });

  const { data: diets, isLoading: isLoadingDiets } = useQuery({
    queryKey: ["diets"],
    queryFn: () => koiDietApi.getDietList(),
  });

  useEffect(() => {
    fetchKoiBreeds();
  }, []);

  const fetchKoiBreeds = async () => {
    const response = await koiBreedApi.getAll();
    if (response.isSuccess) {
      setKoiBreeds(response.data);
    }
  };

  const calculateConsignmentDuration = (startDate: Date, endDate: Date) => {
    return differenceInDays(endDate, startDate) + 1;
  };

  const calculateConsignmentPrice = (
    dietId: number,
    startDate: Date,
    endDate: Date,
  ) => {
    if (!dietId || !startDate || !endDate) return 0;
    const duration = calculateConsignmentDuration(startDate, endDate);
    const diet = diets?.data.find((d) => d.id === dietId);
    if (!diet) return 0;
    return diet.dietCost * duration;
  };

  const handleSaveFish = async (values: z.infer<typeof schema>) => {
    try {
      // Create new koi fish
      const newKoiResponse = await koiFishApi.create({
        ...values.fish,
        personalityTraits: values.fish.personalityTraits || "",
        gender: values.fish.gender ? "Male" : "Female",
        isAvailableForSale: false,
        price: 0,
        isConsigned: true,
        isSold: false,
        koiBreeds: [],
        ownerId: null,
        consignedBy: null,
        koiCertificates: [],
        koiFishImages: [],
        koiDiaries: []
      });

      if (!newKoiResponse.isSuccess) {
        throw new Error(newKoiResponse.message);
      }

      // Create consignment
      const consignmentData = {
        ...values.consignment,
        koiFishId: newKoiResponse.data.id,
        startDate: values.consignment.startDate.toISOString(),
        endDate: values.consignment.endDate.toISOString(),
      };

      const response = await consignmentAPI.createConsignment(consignmentData);
      if (response.isSuccess) {
        toast({
          title: "Success",
          description: "Koi fish and consignment created successfully.",
        });
        router.push("/profile/consignment");
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.message ||
          "Failed to create koi fish and consignment. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoadingDiets) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-6 text-2xl font-bold">
        Create New Koi Fish and Consignment
      </h1>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSaveFish)}
          className="space-y-4"
        >
          <FormField
            control={form.control}
            name="fish.name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fish Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter fish name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fish.origin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Origin</FormLabel>
                <FormControl>
                  <Input placeholder="Enter fish origin" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fish.gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(value === "true")}
                  value={field.value ? "true" : "false"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Male</SelectItem>
                    <SelectItem value="false">Female</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fish.age"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Age</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter fish age"
                    {...field}
                    onChange={(e) => field.onChange(+e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fish.length"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Length (cm)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter fish length (cm)"
                    {...field}
                    onChange={(e) => field.onChange(+e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fish.weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Weight (g)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter fish weight (g)"
                    {...field}
                    onChange={(e) => field.onChange(+e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fish.dailyFeedAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Daily Feed Amount (g)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter daily feed amount (g)"
                    {...field}
                    onChange={(e) => field.onChange(+e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fish.lastHealthCheck"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Health Check</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fish.koiBreedIds"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Koi Breeds</FormLabel>
                <Select
                  onValueChange={(value) =>
                    field.onChange([...field.value, parseInt(value)])
                  }
                  value={(field.value[field.value.length - 1] as string)?.toString()}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select breeds" />
                  </SelectTrigger>
                  <SelectContent>
                    {koiBreeds.map((breed) => (
                      <SelectItem key={breed.id} value={breed.id.toString()}>
                        {breed.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="mt-2">
                  {field.value.map((breedId) => (
                    <span
                      key={breedId}
                      className="mr-2 inline-block rounded-full bg-gray-200 px-3 py-1 text-sm font-semibold text-gray-700"
                    >
                      {koiBreeds.find((b) => b.id === breedId)?.name}
                      <button
                        type="button"
                        onClick={() =>
                          field.onChange(
                            field.value.filter((id) => id !== breedId),
                          )
                        }
                        className="ml-2 text-red-500"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="consignment.dietId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select Diet</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  value={field.value?.toString()}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a diet" />
                  </SelectTrigger>
                  <SelectContent>
                    {diets?.data.map((diet) => (
                      <SelectItem key={diet.id} value={diet.id.toString()}>
                        {diet.name} - {formatPriceVND(diet.dietCost)}/day
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="consignment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Consignment Period</FormLabel>
                <DateRangePicker
                  dateRange={{
                    from: field.value.startDate,
                    to: field.value.endDate,
                  }}
                  onDateRangeChange={(range) => {
                    if (range?.from && range?.to) {
                      field.onChange({
                        ...field.value,
                        startDate: range.from,
                        endDate: range.to,
                      });
                    }
                  }}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="consignment.note"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Note (optional)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Add a note for this consignment"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <p>
              Duration:{" "}
              {calculateConsignmentDuration(
                form.watch("consignment.startDate"),
                form.watch("consignment.endDate"),
              )}{" "}
              days
            </p>
            <p>
              Estimated Price:{" "}
              {formatPriceVND(
                calculateConsignmentPrice(
                  form.watch("consignment.dietId"),
                  form.watch("consignment.startDate"),
                  form.watch("consignment.endDate"),
                ),
              )}
            </p>
          </div>

          <Button type="submit">Create Koi Fish and Consignment</Button>
        </form>
      </Form>
    </div>
  );
}
