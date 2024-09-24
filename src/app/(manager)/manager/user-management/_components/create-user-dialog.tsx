"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { PlusIcon, ReloadIcon } from "@radix-ui/react-icons"
import * as React from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { useMediaQuery } from "@/hooks/use-media-query"

import { createAccount } from "@/lib/api/userAPI"
import { CreateUserDTO, createUserSchema } from "../_lib/userSchema"
import { CreateUserForm } from "./create-user-form"

export function CreateUserDialog() {
  const [open, setOpen] = React.useState(false)
  const [isCreatePending, startCreateTransition] = React.useTransition()
  const isDesktop = useMediaQuery("(min-width: 640px)")

  const form = useForm<CreateUserDTO>({
    resolver: zodResolver(createUserSchema),
  })

  console.log("FORM", form.formState.errors)

  function onSubmit(input: CreateUserDTO) {
    startCreateTransition(() => {
      console.log("Create user", input)
      createAccount(input)
      .then((res) => {
        console.log("Create user response", res)
        setOpen(false)
        toast.success("User created successfully")
      })
      .catch((err) => {
        console.error("Create user error", err)
        toast.error("Failed to create user")
      })
    })
  }

  if (isDesktop)
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <PlusIcon className="mr-2 size-4" aria-hidden="true" />
            New user
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create user</DialogTitle>
            <DialogDescription>
              Fill in the details below to create a new user.
            </DialogDescription>
          </DialogHeader>
          <CreateUserForm form={form} onSubmit={onSubmit}>
            <DialogFooter className="gap-2 pt-2 sm:space-x-0">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button disabled={isCreatePending}>
                {isCreatePending && (
                  <ReloadIcon
                    className="mr-2 size-4 animate-spin"
                    aria-hidden="true"
                  />
                )}
                Create
              </Button>
            </DialogFooter>
          </CreateUserForm>
        </DialogContent>
      </Dialog>
    )

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" size="sm">
          <PlusIcon className="mr-2 size-4" aria-hidden="true" />
          New user
        </Button>
      </DrawerTrigger>

      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Create user</DrawerTitle>
          <DrawerDescription>
            Fill in the details below to create a new user.
          </DrawerDescription>
        </DrawerHeader>
        <CreateUserForm form={form} onSubmit={onSubmit}>
          <DrawerFooter className="gap-2 sm:space-x-0">
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
            <Button disabled={isCreatePending}>
              {isCreatePending && (
                <ReloadIcon
                  className="mr-2 size-4 animate-spin"
                  aria-hidden="true"
                />
              )}
              Create
            </Button>
          </DrawerFooter>
        </CreateUserForm>
      </DrawerContent>
    </Drawer>
  )
}
