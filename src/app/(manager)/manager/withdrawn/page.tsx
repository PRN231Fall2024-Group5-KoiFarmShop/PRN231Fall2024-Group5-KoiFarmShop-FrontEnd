"use client";

import withdrawnRequestAPI, { WithdrawnRequest } from '@/lib/api/withdrawRequestAPI';
import { uploadImage } from '@/lib/configs/firebase';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from 'date-fns';

export default function WithdrawnPage() {
  const [requests, setRequests] = useState<WithdrawnRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<WithdrawnRequest | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  // Fetch withdrawn requests
  useEffect(() => {
    const fetchRequests = async () => {
      setIsLoading(true);
      const response = await withdrawnRequestAPI.getAllWithdrawnRequests();
      if (response.isSuccess && response.data) {
        setRequests(response.data);
      } else {
        toast.error('Failed to fetch withdrawn requests');
      }
      setIsLoading(false);
    };
    fetchRequests();
  }, []);

  // Function to open dialog for approve/reject
  const openActionDialog = (request: WithdrawnRequest) => {
    setSelectedRequest(request);
    setOpenDialog(true);
  };

  // Handle image change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0] || null;
    setFile(uploadedFile);
  };

  // Function to handle approval
  const handleApprove = async () => {
    if (!file || !selectedRequest) {
      toast.error('Please upload an image before approving');
      return;
    }

    try {
      const imageUrl = await uploadImage(file);
      // Call API for approval logic with imageUrl here
      toast.success(`Request ID ${selectedRequest.id} approved successfully!`);
      setOpenDialog(false);
    } catch (error) {
      toast.error(`Failed to approve request ID ${selectedRequest.id}`);
    }
  };

  // Function to handle rejection
  const handleReject = async () => {
    if (selectedRequest) {
      // Call API for rejection logic here
      toast.error(`Request ID ${selectedRequest.id} rejected`);
      setOpenDialog(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-semibold mb-4">Manage Withdrawn Requests</h1>
      
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <table className="min-w-full table-auto bg-white">
          <thead>
            <tr>
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Bank Note</th>
              <th className="px-4 py-2">Amount</th>
              <th className="px-4 py-2">Request Date</th>
              <th className="px-4 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request.id} className="border-b">
                <td className="px-4 py-2">{request.id}</td>
                <td className="px-4 py-2">{request?.user?.email}</td>
                <td className="px-4 py-2">{request.bankNote}</td>
                <td className="px-4 py-2">{request.amount}</td>
                <td className="px-4 py-2">{format(request.createdAt, "hh:mm dd/MM/yyyy")}</td>
                <td className="px-4 py-2 flex gap-2">
                  <Button
                    className="bg-green-500 text-white rounded-lg px-4 py-2"
                    onClick={() => openActionDialog(request)}
                  >
                    Approve/Reject
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Dialog for Approve/Reject */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedRequest ? `Manage Request ID ${selectedRequest.id}` : 'Manage Request'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-lg">Bank Note: {selectedRequest?.bankNote}</p>
            <p className="text-lg">Amount: {selectedRequest?.amount}</p>
            <Input type="file" onChange={handleImageChange} accept="image/*" />
            <div className="flex justify-end gap-4 mt-4">
              <Button className="bg-green-500 text-white" onClick={handleApprove}>Approve</Button>
              <Button className="bg-red-500 text-white" onClick={handleReject}>Reject</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
