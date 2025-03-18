"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { UploadCloud } from "lucide-react"
import { Label } from "@/components/ui/label";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import Image from "next/image";
import shareButton from "../../../assets/share.svg";
import capa from "../../../assets/capa.svg";
import Gallery from "@/components/ui/gallery";
import Balance from "@/components/ui/balance";
import Documents from "@/components/ui/documents";



export default function ActionsPage() {
  const [slides, setSlides] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);
  const [ngoName, setNgoName] = useState("Carregando...");
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imageUrls, setImageUrls] = useState({});
  const [activeTab, setActiveTab] = useState("balance");

  const generateHash = async (name) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(name);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  };

  useEffect(() => {
    const ngoCookieName = Cookies.get("ngo_name");
    if (ngoCookieName) {
      setNgoName(ngoCookieName);
    } else {
      setNgoName("Nome não encontrado");
    }
  }, []);
  
  useEffect(() => {
    fetchActions();
  }, []);
  
  const openModal = (slide = null) => {
    if (slide) {
      setEditingSlide({
        id: slide.id || "",
        name: slide.name || "",
        type: slide.type || "",
        spent: slide.spent || 0,
        goal: slide.goal || 0,
        colected: slide.colected || 0,
        aws_url: slide.aws_url || "",
      });
      setImagePreview(slide.aws_url || null);
    } else {
      setEditingSlide({ name: "", type: "", spent: 0, goal: 0, colected: 0, aws_url: "" });
      setImagePreview(null);
    }
  
    setImageFile(null);
    setIsOpen(true);
  };
  
  const closeModal = () => {
    setIsOpen(false);
    setEditingSlide(null);
    setImagePreview(null);
    setImageFile(null);
  };
  
  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
  
    try {
      const hash = await generateHash(file.name);
      const extension = file.name.split(".").pop();
      const newFileName = `${hash}.${extension}`;
  
      const renamedFile = new File([file], newFileName, { type: file.type });
  
      setImageFile(renamedFile);
      setImagePreview(URL.createObjectURL(renamedFile));
    } catch (error) {
      console.error("Erro ao processar a imagem:", error);
    }
  };
  
  const fetchActions = async (forceFetch = false) => {
    const ngoId = Cookies.get("ngo_id");
  
    if (!ngoId) {
      console.log("Erro: NGO ID não encontrado.");
      return;
    }
  
    // Adiciona um parâmetro de cache-busting, se necessário
    const url = forceFetch
      ? `http://127.0.0.1:3333/ongs/${ngoId}/actions?nocache=${Date.now()}` // Força nova requisição
      : `http://127.0.0.1:3333/ongs/${ngoId}/actions`; 
  
    console.log("Fazendo requisição GET:", url);
  
    try {
      const response = await fetch(url);
  
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
  
      const data = await response.json();
      console.log("Resposta do backend (GET):", data);
  
      if (!Array.isArray(data)) {
        console.log("Erro: Resposta de ações não é um array.");
        return;
      }
  
      console.log("Ações recebidas:", data);
      setSlides(data);
  
      const urls = {};
      data.forEach((slide) => {
        urls[slide.id] = slide.aws_url || "";
      });
  
      console.log("URLs de imagens carregadas:", urls);
      setImageUrls(urls);
    } catch (error) {
      console.log("Erro ao buscar ações:", error);
    }
  };
  
  const handleSave = async () => {
    if (!editingSlide.name || !editingSlide.type) {
      console.log("Erro: Campos obrigatórios não preenchidos.");
      return;
    }
  
    const token = Cookies.get("auth_token");
    const isUpdate = !!editingSlide.id;
    const method = isUpdate ? "PUT" : "POST";
    const url = isUpdate
      ? `http://127.0.0.1:3333/ongs/actions/${editingSlide.id}`
      : "http://127.0.0.1:3333/ongs/actions";
  
    let body;
    let headers = {
      "Authorization": `Bearer ${token}`,
    };
  
    if (isUpdate) {
      // Para PUT, envie apenas o JSON de informações da ação
      body = JSON.stringify({
        name: editingSlide.name,
        type: editingSlide.type,
        spent: editingSlide.spent,
        goal: editingSlide.goal,
        colected: editingSlide.colected,
      });
      headers["Content-Type"] = "application/json";
    } else {
      // Para POST, envie o formData que inclui a imagem
      const formData = new FormData();
      formData.append("name", editingSlide.name);
      formData.append("type", editingSlide.type);
      formData.append("spent", editingSlide.spent.toString());
      formData.append("goal", editingSlide.goal.toString());
      formData.append("colected", editingSlide.colected.toString());
  
      if (imageFile) {
        formData.append("file", imageFile);
      }
  
      body = formData;
    }
  
    console.log("Enviando requisição:", { method, url, body });
  
    try {
      const response = await fetch(url, {
        method,
        headers,
        body,
      });
  
      if (!response.ok) {
        console.log("Erro ao salvar a ação:", response.statusText);
        return;
      }
  
      // Recebe os dados atualizados do backend
      const updatedSlide = await response.json();
      console.log("Resposta do backend:", updatedSlide);
  
      closeModal();
  
      // Atualiza o estado local com os dados retornados
      setSlides((prevSlides) => {
        const newSlides = isUpdate
          ? prevSlides.map((slide) => (slide.id === updatedSlide.id ? updatedSlide : slide)) // Atualiza a ação existente
          : [...prevSlides, updatedSlide]; // Adiciona a nova ação
  
        console.log("Estado local atualizado:", newSlides);
        return newSlides;
      });
  
      if (updatedSlide.aws_url) {
        setImageUrls((prevUrls) => ({ ...prevUrls, [updatedSlide.id]: updatedSlide.aws_url }));
      }
    } catch (error) {
      console.log("Erro ao salvar a ação:", error);
    }
  };
  
  const updateSlideImage = async (slideId) => { // Não é para usar essa rota para salvar a foto da ação como imagem não
    const token = Cookies.get("auth_token");
  
    if (!imageFile) return;
  
    const formData = new FormData();
    formData.append("file", imageFile);
  
    try {
      const response = await fetch(`http://127.0.0.1:3333/ongs/actions/${slideId}/image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }, // Mantém o cabeçalho de autenticação para rotas privadas
        body: formData,
      });
  
      if (!response.ok) {
        console.log("Erro ao atualizar a imagem:", response.statusText);
        return;
      }
  
      const updatedImage = await response.json();
      console.log("Imagem atualizada com sucesso:", updatedImage);
  
      setImageUrls((prevUrls) => ({ ...prevUrls, [slideId]: updatedImage.aws_url }));
    } catch (error) {
      console.log("Erro ao atualizar a imagem:", error);
    }
  };

  return (
    <main className="flex flex-col items-center bg-gray-100 min-h-screen py-10">
      <h1 className="text-center text-5xl font-bold text-[#2E4049] mt-20">{ngoName}</h1>
      <h1 className="text-center text-4xl font-bold text-[#2E4049] mt-20">Ações</h1>

      <Carousel opts={{ align: "start" }} className="w-[100%] p-4 mt-16">
        <CarouselContent>
          {[...slides, { isAddCard: true }].map((slide, index) => (
            <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4 max-w-[400px] border-none shadow-none">
              {slide.isAddCard ? (
                <div
                  className="p-1 flex items-center justify-center bg-gray-200 rounded-lg h-64 cursor-pointer"
                  onClick={() => openModal()}
                >
                  <p className="text-lg font-semibold text-gray-600">+ Adicionar Ação</p>
                </div>
              ) : (
                <div className="p-1">
                  <div className="relative w-full">
                    {/* Container da Imagem */}
                    <div className="relative w-full h-[180px] overflow-hidden rounded-t-lg">
                      <Image
                        src={imageUrls[slide.id] || capa.src}
                        alt="Imagem da ação"
                        layout="fill"
                        objectFit="cover"
                        className="absolute top-0 left-0 w-full h-full"
                      />
                    </div>

                    {/* Container do Card */}
                    <div className="relative z-10 -mt-12 bg-white p-6 border border-gray-200 rounded-lg shadow-lg w-[90%] mx-auto">
                      {/* Botão Editar */}
                      <button
                        onClick={() => openModal(slide)}
                        className="absolute top-3 right-3 bg-[#0056D2] text-white text-xs font-bold px-4 py-1 rounded shadow-sm hover:bg-[#003C99] transition-all"
                      >
                        Editar
                      </button>

                      {/* Tag do Tipo */}
                      <p className="inline-block text-xs font-semibold text-[#0056D2] bg-[#E9F2FF] px-3 py-1 rounded-lg uppercase tracking-wide">
                        {slide.type}
                      </p>

                      {/* Título */}
                      <h2 className="text-lg font-semibold mt-3 text-gray-900">{slide.name}</h2>

                      {/* Barra de Progresso */}
                      <Progress
                        className="w-full bg-gray-200 mt-3"
                        indicatorClass="bg-[#0056D2]"
                        value={(slide.spent / slide.goal) * 100}
                      />

                      {/* Valores numéricos */}
                      <div className="flex justify-between text-sm font-semibold text-gray-700 mt-4">
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Arrecadado</p>
                          <p className="text-lg font-bold whitespace-nowrap">
                            R${" "}
                            {new Intl.NumberFormat("pt-BR", { notation: "compact", compactDisplay: "short" }).format(slide.colected)}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Gasto</p>
                          <p className="text-lg font-bold text-red-500 whitespace-nowrap">
                            R${" "}
                            {new Intl.NumberFormat("pt-BR", { notation: "compact", compactDisplay: "short" }).format(slide.spent)}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Meta</p>
                          <p className="text-lg font-bold whitespace-nowrap">
                            R${" "}
                            {new Intl.NumberFormat("pt-BR", { notation: "compact", compactDisplay: "short" }).format(slide.goal)}
                          </p>
                        </div>
                      </div>


                      {/* Botão de Ação */}
                      <div className="mt-5 flex justify-between items-center">
                        <Button className="w-full h-12 font-semibold rounded-full bg-[#0056D2] text-white hover:bg-[#003C99] transition-all">
                          TRANSPARÊNCIA
                        </Button>
                        <div className="ml-2 w-10 h-10 rounded-full bg-gray-100 flex justify-center items-center cursor-pointer">
                          <Image className="w-6 h-6" src={shareButton} alt="share" />
                        </div>
                      </div>
                    </div>
                  </div>


                </div>
              )}
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="flex justify-center mt-4 gap-4 pb-4 w-full">
          <CarouselPrevious />
          <CarouselNext />
        </div>
      </Carousel>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-white rounded-xl shadow-2xl p-8 border b border-[#2E4049] text-[#2E4049] w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingSlide?.id ? "Editar Ação" : "Nova Ação"}</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="details">Detalhes</TabsTrigger>
              <TabsTrigger value="image">Imagem</TabsTrigger>
            </TabsList>

            <TabsContent value="details">
              <Label className="text-sm font-medium">Título</Label>
              <Input
                placeholder="Digite o título"
                value={editingSlide?.name || ""}
                onChange={(e) => setEditingSlide({ ...editingSlide, name: e.target.value })}
              />

              <Label className="text-sm font-medium mt-4">Categoria</Label>
              <Input
                placeholder="Digite a categoria"
                value={editingSlide?.type || ""}
                onChange={(e) => setEditingSlide({ ...editingSlide, type: e.target.value })}
              />

              <Label className="text-sm font-medium mt-4">Meta (R$)</Label>
              <Input
                type="number"
                placeholder="Digite a meta"
                value={editingSlide?.goal || ""}
                onChange={(e) => setEditingSlide({ ...editingSlide, goal: +e.target.value })}
              />

              <Label className="text-sm font-medium mt-4">Arrecadado (R$)</Label>
              <Input
                type="number"
                placeholder="Digite o valor arrecadado"
                value={editingSlide?.colected || ""}
                onChange={(e) => setEditingSlide({ ...editingSlide, colected: +e.target.value })}
              />

              <Label className="text-sm font-medium mt-4">Gasto (R$)</Label>
              <Input
                type="number"
                placeholder="Digite o valor gasto"
                value={editingSlide?.spent || ""}
                onChange={(e) => setEditingSlide({ ...editingSlide, spent: +e.target.value })}
              />
            </TabsContent>

            <TabsContent value="image">
              <Label className="text-sm font-medium">Imagem da Ação</Label>
              <div className="flex flex-col items-center gap-2 border border-gray-300 p-4 rounded-lg">
                <Label
                  htmlFor="file-upload"
                  className="w-full flex justify-center items-center bg-gray-200 text-gray-700 py-2 px-4 rounded-md cursor-pointer hover:bg-gray-300 transition-all"
                >
                  <UploadCloud className="mr-2" /> Escolher Arquivo
                </Label>
                <Input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="file-upload" />
                {imagePreview && <Image src={imagePreview} alt="Pré-visualização" width={300} height={200} className="mt-4 rounded-lg" />}
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>Cancelar</Button>
            <Button onClick={handleSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

        {/* Tabs */}
        <div className="w-full flex justify-center border-b border-gray-300 mt-6">
            <div className="flex space-x-6">
            {["gallery", "balance", "documents"].map((tab) => (
                <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium transition-all ${
                    activeTab === tab
                    ? "text-[#294BB6] border-b-2 border-[#294BB6]"
                    : "text-gray-500 hover:text-[#2E4049]"
                }`}
                >
                {tab === "gallery" && "Galeria"}
                {tab === "balance" && "Balanço de Gastos"}
                {tab === "documents" && "Documentos"}
                </button>
            ))}
            </div>
        </div>

        {/* Conteúdo das Tabs */}
        <div className="w-full mt-6">
            {activeTab === "gallery" && <Gallery />}
            {activeTab === "balance" && <Balance />}
            {activeTab === "documents" && <Documents />}
        </div>
    </main>
  );
}
