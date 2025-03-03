"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { Sidebar, SidebarTrigger, SidebarContent } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function UserSidebar() {
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    setUserName(Cookies.get("user_name") || "Usuário");
    setUserEmail(Cookies.get("user_email") || "email@exemplo.com");
  }, []);

  return (
    <Sidebar>
      <SidebarTrigger asChild>
        <button className="rounded-full border p-1 bg-gray-200 hover:bg-gray-300">
          <Avatar>
            <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
          </Avatar>
        </button>
      </SidebarTrigger>
      <SidebarContent className="w-[30%] p-6">
        <h2 className="text-lg font-bold">{userName}</h2>
        <p className="text-sm text-gray-500">{userEmail}</p>

        <Button
          className="mt-6 w-full bg-red-500"
          onClick={() => {
            Cookies.remove("auth_token");
            Cookies.remove("user_name");
            Cookies.remove("user_email");
            window.location.href = "/login";
          }}
        >
          Sair
        </Button>
      </SidebarContent>
    </Sidebar>
  );
}
