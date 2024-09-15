"use memo"

import type { SearchParams } from "@/types"
import * as React from "react"

import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton"
import { DateRangePicker } from "@/components/date-range-picker"
import { Shell } from "@/components/shell"
import { Skeleton } from "@/components/ui/skeleton"
import { searchParamsSchema } from "./_lib/validations"
import { UsersTable } from "./_components/users-table"

export interface IndexPageProps {
  searchParams: SearchParams
}

// Static seed data for users
const seedUsers = [
  {
    id: 1,
    fullName: "John Doe",
    email: "john.doe@example.com",
    phoneNumber: "123-456-7890",
    role: "admin",
    isActive: true,
    createdAt: new Date("1990-02-15T00:00:00"),
    updatedAt: new Date("1990-02-15T00:00:00"),
  },
  {
    id: 2,
    fullName: "Jane Smith",
    email: "jane.smith@example.com",
    phoneNumber: "987-654-3210",
    role: "manager",
    isActive: true,
    createdAt: new Date("1990-02-15T00:00:00"),
    updatedAt: new Date("1990-02-15T00:00:00"),
  },
  {
    id: 3,
    fullName: "Alice Johnson",
    email: "alice.johnson@example.com",
    phoneNumber: "555-123-4567",
    role: "staff",
    isActive: false,
    createdAt: new Date("1990-02-15T00:00:00"),
    updatedAt: new Date("1990-02-15T00:00:00"),
  },
  // Add more seed users as needed
];

export default async function IndexPage({ searchParams }: IndexPageProps) {
  const search = searchParamsSchema.parse(searchParams)

  // Static users list as seed data
  const usersPromise = {
    data: seedUsers,
    pageCount: 1,
  }

  return (
    <Shell className="gap-2">
        <React.Suspense fallback={<Skeleton className="h-7 w-52" />}>
          <div className="flex items-center justify-between gap-2">
            <h1 className="text-2xl font-bold">Users Manager</h1>
            <DateRangePicker
                triggerSize="sm"
                triggerClassName="ml-auto w-56 sm:w-60"
                align="end"
            />
          </div>
        </React.Suspense>
        <React.Suspense
          fallback={
            <DataTableSkeleton
              columnCount={5}
              searchableColumnCount={1}
              filterableColumnCount={2}
              cellWidths={["10rem", "40rem", "12rem", "12rem", "8rem"]}
              shrinkZero
            />
          }
        >
          <UsersTable usersPromise={usersPromise} />
        </React.Suspense>
    </Shell>
  )
}
