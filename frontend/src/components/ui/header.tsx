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

const UserSidebar = dynamic(() => import("./user-sidebar").then((mod) => mod.UserSidebar), { ssr: false });

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      setIsLoggedIn(!!Cookies.get("auth_token"));
    };

    const interval = setInterval(checkAuth, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-[#00B3FF] py-5 px-12 flex items-center justify-between">
      <Image src={prefeituraLogo} alt="Prefeitura do Recife" width={150} height={60}/>

      <Menubar className="border-none shadow-none text-white justify-between">
        <MenubarMenu>
        <MenubarTrigger className="px-10 text-xl font-semibold text-white transition-all duration-300 hover:text-[#d4dbf0] hover:scale-110">
            Início
          </MenubarTrigger>
          <MenubarTrigger className="px-10 text-xl font-semibold text-white transition-all duration-300 hover:text-[#d4dbf0] hover:scale-110">
            Ongs
          </MenubarTrigger>
          <MenubarTrigger className="px-10 text-xl font-semibold text-white transition-all duration-300 hover:text-[#d4dbf0] hover:scale-110">
            Ações
          </MenubarTrigger>
          <MenubarTrigger className="px-10 text-xl font-semibold text-white transition-all duration-300 hover:text-[#d4dbf0] hover:scale-110">
            Transparência
          </MenubarTrigger>
        </MenubarMenu>
      </Menubar>

      {isLoggedIn ? <UserSidebar /> : (
        <Link href="/login">
          <Button className="bg-[#294BB6] text-lg font-semibold text-white rounded-xl px-14 py-3 transition-colors duration-300 delay-150 hover:bg-white hover:text-[#294BB6]">
            Entrar
          </Button>
        </Link>
      )}
    </header>
  );
}
