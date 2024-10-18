"use client";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import koiFishApi, { KoiFish } from "@/lib/api/koiFishApi";
import Image from "next/image";
import { useEffect, useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import BuyingGuide from "./components/BuyingGuide";
import PolicyGuide from "./components/PolicyGuide";

import { addToCart } from "@/lib/cart";
import { useToast } from "@/hooks/use-toast";
import { formatPriceVND, formatDate } from "@/lib/utils";

const KoiDetailPage = ({ params }: { params: { koiId: string } }) => {
  const { koiId } = params;
  const [isOpen, setIsOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [koiDetails, setKoiDetails] = useState<KoiFish | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchKoiDetails = async () => {
      try {
        const response = await koiFishApi.getById(parseInt(koiId));
        if (response.isSuccess) {
          setKoiDetails(response.data);
        } else {
          setError(response.message);
        }
      } catch (err) {
        setError("An error occurred while fetching koi details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchKoiDetails();
  }, [koiId]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error || !koiDetails) {
    return <div>Error: {error || "Koi details not found"}</div>;
  }

  const breeds = koiDetails.koiBreeds.map((breed) => breed.name).join(", ");

  const handleAddToCart = () => {
    if (koiDetails) {
      addToCart(koiDetails);
      toast({
        title: "Added to cart",
        description: `${koiDetails.name} has been added to your cart.`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-[url('https://www.kodamakoifarm.com/wp-content/uploads/2024/01/kodama_menu-bg.jpg')]">
        <div className="container mx-auto max-w-6xl">
          <Breadcrumb className="py-4 text-primary">
            <BreadcrumbList>
              <BreadcrumbItem className="text-primary">
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
                <BreadcrumbSeparator />
              </BreadcrumbItem>
              <BreadcrumbItem className="text-primary">
                <BreadcrumbLink href="/search">Koi Fish</BreadcrumbLink>
                <BreadcrumbSeparator />
              </BreadcrumbItem>
              <BreadcrumbItem className="text-primary">
                <BreadcrumbLink href={`/breed/${koiDetails.koiBreeds[0]?.id}`}>
                  {breeds}
                </BreadcrumbLink>
                <BreadcrumbSeparator />
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbLink href={`/koi/${koiId}`}>
                  {koiDetails.name}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="container mx-auto mt-8 max-w-6xl">
        <div className="flex flex-col gap-8 md:flex-row">
          {/* Left column - Image Carousel */}
          <div className="md:w-1/2">
            <div className="relative w-full pb-[100%]">
              <Image
                src={
                  koiDetails.koiFishImages[photoIndex]?.imageUrl ||
                  "/koi-farm-generic-koi-thumbnail.jpg"
                }
                alt={koiDetails.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="cursor-pointer object-contain"
                onClick={() => setIsOpen(true)}
              />
            </div>
            <div className="mt-4 flex gap-2">
              {koiDetails.koiFishImages.map((image, index) => (
                <div
                  key={index}
                  className={`relative h-20 w-20 cursor-pointer overflow-hidden rounded-md ${
                    index === photoIndex ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setPhotoIndex(index)}
                >
                  <Image
                    src={image.imageUrl}
                    alt={`${koiDetails.name} thumbnail ${index + 1}`}
                    fill
                    sizes="80px"
                    className="object-contain"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Right column - Details */}
          <div className="md:w-1/2">
            <h1 className="mb-4 text-2xl font-bold text-primary">
              {koiDetails.name}
            </h1>
            <p className="mb-4 text-xl font-semibold">
              Price: {formatPriceVND(koiDetails.price)}
            </p>
            <div className="mb-4 rounded-lg bg-[#F9F5EC] p-4">
              <p>{koiDetails.personalityTraits}</p>
            </div>
            <div className="space-y-2">
              <p>
                <strong>Origin:</strong> {koiDetails.origin}
              </p>
              <p>
                <strong>Gender:</strong> {koiDetails.gender}
              </p>
              <p>
                <strong>Age:</strong> {koiDetails.age} years
              </p>
              <p>
                <strong>Size:</strong> {koiDetails.length} cm
              </p>
              <p>
                <strong>Weight:</strong> {koiDetails.weight} g
              </p>
              <p>
                <strong>Breed(s):</strong> {breeds}
              </p>
              <p>
                <strong>Date of Birth:</strong>
                {koiDetails.dob ? formatDate(koiDetails.dob) : "N/A"}
              </p>
            </div>
            <Button
              className="mt-6 bg-red-600 text-white hover:bg-red-700"
              disabled={!koiDetails.isAvailableForSale}
              onClick={handleAddToCart}
            >
              {koiDetails.isAvailableForSale ? "Add to Cart" : "Not Available"}
            </Button>
          </div>
        </div>

        {/* Tabbed section */}
        <div className="mb-6 mt-12">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="description">
                Detailed Description
              </TabsTrigger>
              <TabsTrigger value="breed">Fish Breed</TabsTrigger>
              <TabsTrigger value="certificates">Certificates</TabsTrigger>
              <TabsTrigger value="policy">Policy</TabsTrigger>
              <TabsTrigger value="purchaseGuide">Purchase Guide</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="mt-4">
              <div className="min-h-[300px] rounded-lg bg-[#F9F5EC] p-6">
                <h3 className="mb-4 text-xl font-semibold">
                  Detailed Description
                </h3>
                <p>{koiDetails.personalityTraits}</p>
                {/* Add more details as needed */}
              </div>
            </TabsContent>
            <TabsContent value="breed" className="mt-4">
              <div className="min-h-[300px] rounded-lg bg-[#F9F5EC] p-6">
                <h3 className="mb-4 text-xl font-semibold">
                  About {breeds} Koi
                </h3>
                {koiDetails.koiBreeds.map((breed, index) => (
                  <div key={breed.id} className={index > 0 ? "mt-4" : ""}>
                    <h4 className="mb-2 text-lg font-semibold">{breed.name}</h4>
                    <p>{breed.content}</p>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="certificates" className="mt-4">
              <div className="min-h-[300px] rounded-lg bg-[#F9F5EC] p-6">
                <h3 className="mb-4 text-xl font-semibold">Koi Certificates</h3>
                {koiDetails.koiCertificates.length > 0 ? (
                  <div className="flex flex-row flex-wrap gap-4">
                    {koiDetails.koiCertificates.map((cert) => (
                      <div
                        key={cert.id}
                        className="flex flex-col items-center gap-2"
                      >
                        <p className="text-center font-semibold">
                          {cert.certificateType}
                        </p>
                        <div className="relative h-[300px] w-[300px] overflow-hidden rounded-lg">
                          <Image
                            src={cert.certificateUrl}
                            alt={`${cert.certificateType} Certificate`}
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            style={{ objectFit: "contain" }}
                          />
                        </div>
                        <a
                          href={cert.certificateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          View Full Certificate
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No certificates available for this koi.</p>
                )}
              </div>
            </TabsContent>
            <TabsContent value="policy" className="mt-4">
              <div className="min-h-[300px] rounded-lg bg-[#F9F5EC] p-6">
                <PolicyGuide />
              </div>
            </TabsContent>
            <TabsContent value="purchaseGuide" className="mt-4">
              <div className="min-h-[300px] rounded-lg bg-[#F9F5EC] p-6">
                <BuyingGuide />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Lightbox
        open={isOpen}
        close={() => setIsOpen(false)}
        slides={koiDetails.koiFishImages.map((image) => ({
          src: image.imageUrl,
        }))}
        plugins={[Thumbnails, Zoom]}
        index={photoIndex}
        on={{
          view: ({ index }) => setPhotoIndex(index),
        }}
      />
    </div>
  );
};

export default KoiDetailPage;
