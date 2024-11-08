"use client";

import { useState, useEffect } from 'react';
import axiosClient from '@/lib/api/axiosClient';

interface FAQ {
  id: number;
  question: string;
  answer: string;
    isDeleted?: boolean;
}

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formData, setFormData] = useState<{ id: number | null; question: string; answer: string }>({
    id: null,
    question: '',
    answer: '',
  });
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Fetch FAQs on component mount
  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get('/faqs');
      //Filter isDeleted = false
        response.data = response.data.filter((faq: FAQ) => !faq.isDeleted);
      setFaqs(response.data);
    } catch (error) {
      console.error("Error fetching FAQs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (isEditing && formData.id !== null) {
      await updateFAQ(formData.id, { question: formData.question, answer: formData.answer });
    } else {
      await createFAQ({ question: formData.question, answer: formData.answer });
    }

    setFormData({ id: null, question: '', answer: '' });
    setIsEditing(false);
    fetchFAQs();
    setSubmitting(false);
  };

  const createFAQ = async (faq: Omit<FAQ, 'id'>) => {
    try {
      await axiosClient.post('/faqs', faq);
    } catch (error) {
      console.error("Error creating FAQ:", error);
    }
  };

  const updateFAQ = async (id: number, faq: Omit<FAQ, 'id'>) => {
    try {
      await axiosClient.put(`/faqs/${id}`, faq);
    } catch (error) {
      console.error("Error updating FAQ:", error);
    }
  };

  const deleteFAQ = async (id: number) => {
    try {
      await axiosClient.delete(`/faqs/${id}`);
      fetchFAQs();
    } catch (error) {
      console.error("Error deleting FAQ:", error);
    }
  };

  const handleEdit = (faq: FAQ) => {
    setFormData({ id: faq.id, question: faq.question, answer: faq.answer });
    setIsEditing(true);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">FAQ Management</h1>
      
      {/* FAQ Form */}
      <form onSubmit={handleFormSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="question">
            Question
          </label>
          <input
            type="text"
            name="question"
            value={formData.question}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="answer">
            Answer
          </label>
          <textarea
            name="answer"
            value={formData.answer}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={submitting}
          >
            {submitting ? "Submitting..." : isEditing ? "Update FAQ" : "Create FAQ"}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setFormData({ id: null, question: '', answer: '' });
              }}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-4"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* FAQ List with Skeleton Loading */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((index) => (
            <div key={index} className="p-4 bg-white shadow rounded animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">ID</th>
                <th className="py-2 px-4 border-b">Question</th>
                <th className="py-2 px-4 border-b">Answer</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {faqs.map((faq) => (
                <tr key={faq.id} className="text-center">
                  <td className="py-2 px-4 border-b">{faq.id}</td>
                  <td className="py-2 px-4 border-b">{faq.question}</td>
                  <td className="py-2 px-4 border-b">{faq.answer}</td>
                  <td className="py-2 px-4 border-b">
                    <button
                      onClick={() => handleEdit(faq)}
                      className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteFAQ(faq.id)}
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
