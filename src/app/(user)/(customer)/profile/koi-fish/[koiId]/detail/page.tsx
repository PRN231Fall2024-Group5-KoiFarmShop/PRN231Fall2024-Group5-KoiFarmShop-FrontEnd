"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import koiFishApi, { KoiFish } from "@/lib/api/koiFishApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { formatPriceVND } from "@/lib/utils";

function MyKoiFishDetail() {
  const params = useParams();
  const koiId = Number(params.koiId);
  const [koiFish, setKoiFish] = useState<KoiFish | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchKoiFishDetails = async () => {
      setLoading(true);
      try {
        const response = await koiFishApi.getMyKoiFishDetailById(koiId);
        if (response.isSuccess && response.data) {
          setKoiFish(response.data);
        } else {
          setError(response.message);
        }
      } catch (err) {
        setError("An error occurred while fetching koi fish details.");
      } finally {
        setLoading(false);
      }
    };

    fetchKoiFishDetails();
  }, [koiId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!koiFish) return <div>No koi fish found</div>;

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

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-6 text-3xl font-bold">{koiFish.name} Details</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Koi Fish Information */}
        <Card>
          <CardHeader>
            <CardTitle>Koi Fish Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Image
                src={
                  koiFish.koiFishImages[0]?.imageUrl || "/placeholder-koi.jpg"
                }
                alt={koiFish.name}
                width={300}
                height={200}
                className="rounded-lg"
              />
            </div>
            <p>
              <strong>Name:</strong> {koiFish.name}
            </p>
            <p>
              <strong>Origin:</strong> {koiFish.origin}
            </p>
            <p>
              <strong>Gender:</strong> {koiFish.gender}
            </p>
            <p>
              <strong>Age:</strong> {koiFish.age} years
            </p>
            <p>
              <strong>Length:</strong> {koiFish.length} cm
            </p>
            <p>
              <strong>Weight:</strong> {koiFish.weight} g
            </p>
            <p>
              <strong>Personality Traits:</strong> {koiFish.personalityTraits}
            </p>
            <p>
              <strong>Daily Feed Amount:</strong> {koiFish.dailyFeedAmount} g
            </p>
            <p>
              <strong>Last Health Check:</strong>{" "}
              {new Date(koiFish.lastHealthCheck).toLocaleDateString()}
            </p>
            <p>
              <strong>Price:</strong> {formatPriceVND(koiFish.price)}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              {koiFish.isAvailableForSale
                ? "For Sale"
                : koiFish.isConsigned
                  ? "Consigned"
                  : "Not for Sale"}
            </p>
          </CardContent>
        </Card>

        {/* Breed Information */}
        <Card>
          <CardHeader>
            <CardTitle>Breed Information</CardTitle>
          </CardHeader>
          <CardContent>
            {koiFish.koiBreeds.map((breed) => (
              <div key={breed.id} className="mb-4">
                <h3 className="text-xl font-semibold">{breed.name}</h3>
                <p>{breed.content}</p>
                {breed.imageUrl && (
                  <Image
                    src={breed.imageUrl}
                    alt={breed.name}
                    width={200}
                    height={150}
                    className="mt-2 rounded-lg"
                  />
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Consignment Information */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Consignment History</CardTitle>
          </CardHeader>
          <CardContent>
            {koiFish.consignments && koiFish.consignments.length > 0 ? (
              <div className="space-y-4">
                {koiFish.consignments
                  .sort((a, b) => b.id - a.id)
                  .map((consignment) => (
                    <div key={consignment.id} className="border-b pb-4">
                      <p>
                        <strong>Status:</strong>{" "}
                        <Badge
                          className={`${getConsignmentStatusColor(consignment.consignmentStatus)} text-white`}
                        >
                          {consignment.consignmentStatus}
                        </Badge>
                      </p>
                      <p>
                        <strong>Start Date:</strong>{" "}
                        {new Date(consignment.startDate).toLocaleDateString()}
                      </p>
                      <p>
                        <strong>End Date:</strong>{" "}
                        {new Date(consignment.endDate).toLocaleDateString()}
                      </p>
                      <p>
                        <strong>Diet ID:</strong> {consignment.dietId}
                      </p>
                      <p>
                        <strong>Diet Cost:</strong>{" "}
                        {formatPriceVND(consignment.dietCost)}/day
                      </p>
                      <p>
                        <strong>Total Days:</strong> {consignment.totalDays}
                      </p>
                      <p>
                        <strong>Projected Cost:</strong>{" "}
                        {formatPriceVND(consignment.projectedCost)}
                      </p>
                      {consignment.actualCost && (
                        <p>
                          <strong>Actual Cost:</strong>{" "}
                          {formatPriceVND(consignment.actualCost)}
                        </p>
                      )}
                      {consignment.note && (
                        <p>
                          <strong>Note:</strong> {consignment.note}
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            ) : (
              <p>No consignment history available.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default MyKoiFishDetail;
