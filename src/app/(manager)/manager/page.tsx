'use client'

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon, PencilIcon, TrashIcon } from "lucide-react";
import {
  fetchUserList,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} from "@/lib/api/userAPI";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { UserCreateDTO, UserResponseDTO } from "@/types/user";
import { uploadImage } from "@/lib/configs/firebase";

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserResponseDTO[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserResponseDTO | null>(null);
  const [userFormData, setUserFormData] = useState<UserCreateDTO>({
    email: "",
    password: "",
    fullName: "",
    dob: "",
    phoneNumber: "",
    address: "",
    profilePictureUrl: "" // Add profilePictureUrl to form data
  });
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null); // State for the image file
  const [openUserDialog, setOpenUserDialog] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data } = await fetchUserList();
    setUsers(data.data);
  };

  const handleDeleteUser = async (id: number) => {
    await deleteUser(id);
    toast({
      title: "User deleted successfully",
      description: "The user has been deleted successfully",
    });
    fetchUsers();
  };

  const handleOpenUserDialog = async (user: UserResponseDTO | null = null) => {
    setSelectedUser(user);
    if (user) {
      const { data } = await getUserById(user.id); // Fetch detailed user data
      const details = data.data;
      setUserFormData({
        email: details.email,
        password: "", // Keep password empty for security
        fullName: details.fullName,
        dob: details.dob,
        phoneNumber: details.phoneNumber,
        address: details.address,
        profilePictureUrl: details.profilePictureUrl || "" // Set existing profile picture URL
      });
    } else {
      setUserFormData({
        email: "",
        password: "",
        fullName: "",
        dob: "",
        phoneNumber: "",
        address: "",
        profilePictureUrl: "" // Reset profile picture URL
      });
    }
    setOpenUserDialog(true);
  };

  const handleCloseUserDialog = () => {
    setOpenUserDialog(false);
    setProfilePictureFile(null); // Reset file when dialog is closed
  };

  const handleUserFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePictureFile(file);
      setUserFormData((prev) => ({ ...prev, profilePictureUrl: "" })); // Reset the URL to ensure it's updated after upload
    }
  };

  const handleSaveUser = async () => {
    let profilePictureUrl = userFormData.profilePictureUrl;

    // Upload image if a new file is selected
    if (profilePictureFile) {
      try {
        profilePictureUrl = await uploadImage(profilePictureFile);
      } catch (error) {
        toast({
          title: "Image upload failed",
          description: (error as Error).message,
        });
        return;
      }
    }

    if (selectedUser) {
      await updateUser(selectedUser.id, {
        ...userFormData,
        profilePictureUrl, // Include the uploaded URL
        isActive: true // Assume activation
      });
      toast({
        title: "User updated successfully",
        description: "The user has been updated successfully",
      });
    } else {
      await createUser({ ...userFormData, profilePictureUrl }); // Include the uploaded URL
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
        <h2 className="text-2xl font-bold flex-1">User Management</h2>
        <Button variant="default" onClick={() => handleOpenUserDialog(null)}>
          <PlusIcon className="w-4 h-4 mr-2" />
          <span>Create User</span>
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b">Profile Picture</th>
              <th className="py-2 px-4 border-b">Full Name</th>
              <th className="py-2 px-4 border-b">Email</th>
              <th className="py-2 px-4 border-b">Phone</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">
                  {user.profilePictureUrl ? (
                    <img src={user.profilePictureUrl} alt="Profile" className="w-10 h-10 rounded-full" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-300" />
                  )}
                </td>
                <td className="py-2 px-4 border-b">{user.fullName}</td>
                <td className="py-2 px-4 border-b">{user.email}</td>
                <td className="py-2 px-4 border-b">{user.phoneNumber}</td>
                <td className="py-2 px-4 border-b">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleOpenUserDialog(user)}
                  >
                    <PencilIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dialog for User */}
      <Dialog open={openUserDialog} onOpenChange={setOpenUserDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedUser ? "Update User" : "Create User"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Input
              id="email"
              name="email"
              value={userFormData.email}
              onChange={handleUserFormChange}
              placeholder="Enter email"
              className="w-full"
            />
            <Input
              id="fullName"
              name="fullName"
              value={userFormData.fullName}
              onChange={handleUserFormChange}
              placeholder="Enter full name"
              className="w-full"
            />
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
            <Input
              id="profilePicture"
              name="profilePicture"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full"
            />
            {selectedUser === null && (
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseUserDialog}>Cancel</Button>
            <Button variant="default" onClick={handleSaveUser}>
              {selectedUser ? "Update User" : "Create User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
