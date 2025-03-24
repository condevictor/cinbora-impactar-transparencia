"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import boraImpactar from "../../assets/bora_impactar.svg";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:3333/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Credenciais inválidas. Verifique seu email e senha.");
        } else {
          toast.error(`Erro ao fazer login: ${response.statusText}`);
        }
        throw new Error("Erro no login");
      }

      const data = await response.json();

      if (data.token) {
        Cookies.remove("auth_token");
        Cookies.set("auth_token", data.token, { expires: 7, secure: true, sameSite: "Strict" });
        toast.success("Sessão iniciada com sucesso!");
      }

      if (data.user?.name) {
        Cookies.set("user_name", data.user.name);
        toast.success(`Bem-vindo, ${data.user.name}!`);
      }

      if (data.ngo?.name) {
        Cookies.set("ngo_name", data.ngo.name);
        toast.success(`ONG vinculada: ${data.ngo.name}`);
      }

      if (data.ngo?.id) {
        Cookies.set("ngo_id", data.ngo.id);
      }

      toast.success("Redirecionando para o painel...");

      setTimeout(() => router.push("/dashboard/ongs"), 1000);

    } catch (error) {
      toast.error("Falha ao conectar ao servidor. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen max-w-4/5 p-4">
      <Image src={boraImpactar} alt="bora impactar"/>
      <div className="p-14 rounded-xl shadow-lg w-full max-w-lg bg-[#00B3FF]">
        <h2 className="text-2xl font-bold text-center text-white">Entrar</h2>
        <p className="text-white text-center">Acesse sua Ong</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <Input 
            className="bg-white rounded-xl border-[#D4D7E3]" 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />

          <div className="relative">
            <Input 
              className="bg-white rounded-xl border-[#D4D7E3] pr-10" 
              type={showPassword ? "text" : "password"} 
              placeholder="Senha" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
            <button 
              type="button" 
              className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700 transition" 
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-[#294BB6] rounded-xl text-white font-bold tracking-widest hover:bg-white hover:text-[#294BB6]" 
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Entrar"}
          </Button>
        </form>
      </div>
    </div>
  );
}
