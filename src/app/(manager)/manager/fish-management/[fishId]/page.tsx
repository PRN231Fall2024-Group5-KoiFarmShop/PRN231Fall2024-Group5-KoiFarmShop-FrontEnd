'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Toaster } from '@/components/ui/toaster'
import { ReactFbImageGrid } from "@uydev/react-fb-image-grid"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

// Assuming you have a koiFishApi with these methods
import koiFishApi from '@/lib/api/koiFishApi'
import { useToast } from '@/hooks/use-toast'

type Certificate = {
  id: number
  koiFishId: number
  certificateType: string
  certificateUrl: string
}

const certificateSchema = z.object({
  certificateType: z.string().min(1, 'Certificate type is required').max(100, 'Certificate type must be 100 characters or less'),
  certificateUrl: z.string().url('Invalid URL').min(1, 'Certificate URL is required'),
})

type CertificateFormValues = z.infer<typeof certificateSchema>

export default function KoiFishDetailsPage() {
  const {toast} = useToast()
  const router = useRouter()
  const { fishId } = useParams()
  const [fishDetails, setFishDetails] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [certificates, setCertificates] = useState<Certificate[]>([])

  const form = useForm<CertificateFormValues>({
    resolver: zodResolver(certificateSchema),
    defaultValues: {
      certificateType: '',
      certificateUrl: '',
    },
  })

  useEffect(() => {
    fetchFishDetails()
    fetchCertificates()
  }, [fishId])

  const fetchFishDetails = async () => {
    setLoading(true)
    const response = await koiFishApi.getById(+fishId)
    if (response.isSuccess) {
      setFishDetails(response.data)
    }
    setLoading(false)
  }

  const fetchCertificates = async () => {
    const response = await koiFishApi.getCertificates(+fishId)
    if (response.isSuccess) {
      setCertificates(response.data)
    }
  }

  const handleAddCertificate = async (data: CertificateFormValues) => {
    const response = await koiFishApi.addCertificate({
      koiFishId: +fishId,
      ...data
    })
    if (response.isSuccess) {
      toast({
        title: "Success",
        description: "Certificate added successfully",
      })
      fetchCertificates()
      form.reset()
    } else {
      toast({
        title: "Error",
        description: "Failed to add certificate",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div className="container mx-auto p-4">Loading...</div>
  }

  return (
    <div className="container mx-auto p-4">
      <Toaster />
      <h1 className="text-2xl font-bold mb-6">{fishDetails?.name} - Details</h1>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Column - Fish Images */}
        <div className="md:w-1/2">
          <h2 className="text-xl font-bold mb-4">Fish Images</h2>
          {fishDetails?.koiFishImages?.length > 0 ? (
            <ReactFbImageGrid images={fishDetails.koiFishImages.map((image: any) => image?.imageUrl)} className="w-full aspect-square" />
          ) : (
            <p>No images available for this fish.</p>
          )}
        </div>

        {/* Right Column - Fish Details and Tabs */}
        <div className="md:w-1/2">
          <Tabs defaultValue="information">
            <TabsList className="mb-4">
              <TabsTrigger value="information">Information</TabsTrigger>
              <TabsTrigger value="certificate">Certificate</TabsTrigger>
              <TabsTrigger value="others">Others</TabsTrigger>
            </TabsList>

            {/* Information Tab */}
            <TabsContent value="information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <h3 className="font-semibold">Daily Feed Amount</h3>
                  <p>{fishDetails?.dailyFeedAmount} g</p>
                </div>
                <div>
                  <h3 className="font-semibold">Last Health Check</h3>
                  <p>{new Date(fishDetails?.lastHealthCheck).toLocaleString()}</p>
                </div>
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
            </TabsContent>

            {/* Certificate Tab */}
            <TabsContent value="certificate">
              <div className="space-y-4">
                <h2 className="text-xl font-bold">Certificates</h2>
                {certificates.length > 0 ? (
                  certificates.map((cert) => (
                    <Card key={cert.id}>
                      <CardHeader>
                        <CardTitle>{cert.certificateType}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <a href={cert.certificateUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                          View Certificate
                        </a>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p>No certificates available for this fish.</p>
                )}

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleAddCertificate)} className="space-y-4">
                    <h3 className="text-lg font-semibold">Add New Certificate</h3>
                    <FormField
                      control={form.control}
                      name="certificateType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Certificate Type</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="certificateUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Certificate URL</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit">Add Certificate</Button>
                  </form>
                </Form>
              </div>
            </TabsContent>

            {/* Others Tab */}
            <TabsContent value="others">
              <div className="text-gray-500">This tab is currently empty.</div>
            </TabsContent>
          </Tabs>

          <div className="mt-4">
            <Button variant="outline" onClick={() => router.push('/manager/fish-management')}>
              Back to List
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}