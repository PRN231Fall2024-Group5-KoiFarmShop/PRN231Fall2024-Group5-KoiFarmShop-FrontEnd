"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { uploadImage } from "@/lib/configs/firebase";
import koiCertAPI, {
  CERTIFICATE_TYPES,
  KoiFishCertificate,
  KoiFishCertificateUpdate,
} from "@/lib/api/koiCertAPI";
import koiFishApi, { KoiFish } from "@/lib/api/koiFishApi";
import { Badge } from "@/components/ui/badge";
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
import { Edit, Trash, MoreHorizontal } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type CertificateDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    type: string;
    file?: File | null;
    url?: string;
  }) => Promise<void>;
  title: string;
  description: string;
  initialData?: KoiFishCertificate | null;
  isUpdate?: boolean;
};

function CertificateDialog({
  isOpen,
  onClose,
  onSubmit,
  title,
  description,
  initialData = null,
  isUpdate = false,
}: CertificateDialogProps) {
  const [selectedType, setSelectedType] = useState(
    initialData?.certificateType || "",
  );
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      type: selectedType,
      file: isUpdate ? undefined : file,
      url: initialData?.certificateUrl,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select certificate type" />
                </SelectTrigger>
                <SelectContent>
                  {CERTIFICATE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {!isUpdate && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="file" className="text-right">
                  Certificate
                </Label>
                <Input
                  id="file"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="col-span-3"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={!isUpdate && !file}>
              Save Certificate
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function CertificatePage() {
  const params = useParams();
  const koiId = Number(params.fishId);
  const { toast } = useToast();
  const [koiFish, setKoiFish] = useState<KoiFish | null>(null);
  const [certificates, setCertificates] = useState<KoiFishCertificate[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [selectedCertificate, setSelectedCertificate] =
    useState<KoiFishCertificate | null>(null);
  const [certificateToDelete, setCertificateToDelete] = useState<number | null>(
    null,
  );

  const router = useRouter();

  useEffect(() => {
    fetchKoiFish();
    fetchCertificates();
  }, [koiId]);

  const fetchKoiFish = async () => {
    const response = await koiFishApi.getById(koiId);
    if (response.isSuccess && response.data) {
      setKoiFish(response.data);
    }
  };

  const fetchCertificates = async () => {
    const response = await koiCertAPI.getByKoiFishId(koiId);
    if (response.isSuccess) {
      setCertificates(response.data);
    }
  };

  const handleAdd = async (data: {
    type: string;
    file?: File | null;
    url?: string;
  }) => {
    if (!data.file) return;

    try {
      const imageUrl = await uploadImage(data.file);
      const response = await koiCertAPI.create({
        koiFishId: koiId,
        certificateType: data.type,
        certificateUrl: imageUrl,
      });

      if (response.isSuccess) {
        toast({
          title: "Success",
          description: "Certificate added successfully",
        });
        fetchCertificates();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add certificate",
        variant: "destructive",
      });
    }
    setIsAddDialogOpen(false);
  };

  const handleUpdate = async (data: {
    type: string;
    file?: File | null;
    url?: string;
  }) => {
    if (!selectedCertificate) return;

    try {
      const response = await koiCertAPI.update(selectedCertificate.id, {
        certificateType: data.type,
        certificateUrl: data.url!,
      });

      if (response.isSuccess) {
        toast({
          title: "Success",
          description: "Certificate updated successfully",
        });
        fetchCertificates();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update certificate",
        variant: "destructive",
      });
    }
    setIsUpdateDialogOpen(false);
    setSelectedCertificate(null);
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await koiCertAPI.delete(id);
      if (response.isSuccess) {
        toast({
          title: "Success",
          description: "Certificate deleted successfully",
        });
        fetchCertificates();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete certificate",
        variant: "destructive",
      });
    }
  };

  const isCurrentlyConsigned = () => {
    if (!koiFish?.consignments || koiFish.consignments.length === 0)
      return false;

    return koiFish.consignments.some(
      (consignment) => consignment.consignmentStatus.toUpperCase() === "ACTIVE",
    );
  };

  return (
    <div className="container mx-auto p-4">
      {/* Add Breadcrumb Navigation */}
      <div className="mb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/manager">Manager</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/manager/fish-management">
                Fish Management
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/manager/fish-management/${koiId}`}>
                {koiFish?.name || "Koi Details"}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Certificates</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Koi Fish Summary Section */}
      {koiFish && (
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
                      router.push(`/profile/koi-fish/${koiId}/consignment`)
                    }
                    disabled={isCurrentlyConsigned()}
                  >
                    Consign Koi
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
                  {koiFish.koiBreeds.map((breed) => (
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
      )}

      {/* Certificates Header */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Certificates</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          Add Certificate
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {certificates.map((cert) => (
          <Card key={cert.id}>
            <CardContent className="p-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-semibold">{cert.certificateType}</h3>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedCertificate(cert);
                      setIsUpdateDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setCertificateToDelete(cert.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Image
                src={cert.certificateUrl}
                alt={cert.certificateType}
                width={300}
                height={200}
                className="rounded-lg object-cover"
              />
            </CardContent>
          </Card>
        ))}
      </div>

      <CertificateDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={handleAdd}
        title="Add Certificate"
        description="Upload a new certificate for your koi fish."
        isUpdate={false}
      />

      <CertificateDialog
        isOpen={isUpdateDialogOpen}
        onClose={() => {
          setIsUpdateDialogOpen(false);
          setSelectedCertificate(null);
        }}
        onSubmit={handleUpdate}
        title="Update Certificate"
        description="Update the certificate type."
        initialData={selectedCertificate}
        isUpdate={true}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={certificateToDelete !== null}
        onOpenChange={() => setCertificateToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              certificate.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (certificateToDelete) {
                  handleDelete(certificateToDelete);
                  setCertificateToDelete(null);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
