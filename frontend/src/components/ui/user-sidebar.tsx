"use client";

import { useState, useEffect, useCallback } from "react";
import Cookies from "js-cookie";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function UserSidebar() {
  const [userName, setUserName] = useState("Carregando...");
  const [userEmail, setUserEmail] = useState("...");
  const [actions, setActions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const ngoId = Cookies.get("ngo_id");
  const authToken = Cookies.get("auth_token");

  const fetchUserData = useCallback(() => {
    if (authToken) {
      fetch(`http://127.0.0.1:3333/user`, {
        method: "POST", 
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({}) 
      })
        .then((res) => res.json())
        .then((data) => {
          setUserName(data.name || "Usuário");
          setUserEmail(data.email || "email@exemplo.com");
        })
        .catch(() => {
          setUserName("Erro ao carregar");
          setUserEmail("Erro ao carregar");
        });
  

      if (ngoId) {
        fetch(`http://127.0.0.1:3333/ongs/${ngoId}/actions`, {
          headers: { Authorization: `Bearer ${authToken}` },
        })
          .then((res) => res.json())
          .then((data) => setActions(Array.isArray(data) ? data : []))
          .catch(() => setActions([]));
      }
    }
  }, [authToken, ngoId]);

  useEffect(() => {
    if (isOpen) {
      fetchUserData();
    }
  }, [isOpen, fetchUserData]);

  const handleLogout = () => {
    const tokens = Cookies.get("auth_token");
  
    if (Array.isArray(tokens)) {
      tokens.forEach((_, index) => Cookies.remove(`auth_token[${index}]`));
    }
  
    Cookies.remove("auth_token");
    Cookies.remove("user_name");
    Cookies.remove("user_email");
    Cookies.remove("ngo_id");
    Cookies.remove("ngo_name");
  
    window.location.href = "/login";
  };
  
  

  return (
    <Sheet onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button className="rounded-full border p-1 bg-gray-200 hover:bg-gray-300 transition-all">
          <Avatar className="w-10 h-10 bg-white text-black">
            <AvatarFallback className="text-lg font-semibold">
              {userName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[320px] sm:w-[350px] md:w-[400px] p-6 bg-white shadow-xl rounded-xl">
        <div className="flex flex-col items-center gap-4">
          <Avatar className="w-16 h-16 bg-gray-200 text-black rounded-full">
            <AvatarFallback className="text-2xl font-semibold">
              {userName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-lg font-bold">{userName}</h2>
          <p className="text-sm text-gray-500">{userEmail}</p>

          <Separator className="my-4" />

          <h3 className="text-md font-semibold text-gray-700">Ações da ONG</h3>
          <div className="w-full max-h-60 overflow-y-auto border rounded-lg p-3 shadow-sm bg-gray-50">
          {actions.length > 0 ? (
            actions.map((action) => (
              <div key={action.id} className="p-3 mb-2 rounded-lg bg-white shadow-md border">
                <h4 className="text-sm font-medium text-gray-900 flex justify-between items-center gap-2">
                  <span className="truncate max-w-[60%] overflow-hidden text-ellipsis">
                    {action.name}
                  </span>
                  <Badge className="max-w-[40%] truncate px-2 py-1 text-xs">{action.type.toUpperCase()}</Badge>
                </h4>


                {/* Valores numéricos compactados */}
                <div className="flex justify-between text-sm font-semibold text-gray-700 mt-4">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Arrecadado</p>
                    <p className="text-lg font-bold whitespace-nowrap">
                      R${" "}
                      {new Intl.NumberFormat("pt-BR", { notation: "compact", compactDisplay: "short" }).format(action.colected)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Gasto</p>
                    <p className="text-lg font-bold text-red-500 whitespace-nowrap">
                      R${" "}
                      {new Intl.NumberFormat("pt-BR", { notation: "compact", compactDisplay: "short" }).format(action.spent)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Meta</p>
                    <p className="text-lg font-bold whitespace-nowrap">
                      R${" "}
                      {new Intl.NumberFormat("pt-BR", { notation: "compact", compactDisplay: "short" }).format(action.goal)}
                    </p>
                  </div>
                </div>

                {/* Barra de progresso */}
                <Progress
                  className="w-full h-2 mt-2 bg-gray-200 rounded-full"
                  indicatorClass="bg-green-500 rounded-full"
                  value={(action.colected / action.goal) * 100}
                />
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">Nenhuma ação cadastrada.</p>
          )}

          </div>

          <div className="flex w-full gap-2 mt-6">
            <Button
              className="w-1/2 bg-gray-500 text-white rounded-full hover:bg-gray-600 transition-all shadow-md"
              onClick={() => window.location.href = "/dashboard/ongs"}
            >
              Dashboard
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="w-1/2 bg-red-500 text-white rounded-full px-6 py-3 hover:bg-red-600 transition-all shadow-md">
                  Sair
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-2xl shadow-lg p-6 w-[380px] flex flex-col items-center bg-white dark:bg-gray-900 border dark:border-gray-700">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 text-center">
                  Tem certeza que deseja sair?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-gray-600 dark:text-gray-300 text-center mt-2">
                  Você será desconectado e precisará fazer login novamente para acessar sua conta.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex gap-4 mt-4">
                <AlertDialogCancel className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full px-6 py-3 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all w-full sm:w-auto">
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-500 text-white rounded-full px-6 py-3 hover:bg-red-600 transition-all w-full sm:w-auto"
                  onClick={handleLogout}
                >
                  Sair
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>

            </AlertDialog>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
