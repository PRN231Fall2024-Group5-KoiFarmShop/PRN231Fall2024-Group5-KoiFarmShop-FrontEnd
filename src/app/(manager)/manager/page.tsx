'use client'

import { toast } from "@/hooks/use-toast";
import {
  createUser,
  deleteUser,
  fetchUserList,
  getUserById,
  updateUser
} from "@/lib/api/userAPI";
import { uploadImage } from "@/lib/configs/firebase";
import { UserCreateDTO, UserResponseDTO } from "@/types/user";
import React, { useEffect, useState } from "react";

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
      Manager
    </div>
  );
}
