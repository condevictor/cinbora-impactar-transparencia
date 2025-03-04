"use client";

import { useState } from "react";
import Cookies from "js-cookie";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function UserSidebar() {
  const [userName, setUserName] = useState(Cookies.get("user_name") || "Usuário");
  const [userEmail, setUserEmail] = useState(Cookies.get("user_email") || "email@exemplo.com");

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="rounded-full border p-1 bg-gray-200 hover:bg-gray-300">
          <Avatar className="w-10 h-10 bg-white text-black">
            <AvatarFallback className="text-lg font-semibold">
              {userName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[350px] md:w-[400px] p-6 bg-white shadow-xl">
        <div className="flex flex-col items-center gap-4">
          <Avatar className="w-16 h-16 bg-gray-200 text-black">
            <AvatarFallback className="text-2xl font-semibold">
              {userName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-lg font-bold">{userName}</h2>
          <p className="text-sm text-gray-500">{userEmail}</p>

          <Button
            className="mt-6 w-full bg-red-500 text-white hover:bg-red-600"
            onClick={() => {
              Cookies.remove("auth_token");
              Cookies.remove("user_name");
              Cookies.remove("user_email");
              window.location.href = "/login";
            }}
          >
            Sair
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
