'use client';

import React, { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { PencilIcon, TrashIcon, PlusIcon, UserIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { uploadImage } from "@/lib/configs/firebase";
import userApi, { User } from "@/lib/api/userAPI";
import { Skeleton } from "@/components/ui/skeleton";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const userSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  dob: z.string().refine((date) => {
    const parsedDate = new Date(date);
    const now = new Date();
    return parsedDate < now && parsedDate > new Date('1900-01-01');
  }, { message: "Please enter a valid date of birth" }),
  phoneNumber: z.string().regex(/^\d{10}$/, "Phone number must be 10 digits"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  roleName: z.enum(["ADMIN", "STAFF", "MANAGER", "CUSTOMER"]),
  imageUrl: z.string().optional(),
});

type UserFormValues = z.infer<typeof userSchema>;

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: "",
      fullName: "",
      dob: "",
      phoneNumber: "",
      address: "",
      roleName: "CUSTOMER",
      imageUrl: "",
    },
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const response = await userApi.getAll();
    if (response.isSuccess) {
      setUsers(response.data);
    }
    setLoading(false);
  };

  const handleDeleteUser = async (id: number) => {
    await userApi.delete(id);
    toast({
      title: "User deleted successfully",
      description: "The user has been deleted successfully",
    });
    fetchUsers();
  };

  const handleOpenUserDialog = (user: User | null = null) => {
    setSelectedUser(user);
    if (user) {
      form.reset({
        email: user.email,
        fullName: user.fullName,
        dob: user.dob,
        phoneNumber: user.phoneNumber,
        address: user.address,
        roleName: user.roleName,
        imageUrl: user.imageUrl || "",
      });
      setImagePreview(user.imageUrl || null);
    } else {
      form.reset({
        email: "",
        fullName: "",
        dob: "",
        phoneNumber: "",
        address: "",
        roleName: "CUSTOMER",
        imageUrl: "",
      });
      setImagePreview(null);
    }
    setOpenUserDialog(true);
  };

  const handleCloseUserDialog = () => {
    setOpenUserDialog(false);
    setImagePreview(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: UserFormValues) => {
    let imageUrl = data.imageUrl || "";

    if (imageFile) {
      try {
        imageUrl = await uploadImage(imageFile);
        toast({
          title: "Image uploaded successfully",
          description: "The image has been uploaded successfully",
        });
      } catch (error: any) {
        toast({
          title: "Image upload failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
    }

    try {
      if (selectedUser) {
        await userApi.update(selectedUser.id, {
          ...data,
          imageUrl,
        });
        toast({
          title: "User updated successfully",
          description: "The user has been updated successfully",
        });
      } else {
        await userApi.create({
          ...data,
          imageUrl,
        });
        toast({
          title: "User created successfully",
          description: "The user has been created successfully",
        });
      }

      handleCloseUserDialog();
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Toaster />
      <div className="flex items-center justify-between w-full gap-2 mb-6">
        <h2 className="text-2xl font-bold flex-1">Users</h2>
        <Button variant="default" onClick={() => handleOpenUserDialog(null)}>
          <PlusIcon className="w-4 h-4 mr-2" />
          <span>Create User</span>
        </Button>
      </div>
      
      {loading ? (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(6)].map((_, i) => (
      <Skeleton key={i} className="w-full h-60 bg-gray-300 rounded-md" />
    ))}
  </div>
) : (
  <div className="overflow-x-auto">
    <table className="min-w-full table-auto border-collapse">
      <thead className="bg-gray-100">
        <tr>
          <th className="border px-4 py-2">Avatar</th>
          <th className="border px-4 py-2">Full Name</th>
          <th className="border px-4 py-2">Email</th>
          <th className="border px-4 py-2">Phone</th>
          <th className="border px-4 py-2">Role</th>
          <th className="border px-4 py-2">Address</th>
          <th className="border px-4 py-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.id} className="bg-white">
            <td className="border px-4 py-2 text-center">
              <Avatar className="w-12 h-12 inline-block">
                <AvatarImage src={user.imageUrl || undefined} />
                <AvatarFallback><UserIcon /></AvatarFallback>
              </Avatar>
            </td>
            <td className="border px-4 py-2">{user.fullName}</td>
            <td className="border px-4 py-2">{user.email}</td>
            <td className="border px-4 py-2">{user.phoneNumber}</td>
            <td className="border px-4 py-2">{user.roleName}</td>
            <td className="border px-4 py-2">{user.address}</td>
            <td className="border px-4 py-2 flex justify-end space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenUserDialog(user)}
              >
                <PencilIcon className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeleteUser(user.id)}
              >
                <TrashIcon className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}


      <Dialog open={openUserDialog} onOpenChange={setOpenUserDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedUser ? "Update User" : "Create User"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex justify-center mb-6">
                <Avatar className="w-32 h-32">
                  <AvatarImage src={imagePreview || form.getValues('imageUrl') || undefined} />
                  <AvatarFallback>{form.getValues('fullName').charAt(0)}</AvatarFallback>
                </Avatar>
              </div>
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {!selectedUser && (
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="dob"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="roleName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormItem>
                <FormLabel>Profile Picture</FormLabel>
                <FormControl>
                  <Input id="imageFile" type="file" onChange={handleImageChange} accept="image/*" />
                </FormControl>
              </FormItem>
              <Button type="submit" className="w-full">
                {selectedUser ? "Update User" : "Create User"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}