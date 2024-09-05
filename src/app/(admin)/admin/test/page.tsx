"use client";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  fetchItemList,
  createItem,
  updateItem,
  deleteItem,
  type ItemModel,
} from "@/lib/api/testAPI";
import { useToast } from "@/hooks/use-toast";

export default function TodoList() {
  const queryClient = useQueryClient();
  const [newItemName, setNewItemName] = useState<string>("");
  const [newItemDescription, setNewItemDescription] = useState<string>("");
  const { toast } = useToast();
  // Fetch list of items (todos)
  const { data: items, isLoading } = useQuery({
    queryKey: ["items"],
    queryFn: fetchItemList,
  });

  // Create new todo
  const createMutation = useMutation({
    mutationFn: createItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] }); // Refetch item list
      toast({ title: "Item created!", variant: "default" });
    },
    onError: () => {
      toast({ title: "Failed to create item", variant: "destructive" });
    },
  });

  // Update a todo
  const updateMutation = useMutation({
    mutationFn: updateItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] }); // Refetch item list
      toast({ title: "Item updated!", variant: "default" });
    },
    onError: () => {
      toast({ title: "Failed to update item", variant: "destructive" });
    },
  });

  // Delete a todo
  const deleteMutation = useMutation({
    mutationFn: deleteItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] }); // Refetch item list
      toast({ title: "Item deleted!", variant: "default" });
    },
    onError: () => {
      toast({ title: "Failed to delete item", variant: "destructive" });
    },
  });

  // Handlers for item creation, update, and delete
  const handleCreate = () => {
    if (newItemName && newItemDescription) {
      createMutation.mutate({
        name: newItemName,
        description: newItemDescription,
      });
      setNewItemName("");
      setNewItemDescription("");
    } else {
      toast({
        title: "Name and description cannot be empty",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = (item: ItemModel) => {
    updateMutation.mutate({
      ...item,
      name: prompt("Enter new name", item.name) || item.name,
      description:
        prompt("Enter new description", item.description) || item.description,
    });
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl">Todo List</h1>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Item name"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          className="mr-2 border px-2 py-1"
        />
        <input
          type="text"
          placeholder="Item description"
          value={newItemDescription}
          onChange={(e) => setNewItemDescription(e.target.value)}
          className="mr-2 border px-2 py-1"
        />
        <button
          onClick={handleCreate}
          className="bg-blue-500 px-4 py-2 text-white"
        >
          Add Item
        </button>
      </div>

      <ul>
        {items?.data.map((item: ItemModel) => (
          <li key={item.id} className="mb-2 flex items-center justify-between">
            <div>
              <span className="font-bold">{item.name}</span>: {item.description}
            </div>
            <div>
              <button
                onClick={() => handleUpdate(item)}
                className="mr-2 bg-yellow-500 px-2 py-1 text-white"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="bg-red-500 px-2 py-1 text-white"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
