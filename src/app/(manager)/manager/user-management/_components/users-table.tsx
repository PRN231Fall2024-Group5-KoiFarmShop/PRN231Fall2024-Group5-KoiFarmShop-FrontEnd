"use client"
"use memo"

import * as React from "react"
import { type DataTableFilterField } from "@/types"
import { useDataTable } from "@/hooks/use-data-table"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar"
import { getColumns } from "./users-table-columns" // Update to import user column definitions
import { UsersTableToolbarActions } from "./users-table-toolbar-actions" // Actions specific to user toolbar
import { UsersTableFloatingBar } from "./users-table-floating-bar"

interface UsersTableProps {
  usersPromise: { data: any, pageCount: number }
}

export function UsersTable({ usersPromise }: UsersTableProps) {
  const [data, setData] = React.useState<any[]>([])
  const [pageCount, setPageCount] = React.useState(0)

  // Load users data from the promise
  React.useEffect(() => {
    if (usersPromise) {
      setData(usersPromise.data)
      setPageCount(usersPromise.pageCount)
    }
  }, [usersPromise])

  // Memoize the columns so they don't re-render on every render
  const columns = React.useMemo(() => getColumns(), [])

  const filterFields: DataTableFilterField<any>[] = [
    {
      label: "Full Name",
      value: "fullName",
      placeholder: "Filter by full name...",
    },
    {
      label: "Email",
      value: "email",
      placeholder: "Filter by email...",
    },
    {
      label: "Phone Number",
      value: "phoneNumber",
      placeholder: "Filter by phone number...",
    },
  ]

  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    filterFields,
    initialState: {
      sorting: [{ id: "createdAt", desc: true }],
      columnPinning: { right: ["actions"] },
    },
    getRowId: (originalRow, index) => `${originalRow.id}-${index}`,
  })

  return (
    <DataTable
      table={table}
      floatingBar={<UsersTableFloatingBar table={table} />}
    >
      <DataTableToolbar table={table} filterFields={filterFields}>
        <UsersTableToolbarActions table={table} />
      </DataTableToolbar>
    </DataTable>
  )
}
