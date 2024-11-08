"use client";

import { useToast } from '@/hooks/use-toast';
import axiosClient from '@/lib/api/axiosClient';
import React, { useEffect, useState } from 'react';

export default function Page() {
  const { toast } = useToast();
  const [startDate, setStartDate] = useState<string>(
    new Date(Date.now() - 86400000).toISOString().split('T')[0] + 'T00:00:00'
  ); //yesterday
  const [endDate, setEndDate] = useState<string>(
    new Date().toISOString().split('T')[0] + 'T23:59:59'
  ); //today
  const [analyticsData, setAnalyticsData] = useState<{
    totalOrders: number;
    totalRevenue: number;
    ordersByStatus: Record<string, number>;
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchAnalytics = () => {
    setLoading(true);
    axiosClient
      .get(`/WithdrawnRequest/dashboard/analytics?startDate=${startDate}&endDate=${endDate}`)
      .then(res => {
        setAnalyticsData(res.data);
      })
      .catch(err => {
        toast({ title: err.message });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-4">Order Analytics</h1>
      
      <div className="mb-6 flex gap-4">
        <input
          type="datetime-local"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border rounded-md p-2"
          placeholder="Start Date"
        />
        <input
          type="datetime-local"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border rounded-md p-2"
          placeholder="End Date"
        />
        <button 
          onClick={fetchAnalytics} 
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
        >
          {loading ? 'Fetching...' : 'Fetch Data'}
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 rounded-md animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded-md animate-pulse"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded-md animate-pulse"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-20 bg-gray-200 rounded-md animate-pulse"></div>
              <div className="h-20 bg-gray-200 rounded-md animate-pulse"></div>
              <div className="h-20 bg-gray-200 rounded-md animate-pulse"></div>
              <div className="h-20 bg-gray-200 rounded-md animate-pulse"></div>
            </div>
          </div>
        </div>
      ) : analyticsData ? (
        <div className="space-y-4">
          <div className="text-lg font-medium">Total Orders: {analyticsData.totalOrders}</div>
          <div className="text-lg font-medium">Total Revenue: {analyticsData.totalRevenue.toLocaleString()} VND</div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Orders by Status</h2>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(analyticsData.ordersByStatus).map(([status, count]) => (
                <div key={status} className="bg-gray-100 p-4 rounded-lg">
                  <p className="font-medium">{status}</p>
                  <p>{count} orders</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <p>Loading analytics...</p>
      )}
    </div>
  );
}
