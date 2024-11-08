"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import * as signalR from "@microsoft/signalr";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";
import { BellIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";

interface Notification {
    title: string;
    body: string;
    url: string;
    receiverId: number;
    type: string;
    isRead: boolean;
    id: number;
    createdAt: string;
    createdBy: number;
    modifiedAt?: string | null;
    modifiedBy?: number | null;
    deletedAt?: string | null;
    deletedBy?: number | null;
    isDeleted: boolean;
}

export default function NotificationBar() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadNumber, setUnreadNumber] = useState(0);

  const fetchNotifications = async () => {
    const { data } = await axios.get("https://koi-api.uydev.id.vn/api/v1/notifications", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("jwt")}`,
      },
    });

    setNotifications(data?.data);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);
  
  useEffect(() => {
    console.log("NotificationBar mounted");
    
    const connection = new signalR.HubConnectionBuilder()
      .configureLogging(signalR.LogLevel.Debug)
      .withUrl("ws://koi-api.uydev.id.vn/notificationHub", {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
      })
      .build();

    connection
      .start()
      .then(() => {
        console.log("Connection started");
      })
      .catch((e) => console.log("Error connecting to SignalR", e));

    connection.on("ReceiveMessage", (title, content) => {
      fetchNotifications();
      toast.info(`${title} - ${content}`);
    });

    return () => {
      connection.stop();
    };
  }, []);

  useEffect(() => {
    const unreadCount = notifications.filter((n) => !n.isRead).length;
    setUnreadNumber(unreadCount);
  }, [notifications]);

  return (
    <>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="icon" className="rounded-full relative ml-auto">
          <BellIcon className="h-5 w-5" />
          <span className="absolute -top-1 -right-2 bg-red-500 text-background h-6 w-6 items-center justify-center flex rounded-full select-none">
            {unreadNumber}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-96 shadow-2xl mr-6 mt-2" side="bottom" align="start">
        <DropdownMenuLabel className="text-orange-500">
          <Badge>Notification</Badge>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-96">
          <div className="space-y-4">
            {notifications.map((notification, index) => (
              <NotificationItem key={index} notification={notification} />
            ))}
          </div>
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
    </>
  );
}

function NotificationItem({ notification }: { notification: Notification }) {
  const domain = window.location.origin;
  console.log(domain);
  console.log(notification);

  return (
    
      <DropdownMenuItem>
      <div className="flex items-center gap-2">
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
          <AvatarFallback>{notification.createdBy ?? "Unknown"}</AvatarFallback>
        </Avatar>
        <div>
          <div className="font-semibold">{notification.title ?? "No Title"}</div>
          <div className="line-clamp-2">{notification.body ?? "No Content"}</div>
          <div className="text-xs">
            {notification.createdAt
              ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })
              : "Unknown time"}
          </div>
        </div>
      </div>
    </DropdownMenuItem>

  );
}
