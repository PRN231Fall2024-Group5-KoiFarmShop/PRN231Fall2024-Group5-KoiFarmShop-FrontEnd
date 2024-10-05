'use client';

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PencilIcon, TrashIcon, PlusIcon } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { uploadImage } from "@/lib/configs/firebase";
import userApi, { User } from "@/lib/api/userAPI";
import { Skeleton } from "@/components/ui/skeleton";

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // For loading skeleton
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userFormData, setUserFormData] = useState<any>({
    email: "",
    password: "",
    fullName: "",
    dob: "",
    phoneNumber: "",
    imageUrl: "",
    address: "",
    roleName: "CUSTOMER", // Default role
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [openUserDialog, setOpenUserDialog] = useState(false);

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
      setUserFormData({
        email: user.email,
        password: "", // Not updating password unless explicitly set
        fullName: user.fullName,
        dob: user.dob,
        phoneNumber: user.phoneNumber,
        imageUrl: user.imageUrl || "",
        address: user.address,
        roleName: user.roleName,
      });
      setImagePreview(user.imageUrl || "");
    } else {
      setUserFormData({
        email: "",
        password: "",
        fullName: "",
        dob: "",
        phoneNumber: "",
        imageUrl: "",
        address: "",
        roleName: "CUSTOMER",
      });
      setImagePreview(null);
    }
    setOpenUserDialog(true);
  };

  const handleCloseUserDialog = () => {
    setOpenUserDialog(false);
    setImagePreview(null);
  };

  const handleUserFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserFormData((prev:any) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSaveUser = async () => {
    let imageUrl = userFormData.imageUrl;

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
        });
        return;
      }
    }

    if (selectedUser) {
      await userApi.update(selectedUser.id, {
        ...userFormData,
        imageUrl,
      });
      toast({
        title: "User updated successfully",
        description: "The user has been updated successfully",
      });
    } else {
      await userApi.create({
        ...userFormData,
        imageUrl,
      });
      toast({
        title: "User created successfully",
        description: "The user has been created successfully",
      });
    }

    handleCloseUserDialog();
    fetchUsers();
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
      
      {/* Loading skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="w-full h-60 bg-gray-300 rounded-md" />
          ))}
        </div>
      ) : (
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="w-full bg-gray-100">
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Full Name</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Email</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Phone Number</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Role</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-gray-200 hover:bg-gray-50">
                <td className="px-6 py-4">{user.fullName}</td>
                <td className="px-6 py-4">{user.email}</td>
                <td className="px-6 py-4">{user.phoneNumber}</td>
                <td className="px-6 py-4">{user.roleName}</td>
                <td className="px-6 py-4 flex space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleOpenUserDialog(user)}
                    className="w-8 h-8"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDeleteUser(user.id)}
                    className="w-8 h-8"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Dialog open={openUserDialog} onOpenChange={setOpenUserDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedUser ? "Update User" : "Create User"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Input
              id="fullName"
              name="fullName"
              value={userFormData.fullName}
              onChange={handleUserFormChange}
              placeholder="Enter full name"
              className="w-full"
            />
            <Input
              id="email"
              name="email"
              value={userFormData.email}
              onChange={handleUserFormChange}
              placeholder="Enter email"
              className="w-full"
            />
            {!selectedUser && (
              <Input
                id="password"
                name="password"
                type="password"
                value={userFormData.password}
                onChange={handleUserFormChange}
                placeholder="Enter password"
                className="w-full"
              />
            )}
            <Input
              id="dob"
              name="dob"
              type="date"
              value={userFormData.dob}
              onChange={handleUserFormChange}
              className="w-full"
            />
            <Input
              id="phoneNumber"
              name="phoneNumber"
              value={userFormData.phoneNumber}
              onChange={handleUserFormChange}
              placeholder="Enter phone number"
              className="w-full"
            />
            <Input
              id="address"
              name="address"
              value={userFormData.address}
              onChange={handleUserFormChange}
              placeholder="Enter address"
              className="w-full"
            />
            <label>Role</label>
            <select
              id="roleName"
              name="roleName"
              value={userFormData.roleName}
              onChange={handleUserFormChange}
              className="w-full border p-2 rounded"
            >
              <option value="ADMIN">ADMIN</option>
              <option value="STAFF">STAFF</option>
              <option value="MANAGER">MANAGER</option>
              <option value="CUSTOMER">CUSTOMER</option>
            </select>
            <Input id="imageFile" type="file" onChange={handleImageChange} className="w-full" />
            {imagePreview && (
              <img src={imagePreview} alt="Preview" className="mt-4 w-full h-40 object-cover" />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseUserDialog}>
              Cancel
            </Button>
            <Button variant="default" onClick={handleSaveUser}>
              {selectedUser ? "Update User" : "Create User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
