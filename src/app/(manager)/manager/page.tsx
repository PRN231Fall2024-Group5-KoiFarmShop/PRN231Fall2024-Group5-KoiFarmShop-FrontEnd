"use client";

import { Button } from "@/components/ui/button";
import { Table } from "@/components/ui/table";
import { useEntities, useEntity } from "@/lib/react-query-utils";
import { useState } from "react";
import { User } from "./user-management/_lib/userSchema";

const url = "https://localhost:8081/api/v1/";
const table = "users";

export default function ManagerPage() {
  const { entities } = useEntities<User>("users", `${url}${table}`);
  const [selectedId, setSelectedId] = useState<string | null>(null);

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
                  {/* <Button onClick={() => handleDelete(user.id)}>Delete</Button> */}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}