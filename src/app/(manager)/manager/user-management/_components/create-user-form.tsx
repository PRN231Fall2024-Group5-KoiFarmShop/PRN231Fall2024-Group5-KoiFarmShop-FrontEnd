"use client"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import * as React from "react"
import { type UseFormReturn } from "react-hook-form"
import { CreateUserDTO } from "../_lib/userSchema"
import { useState } from "react"

interface CreateUserFormProps
  extends Omit<React.ComponentPropsWithRef<"form">, "onSubmit"> {
  children: React.ReactNode
  form: UseFormReturn<CreateUserDTO>
  onSubmit: (data: CreateUserDTO) => void
}

export function CreateUserForm({ form, onSubmit, children }: CreateUserFormProps) {
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null)

  const handleProfilePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-4">
          {/* Profile Picture Preview */}
        <div className="col-span-2 flex flex-col items-center">
          {profilePicturePreview ? (
            <img
              src={profilePicturePreview}
              alt="Profile Preview"
              className="h-24 w-24 rounded-full object-cover mb-2"
            />
          ) : (
            <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center mb-2">
              <span className="text-gray-500">No Image</span>
            </div>
          )}
        </div>

        {/* Profile Picture URL Field */}
        <FormField
          control={form.control}
          name="profilePictureUrl"
          render={({ field }) => (
            <FormItem className="col-span-2">
              <FormLabel>Profile Picture URL</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    handleProfilePictureChange(e)
                    field.onChange(e)
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Full Name Field */}
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Email Field */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="user@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Password Field */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="123456" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Date of Birth Field */}
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

        {/* Phone Number Field */}
        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="123-456-7890" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Role Field */}
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="capitalize">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="customer">Customer</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Address Field */}
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem className="col-span-2">
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="1234 Main St, City" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        
        </div>
        {children}
      </form>
    </Form>
  )
}
