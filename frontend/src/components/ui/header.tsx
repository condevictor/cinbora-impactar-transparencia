"use client";

import Image from "next/image";
import prefeituraLogo from "../../assets/prefeitura.svg";
import Link from "next/link";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import dynamic from "next/dynamic";
import cinLogo from "../../assets/cin.svg"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const UserSidebar = dynamic(() => import("./user-sidebar").then((mod) => mod.UserSidebar), { ssr: false });

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const token = Cookies.get("auth_token");
  
      if (token) {
        setIsLoggedIn(true);
  
        if (!avatarUrl) {
          fetch("http://127.0.0.1:3333/user", {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
            .then((res) => res.json())
            .then((data) => setAvatarUrl(data?.profileUrl || null))
            .catch(() => setAvatarUrl(null));
        }
      } else {
        setIsLoggedIn(false);
      }
    }, 500);
  
    return () => clearInterval(interval);
  }, [avatarUrl]);
  

  return (
    <header className="bg-[#00B3FF] py-5 px-12 flex items-center justify-between max-sm:px-5">
      <div>
        <div className="flex justify-between max-sm:max-w-40">
          <Image src={prefeituraLogo} alt="Prefeitura do Recife" className="max-sm:w-[80%]"/>
          <div className="border-solid border-l-2 border-white h-14 ml-4 mr-2 max-sm:ml-3 max-sm:mr-1 max-sm:h-12"></div>
          <Image src={cinLogo} alt="logo do cin/ufpe" className="max-sm:w-[30%] max-s"/>
        </div>
      </div>
      <Menubar className="border-none shadow-none text-white justify-between max-lg:hidden">
        <MenubarMenu>
          <Link href="/">
            <MenubarTrigger className="px-20 pl-0 text-xl font-semibold text-white transition-all duration-300 hover:text-[#d4dbf0] hover:scale-110">
              Início
            </MenubarTrigger>
          </Link>
          <Link href="/partners">
            <MenubarTrigger className="px-20 pr-0 text-xl font-semibold text-white transition-all duration-300 hover:text-[#d4dbf0] hover:scale-110">
              Parceiros
            </MenubarTrigger>
          </Link>
        </MenubarMenu>
      </Menubar>

      {isLoggedIn ? <UserSidebar avatarUrl={avatarUrl} setAvatarUrl={setAvatarUrl} />
 : (
        <div>
          <Link href="/login">
            <Button className="bg-[#294BB6] text-lg font-semibold text-white rounded-xl px-14 py-3 transition-colors duration-300 delay-150 hover:bg-white hover:text-[#294BB6] max-lg:hidden">
              Entrar
            </Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger className="text-white text-4xl hidden max-lg:block">
              <div id="mobile">☰</div>
            </DropdownMenuTrigger>
            <DropdownMenuContent id="start" className="bg-white rounded-xl border-solid border-2 mr-4 mt-2 border-white hidden max-lg:block">
              <Link href="/">
                <DropdownMenuItem id="partners" className="block text-center text-8 font-semibold text-[#294BB6] hover:scale-110">Início</DropdownMenuItem>
              </Link>
              <Link href="/partners">
                <DropdownMenuItem className="block text-center text-8 font-semibold text-[#294BB6] hover:scale-110">Parceiros</DropdownMenuItem>
              </Link>
              <DropdownMenuItem className="px-4 py-2 hover:bg-gray-200">
                <Link href="/login">
                  <Button id="loginMobile" className="bg-[#294BB6] text-8 font-semibold text-white rounded-xl px-14 py-3 transition-colors duration-300 delay-150 hover:bg-white hover:text-[#294BB6]">Entrar como Ong</Button>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

    </header>
  );
}
