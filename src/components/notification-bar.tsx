"use client";

import { BellIcon, LifeBuoy } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import * as signalR from "@microsoft/signalr";
import { useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface Notification {
    Title: string;
    Body: string;
    UserId: string;
    IsRead: boolean;
    Url: string;
    Sender: string;
    CreatedAt: Date;
}

export default function NotificationBar() {

  //const {notifications, refetch} = useNotification();


  //Mock
  const notifications: Notification[] = [
    {
      Title: "New User",
      Body: "New user has been added",
      UserId: "1",
      IsRead: false,
      Url: "/user",
      Sender: "System",
      CreatedAt: new Date()
    },
    {
      Title: "New User",
      Body: "New user has been added",
      UserId: "1",
      IsRead: false,
      Url: "/user",
      Sender: "System",
      CreatedAt: new Date()
    },
    {
      Title: "New User",
      Body: "New user has been added",
      UserId: "1",
      IsRead: false,
      Url: "/user",
      Sender: "System",
      CreatedAt: new Date()
    },
  ];

  console.log(notifications);

  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .configureLogging(signalR.LogLevel.Debug)
      .withUrl("https://ez-api.azurewebsites.net/notification-hub", {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
      })
      .build();

    connection.start()
    .then(() => {
      console.log("Connection started")
    //   console.log(authUser)
    //   if(authUser){
    //     connection.invoke("JoinRoom", authUser.RoleName)
    //   }
    })
    .catch(() => console.log("Error connecting to SignalR"));

    connection.on("ReceiveNotification", (title, content) => {
      console.log(title, content);
      toast.info(`${title} - ${content}`);
    });

    return () => {
      connection.stop();
    };
  }, [1]);

  return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="icon" className="rounded-full relative ml-auto">
            <BellIcon className="h-5 w-5" />
            <span className="absolute -top-1 -right-2 bg-red-500 text-background  h-6 w-6 items-center justify-center flex rounded-full select-none">
              5
            </span>
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-96 shadow-2xl mr-6 mt-2"
          side="bottom"
          align="start"
        >
          <DropdownMenuLabel className="text-orange-500">
            <Badge>Notification</Badge>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {notifications.map((notification,index:number) => (
                <NotificationItem key={index} notification={notification} />
              ))}
            </div>
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenu>
  );
}

// var newNotification = new Notification
// {
//     Title = notification.Title,
//     Body = notification.Body,
//     UserId = notification.UserId,
//     IsRead = false,
//     Url = notification.Url,
//     Sender = notification.Sender ?? "System"
// };

function NotificationItem({ notification }: { notification: Notification }) {
  //get current domain
  const domain = window.location.origin;
  console.log(domain);
  console.log(notification);
  return (
    <DropdownMenuItem>
      <div className="flex items-center gap-2">
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
          <AvatarFallback>{notification.Sender}</AvatarFallback>
        </Avatar>
        <div>
          <div className="font-semibold">{notification.Title}</div>
          <div className="line-clamp-2">
            {notification.Body}
          </div>
          {/* at */}
          <div className="text-xs">
            {formatDistanceToNow(new Date(notification.CreatedAt), { addSuffix: true })}
          </div>
        </div>
      </div>
    </DropdownMenuItem>
  );
}
