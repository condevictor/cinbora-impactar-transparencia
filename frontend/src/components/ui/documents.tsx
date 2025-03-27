import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import arrowDown from "../../assets/downArrow.svg";
import arrowUP from "../../assets/upArrow.svg";
import download from "../../assets/Documents.svg";
import { UploadCloud, Trash2 } from "lucide-react";
import Cookies from "js-cookie";
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

const AccordionSection = ({
  isOpen,
  children,
}: {
  isOpen: boolean;
  children: React.ReactNode;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState("0px");

  useEffect(() => {
    if (ref.current) {
      if (isOpen) {
        setHeight(`${ref.current.scrollHeight}px`);
      } else {
        setHeight("0px");
      }
    }
  }, [isOpen]);

  return (
    <div
      style={{ height, marginBottom: isOpen ? "1.5rem" : "0px" }}
      className="transition-all duration-500 ease-in-out overflow-hidden"
    >

      <div ref={ref} className="opacity-100">
        {children}
      </div>
    </div>
  );
};


export default function Documents() {
  const [others, setOthers] = useState<FileDocument[]>([]);
  const [taxInvoices, setTaxInvoices] = useState<FileDocument[]>([]);
  const [reports, setReports] = useState<FileDocument[]>([]);
  const [isNotasFiscaisOpen, setIsNotasFiscaisOpen] = useState(false);
  const [isRelatoriosOpen, setIsRelatoriosOpen] = useState(false);
  const [isOutrosOpen, setIsOutrosOpen] = useState(false);
  const [uploadCategory, setUploadCategory] = useState("other");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFiles = () => {
    const ngoId = Cookies.get("ngo_id");
    if (ngoId) {
      fetch(`http://127.0.0.1:3333/ongs/${ngoId}/files/others`)
        .then(response => {
          if (!response.ok) throw new Error("Erro ao buscar outros arquivos");
          return response.json();
        })
        .then(data => setOthers(data))
        .catch(err => console.error(err));

      fetch(`http://127.0.0.1:3333/ongs/${ngoId}/files/tax_invoices`)
        .then(response => {
          if (!response.ok) throw new Error("Erro ao buscar notas fiscais");
          return response.json();
        })
        .then(data => setTaxInvoices(data))
        .catch(err => console.error(err));

      fetch(`http://127.0.0.1:3333/ongs/${ngoId}/files/reports`)
        .then(response => {
          if (!response.ok) throw new Error("Erro ao buscar relatórios");
          return response.json();
        })
        .then(data => setReports(data))
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
          key={index}
          className="w-full h-14 mr-2 border border-[#294BB6] rounded-[16px] flex items-center justify-between p-4 bg-[#F9FAFB] hover:shadow-md transition"
        >
          <div className="flex items-center gap-3">
            <Image
              className="cursor-pointer"
              onClick={() => handleDownload(item)}
              src={download}
              alt="download"
            />
            <span
              onClick={() => handleDownload(item)}
              title={item.name}
              className="cursor-pointer whitespace-nowrap overflow-hidden text-ellipsis"
            >
              {item.name}
            </span>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button>
                <Trash2 className="text-red-600 w-6 h-6" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-2xl bg-white shadow-lg p-6 w-[380px]">
              <AlertDialogHeader>
                <AlertDialogTitle>Deseja deletar este documento?</AlertDialogTitle>
                <AlertDialogDescription>Esta operação não poderá ser desfeita.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleDeleteFile(item.id)}>Deletar</AlertDialogAction>
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

        {/* Notas Fiscais */}
        <div onClick={() => setIsNotasFiscaisOpen(!isNotasFiscaisOpen)} className="w-full h-20 bg-[#E0E0E0] border border-[#ADADAD] rounded-full flex items-center justify-between mb-4 cursor-pointer">
          <p className="ml-12">Notas Fiscais</p>
          <Image className={`w-4 mr-12 transition-transform duration-300 ${isNotasFiscaisOpen ? "rotate-180" : ""}`} src={arrowDown} alt="toggle" />
        </div>
        <AccordionSection isOpen={isNotasFiscaisOpen}>
          <h1 className="text-center font-bold text-2xl mb-2">Notas Fiscais</h1>
          <div className="h-full w-full border border-black rounded-[64px] p-16 mb-10 max-[1600px]:border-none max-[1600px]:p-0">
            <div className="grid grid-cols-3 gap-6 max-lg:grid-cols-2 max-sm:grid-cols-1">
              {renderFiles(taxInvoices, "tax invoice")}
            </div>
          </div>
        </AccordionSection>

        {/* Relatórios */}
        <div onClick={() => setIsRelatoriosOpen(!isRelatoriosOpen)} className="w-full h-20 bg-[#E0E0E0] border border-[#ADADAD] rounded-full flex items-center justify-between mb-4 cursor-pointer">
          <p className="ml-12">Relatórios</p>
          <Image className={`w-4 mr-12 transition-transform duration-300 ${isRelatoriosOpen ? "rotate-180" : ""}`} src={arrowDown} alt="toggle" />
        </div>
        <AccordionSection isOpen={isRelatoriosOpen}>
          <h1 className="text-center font-bold text-2xl mb-2">Relatórios</h1>
          <div className="h-full w-full border border-black rounded-[64px] p-16 mb-10 max-[1600px]:border-none max-[1600px]:p-0">
            <div className="grid grid-cols-3 gap-6 max-lg:grid-cols-2 max-sm:grid-cols-1">
              {renderFiles(reports, "report")}
            </div>
          </div>
        </AccordionSection>

        {/* Outros documentos */}
        <div onClick={() => setIsOutrosOpen(!isOutrosOpen)} className="w-full h-20 bg-[#E0E0E0] border border-[#ADADAD] rounded-full flex items-center justify-between mb-4 cursor-pointer">
          <p className="ml-12">Outros documentos</p>
          <Image className={`w-4 mr-12 transition-transform duration-300 ${isOutrosOpen ? "rotate-180" : ""}`} src={arrowDown} alt="toggle" />
        </div>
        <AccordionSection isOpen={isOutrosOpen}>
          <h1 className="text-center font-bold text-2xl mb-2">Outros documentos</h1>
          <div className="h-full w-full border border-black rounded-[64px] p-16 mb-10 max-[1600px]:border-none max-[1600px]:p-0">
            <div className="grid grid-cols-3 gap-6 max-lg:grid-cols-2 max-sm:grid-cols-1">
              {renderFiles(others, "other")}
            </div>
          </div>
        </AccordionSection>

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
