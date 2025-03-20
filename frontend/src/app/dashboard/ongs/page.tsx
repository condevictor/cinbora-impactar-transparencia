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
  const [searchTerm, setSearchTerm] = useState("");

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
  
   
    const url = forceFetch
      ? `http://127.0.0.1:3333/ongs/${ngoId}/actions?nocache=${Date.now()}`
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
    
      body = JSON.stringify({
        name: editingSlide.name,
        type: editingSlide.type,
        spent: editingSlide.spent,
        goal: editingSlide.goal,
        colected: editingSlide.colected,
      });
      headers["Content-Type"] = "application/json";
    } else {
     
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
  

      const updatedSlide = await response.json();
      console.log("Resposta do backend:", updatedSlide);
  
      closeModal();
  
      
      setSlides((prevSlides) => {
        const newSlides = isUpdate
          ? prevSlides.map((slide) => (slide.id === updatedSlide.id ? updatedSlide : slide)) // Atualiza a ação existente
          : [...prevSlides, updatedSlide]; 
  
        console.log("Estado local atualizado:", newSlides);
        return newSlides;
      });
  
      if (updatedSlide.aws_url) {
        setImageUrls((prevUrls) => ({ ...prevUrls, [updatedSlide.id]: updatedSlide.aws_url }));
      }

    
      if (isUpdate && imageFile) {
        await updateSlideImage(updatedSlide.id);
      }
    } catch (error) {
      console.log("Erro ao salvar a ação:", error);
    }
  };

  const updateSlideImage = async (slideId) => {
    const token = Cookies.get("auth_token");
    if (!imageFile) return;
    const formData = new FormData();
    formData.append("file", imageFile);
    try {
      const response = await fetch(`http://127.0.0.1:3333/ongs/actions/${slideId}/image`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!response.ok) {
        console.log("Erro ao atualizar a imagem:", response.statusText);
        return;
      }
      const updatedImage = await response.json();
      setImageUrls((prevUrls) => ({ ...prevUrls, [slideId]: updatedImage.aws_url }));
    } catch (error) {
      console.log("Erro ao atualizar a imagem:", error);
    }
  };

  return (
    <main className="flex flex-col items-center bg-gray-100 min-h-screen">
      <h1 className="text-center text-5xl font-bold text-[#2E4049] mt-20">Transparência</h1>
      <h1 className="text-center text-4xl font-bold text-[#2E4049] mt-20">Ações</h1>

      
      <div className="w-full max-w-md mx-auto mt-6 px-4">
        <Input
          placeholder="Buscar por nome ou meta"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {(() => {
        const filteredSlides = slides.filter((slide) =>
          slide.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          slide.type.toLowerCase().includes(searchTerm.toLowerCase())
        );
        const displaySlides = searchTerm ? filteredSlides : [{ isAddCard: true }, ...filteredSlides];
        
        return searchTerm && filteredSlides.length === 0 ? (
          <div className="mt-10 text-red-600">
            ação não encontrada
          </div>
        ) : (
          <Carousel opts={{ align: "start" }} className="mt-16 w-full p-4">
            <CarouselContent>
              {displaySlides.map((slide, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4 border-none shadow-none">
                  {slide.isAddCard ? (
                    <div
                      className="p-1 flex items-center justify-center bg-gray-200 rounded-lg h-64 cursor-pointer"
                      onClick={() => openModal()}
                    >
                      <p className="text-lg font-semibold text-gray-600">+ Adicionar Ação</p>
                    </div>
                  ) : (
                    <CardContent className="relative p-4 min-w-72">
                      <div
                        className="absolute inset-0 bg-no-repeat bg-center bg-cover max-h-48"
                        style={{ backgroundImage: `url(${imageUrls[slide.id] || capa.src})` }}
                      />
                      <div className="relative z-10 bg-white mt-32 w-full">
                        <div className="flex flex-col justify-between p-4 w-full h-64 border border-white rounded shadow-[0_1px_4px_1px_rgba(16,24,40,0.1)]">
                          <div className="relative">
                            <button
                              onClick={() => openModal(slide)}
                              className="absolute  right-3 bg-[#0056D2] text-white text-xs font-bold px-4 py-1 rounded shadow-sm hover:bg-[#003C99] transition-all"
                            >
                              Editar
                            </button>
                            <p className="inline text-sm font-semibold text-[#294BB6] px-2 py-1 bg-[#2BAFF1] bg-opacity-20 rounded">
                              {slide.type}
                            </p>
                          </div>
                          <div className="font-semibold">{slide.name}</div>
                          <div>
                            <Progress className="w-full bg-[#EAECF0]" indicatorClass="bg-[#2BAFF150]" value={(slide.colected / slide.goal) * 100} />
                          </div>
                          <div className="flex justify-between font-semibold">
                            <div className="flex flex-col">
                              <p className="text-xs font-light text-gray-600">Gasto</p>
                              <p>R${slide.spent}</p>
                            </div>
                            <div className="flex flex-col">
                              <p className="text-xs font-light text-gray-600">Coletado</p>
                              <p>R${slide.colected}</p>
                            </div>
                            <div className="flex flex-col">
                              <p className="text-xs font-light text-gray-600">Meta</p>
                              <p>R${slide.goal}</p>
                            </div>
                          </div>
                          <hr className="border-solide border borde-gray-500" />
                          <div className="flex justify-between items-center h-10">
                            <Button className="w-4/5 h-full font-bold rounded-[34px] bg-[#294BB6] text-white border-solid border-[#2E4049] border hover:text-[#294BB6] hover:bg-white">
                              TRANSPARÊNCIA
                            </Button>
                            <div className="w-2/12 rounded-full h-full bg-[#F2F4F7] flex justify-center items-center">
                              <Image className="w-6 h-6" src={shareButton} alt="share" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-center mt-4 gap-4 pb-4 w-full">
              <CarouselPrevious />
              <CarouselNext />
            </div>
          </Carousel>
        );
      })()}

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
