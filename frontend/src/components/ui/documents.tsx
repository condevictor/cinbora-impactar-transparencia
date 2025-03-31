"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import download from "../../assets/Documents.svg";
import { UploadCloud, Trash2 } from "lucide-react";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { API_BASE_URL } from "@/config/api"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface FileDocument {
  id: string;
  name: string;
  aws_url?: string;
}

export default function Documents() {
  const [others, setOthers] = useState<FileDocument[]>([]);
  const [taxInvoices, setTaxInvoices] = useState<FileDocument[]>([]);
  const [reports, setReports] = useState<FileDocument[]>([]);
  const [uploadCategory, setUploadCategory] = useState("other");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const deduplicate = (data: FileDocument[]) => {
    return Array.from(new Map(data.map(item => [item.id, item])).values());
  };

  const getFiles = () => {
    const ngoId = Cookies.get("ngo_id");
    if (ngoId) {
      fetch(`${API_BASE_URL}/ongs/${ngoId}/files/others`)
        .then(response => {
          if (!response.ok) throw new Error("Erro ao buscar outros arquivos");
          return response.json();
        })
        .then(data => setOthers(deduplicate(data)))
        .catch(err => console.error(err));

      fetch(`${API_BASE_URL}/ongs/${ngoId}/files/tax_invoices`)
        .then(response => {
          if (!response.ok) throw new Error("Erro ao buscar notas fiscais");
          return response.json();
        })
        .then(data => setTaxInvoices(deduplicate(data)))
        .catch(err => console.error(err));

      fetch(`${API_BASE_URL}/ongs/${ngoId}/files/reports`)
        .then(response => {
          if (!response.ok) throw new Error("Erro ao buscar relatórios");
          return response.json();
        })
        .then(data => setReports(deduplicate(data)))
        .catch(err => console.error(err));
    }
  };

  useEffect(() => {
    getFiles();
  }, []);

  const handleUpload = (category: string) => {
    setUploadCategory(category);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("O arquivo excede o limite de 10MB");
        return;
      }
      const token = Cookies.get("auth_token");
      if (!token) {
        toast.error("Usuário não autenticado");
        return;
      }
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", uploadCategory);
      try {
        const response = await fetch(`${API_BASE_URL}/ongs/files/upload`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}` },
          body: formData,
        });
        if (!response.ok) throw new Error("Erro no upload do arquivo");
        await response.json();
        toast.success("Arquivo enviado com sucesso!");
        getFiles();
      } catch (err) {
        console.error(err);
        toast.error("Falha ao enviar o arquivo. Tente novamente.");
      }
    }
  };

  const handleDownload = (file: FileDocument) => {
    if (file.aws_url) {
      window.open(file.aws_url, "_blank");
    } else {
      alert("URL do arquivo não disponível");
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    const token = Cookies.get("auth_token");
    if (!token) {
      alert("Usuário não autenticado");
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/ongs/files/${fileId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Erro ao deletar o documento");
      getFiles();
    } catch (err) {
      console.error(err);
    }
  };

  const renderFiles = (list: FileDocument[], category: string) => (
    <>
      <div
        onClick={() => handleUpload(category)}
        className="w-full h-14 rounded-[16px] bg-[#E0E0E0] flex items-center justify-center cursor-pointer"
      >
        <UploadCloud className="text-[#294BB6] mr-2" size={24} />
        <p>Carregar arquivo</p>
      </div>
      {list.map((item, index) => (
        <div
          key={item.id}
          className="w-full h-14 border border-[#294BB6] rounded-[16px] flex items-center px-4 bg-[#F9FAFB] hover:shadow-md transition"
        >
          <Image
            className="cursor-pointer flex-shrink-0"
            onClick={() => handleDownload(item)}
            src={download}
            alt="download"
          />
          <span
            onClick={() => handleDownload(item)}
            title={item.name}
            className="cursor-pointer ml-2 whitespace-nowrap overflow-hidden text-ellipsis max-w-[calc(100%-60px)] flex-grow"
          >
            {item.name}
          </span>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="ml-2 flex-shrink-0">
                <Trash2 className="text-red-600 w-6 h-6" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-[16px] bg-white shadow-2xl p-8 w-full max-w-md border border-gray-200 text-center">
              <AlertDialogHeader className="flex flex-col items-center text-center justify-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                  <Trash2 className="text-red-600 w-6 h-6" />
                </div>
                <AlertDialogTitle className="text-lg font-bold text-gray-800">
                  Tem certeza que deseja deletar?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-sm text-gray-500">
                  Essa ação é irreversível. O documento será permanentemente excluído.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="mt-6 flex justify-center gap-4">
                <AlertDialogCancel className="px-4 py-2 rounded-[16px] border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 transition">
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleDeleteFile(item.id)}
                  className="px-4 py-2 rounded-[16px] bg-red-600 text-white hover:bg-red-700 transition"
                >
                  Deletar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ))}
    </>
  );

  return (
    <div className="w-9/12 m-auto mb-20 mt-10 max-[1600px]:w-11/12">
      <div className="flex flex-col">

        <div className="w-full h-20 bg-[#E0E0E0] border border-[#ADADAD] rounded-full flex items-center justify-between mb-4">
          <p className="ml-12">Notas Fiscais</p>
        </div>
        <div className="mb-8">
          <h1 className="text-center font-bold text-2xl mb-2">Notas Fiscais</h1>
          <div className="h-full w-full border border-black rounded-[64px] p-10 mb-16 max-[1600px]:border-none max-[1600px]:p-0">
            <div className="grid grid-cols-3 gap-6 max-lg:grid-cols-2 max-sm:grid-cols-1">
              {renderFiles(taxInvoices, "tax invoice")}
            </div>
          </div>
        </div>

        <div className="w-full h-20 bg-[#E0E0E0] border border-[#ADADAD] rounded-full flex items-center justify-between mb-4">
          <p className="ml-12">Relatórios</p>
        </div>
        <div className="mb-8">
          <h1 className="text-center font-bold text-2xl mb-2">Relatórios</h1>
          <div className="h-full w-full border border-black rounded-[64px] p-12 mb-16 max-[1600px]:border-none max-[1600px]:p-0">
            <div className="grid grid-cols-3 gap-6 max-lg:grid-cols-2 max-sm:grid-cols-1">
              {renderFiles(reports, "report")}
            </div>
          </div>
        </div>

        <div className="w-full h-20 bg-[#E0E0E0] border border-[#ADADAD] rounded-full flex items-center justify-between mb-4">
          <p className="ml-12">Outros documentos</p>
        </div>
        <div className="mb-8">
          <h1 className="text-center font-bold text-2xl mb-2">Outros documentos</h1>
          <div className="h-full w-full border border-black rounded-[64px] p-10 mb-16 max-[1600px]:border-none max-[1600px]:p-0">
            <div className="grid grid-cols-3 gap-6 max-lg:grid-cols-2 max-sm:grid-cols-1">
              {renderFiles(others, "other")}
            </div>
          </div>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: "none" }}
          accept="image/jpeg,image/png,application/pdf"
        />
      </div>
    </div>
  );
}
