"use client"
"use memo"

import type { SearchParams } from "@/types"
import * as React from "react"

import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton"
import { DateRangePicker } from "@/components/date-range-picker"
import { Shell } from "@/components/shell"
import { Skeleton } from "@/components/ui/skeleton"
import { searchParamsSchema } from "./_lib/validations"
import { UsersTable } from "./_components/users-table"
import { useEntities } from "@/lib/react-query-utils"
import { User } from "./_lib/userSchema"
import { backendUrl } from "@/lib/constraint"

export interface IndexPageProps {
  searchParams: SearchParams
}

const table = "users";

export default function IndexPage({ searchParams }: IndexPageProps) {
  const search = searchParamsSchema.parse(searchParams)

  // Fetch users using React Query
  const { entities } = useEntities<User>("users", `${backendUrl}${table}`);

  // Handle loading and error states from React Query
  if (entities.isLoading) {
    return (
      <Shell className="gap-2">
        <Skeleton className="h-7 w-52" />
        <DataTableSkeleton
          columnCount={5}
          searchableColumnCount={1}
          filterableColumnCount={2}
          cellWidths={["10rem", "40rem", "12rem", "12rem", "8rem"]}
          shrinkZero
        />
      </Shell>
    );
  }

  if (entities.isError) {
    return <div>Error: {entities.error.message}</div>;
  }

  // Prepare the data to be passed to UsersTable
  const usersPromise = {
    data: entities.data?.data, // This will be the users array fetched from the API
    pageCount: 2, // Adjust this if you have pagination
  }

  return (
    <Shell className="gap-2">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Users Management</h1>
        <DateRangePicker
          triggerSize="sm"
          triggerClassName="ml-auto w-56 sm:w-60"
          align="end"
        />
      </div>

      <UsersTable usersPromise={usersPromise} />
    </Shell>
  )
}
