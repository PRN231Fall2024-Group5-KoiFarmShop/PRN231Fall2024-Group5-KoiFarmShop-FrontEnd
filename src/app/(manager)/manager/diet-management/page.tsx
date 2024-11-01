"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MoreHorizontalIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import koiDietApi, { KoiDiet } from "@/lib/api/koiDietAPI";
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

export default function KoiDietManagementPage() {
  const [koiDiets, setKoiDiets] = useState<KoiDiet[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDiet, setSelectedDiet] = useState<KoiDiet | null>(null);
  const [dietFormData, setDietFormData] = useState({
    name: "",
    dietCost: 0,
    description: "",
  });
  const [openDietDialog, setOpenDietDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dietToDelete, setDietToDelete] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchKoiDiets();
  }, []);

  const fetchKoiDiets = async () => {
    setLoading(true);
    const response = await koiDietApi.getDietList();
    if (response.isSuccess) {
      const activeDiets = response.data.filter((diet) => !diet.isDeleted);
      const filteredDiets = searchTerm
        ? activeDiets.filter(
            (diet) =>
              diet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              diet.description.toLowerCase().includes(searchTerm.toLowerCase()),
          )
        : activeDiets;
      setKoiDiets(filteredDiets);
    }
    setLoading(false);
  };

  const handleSearch = () => {
    fetchKoiDiets();
  };

  const handleDeleteConfirmation = (id: number) => {
    setDietToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteDiet = async () => {
    if (dietToDelete) {
      const response = await koiDietApi.deleteDiet(dietToDelete);
      if (response.isSuccess) {
        toast({
          title: "Diet deleted successfully",
          description: "The diet has been deleted successfully",
        });
        fetchKoiDiets();
      } else {
        toast({
          title: "Error",
          description: "Failed to delete diet",
          variant: "destructive",
        });
      }
    }
    setDeleteDialogOpen(false);
  };

  const handleOpenDietDialog = (diet: KoiDiet | null = null) => {
    setSelectedDiet(diet);
    if (diet) {
      setDietFormData({
        name: diet.name,
        dietCost: diet.dietCost,
        description: diet.description,
      });
    } else {
      setDietFormData({ name: "", dietCost: 0, description: "" });
    }
    setOpenDietDialog(true);
  };

  const handleCloseDietDialog = () => {
    setOpenDietDialog(false);
    setDietFormData({ name: "", dietCost: 0, description: "" });
  };

  const handleDietFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setDietFormData((prev) => ({
      ...prev,
      [name]: name === "dietCost" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSaveDiet = async () => {
    if (selectedDiet) {
      const response = await koiDietApi.updateDiet(
        selectedDiet.id,
        dietFormData,
      );
      if (response.isSuccess) {
        toast({
          title: "Diet updated successfully",
          description: "The diet has been updated successfully",
        });
      }
    } else {
      const response = await koiDietApi.createDiet(dietFormData);
      if (response.isSuccess) {
        toast({
          title: "Diet created successfully",
          description: "The diet has been created successfully",
        });
      }
    }

    handleCloseDietDialog();
    fetchKoiDiets();
  };

  return (
    <div className="container mx-auto p-4">
      <Toaster />
      <h1 className="mb-4 text-2xl font-bold">Diet Management</h1>

      <div className="mb-4 flex gap-4">
        <div className="flex flex-1 items-center">
          <Input
            type="text"
            placeholder="Search by name or description"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mr-2"
          />
          <Button onClick={handleSearch} variant="outline">
            Search
          </Button>
        </div>

        <Button variant="default" onClick={() => handleOpenDietDialog(null)}>
          <PlusIcon className="mr-2 h-4 w-4" />
          <span>Create Diet</span>
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Cost</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                Loading...
              </TableCell>
            </TableRow>
          ) : (
            koiDiets.map((diet) => (
              <TableRow key={diet.id}>
                <TableCell>{diet.id}</TableCell>
                <TableCell>{diet.name}</TableCell>
                <TableCell>{diet.dietCost}đ</TableCell>
                <TableCell>{diet.description}</TableCell>
                <TableCell>
                  {new Date(diet.createdAt || "").toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontalIcon className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleOpenDietDialog(diet)}
                      >
                        Edit Diet
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteConfirmation(diet.id)}
                        className="text-red-600"
                      >
                        Delete Diet
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Dialog open={openDietDialog} onOpenChange={setOpenDietDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedDiet ? "Update Diet" : "Create Diet"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Input
              id="name"
              name="name"
              value={dietFormData.name}
              onChange={handleDietFormChange}
              placeholder="Enter diet name"
              className="w-full"
            />
            <Input
              id="dietCost"
              name="dietCost"
              type="number"
              value={dietFormData.dietCost}
              onChange={handleDietFormChange}
              placeholder="Enter diet cost"
              className="w-full"
            />
            <Input
              id="description"
              name="description"
              value={dietFormData.description}
              onChange={handleDietFormChange}
              placeholder="Enter diet description"
              className="w-full"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDietDialog}>
              Cancel
            </Button>
            <Button variant="default" onClick={handleSaveDiet}>
              {selectedDiet ? "Update Diet" : "Create Diet"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              diet from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteDiet}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
