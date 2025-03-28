"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { UploadCloud, Camera, Video, Trash2 } from "lucide-react";
import Image from "next/image";
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

// Interface para representar os arquivos de mídia
interface MediaFile {
  id: string;
  aws_url: string;
  category: string;
  filename: string;
  type: "image" | "video";
}

export default function Gallery() {
  const [imageFiles, setImageFiles] = useState<MediaFile[]>([]);
  const [videoFiles, setVideoFiles] = useState<MediaFile[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<"image" | "video" | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploadType, setUploadType] = useState<"image" | "video" | null>(null);
  const [category, setCategory] = useState<"tax_invoice" | "report" | "image" | "video" | "other">("image");
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

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
        const typedImages = data.map((item) => ({ ...item, type: "image" as const }));
        setImageFiles(typedImages);
      })
      .catch((error) => {
        console.log("Erro ao buscar imagens:", error);
        setImageFiles([]);
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
        const typedVideos = data.map((item) => ({ ...item, type: "video" as const }));
        setVideoFiles(typedVideos);
      })
      .catch((error) => {
        console.log("Erro ao buscar vídeos:", error);
        setVideoFiles([]);
      });
  }, []);
  
  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>, 
    type: "image" | "video"
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
  
      const newFile = { ...uploadedFile, type: uploadType };
      
      // Atualiza o estado local com base no tipo de arquivo enviado
      if (uploadType === "image") {
        setImageFiles((prev) => [...prev, newFile]);
      } else {
        setVideoFiles((prev) => [...prev, newFile]);
      }
    } catch (error) {
      console.log("Erro no upload:", error);
      toast.error("Falha ao enviar o arquivo. Tente novamente.");
    }
  };

  // Função para expandir a imagem
  const handleExpandImage = (img: string) => {
    setExpandedImage(img);
  };

  // Função única para deletar qualquer tipo de arquivo
  const handleDeleteFile = async (fileId: string) => {
    const authToken = Cookies.get("auth_token");
  
    if (!authToken) {
      toast.error("Erro de autenticação. Faça login novamente.");
      return;
    }
  
    // Encontra o arquivo nos arrays para determinar seu tipo
    const imageFile = imageFiles.find(img => img.id === fileId);
    const videoFile = videoFiles.find(vid => vid.id === fileId);
    
    if (!imageFile && !videoFile) {
      toast.error("Arquivo não encontrado.");
      return;
    }

    const isImage = !!imageFile;
  
    try {
      const response = await fetch(`http://127.0.0.1:3333/ongs/files/${fileId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` },
      });
  
      if (!response.ok) {
        throw new Error(`Erro ao deletar ${isImage ? "a imagem" : "o vídeo"}.`);
      }
  
      toast.success(`${isImage ? "Imagem" : "Vídeo"} removido com sucesso!`);
      
      // Atualiza o estado removendo o arquivo deletado
      if (isImage) {
        setImageFiles(prev => prev.filter(img => img.id !== fileId));
      } else {
        setVideoFiles(prev => prev.filter(vid => vid.id !== fileId));
      }
    } catch (error) {
      console.error(`Erro ao deletar arquivo:`, error);
      toast.error(`Falha ao remover ${isImage ? "a imagem" : "o vídeo"}. Tente novamente.`);
    }
  };

  return (
    <div className="flex flex-col items-center w-11/12 max-w-6xl m-auto">
      <h2 className="text-3xl font-bold mb-6 mt-10 w-full text-center">Galeria de Fotos e Vídeos</h2>
      <div className="w-full border-b border-gray-300 mb-8"></div>
  
      <div className="flex flex-col w-full">
        {/* Imagens */}
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-700">
          <Camera className="text-blue-600 mr-2" size={28} />
          Imagens
        </h2>
  
        <div className="grid grid-cols-3 gap-6 max-lg:grid-cols-2 max-sm:grid-cols-1">
          {/* Botão upload imagem */}
          <label className="border-2 border-dashed border-gray-300 w-full h-64 flex flex-col justify-center items-center cursor-pointer rounded-[16px] hover:shadow-lg transition">
            <UploadCloud className="text-blue-600 mb-2" size={32} />
            <span className="text-lg font-semibold text-gray-600">Carregar Imagem</span>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileSelect(e, "image")} />
          </label>
  
          {/* Galeria de imagens com botão de exclusão */}
          {imageFiles.map((imgFile, index) => (
            <div key={index} className="relative group">
              <img
                src={imgFile.aws_url}
                alt={`Imagem ${index}`}
                className="w-full h-64 object-cover rounded-[16px] shadow-md cursor-pointer hover:shadow-lg transition"
                onClick={() => handleExpandImage(imgFile.aws_url)}
              />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-2xl shadow-lg p-6 w-[380px] flex flex-col items-center bg-white">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-lg font-semibold text-gray-900 text-center">
                      Deseja excluir esta imagem?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-600 text-center mt-2">
                      Esta operação não poderá ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex gap-4 mt-4">
                    <AlertDialogCancel className="bg-gray-200 text-gray-800 rounded-full px-6 py-3 hover:bg-gray-300 transition-all w-full sm:w-auto">
                      Cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-500 text-white rounded-full px-6 py-3 hover:bg-red-600 transition-all w-full sm:w-auto"
                      onClick={() => handleDeleteFile(imgFile.id)}
                    >
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}
        </div>
  
        {/* Vídeos */}
        <h2 className="text-xl font-bold mt-12 mb-4 flex items-center gap-2 text-gray-700">
          <Video className="text-blue-600 mr-2" size={28} />
          Vídeos
        </h2>
  
        <div className="grid grid-cols-3 gap-6 max-lg:grid-cols-2 max-sm:grid-cols-1 mb-20">
          {/* Botão upload vídeo */}
          <label className="border-2 border-dashed border-gray-300 w-full h-64 flex flex-col justify-center items-center cursor-pointer rounded-[16px] hover:shadow-lg transition">
            <UploadCloud className="text-blue-600 mb-2" size={32} />
            <span className="text-lg font-semibold text-gray-600">Carregar Vídeo</span>
            <input type="file" accept="video/*" className="hidden" onChange={(e) => handleFileSelect(e, "video")} />
          </label>
  
          {/* Galeria de vídeos com botão de exclusão */}
          {videoFiles.map((vidFile, index) => (
            <div key={index} className="relative group">
              <video
                src={vidFile.aws_url}
                className="w-full h-64 object-cover rounded-[16px] shadow-md hover:shadow-lg transition"
                controls
              />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-2xl shadow-lg p-6 w-[380px] flex flex-col items-center bg-white">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-lg font-semibold text-gray-900 text-center">
                      Deseja excluir este vídeo?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-600 text-center mt-2">
                      Esta operação não poderá ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex gap-4 mt-4">
                    <AlertDialogCancel className="bg-gray-200 text-gray-800 rounded-full px-6 py-3 hover:bg-gray-300 transition-all w-full sm:w-auto">
                      Cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-500 text-white rounded-full px-6 py-3 hover:bg-red-600 transition-all w-full sm:w-auto"
                      onClick={() => handleDeleteFile(vidFile.id)}
                    >
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}
        </div>
      </div>
  
      {/* Modal de Pré-visualização */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-white rounded-[16px] shadow-xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Pré-visualização</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            {previewType === "image" && preview && (
              <Image
                src={preview}
                alt="Preview"
                width={600}
                height={400}
                className="rounded-[16px] shadow-md"
              />
            )}
            {previewType === "video" && preview && (
              <video src={preview} className="w-full rounded-[16px]" controls />
            )}
  
            <label className="font-semibold text-gray-700">Categoria:</label>
            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as "tax_invoice" | "report" | "image" | "video" | "other")
              }
              className="border p-2 rounded-[16px] focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <option value="tax_invoice">Nota Fiscal</option>
              <option value="report">Relatório</option>
              <option value="image">Imagem</option>
              <option value="video">Vídeo</option>
              <option value="other">Outro</option>
            </select>
  
            <Button className="rounded-[16px]" onClick={handleUpload}>
              Confirmar Upload
            </Button>
          </div>
        </DialogContent>
      </Dialog>
  
      {/* Modal de imagem expandida */}
      <Dialog open={expandedImage !== null} onOpenChange={() => setExpandedImage(null)}>
        <DialogContent className="bg-white rounded-[16px] shadow-xl p-6">
          {expandedImage && (
            <img src={expandedImage} alt="Imagem Expandida" className="w-full h-auto rounded-[16px]" />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );  
}
