"use client";

import { useEffect } from "react";
import { useToast } from "./use-toast";

type ErrorNotificationProps = {
  isError: boolean;
  title: string | null | undefined;
};

export function useErrorNotification({
  isError,
  title = "An unexpected error occured. Please try again later.",
}: ErrorNotificationProps) {
  const { toast } = useToast();
  useEffect(() => {
    if (isError) {
      toast({ title: title ?? "" });
    }
  }, [isError, title]);
}
