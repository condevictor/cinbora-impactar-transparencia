"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import arrowDown from "../../assets/downArrow.svg";
import arrowUP from "../../assets/upArrow.svg";
import download from "../../assets/Documents.svg";

export default function ActionsDocuments() {
  const searchParams = useSearchParams();
  const actionId = searchParams.get("action_id");
  const [others, setOthers] = useState([]);
  const [taxInvoices, setTaxInvoices] = useState([]);
  const [reports, setReports] = useState([]);
  const [isNotasFiscaisOpen, setIsNotasFiscaisOpen] = useState(false);
  const [isRelatoriosOpen, setIsRelatoriosOpen] = useState(false);
  const [isOutrosOpen, setIsOutrosOpen] = useState(false);

  const getFiles = () => {
    if (actionId) {
      fetch(`http://127.0.0.1:3333/ongs/actions/${actionId}/files/others`)
        .then(response => { if (!response.ok) throw new Error("Erro ao buscar outros arquivos"); return response.json(); })
        .then(data => setOthers(data))
        .catch(err => console.error(err));
      fetch(`http://127.0.0.1:3333/ongs/actions/${actionId}/files/tax_invoices`)
        .then(response => { if (!response.ok) throw new Error("Erro ao buscar notas fiscais"); return response.json(); })
        .then(data => setTaxInvoices(data))
        .catch(err => console.error(err));
      fetch(`http://127.0.0.1:3333/ongs/actions/${actionId}/files/reports`)
        .then(response => { if (!response.ok) throw new Error("Erro ao buscar relatórios"); return response.json(); })
        .then(data => setReports(data))
        .catch(err => console.error(err));
    }
  };

  useEffect(() => { if (actionId) getFiles(); }, [actionId]);

  const handleDownload = (file: any) => {
    if (file.aws_url) {
      const link = document.createElement("a");
      link.href = file.aws_url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert("URL do arquivo não disponível");
    }
  };

  return (
    <div className="w-9/12 m-auto mb-20 mt-10">
      <div className="flex flex-col">
        <div onClick={() => setIsNotasFiscaisOpen(!isNotasFiscaisOpen)} className="w-full h-20 bg-[#E0E0E0] border border-[#ADADAD] rounded-full flex items-center justify-between mb-8 cursor-pointer">
          <p className="ml-12">Notas Fiscais</p>
          <Image className="w-4 mr-12" src={isNotasFiscaisOpen ? arrowUP : arrowDown} alt={isNotasFiscaisOpen ? "seta para cima" : "seta para baixo"} />
        </div>
        {isNotasFiscaisOpen && (
          <>
            <h1 className="text-center font-bold text-2xl mb-2">Notas Fiscais</h1>
            <div className="h-full w-full border border-black rounded-[64px] p-16 mb-20">
              <div className="grid grid-cols-3 gap-10">
                {taxInvoices.length === 0 ? (
                  <p>nenhum arquivo encontrado</p>
                ) : (
                  taxInvoices.map((item, index) => (
                    <div key={index} onClick={() => handleDownload(item)} className="w-full h-12 border border-[#294BB6] rounded flex items-center px-0.5 cursor-pointer">
                      <Image src={download} alt="download" />
                      <span className="ml-2 text-sm">{item.name}</span>
                    </div>
                  ))
                )}
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
            <div className="h-full w-full border border-black rounded-[64px] p-16 mb-20">
              <div className="grid grid-cols-3 gap-10">
                {reports.length === 0 ? (
                  <p>nenhum arquivo encontrado</p>
                ) : (
                  reports.map((item, index) => (
                    <div key={index} onClick={() => handleDownload(item)} className="w-full h-12 border border-[#294BB6] rounded flex items-center px-0.5 cursor-pointer">
                      <Image src={download} alt="download" />
                      <span className="ml-2 text-sm">{item.name}</span>
                    </div>
                  ))
                )}
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
            <div className="h-full w-full border border-black rounded-[64px] p-16 mb-20">
              <div className="grid grid-cols-3 gap-10">
                {others.length === 0 ? (
                  <p>nenhum arquivo encontrado</p>
                ) : (
                  others.map((item, index) => (
                    <div key={index} onClick={() => handleDownload(item)} className="w-full h-12 border border-[#294BB6] rounded flex items-center px-0.5 cursor-pointer">
                      <Image src={download} alt="download" />
                      <span className="ml-2 text-sm">{item.name}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}