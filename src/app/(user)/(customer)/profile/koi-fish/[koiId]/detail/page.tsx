"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import koiFishApi, { KoiFish } from "@/lib/api/koiFishApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { formatPriceVND } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

function MyKoiFishDetail() {
  const params = useParams();
  const koiId = Number(params.koiId);
  const [koiFish, setKoiFish] = useState<KoiFish | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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

  const isCurrentlyConsigned = () => {
    if (!koiFish.consignments || koiFish.consignments.length === 0)
      return false;

    return koiFish.consignments.some(
      (consignment) => consignment.consignmentStatus.toUpperCase() === "ACTIVE",
    );
  };

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
              <BreadcrumbPage>{koiFish?.name || "Koi Details"}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <h1 className="mb-6 text-3xl font-bold">{koiFish?.name} Details</h1>

      <div className="space-y-8">
        {/* Basic Information Section */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Basic Information</h2>
            <Button
              onClick={() => router.push(`/profile/koi-fish/${koiId}/update`)}
              variant="outline"
            >
              Edit
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle>Images</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {koiFish.koiFishImages.map((image, index) => (
                    <Image
                      key={image.id}
                      src={image.imageUrl}
                      alt={`${koiFish.name} ${index + 1}`}
                      width={300}
                      height={200}
                      className="rounded-lg object-cover"
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Details */}
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
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
                  <strong>Date of Birth:</strong>{" "}
                  {new Date(koiFish.dob!).toLocaleDateString()}
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
                  <strong>Daily Feed Amount:</strong> {koiFish.dailyFeedAmount}{" "}
                  g
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
                  <Badge>
                    {koiFish.isAvailableForSale
                      ? "For Sale"
                      : koiFish.isConsigned
                        ? "Consigned"
                        : "Not for Sale"}
                  </Badge>
                </p>
                <Separator className="my-2" />
                <div>
                  <strong>Breeds:</strong>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {koiFish.koiBreeds.map((breed) => (
                      <Badge key={breed.id} variant="secondary">
                        {breed.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Certificates Section */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Certificates</h2>
            <Button
              onClick={() =>
                router.push(`/profile/koi-fish/${koiId}/certificate`)
              }
              variant="outline"
            >
              Manage
            </Button>
          </div>
          <Card>
            <CardContent className="pt-6">
              {koiFish.koiCertificates && koiFish.koiCertificates.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {koiFish.koiCertificates.map((cert: any) => (
                    <div key={cert.Id} className="rounded-lg border p-4">
                      <h3 className="mb-2 text-center font-semibold">
                        {cert.certificateType}
                      </h3>
                      <Image
                        src={cert.certificateUrl}
                        alt={cert.certificateType}
                        width={300}
                        height={200}
                        className="rounded-lg object-cover"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p>No certificates available.</p>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Consignment History Section */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Consignment History</h2>
            <Button
              onClick={() =>
                router.push(`/profile/koi-fish/${koiId}/consignment`)
              }
              variant="outline"
            >
              Manage
            </Button>
          </div>
          <Card>
            <CardContent className="pt-6">
              {koiFish.consignments && koiFish.consignments.length > 0 ? (
                <div className="space-y-4">
                  {koiFish.consignments
                    .sort((a, b) => b.id - a.id)
                    .map((consignment) => (
                      <div
                        key={consignment.id}
                        className="rounded-lg border p-4"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <Badge
                            className={`${getConsignmentStatusColor(
                              consignment.consignmentStatus,
                            )} text-white`}
                          >
                            {consignment.consignmentStatus}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {new Date(
                              consignment.startDate,
                            ).toLocaleDateString()}{" "}
                            -{" "}
                            {new Date(consignment.endDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
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
                        </div>
                        {consignment.note && (
                          <p className="mt-2">
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
        </section>
      </div>
    </div>
  );
}

export default MyKoiFishDetail;
