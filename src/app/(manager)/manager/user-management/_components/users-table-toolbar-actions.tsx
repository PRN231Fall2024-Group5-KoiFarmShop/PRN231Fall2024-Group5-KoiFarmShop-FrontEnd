"use client"

import { DownloadIcon } from "@radix-ui/react-icons"
import { type Table } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"

import { CreateUserDialog } from "./create-user-dialog" // Updated to CreateUserDialog
import { exportTableToCSV } from "@/lib/export"
import { DeleteUserDialog } from "./delete-user-dialog"
import { User } from "../_lib/userSchema"

interface UsersTableToolbarActionsProps {
  table: Table<User> // Updated to User type
}

export function UsersTableToolbarActions({
  table,
}: UsersTableToolbarActionsProps) {
  return (
    <div className="flex items-center gap-2">
      {table.getFilteredSelectedRowModel().rows.length > 0 ? (
        <DeleteUserDialog
          users={table
            .getFilteredSelectedRowModel()
            .rows.map((row) => row.original)} // Updated to users
          onSuccess={() => table.toggleAllRowsSelected(false)}
        />
      ) : null}
      <CreateUserDialog /> {/* Updated to CreateUserDialog */}
      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          exportTableToCSV(table, {
            filename: "users", // Updated filename to "users"
            excludeColumns: ["select", "actions"],
          })
        }
      >
        <DownloadIcon className="mr-2 size-4" aria-hidden="true" />
        Export
      </Button>
      {/**
       * Other actions can be added here.
       * For example, import, view, etc.
       */}
    </div>
  )
}
