"use client";

import withdrawnRequestAPI, { WithdrawnRequest } from '@/lib/api/withdrawRequestAPI';
import { uploadImage } from '@/lib/configs/firebase';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from 'date-fns';
import { formatPriceVND } from "@/lib/utils"; // Assuming this utility formats VND properly

export default function WithdrawnPage() {
  const [requests, setRequests] = useState<WithdrawnRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<WithdrawnRequest | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [viewDetailsDialog, setViewDetailsDialog] = useState(false);
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

  // Function to open dialog to view details (imageUrl)
  const openDetailsDialog = (request: WithdrawnRequest) => {
    setSelectedRequest(request);
    setViewDetailsDialog(true);
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
      const response = await withdrawnRequestAPI.approveWithdrawnRequest(selectedRequest.id, imageUrl);

      if (response.isSuccess) {
        toast.success(`Request ID ${selectedRequest.id} approved successfully!`);
        setRequests((prevRequests) =>
          prevRequests.map((req) => req.id === selectedRequest.id ? { ...req, status: 'Approved', imageUrl } : req)
        );
      } else {
        toast.error(`Failed to approve request ID ${selectedRequest.id}`);
      }
      setOpenDialog(false);
    } catch (error) {
      toast.error(`Error approving request ID ${selectedRequest.id}`);
    }
  };

  // Function to handle rejection
  const handleReject = async () => {
    if (!selectedRequest) {
      return;
    }

    try {
      const response = await withdrawnRequestAPI.rejectWithdrawnRequest(selectedRequest.id, "Rejected by admin");

      if (response.isSuccess) {
        toast.error(`Request ID ${selectedRequest.id} rejected`);
        setRequests((prevRequests) =>
          prevRequests.map((req) => req.id === selectedRequest.id ? { ...req, status: 'Rejected' } : req)
        );
      } else {
        toast.error(`Failed to reject request ID ${selectedRequest.id}`);
      }
      setOpenDialog(false);
    } catch (error) {
      toast.error(`Error rejecting request ID ${selectedRequest.id}`);
    }
  };

  // Function to render styled status
  const renderStatus = (status: string) => {
    let color = "bg-gray-300"; // Default gray
    if (status === "Approved") color = "bg-green-100 text-green-700";
    else if (status === "Rejected") color = "bg-red-100 text-red-700";
    else if (status === "Pending") color = "bg-yellow-100 text-yellow-700";

    return <span className={`px-2 py-1 rounded-md ${color}`}>{status}</span>;
  };

  // Separate pending and processed requests
  const pendingRequests = requests.filter(request => request.status === 'Pending').sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const processedRequests = requests.filter(request => request.status !== 'Pending').sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-semibold mb-4">Pending Withdrawn Requests</h1>
      
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <>
          {/* Pending Requests */}
          <table className="min-w-full table-auto bg-white shadow-md rounded-lg mb-6">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Bank Note</th>
                <th className="px-4 py-2 text-left">Amount</th>
                <th className="px-4 py-2 text-left">Request Date</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingRequests.map((request) => (
                <tr key={request.id} className="border-b">
                  <td className="px-4 py-2">{request.id}</td>
                  <td className="px-4 py-2">{request?.user?.email}</td>
                  <td className="px-4 py-2">{request.bankNote}</td>
                  <td className="px-4 py-2">{formatPriceVND(request.amount)}</td>
                  <td className="px-4 py-2">{format(new Date(request.createdAt), "hh:mm dd/MM/yyyy")}</td>
                  <td className="px-4 py-2">{renderStatus(request.status)}</td>
                  <td className="px-4 py-2 flex gap-2">
                    <Button
                      className="bg-blue-500 text-white rounded-lg px-4 py-2"
                      onClick={() => openActionDialog(request)}
                    >
                      Approve/Reject
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Processed Requests */}
          <h1 className="text-2xl font-semibold mb-4">Processed Withdrawn Requests</h1>
          <table className="min-w-full table-auto bg-white shadow-md rounded-lg">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Bank Note</th>
                <th className="px-4 py-2 text-left">Amount</th>
                <th className="px-4 py-2 text-left">Request Date</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {processedRequests.map((request) => (
                <tr key={request.id} className="border-b">
                  <td className="px-4 py-2">{request.id}</td>
                  <td className="px-4 py-2">{request?.user?.email}</td>
                  <td className="px-4 py-2">{request.bankNote}</td>
                  <td className="px-4 py-2">{formatPriceVND(request.amount)}</td>
                  <td className="px-4 py-2">{format(new Date(request.createdAt), "hh:mm dd/MM/yyyy")}</td>
                  <td className="px-4 py-2">{renderStatus(request.status)}</td>
                  <td className="px-4 py-2 flex gap-2">
                    {request.imageUrl && (
                      <Button
                        className="bg-gray-500 text-white rounded-lg px-4 py-2"
                        onClick={() => openDetailsDialog(request)}
                      >
                        View Details
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
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
            <p className="text-lg">Status: {selectedRequest?.status}</p>
            <Input type="file" onChange={handleImageChange} accept="image/*" />
            <div className="flex justify-end gap-4 mt-4">
              <Button className="bg-green-500 text-white" onClick={handleApprove}>Approve</Button>
              <Button className="bg-red-500 text-white" onClick={handleReject}>Reject</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog for Viewing Details (Image) */}
      <Dialog open={viewDetailsDialog} onOpenChange={setViewDetailsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedRequest ? `Details for Request ID ${selectedRequest.id}` : 'Request Details'}</DialogTitle>
          </DialogHeader>
          {selectedRequest?.imageUrl ? (
            <div className="space-y-4">
              <p className="text-lg">Bank Note: {selectedRequest.bankNote}</p>
              <p className="text-lg">Amount: {selectedRequest.amount}</p>
              <p className="text-lg">Status: {selectedRequest.status}</p>
              <img src={selectedRequest.imageUrl} alt="Proof of Approval" className="w-full h-auto rounded-lg shadow-md" />
            </div>
          ) : (
            <p>No image available for this request.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
