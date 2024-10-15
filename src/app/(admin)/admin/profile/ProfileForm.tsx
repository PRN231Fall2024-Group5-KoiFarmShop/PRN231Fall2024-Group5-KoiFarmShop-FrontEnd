'use client';

import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import userApi, { UserUpdateProfile } from '@/lib/api/userAPI';

const profileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  dob: z.string().refine((date) => {
    const parsedDate = new Date(date);
    const now = new Date();
    return parsedDate < now && parsedDate > new Date('1900-01-01');
  }, { message: 'Please enter a valid date of birth' }),
  phoneNumber: z.string().regex(/^\d{10}$/, 'Phone number must be 10 digits'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  imageUrl: z.string().nullable(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const ProfileForm: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '',
      dob: '',
      phoneNumber: '',
      address: '',
      imageUrl: null,
    },
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      form.reset({
        fullName: user.fullName,
        dob: user.dob,
        phoneNumber: user.phoneNumber,
        address: user.address,
        imageUrl: user.imageUrl || null,
      });
      setImagePreview(user.imageUrl || null);
    }
  }, [form]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      if (imageFile) {
        toast({
          title: 'Uploading image...',
          description: 'Please wait...',
        });
        // Implement image upload logic here
        // For example:
        // const imageUrl = await uploadImage(imageFile);
        // data.imageUrl = imageUrl;
      }

      const userId = JSON.parse(localStorage.getItem('user') || '{}').id;
      if (!userId) {
        throw new Error('User ID not found');
      }

      const response = await userApi.updateProfile(userId, data as UserUpdateProfile);
      
      if (response.isSuccess) {
        toast({
          title: 'Profile updated',
          description: 'Your profile has been successfully updated.',
        });
        // Update local storage with new user data
        const updatedUser = { ...JSON.parse(localStorage.getItem('user') || '{}'), ...data };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      toast({
        title: 'Update failed',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Update Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex justify-center mb-6">
              <Avatar className="w-32 h-32">
                <AvatarImage src={imagePreview || form.getValues('imageUrl') || undefined} />
                <AvatarFallback>{form.getValues('fullName').charAt(0)}</AvatarFallback>
              </Avatar>
            </div>
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dob"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormItem>
              <FormLabel>Profile Picture</FormLabel>
              <FormControl>
                <Input id="imageFile" type="file" onChange={handleImageChange} accept="image/*" />
              </FormControl>
            </FormItem>
            <Button type="submit" className="w-full">Update Profile</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ProfileForm;