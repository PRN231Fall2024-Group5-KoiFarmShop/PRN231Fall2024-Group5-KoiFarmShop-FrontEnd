"use client";

import { Button } from "@/components/ui/button";
import { Table } from "@/components/ui/table";
import { useEntities, useEntity } from "@/lib/react-query-utils";
import { useState } from "react";

const url = "https://localhost:8081/api/v1/";
const table = "users";

interface Users {
  id: string;
  email: string;
  fullName: string;
  unsignFullName?: string | null;
  dob: string;
  phoneNumber: string;
  profilePictureUrl: string;
  address: string;
  isActive: boolean;
  loyaltyPoints: number;
  isDeleted: boolean;
}

export default function ManagerPage() {
  const { entities } = useEntities<Users>("users", `${url}${table}`);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { entity, add, update, remove } = useEntity<Users>("users", `${url}${table}`, selectedId);

  const [newUser, setNewUser] = useState<Users>({
    id: "0",
    email: "",
    fullName: "",
    unsignFullName: "",
    dob: "",
    phoneNumber: "",
    profilePictureUrl: "",
    address: "",
    isActive: true,
    loyaltyPoints: 0,
    isDeleted: false,
  });

  const handleAdd = () => {
    add.mutate(newUser);
    setNewUser({
      id: "0",
      email: "",
      fullName: "",
      unsignFullName: "",
      dob: "",
      phoneNumber: "",
      profilePictureUrl: "",
      address: "",
      isActive: true,
      loyaltyPoints: 0,
      isDeleted: false,
    });
  };

  const handleUpdate = () => {
    if (selectedId) {
      update.mutate({ ...newUser, id: selectedId });
    }
  };

  const handleDelete = (id: string) => {
    remove.mutate(id);
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Users Manager</h1>

      {entities.isLoading && <p>Loading...</p>}
      {entities.isError && <p>Error loading users</p>}
      {entities.data && (
        <Table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Full Name</th>
              <th>Phone Number</th>
              <th>Address</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {entities?.data?.data.map((user) => (
              <tr key={user.id}>
                <td>{user.email}</td>
                <td>{user.fullName}</td>
                <td>{user.phoneNumber}</td>
                <td>{user.address}</td>
                <td>{user.isActive ? "Yes" : "No"}</td>
                <td>
                  <Button onClick={() => setSelectedId(user.id)}>Edit</Button>
                  <Button onClick={() => handleDelete(user.id)}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}