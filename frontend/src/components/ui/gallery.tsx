"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { UploadCloud, Camera, Video } from "lucide-react";
import Image from "next/image";

export default function Gallery() {
  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<"image" | "video" | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploadType, setUploadType] = useState<"image" | "video" | null>(null);
  const [category, setCategory] = useState<"tax_invoice" | "report" | "image" | "video" | "other">("image");

  useEffect(() => {
    const ngoId = Cookies.get("ngo_id");
    const authToken = Cookies.get("auth_token");
  
    if (!ngoId || !authToken) {
      console.log("Erro: NGO ID ou Token não encontrado.");
      return;
    }
  
    console.log("Buscando imagens e vídeos...");
  
    // Busca as imagens
    fetch(`http://127.0.0.1:3333/ongs/${ngoId}/files/images`, {
      headers: { Authorization: `Bearer ${authToken}` },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Erro ${res.status}: ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => {
        if (!Array.isArray(data)) {
          console.log("Erro: Resposta de imagens não é um array.");
          return;
        }
        console.log("Imagens recebidas:", data);
        setImages(data.map((item) => item.aws_url));
      })
      .catch((error) => {
        console.log("Erro ao buscar imagens:", error);
        setImages([]);
      });
  
    // Busca os vídeos
    fetch(`http://127.0.0.1:3333/ongs/${ngoId}/files/videos`, {
      headers: { Authorization: `Bearer ${authToken}` },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Erro ${res.status}: ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => {
        if (!Array.isArray(data)) {
          console.log("Erro: Resposta de vídeos não é um array.");
          return;
        }
        console.log("Vídeos recebidos:", data);
        setVideos(data.map((item) => item.aws_url));
      })
      .catch((error) => {
        console.log("Erro ao buscar vídeos:", error);
        setVideos([]);
      });
  }, []);
  
  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>, // Define o tipo do evento
    type: "image" | "video" // Define o tipo do parâmetro "type"
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
  
    setUploadType(type);
    setFile(file);
    setPreview(URL.createObjectURL(file));
    setPreviewType(type);
  
    // Define a categoria padrão com base no tipo do arquivo
    setCategory(type === "image" ? "image" : "video");
  
    setIsDialogOpen(true);
  };
  
  const handleUpload = async () => {
    if (!file || !uploadType) {
      toast.warning("Selecione um arquivo antes de confirmar o upload.");
      return;
    }
  
    const ngoId = Cookies.get("ngo_id");
    const authToken = Cookies.get("auth_token");
  
    if (!ngoId || !authToken) {
      toast.error("Erro de autenticação. Faça login novamente.");
      return;
    }
  
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category);
  
    try {
      const response = await fetch(`http://127.0.0.1:3333/ongs/files/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${authToken}` },
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error("Erro ao enviar o arquivo.");
      }
  
      // Recebe os dados do arquivo enviado
      const uploadedFile = await response.json();
      console.log("Resposta do backend:", uploadedFile);
  
      toast.success("Upload concluído com sucesso!");
  
      setIsDialogOpen(false);
      setFile(null);
      setPreview(null);
  
      // Atualiza o estado local com base no tipo de arquivo enviado
      if (uploadType === "image") {
        setImages((prev) => [...prev, uploadedFile.aws_url]);
      } else {
        setVideos((prev) => [...prev, uploadedFile.aws_url]);
      }
    } catch (error) {
      console.log("Erro no upload:", error);
      toast.error("Falha ao enviar o arquivo. Tente novamente.");
    }
  };



  return (
    <div className="flex flex-col items-center w-full">
      {/* Título da Galeria */}
      <h2 className="text-3xl font-bold mb-6">Galeria de Fotos e Vídeos</h2>

      {/* Separador */}
      <div className="w-full border-b-2 border-gray-300 mb-6"></div>

      <div className="flex flex-col w-full max-w-6xl mx-auto">
        {/* Seção de Imagens */}
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Camera className="text-blue-600" size={24} />
          Imagens
        </h2>

        <div className="grid grid-cols-[repeat(auto-fill,_minmax(300px,_1fr))] gap-6">
          {/* Botão de Upload de Imagens */}
          <label className="border-2 border-dashed border-gray-300 w-[300px] h-[300px] flex flex-col justify-center items-center cursor-pointer rounded-lg">
            <UploadCloud className="text-blue-600" size={32} />
            <span className="text-lg font-semibold">Carregar Imagem</span>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileSelect(e, "image")} />
          </label>

          {/* Grid de Imagens */}
          {images.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`Imagem ${index}`}
              className="w-[300px] h-[300px] rounded-lg shadow object-cover"
            />
          ))}
        </div>

        {/* Seção de Vídeos */}
        <h2 className="text-lg font-bold mt-10 mb-4 flex items-center gap-2">
          <Video className="text-blue-600" size={24} />
          Vídeos
        </h2>

        <div className="grid grid-cols-[repeat(auto-fill,_minmax(300px,_1fr))] gap-6">
          {/* Botão de Upload de Vídeos */}
          <label className="border-2 border-dashed border-gray-300 w-[300px] h-[300px] flex flex-col justify-center items-center cursor-pointer rounded-lg">
            <UploadCloud className="text-blue-600" size={32} />
            <span className="text-lg font-semibold">Carregar Vídeo</span>
            <input type="file" accept="video/*" className="hidden" onChange={(e) => handleFileSelect(e, "video")} />
          </label>

          {/* Grid de Vídeos */}
          {videos.map((vid, index) => (
            <video
              key={index}
              src={vid}
              className="w-[300px] h-[300px] rounded-lg shadow object-cover"
              controls
            />
          ))}
        </div>
      </div>

      {/* Modal de Pré-visualização e Upload */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-white rounded-xl shadow-xl p-6">
          <DialogHeader>
            <DialogTitle>Pré-visualização</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            {previewType === "image" && preview && <Image src={preview} alt="Preview" width={600} height={400} />}
            {previewType === "video" && preview && (
              <video src={preview} className="w-full rounded-lg" controls />
            )}

            {/* Dropdown para seleção de categoria */}
            <label className="font-semibold">Categoria:</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as "tax_invoice" | "report" | "image" | "video" | "other")}
              className="border p-2 rounded-lg"
            >
              <option value="tax_invoice">Nota Fiscal</option>
              <option value="report">Relatório</option>
              <option value="image">Imagem</option>
              <option value="video">Vídeo</option>
              <option value="other">Outro</option>
            </select>

            <Button onClick={handleUpload}>Confirmar Upload</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
