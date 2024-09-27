'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import koiFishApi from '@/lib/api/koiFishApi';
import { Toaster } from '@/components/ui/toaster';

export default function KoiFishDetailsPage() {
  const router = useRouter();
  const { fishId } = useParams(); // Fetch fishId from the slug
  const [fishDetails, setFishDetails] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchFishDetails();
  }, [fishId]);

  const fetchFishDetails = async () => {
    setLoading(true);
    const response = await koiFishApi.getById(+fishId);
    if (response.isSuccess) {
      setFishDetails(response.data);
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Toaster />
      <h1 className="text-2xl font-bold mb-6">{fishDetails?.name} - Details</h1>

      {/* Tabs for Information and Others */}
      <Tabs defaultValue="information">
        <TabsList>
          <TabsTrigger value="information">Information</TabsTrigger>
          <TabsTrigger value="others">Others</TabsTrigger>
        </TabsList>

        {/* Information Tab */}
        <TabsContent value="information">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Fish Basic Details */}
            <div>
              <h3 className="font-semibold">Fish Name</h3>
              <p>{fishDetails?.name}</p>
            </div>
            <div>
              <h3 className="font-semibold">Origin</h3>
              <p>{fishDetails?.origin}</p>
            </div>
            <div>
              <h3 className="font-semibold">Gender</h3>
              <p>{fishDetails?.gender ? 'Male' : 'Female'}</p>
            </div>
            <div>
              <h3 className="font-semibold">Age</h3>
              <p>{fishDetails?.age} years</p>
            </div>
            <div>
              <h3 className="font-semibold">Length</h3>
              <p>{fishDetails?.length} cm</p>
            </div>
            <div>
              <h3 className="font-semibold">Weight</h3>
              <p>{fishDetails?.weight} g</p>
            </div>
            <div>
              <h3 className="font-semibold">Personality Traits</h3>
              <p>{fishDetails?.personalityTraits}</p>
            </div>
            <div>
              <h3 className="font-semibold">Daily Feed Amount</h3>
              <p>{fishDetails?.dailyFeedAmount} g</p>
            </div>
            <div>
              <h3 className="font-semibold">Last Health Check</h3>
              <p>{new Date(fishDetails?.lastHealthCheck).toLocaleString()}</p>
            </div>

            {/* Additional Fields */}
            <div>
              <h3 className="font-semibold">Price</h3>
              <p>{fishDetails?.price ? `${fishDetails.price} VND` : 'Not available'}</p>
            </div>
            <div>
              <h3 className="font-semibold">Available for Sale</h3>
              <p>{fishDetails?.isAvailableForSale ? 'Yes' : 'No'}</p>
            </div>
            <div>
              <h3 className="font-semibold">Sold</h3>
              <p>{fishDetails?.isSold ? 'Yes' : 'No'}</p>
            </div>
          </div>

          {/* Display Associated Breeds */}
          <div className="mt-6">
            <h2 className="text-xl font-bold mb-4">Associated Breeds</h2>
            {fishDetails?.koiBreeds?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {fishDetails.koiBreeds.map((breed: any) => (
                  <div key={breed.name} className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">{breed.name}</h3>
                    {breed.imageUrl ? (
                      <img src={breed.imageUrl} alt={breed.name} className="w-full h-40 object-cover rounded-md mb-2" />
                    ) : (
                      <div className="w-full h-40 bg-gray-200 rounded-md mb-2"></div>
                    )}
                    <p className="text-gray-600">{breed.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p>No associated breeds available.</p>
            )}
          </div>

          {/* Display Fish Images */}
          <div className="mt-6">
            <h2 className="text-xl font-bold mb-4">Fish Images</h2>
            {fishDetails?.koiFishImages?.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {fishDetails.koiFishImages.map((image: string, index: number) => (
                  <img key={index} src={image} alt={`Koi Fish ${index}`} className="w-full h-40 object-cover rounded-md" />
                ))}
              </div>
            ) : (
              <p>No images available for this fish.</p>
            )}
          </div>
        </TabsContent>

        {/* Others Tab */}
        <TabsContent value="others">
          <div className="text-gray-500">This tab is currently empty.</div>
        </TabsContent>
      </Tabs>

      <div className="mt-6">
        <Button variant="outline" onClick={() => router.push('/manager/fish-management')}>
          Back to List
        </Button>
      </div>
    </div>
  );
}
