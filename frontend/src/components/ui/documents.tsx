import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import arrowDown from "../../assets/downArrow.svg";
import arrowUP from "../../assets/upArrow.svg";
import download from "../../assets/Documents.svg";
import { Delete, UploadCloud } from "lucide-react";
import Cookies from "js-cookie";
import { Trash2 } from "lucide-react"
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

export default function Documents() {
  const [others, setOthers] = useState([]);
  const [taxInvoices, setTaxInvoices] = useState([]);
  const [reports, setReports] = useState([]);
  const [isNotasFiscaisOpen, setIsNotasFiscaisOpen] = useState(false);
  const [isRelatoriosOpen, setIsRelatoriosOpen] = useState(false);
  const [isOutrosOpen, setIsOutrosOpen] = useState(false);
  const [uploadCategory, setUploadCategory] = useState("other");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFiles = () => {
    const ngoId = Cookies.get("ngo_id");
    if (ngoId) {
      fetch(`http://127.0.0.1:3333/ongs/${ngoId}/files/others`)
        .then(response => { if (!response.ok) throw new Error("Erro ao buscar outros arquivos"); return response.json(); })
        .then(data => setOthers(data))
        .catch(err => console.error(err));
      fetch(`http://127.0.0.1:3333/ongs/${ngoId}/files/tax_invoices`)
        .then(response => { if (!response.ok) throw new Error("Erro ao buscar notas fiscais"); return response.json(); })
        .then(data => setTaxInvoices(data))
        .catch(err => console.error(err));
      fetch(`http://127.0.0.1:3333/ongs/${ngoId}/files/reports`)
        .then(response => { if (!response.ok) throw new Error("Erro ao buscar relatórios"); return response.json(); })
        .then(data => setReports(data))
        .catch(err => console.error(err));
    }
  };

  useEffect(() => { getFiles(); }, []);

  const handleUpload = (category: string) => {
    setUploadCategory(category);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("O arquivo excede o limite de 10MB");
        return;
      }
      const token = Cookies.get("auth_token");
      if (!token) {
        alert("Usuário não autenticado");
        return;
      }
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", uploadCategory);
      try {
        const response = await fetch(`http://127.0.0.1:3333/ongs/files/upload`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}` },
          body: formData,
        });
        if (!response.ok) throw new Error("Erro no upload do arquivo");
        await response.json();
        getFiles();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDownload = (file: any) => {
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
      const response = await fetch(`http://127.0.0.1:3333/ongs/files/${fileId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Erro ao deletar o documento");
      getFiles();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-9/12 m-auto mb-20 mt-10 max-[1600px]:w-11/12">
      <div className="flex flex-col">
        <div onClick={() => setIsNotasFiscaisOpen(!isNotasFiscaisOpen)} className="w-full h-20 bg-[#E0E0E0] border border-[#ADADAD] rounded-full flex items-center justify-between mb-8 cursor-pointer">
          <p className="ml-12">Notas Fiscais</p>
          <Image className="w-4 mr-12" src={isNotasFiscaisOpen ? arrowUP : arrowDown} alt={isNotasFiscaisOpen ? "seta para cima" : "seta para baixo"} />
        </div>
        {isNotasFiscaisOpen && (
          <>
            <h1 className="text-center font-bold text-2xl mb-2">Notas Fiscais</h1>
            <div className="h-full w-full border border-black rounded-[64px] p-16 mb-20 max-[1600px]:border-none max-[1600px]:p-0">
              <div className="grid grid-cols-3 gap-10 max-lg:grid-cols-2 max-sm:grid-cols-1">
                <div onClick={() => handleUpload("tax invoice")} className="w-full h-12 rounded bg-[#E0E0E0] flex items-center justify-center cursor-pointer">
                  <UploadCloud className="text-[#294BB6] mr-2" size={24}/>
                  <p>Carregar arquivo</p>
                </div>
                {taxInvoices.map((item, index) => (
                  
                    <div key={index} className="w-full h-12 mr-2 border border-[#294BB6]  rounded flex items-center px-0.5">
                      <Image className="cursor-pointer" onClick={() => handleDownload(item)} src={download} alt="download" />
                      <span onClick={() => handleDownload(item)} title={item.name} className="cursor-pointer ml-2 whitespace-nowrap overflow-hidden text-ellipsis">{item.name}</span>
                    
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button className="ml-2 ml-auto">
                            <Trash2 className="text-red-600 w-8 h-8"/>
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-2xl bg-white shadow-lg p-6 w-[380px]">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Deseja deletar este documento?</AlertDialogTitle>
                            <AlertDialogDescription>Esta operação não poderá ser desfeita.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteFile(item.id)}>
                              Deletar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                ))}
              </div>
            </div>
          </>
        )}
        <div onClick={() => setIsRelatoriosOpen(!isRelatoriosOpen)} className="w-full h-20 bg-[#E0E0E0] border border-[#ADADAD] rounded-full flex items-center justify-between mb-8 cursor-pointer">
          <p className="ml-12">Relatórios</p>
          <Image className="w-4 mr-12" src={isRelatoriosOpen ? arrowUP : arrowDown} alt={isRelatoriosOpen ? "seta para cima" : "seta para baixo"} />
        </div>
        {isRelatoriosOpen && (
          <>
            <h1 className="text-center font-bold text-2xl mb-2">Relatórios</h1>
            <div className="h-full w-full border border-black rounded-[64px] p-16 mb-20 max-[1600px]:border-none max-[1600px]:p-0">
              <div className="grid grid-cols-3 gap-10 max-lg:grid-cols-2 max-sm:grid-cols-1">
                <div onClick={() => handleUpload("report")} className="w-full h-12 rounded bg-[#E0E0E0] flex items-center justify-center cursor-pointer">
                  <UploadCloud className="text-[#294BB6] mr-2" size={24}/>
                  <p>Carregar arquivo</p>
                </div>
                {reports.map((item, index) => (
                  <div key={index} className="w-full h-12 mr-2 border border-[#294BB6] rounded flex items-center px-0.5">
                    <Image className="cursor-pointer" onClick={() => handleDownload(item)} src={download} alt="download" />
                    <span onClick={() => handleDownload(item)} title={item.name} className="cursor-pointer ml-2 whitespace-nowrap overflow-hidden text-ellipsis">{item.name}</span>
                  
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button className="ml-2 ml-auto">
                          <Trash2 className="text-red-600 w-8 h-8"/>
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-2xl bg-white shadow-lg p-6 w-[380px]">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Deseja deletar este documento?</AlertDialogTitle>
                          <AlertDialogDescription>Esta operação não poderá ser desfeita.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteFile(item.id)}>
                            Deletar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
        <div onClick={() => setIsOutrosOpen(!isOutrosOpen)} className="w-full h-20 bg-[#E0E0E0] border border-[#ADADAD] rounded-full flex items-center justify-between mb-8 cursor-pointer">
          <p className="ml-12">Outros documentos</p>
          <Image className="w-4 mr-12" src={isOutrosOpen ? arrowUP : arrowDown} alt={isOutrosOpen ? "seta para cima" : "seta para baixo"} />
        </div>
        {isOutrosOpen && (
          <>
            <h1 className="text-center font-bold text-2xl mb-2">Outros documentos</h1>
            <div className="h-full w-full border border-black rounded-[64px] p-16 mb-20 max-[1600px]:border-none max-[1600px]:p-0">
              <div className="grid grid-cols-3 gap-10 max-lg:grid-cols-2 max-sm:grid-cols-1">
                <div onClick={() => handleUpload("other")} className="w-full h-12 rounded bg-[#E0E0E0] flex items-center justify-center cursor-pointer">
                  <UploadCloud className="text-[#294BB6] mr-2" size={24}/>
                  <p>Carregar arquivo</p>
                </div>
                {others.map((item, index) => (
                  <div key={index} className="w-full h-12 mr-2 border border-[#294BB6] rounded flex items-center px-0.5">
                    <Image className="cursor-pointer" onClick={() => handleDownload(item)} src={download} alt="download" />
                    <span onClick={() => handleDownload(item)} title={item.name} className="cursor-pointer ml-2 whitespace-nowrap overflow-hidden text-ellipsis">{item.name}</span>
                  
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button className="ml-2 ml-auto">
                          <Trash2 className="text-red-600 w-8 h-8"/>
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-2xl bg-white shadow-lg p-6 w-[380px]">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Deseja deletar este documento?</AlertDialogTitle>
                          <AlertDialogDescription>Esta operação não poderá ser desfeita.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteFile(item.id)}>
                            Deletar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
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
