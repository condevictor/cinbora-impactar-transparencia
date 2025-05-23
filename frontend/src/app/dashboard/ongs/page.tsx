"use client";

import { Search, Target, Trash2, HelpCircle } from "lucide-react"
import { API_BASE_URL } from "@/config/api"
import Link from "next/link";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";
import ModalPortal from "@/components/ui/modalPortal";
import { UploadCloud, Loader2 } from "lucide-react";
import { FiChevronDown, FiTrash2 } from "react-icons/fi";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";
import shareButton from "../../../assets/share.svg";
import capa from "../../../assets/capa.svg";
import Gallery from "@/components/ui/gallery";
import Balance from "@/components/ui/balance";
import Documents from "@/components/ui/documents";
import { toast } from "sonner"
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
import { useRouter } from "next/navigation";
import InfoTooltipModal from "@/components/ui/HelpTooltip";


type EditingSlideType = {
	id?: string;
	name: string;
	type: string;
	categorysExpenses: Record<string, number | string>;
	spent: number | string;
	goal: number | string;
	colected: number | string;
	aws_url?: string;
};

type SlideType = EditingSlideType | { isAddCard: boolean; id?: never };

const calculateSpent = (expenses: Record<string, number | string>): number =>
  Object.values(expenses).reduce<number>((acc, val) => {
    const numericVal = typeof val === 'string' ? parseFloat(val) || 0 : val;
    return acc + numericVal;
  }, 0);


export default function ActionsPage() {
  const [slides, setSlides] = useState<SlideType[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [actionToDelete, setActionToDelete] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [editingSlide, setEditingSlide] = useState<EditingSlideType>({
    name: "",
    type: "",
    categorysExpenses: {} as Record<string, number | string>,
    spent: 0,
    goal: 0,
    colected: 0,
  });
  const [ngoName, setNgoName] = useState("Carregando...");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState("galeria");
  const [modalTab, setModalTab] = useState("detalhes");  
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [hoveredSlide, setHoveredSlide] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [originalCategorysExpenses, setOriginalCategorysExpenses] = useState<Record<string, number>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); 
  const [categoryNotificationShown, setCategoryNotificationShown] = useState(false);

  const router = useRouter();
  
  const generateHash = async (name: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(name);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};



  useEffect(() => {
    if (editingSlide.id) {
      fetch(`${API_BASE_URL}/ongs/actions/${editingSlide.id}`, {
        headers: { Authorization: `Bearer ${Cookies.get("auth_token")}` },
      })
        .then((res) => res.json())
        .then((data) => {
          setEditingSlide((prev) => ({
            ...prev,
            aws_url: `${data.action.aws_url}?t=${Date.now()}`,
          }));
        })
        .catch((err) => console.error("Erro ao buscar ação:", err));
    }
  }, [editingSlide.id]);
  
  useEffect(() => {
    setEditingSlide((prev) => ({
      ...prev,
      spent: Object.values(prev?.categorysExpenses || {}).reduce<number>((acc, val) =>
        acc + (typeof val === 'string' ? (parseFloat(val) || 0) : Number(val)), 0),
    }));
  }, [editingSlide?.categorysExpenses]);
  
  

  useEffect(() => {
    const ngoCookieName = Cookies.get("ngo_name");
    if (ngoCookieName) {
      setNgoName(ngoCookieName);
    } else {
      setNgoName("Nome não encontrado");
    }
  }, []);
  
  useEffect(() => {
      setActiveTab("gallery");
  }, []);

  useEffect(() => {
    if (isOpen) {
      setModalTab("detalhes");
    }
  }, [isOpen]);
  
  
  useEffect(() => {
    fetchActions();
  }, []);
  
  useEffect(() => {
    const ngoId = Cookies.get("ngo_id");
    const token = Cookies.get("auth_token");
  
    fetch(`${API_BASE_URL}/logs/last/${ngoId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        const timestamp = data?.timestamp;
        if (timestamp) {
          const date = new Date(timestamp);
          const formatted = date.toLocaleDateString("pt-BR");
          setLastUpdated(formatted);
        }
      })
      .catch(err => {
        console.error("Erro ao buscar última atualização:", err);
      });
  }, []);
  
    
  
  useEffect(() => {
    if (isOpen) {
      const extractedCategories = [
        ...Array.from(new Set(slides
          .map((slide: SlideType) => 
            'isAddCard' in slide ? undefined : slide.type)
          .filter(Boolean) as string[]
        ))
      ];
      setCategories(extractedCategories);
    }
  }, [isOpen, slides]);
  
  
  const openModal = async (slide?: EditingSlideType | null) => {
    if (!slides.length) {
      console.log("Carregando ações antes de abrir o modal...");
      await fetchActions();
    }
  
    // Always reset the selectedCategory when opening modal
    setSelectedCategory(null);
    
    if (slide?.id) {
      setEditingSlide({
        id: slide.id,
        name: slide.name || "",
        type: slide.type || "",
        categorysExpenses: slide.categorysExpenses || {},
        spent: slide.spent || 0,
        goal: slide.goal || 0,
        colected: slide.colected || 0,
        aws_url: slide.aws_url || "",
      });
  
      setImagePreview(slide.aws_url ?? null);
  
      await fetchActionDetails(slide.id); 
    } else {
      setEditingSlide({
        name: "",
        type: "",
        categorysExpenses: {},
        spent: 0,
        goal: 0,
        colected: 0,
        aws_url: "",
      });
      setImagePreview(null);
    }
  
    setImageFile(null);
    setIsOpen(true);
  };
  
  
  
  const closeModal = () => {
    setIsOpen(false);
    setIsSaving(false);
    setSelectedCategory(null); 
    setNewCategory("");
    setCategoryNotificationShown(false); // Reset notification flag when closing modal
    setEditingSlide({
      name: "",
      type: "",
      categorysExpenses: {},
      spent: 0,
      goal: 0,
      colected: 0,
      aws_url: "", 
    });
    setImagePreview(null);
    setImageFile(null);
  };
  
  
  
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
  
    try {
      const hash = await generateHash(file.name);
      const extension = file.name.split(".").pop();
      const newFileName = `${hash}.${extension}`;
  
      const renamedFile = new File([file], newFileName, { type: file.type });
  
      setImageFile(renamedFile);
      setImagePreview(URL.createObjectURL(renamedFile));
  
      console.log("Imagem preparada para upload:", renamedFile);
    } catch (error) {
      console.error("Erro ao processar a imagem:", error);
    }
  };

  const deleteAction = async (actionId: string): Promise<void> => {
    const token = Cookies.get("auth_token");

    try{
        const res = await fetch(`${API_BASE_URL}/ongs/actions/${actionId}`, {
          method: "DELETE",
          headers: {
          Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Erro ao deletar ação");
        }

        toast.success("Ação deletada com sucesso!");
        setSlides((prev) => prev.filter((s) => !('isAddCard' in s) && s.id !== actionId));
        setActionToDelete(null);
        
        // Force a complete refresh of all actions data
        await fetchActions(true);
        
        // If currently on balance tab, trigger a refresh of the balance component
        if (activeTab === "balance") {
          const event = new CustomEvent('refreshBalance', { detail: { timestamp: Date.now() } });
          window.dispatchEvent(event);
        }
      } catch (error) {
        console.error(error);
        toast.error("Erro ao deletar a ação.");
      }
    };
  
  const updateCategoryExpenses = async (
    actionId: string, 
    categorysExpenses: Record<string, number | string>
  ): Promise<boolean> => {
    const token = Cookies.get("auth_token");
  
    try {
      const response = await fetch(`${API_BASE_URL}/ongs/actions/${actionId}/grafic`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ categorysExpenses }),
      });
  
      if (!response.ok) {
        throw new Error(`Erro ao atualizar categorias: ${response.statusText}`);
      }
  
      return true;
    } catch (error) {
      console.error("Erro ao atualizar categorias de despesas:", error);
      toast.error("Erro ao atualizar categorias de despesas.");
      return false;
    }
  };
  
  
  
  const fetchActions = async (forceFetch = false) => {
    const ngoId = Cookies.get("ngo_id");
  
    if (!ngoId) {
      console.log("Erro: NGO ID não encontrado.");
      return;
    }
  
    const url = forceFetch
      ? `${API_BASE_URL}/ongs/${ngoId}/actions?nocache=${Date.now()}`
      : `${API_BASE_URL}/ongs/${ngoId}/actions`;
  
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
  
      const data = await response.json();
      setSlides(data);
  
      const urls: Record<string, string> = {};
      data.forEach((slide: any) => {
        if (slide.id) {
          urls[slide.id] = slide.aws_url || "";
        }
      });
      setImageUrls(urls);
    } catch (error) {
      console.log("Erro ao buscar ações:", error);
    }
  };
  
  const fetchActionDetails = async (actionId: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/ongs/actions/${actionId}`);
      if (!response.ok) throw new Error("Erro ao buscar detalhes da ação.");
  
      const data = await response.json();
  
      // Initialize direct category totals instead of tracking by month
      let categoryTotals: Record<string, number> = {};
      
      // Use the action's categorysExpenses directly if available - this is the source of truth
      if (data.action?.categorysExpenses) {
        categoryTotals = { ...data.action.categorysExpenses };
      } 
      // Only fall back to calculating from actionGrafic if necessary
      else if (data?.actionGrafic?.[0]?.categorysExpenses) {
        // Instead of summing all records, create a map of the latest value for each category
        const categoryLatestValues: Record<string, number> = {};
        
        // Get most recent data
        const mostRecentData = data.actionGrafic[0];
        
        // Find the latest values across all time periods without adding them together
        mostRecentData.categorysExpenses.forEach((year: any) => {
          year.months.forEach((month: any) => {
            month.dailyRecords.forEach((record: any) => {
              // For each category in this record, update its latest value (overwrite, don't add)
              Object.entries(record.categorysExpenses).forEach(([category, value]) => {
                categoryLatestValues[category] = Number(value);
              });
            });
          });
        });
        
        // Use the latest values
        categoryTotals = categoryLatestValues;
      }
  
      setOriginalCategorysExpenses(categoryTotals);
      
      const awsUrl = data.action.aws_url || "";
      
      // Use the correct spent value from the action data
      const spentValue = data.action.spent || calculateSpent(categoryTotals);
      
      setEditingSlide((prev) => ({
        ...prev,
        ...data.action,
        aws_url: awsUrl,
        categorysExpenses: categoryTotals,
        spent: spentValue,
      }));
      
      setImagePreview(awsUrl ?? null);
    } catch (error) {
      console.error("Erro ao carregar detalhes da ação:", error);
      toast.error("Erro ao carregar detalhes da ação.");
    }
  };
  
  const validateAndFixCategories = () => {
    let updatedCategories = { ...editingSlide.categorysExpenses };
  
    Object.keys(updatedCategories).forEach((category) => {
      const currentValue = Number(updatedCategories[category]);
  
      if (currentValue === 0 || isNaN(currentValue)) {
        updatedCategories[category] = 0;
      }
    });
  
    setEditingSlide((prev) => ({
      ...prev,
      categorysExpenses: updatedCategories,
    }));
  
    return updatedCategories;
  };

const updateSlideImage = async (slideId: string): Promise<void> => {
  const token = Cookies.get("auth_token");
  if (!imageFile) return;
  
  const formData = new FormData();
  formData.append("file", imageFile);

  try {
    const response = await fetch(`${API_BASE_URL}/ongs/actions/${slideId}/image`, {
      method: "PUT",
      headers: { 
        Authorization: `Bearer ${token}` 
      } as Record<string, string>,
      body: formData,
    });

    if (!response.ok) {
      console.log("Erro ao atualizar a imagem:", response.statusText);
      return;
    }

    // After successful PUT, fetch the updated action to get the new image
    const getResponse = await fetch(`${API_BASE_URL}/ongs/actions/${slideId}`, {
      headers: { 
        Authorization: `Bearer ${token}` 
      }
    });
    
    if (!getResponse.ok) {
      console.log("Erro ao recuperar a ação atualizada:", getResponse.statusText);
      return;
    }
    
    const updatedAction = await getResponse.json();
    const timestamp = Date.now();
    const imageUrlWithTimestamp = `${updatedAction.action.aws_url}?t=${timestamp}`;

    setImageUrls((prevUrls) => ({
      ...prevUrls,
      [slideId]: imageUrlWithTimestamp,
    }));
    
   
  } catch (error) {
    console.log("Erro ao atualizar a imagem:", error);
    toast.error("Erro ao atualizar a imagem. Tente novamente.");
  }
}

const showCategoryChangeNotification = () => {
  if (!categoryNotificationShown) {
    toast.info("Lembre-se de clicar em Salvar para aplicar as mudanças.", {
      id: "category-changes",
      duration: 5000,
    });
    setCategoryNotificationShown(true);
  }
};
  
const handleSave = async () => {

  if (isSaving) return;
  setIsSaving(true);

  if (!editingSlide.name || !editingSlide.type) {
    toast.error("Erro: Nome e tipo são obrigatórios.");
    setIsSaving(false);
    return;
  }

  const isUpdate = !!editingSlide.id;
  const updatedCategories = validateAndFixCategories();
  const hasCategoryChanges =
    JSON.stringify(updatedCategories) !== JSON.stringify(originalCategorysExpenses);
  
  if (!isUpdate && !imageFile) {
    toast.error("Erro: É obrigatório anexar uma imagem antes de salvar.");
    setIsSaving(false);
    return;
  }

  const token = Cookies.get("auth_token");
  const method = isUpdate ? "PUT" : "POST";
  const url = isUpdate
    ? `${API_BASE_URL}/ongs/actions/${editingSlide.id}`
    : `${API_BASE_URL}/ongs/actions`;

  let body;
  let headers: Record<string, string> = {
    Authorization: `Bearer ${token || ""}`,
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

    Object.entries(updatedCategories).forEach(([key, value]) => {
      formData.append(`categorysExpenses[${key}]`, value.toString());
    });

    if (imageFile) {
      formData.append("file", imageFile);
    }

    body = formData;
  }

  try {
    const response = await fetch(url, {
      method,
      headers,
      body,
    });

    if (!response.ok) {
      throw new Error("Erro ao salvar a ação.");
    }

    const updatedSlide = await response.json();

    const slideId = updatedSlide.id ? String(updatedSlide.id) : "";

    if (isUpdate && slideId && hasCategoryChanges) {
      const categoryRes = await updateCategoryExpenses(slideId, updatedCategories);
      if (categoryRes === false) throw new Error("Erro nas categorias.");
    }
    

    if (isUpdate && slideId && imageFile) {
      updateSlideImage(slideId);
    }

    toast.success("Ação salva com sucesso!");
    setCategoryNotificationShown(false); // Reset notification flag after saving

    setIsSaving(false);
    closeModal();

    setSlides((prevSlides) =>
      isUpdate
        ? prevSlides.map((slide) => (slide.id === updatedSlide.id ? updatedSlide : slide))
        : [...prevSlides, updatedSlide]
    );

    if (updatedSlide.aws_url) {
      setImageUrls((prevUrls) => ({ ...prevUrls, [updatedSlide.id]: updatedSlide.aws_url }));
    }
    
    if (hasCategoryChanges) {
      setActiveTab("balance");
      await fetchActions(true);
      if (activeTab === "balance") {
        const event = new CustomEvent('refreshBalance', { detail: { timestamp: Date.now() } });
        window.dispatchEvent(event);
      }
    }
    
  } catch (error) {
    console.error(error);
    toast.error("Erro ao salvar a ação. Nenhuma alteração foi aplicada.");
    setIsSaving(false);
  }
};

  return (

    <main className="relative flex flex-col items-center min-h-screen py-10">
      <button
        onClick={() => setShowGuide(true)}
        className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all"
        title="Ver guia de instruções"
      >
        <HelpCircle className="w-6 h-6" />
      </button>

      <h1 title={ngoName} className="text-4xl text-center font-bold whitespace-nowrap overflow-hidden text-ellipsis w-[90%] m-auto max-xl:text-3xl max-sm:text-xl mt-20">{ngoName}</h1>
      {lastUpdated && (
        <div className="absolute top-6 right-10 text-gray-600 text-lg max-sm:p-2">
          Dados atualizados pela última vez em: <strong>{lastUpdated}</strong>
        </div>
      )}

      <h1 className="text-center text-4xl font-bold text-[#2E4049] mt-20">Ações</h1>

      <div className="relative w-full max-w-xl mx-auto mt-10 px-4">
        <Search className="absolute left-6 top-3" />
          <input
            type="text"
            placeholder="Buscar por nome ou causa da ação"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 pl-12 border border-gray-300 rounded-[16px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
          />
      </div>
 
      {(() => {
        const filteredSlides = slides.filter(slide =>
          !('isAddCard' in slide) && 
          (slide.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          slide.type?.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        const displaySlides = searchTerm ? filteredSlides : [...filteredSlides, { isAddCard: true }];
 
        if (searchTerm && filteredSlides.length === 0) {
          return <div className="mt-10 text-red-600">ação não encontrada</div>;
        }
 
        return (
          <Carousel opts={{ align: "start" }} className="w-[100%] mt-16 p-4 max-w-[3000px]">
            <CarouselContent>
              {(displaySlides.reverse()).map((slide, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4 w-full border-none border-t shadow-none">
                  {'isAddCard' in slide ? (
                    <div
                      className="p- flex items-center justify-center bg-gray-200  h-64 rounded-[16px] cursor-pointer"
                      onClick={() => openModal()}
                    >
                      <p className="text-lg font-semibold text-gray-600">+ Adicionar Ação</p>
                    </div>
                  ) : (
                    <div>
                      <div className="relative w-full">
                        {/* Container da Imagem */}
                        <div className="relative w-full h-[180px] overflow-hidden rounded-t-[16px]">
                          <Image
                            src={(imageUrls[slide.id || ''] && `${imageUrls[slide.id || '']}${imageUrls[slide.id || ''].includes('?') ? '&' : '?'}refresh=${Date.now()}`) || capa.src}
                            alt="Imagem da ação"
                            layout="fill"
                            objectFit="cover"
                            className="absolute top-0 left-0 w-full h-full"
                          />
                        </div>
 
                        {/* Container do Card */}
                        <div className="relative z-10 -mt-12 bg-white p-3 py-6 border border-gray-200 rounded-[16px] shadow-lg w-[90%] mx-auto transition-[width] duration-300 ease-in-out hover:w-[100%] hover:shadow-2xl">
                          {/* Botão Editar */}
                          <div id="editar" className="absolute top-6 right-3 flex space-x-2">
                            <button
                              onClick={() => openModal(slide)}
                              className="bg-[#294BB6] text-white text-xs font-bold px-4 py-1 rounded shadow-sm hover:bg-[#003C99] transition-all"
                            >
                              Editar
                            </button>
 
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <button
                                  className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow-sm hover:bg-red-700 transition-all"
                                  onClick={() => setActionToDelete(slide.id ?? null)}
                                  title="Deletar ação"
                                >
                                  <Trash2 className="text-white w-4 h-4" />
                                </button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="rounded-2xl shadow-lg p-6 w-[380px] flex flex-col items-center bg-white">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-lg font-semibold text-gray-900 text-center">
                                    Deseja deletar esta ação?
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
                                    onClick={async () => {
                                      await deleteAction(String(slide.id))
                                    }}
                                  >
                                    Deletar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
 
                          {/* Tag do Tipo */}
                          <p title={slide.type} className="inline-block rounded-[8px] max-w-32 text-xs font-semibold text-[#0056D2] bg-[#E9F2FF] px-3 py-1 uppercase whitespace-nowrap overflow-hidden text-ellipsis">
                            {slide.type}
                          </p>
 
                          {/* Título */}
                          <h2 title={slide.name} className="text-lg font-semibold mt-3 text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis">{slide.name}</h2>
 
                          <div className="relative w-full mt-3">
                            {/* Barra de Progresso */}
                            <div
                              className="relative w-full h-2 rounded-full bg-gray-300 overflow-hidden transition-all duration-300 hover:bg-gray-400"
                              onMouseEnter={() => setHoveredSlide(slide.id ?? null)}
                              onMouseLeave={() => setHoveredSlide(null)}
                            >
                            
                              <div
                                className="h-full bg-[#2BAFF150] transition-all duration-300"
                                style={{ width: `${Math.min((Number(slide.colected) / Number(slide.goal)) * 100, 100).toFixed(2)}%` }}
                              />
                            </div>
                            <p className="text-sm text-center text-gray-500 mt-2 mb-1 italic">
                              Representa o progresso da arrecadação
                            </p>
 
                            {/* Tooltip acima da barra */}
                            {hoveredSlide === slide.id && (
															<div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-4 bg-white/90 backdrop-blur-sm text-gray-800 shadow-xl rounded-2xl px-5 py-4 w-[240px] text-sm">
																{Number(slide.colected) >= Number(slide.goal) ? (
																	<p className="text-center font-semibold text-green-600">🎉 Meta Atingida!</p>
																) : (
																	<p className="text-center font-semibold text-blue-600">
																		 🎯 {(Number(slide.colected) / Number(slide.goal) * 100).toFixed(2)}% da Meta Arrecadada
																	</p>
																)}
																<div className="mt-2 space-y-1">
																	<p className="flex justify-between">
																		<span className="font-medium text-gray-600">🔹 Arrecadado:</span>
																		<span className="font-semibold">
																			R$ {new Intl.NumberFormat("pt-BR", {
																				notation: "compact",
																				compactDisplay: "short",
																			}).format(Number(slide.colected))}
																		</span>
																	</p>
																	<p className="flex justify-between text-red-500">
																		<span className="font-medium">📉 Gasto:</span>
																		<span className="font-semibold">
																			R$ {new Intl.NumberFormat("pt-BR", {
																				notation: "compact",
																				compactDisplay: "short",
																			}).format(Number(slide.spent))}
																		</span>
																	</p>
																	<p className="flex justify-between">
																		<span className="font-medium text-gray-600">🏆 Meta:</span>
																		<span className="font-semibold">
																			R$ {new Intl.NumberFormat("pt-BR", {
																				notation: "compact",
																				compactDisplay: "short",
																			}).format(Number(slide.goal))}
																		</span>
																	</p>
																</div>
																<div className="absolute left-1/2 -translate-x-1/2 top-full w-4 h-4 bg-white rotate-45 border border-gray-300 -mt-1" />
															</div>
														)}
                          </div>
 
                          {/* Valores numéricos */}
                          <div className="flex justify-between text-sm font-semibold text-gray-700 mt-4">
                            <div className="text-center">
                              <p className="text-xs text-gray-500">Arrecadado</p>
                              <p className="text-lg font-bold whitespace-nowrap">
                                R${" "}
                                {new Intl.NumberFormat("pt-BR", { notation: "compact", compactDisplay: "short" }).format(Number(slide.colected))}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-gray-500">Gasto</p>
                              <p className="text-lg font-bold text-red-500 whitespace-nowrap">
                                R${" "}
                                {new Intl.NumberFormat("pt-BR", { notation: "compact", compactDisplay: "short" }).format(Number(slide.spent))}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-gray-500">Meta</p>
                              <p className="text-lg font-bold whitespace-nowrap">
                                R${" "}
                                {new Intl.NumberFormat("pt-BR", { notation: "compact", compactDisplay: "short" }).format(Number(slide.goal))}
                              </p>
                            </div>
                          </div>
                          <hr className="mt-4"/>
                          <div className="mt-5 flex justify-between items-center">
                            {/* Botão de Transparência com novo estilo e lógica */}
                            <Button
                              id="acao"
                              onClick={() => router.push("./actions" + "?action_id=" + String(slide.id))}
                              className="w-4/5 h-full font-bold rounded-[34px] bg-[#294BB6] text-white border-solid border-[#2E4049] border hover:text-[#294BB6] hover:bg-white transition-all"
                            >
                              TRANSPARÊNCIA
                            </Button>
                            {/* ShareButton estilizado */}
                            <Link className="w-2/12 h-12" href={`https://api.whatsapp.com/send?text=${window.location.origin}/actions?action_id=${String(slide.id)}`} target="_blank">
                              <div className="w-full h-full rounded-full bg-[#F2F4F7] flex justify-center items-center border border-[#c3d0e6] hover:bg-[#d6deec] transition-all shadow-sm cursor-pointer">
                                <Image className="w-5 h-5" src={shareButton} alt="Compartilhar no WhatsApp" />
                              </div>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-center mt-16 gap-4 pb-4 w-full">
              <CarouselPrevious />
              <CarouselNext />
            </div>
          </Carousel>
        );
      })()}
 
      {isOpen && (
        <ModalPortal>
          <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in z-50">
            <div className="bg-white border border-gray-200 rounded-3xl shadow-xl p-8 w-[500px] max-h-[85vh] overflow-y-auto">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">
                    {editingSlide?.id ? "Editar Ação" : "Nova Ação"}
                  </h2>
                  <p className="text-gray-500 text-sm mb-4">Preencha os detalhes da ação</p>
                </div>

                {modalTab === "detalhes" && (
                  <InfoTooltipModal>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-gray-700 text-[15px]">
                    {/* 1. Título */}
                    <div className="group p-4 rounded-2xl hover:bg-[#F4F7FF] transition-all border">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-blue-600 font-bold text-xl">1</span>
                        <h3 className="font-semibold text-[#2E4049]">Título</h3>
                      </div>
                      <p>Nome claro da ação. Ex: <strong>Campanha do Agasalho</strong>, <strong>Mutirão de Limpeza</strong>.</p>
                    </div>

                    {/* 2. Tipo */}
                    <div className="group p-4 rounded-2xl hover:bg-[#F5FFF6] transition-all border">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-green-600 font-bold text-xl">2</span>
                        <h3 className="font-semibold text-[#2E4049]">Tipo</h3>
                      </div>
                      <p>Categoria geral da ação. Ex: <strong>Alimento</strong>, <strong>Educação</strong>, <strong>Vacinação</strong>.</p>
                    </div>

                    {/* 3. Meta */}
                    <div className="group p-4 rounded-2xl hover:bg-[#FFF5F7] transition-all border">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-pink-600 font-bold text-xl">3</span>
                        <h3 className="font-semibold text-[#2E4049]">Meta (R$)</h3>
                      </div>
                      <p>Valor total esperado para arrecadação da ação.</p>
                    </div>

                    {/* 4. Arrecadado */}
                    <div className="group p-4 rounded-2xl hover:bg-[#FFFCEB] transition-all border">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-yellow-600 font-bold text-xl">4</span>
                        <h3 className="font-semibold text-[#2E4049]">Arrecadado (R$)</h3>
                      </div>
                      <p>Valor arrecadado até o momento. Atualize conforme for recebendo novos recursos.</p>
                    </div>

                    {/* 5. Categorias de Despesas */}
                    <div className="group p-4 rounded-2xl hover:bg-[#E9F6FF] transition-all border col-span-1 sm:col-span-2">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-sky-600 font-bold text-xl">5</span>
                        <h3 className="font-semibold text-[#2E4049]">Categorias de Despesas</h3>
                      </div>
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>Classificações para os gastos: <strong>Transporte</strong>, <strong>Alimentação</strong>, <strong>Material</strong>.</li>
                        <li>Você pode adicionar categorias novas a qualquer momento.</li>
                        <li><strong>Atenção:</strong> Excluir uma categoria remove todos os registros vinculados a ela.</li>
                        <li>Todos os valores por categoria são somados automaticamente e refletem no total de gastos e nos gráficos mensais.</li>
                      </ul>
                    </div>

                    {/* 6. Imagem */}
                    <div className="group p-4 rounded-2xl hover:bg-[#F9F5FF] transition-all border col-span-1 sm:col-span-2">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-purple-600 font-bold text-xl">6</span>
                        <h3 className="font-semibold text-[#2E4049]">Imagem da Ação</h3>
                      </div>
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>Escolha uma imagem que represente bem a ação.</li>
                        <li>Formatos aceitos: <strong>.jpg</strong>, <strong>.png</strong>, <strong>.jpeg</strong>.</li>
                        <li>Obrigatória na criação da ação, mas pode ser trocada depois.</li>
                      </ul>
                    </div>

                    {/* OBS final */}
                    <div className="col-span-1 sm:col-span-2 text-gray-600 text-sm mt-2 px-2">
                      <strong>OBS:</strong> Use <code className="bg-gray-100 px-1 py-0.5 rounded">.</code> (ponto) para separar centavos. Ex: <strong>5000.50</strong>
                    </div>
                  </div>
                </InfoTooltipModal>

                )}




              </div>


              <div className="flex pb-2">
                <button
                  className={`flex-1 text-lg font-medium py-2 transition-colors duration-200 ${
                    modalTab === "detalhes"
                      ? "border-b-4 border-blue-500 text-blue-500"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setModalTab("detalhes")}
                >
                  Detalhes
                </button>
                <button
                  id="imagemSelecionar"
                  className={`flex-1 text-lg font-medium py-2 transition-colors duration-200 ${
                    modalTab === "imagem"
                      ? "border-b-4 border-blue-500 text-blue-500"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setModalTab("imagem")}
                >
                  Imagem
                </button>
              </div>
              
              {modalTab === "detalhes" && (
                <>
                <div className="mt-6 grid grid-cols-2 gap-4">
                  {/* Campo de Título (Ocupa linha inteira) */}
                  <div id="titulo" className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Título {!editingSlide?.id && <span className="text-red-500">*</span>}</label>
                    <input
                      id="tituloAcao"
                      type="text"
                      className="w-full mt-1 p-4 border rounded-[16px] border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
                      placeholder="Digite o título"
                      value={editingSlide?.name || ""}
                      onChange={(e) =>
                        setEditingSlide({ ...editingSlide, name: e.target.value })
                      }
                    />
                  </div>

                  {/* Campo de Tipo */}
                  <div id="tipo">
                    <label className="block text-sm font-medium text-gray-700">Tipo {!editingSlide?.id && <span className="text-red-500">*</span>}</label>
                    <input
                      id="tipoAcao"
                      type="text"
                      className="w-full mt-1 p-4 border rounded-[16px] border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
                      placeholder="Digite o tipo"
                      value={editingSlide?.type || ""}
                      onChange={(e) =>
                        setEditingSlide({ ...editingSlide, type: e.target.value })
                      }
                    />
                  </div>

                  {/* Meta (Goal) */}
                  <div id="meta">
                    <label className="block text-sm font-medium text-gray-700">Meta (R$) {!editingSlide?.id && <span className="text-red-500">*</span>}</label>
                    <input
                      id="metaAcao"
                      type="text"
                      className="w-full mt-1 p-4 border border-gray-300 rounded-[16px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
                      placeholder="Digite o valor"
                      value={editingSlide.goal?.toString() || ""}
                      onChange={(e) => {
                        let rawValue = e.target.value;
                        rawValue = rawValue.replace(/[^0-9.]/g, "");
                        const parts = rawValue.split(".");
                        if (parts.length > 2) return;
                        if (parts[1]) rawValue = parts[0] + "." + parts[1].slice(0, 2);
                      
                        setEditingSlide((prev) => ({
                          ...prev,
                          goal: rawValue,
                        }));
                      }}
                      
                      onBlur={() => {
                        const parsed = parseFloat(String(editingSlide.goal || "0"));
                        if (!isNaN(parsed)) {
                          setEditingSlide((prev) => ({
                            ...prev,
                            goal: parsed,
                          }));
                        }
                      }}
                      
                      
                      inputMode="decimal"
                    />
                  </div>

                  {/* Arrecadado (Collected) */}
                  <div id="arrecadado">
                    <label className="block text-sm font-medium text-gray-700">Arrecadado (R$)</label>
                    <input
                      id="arrecadadoAcao"
                      type="text"
                      className="w-full mt-1 p-4 border border-gray-300 rounded-[16px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
                      placeholder="Digite o valor"
                      value={editingSlide.colected?.toString() || ""}
                      onChange={(e) => {
                        let rawValue = e.target.value;
                        rawValue = rawValue.replace(/[^0-9.]/g, ""); 
                        const parts = rawValue.split(".");
                        if (parts.length > 2) return;
                        if (parts[1]) rawValue = parts[0] + "." + parts[1].slice(0, 2);

                        setEditingSlide((prev) => ({
                          ...prev,
                          colected: rawValue,
                        }));
                      }}
                      onBlur={() => {
                        const parsed = parseFloat(String(editingSlide.colected || "0"));
                        if (!isNaN(parsed)) {
                          setEditingSlide((prev) => ({
                            ...prev,
                            colected: parsed,
                          }));
                        }
                      }}
                      inputMode="decimal"
                    />
                  </div>


                  {/* Categorias de Despesas */}
                  <div className="col-span-2">
                    <label className="block text-sm mb-2 font-medium text-gray-700">
                      Categorias de Despesas
                    </label>

                    <div className="flex gap-4 mb-2">
                      {/* Dropdown de Seleção de Categoria */}
                      <div className="relative flex-1">
                        <select
                          id="selecionar"
                          className="appearance-none rounded-[16px] w-full p-4 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all pr-10"
                          value={selectedCategory || ""}
                          onChange={(e) => setSelectedCategory(e.target.value || null)}
                        >
                          <option value="">Selecione uma categoria</option>
                          {Object.keys(editingSlide.categorysExpenses || {}).map((category, index) => (
                            <option key={index} value={category}>{category}</option>
                          ))}
                        </select>
                        <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                      </div>

                      {/* Valor da Categoria Selecionada (Só aparece se selectedCategory não for nulo) */}
                      {selectedCategory && (
                        <>
                          <div id="gasto" className="flex-1">
                            <input
                              type="text"
                              className="w-full p-4 border border-gray-300 rounded-[16px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
                              placeholder="Valor"
                              value={editingSlide.categorysExpenses[selectedCategory]?.toString() || ""}
                              onChange={(e) => {
                                let rawValue = e.target.value;
                                rawValue = rawValue.replace(/[^0-9.]/g, "");
                                const parts = rawValue.split(".");
                                if (parts.length > 2) return;
                                if (parts[1]) rawValue = parts[0] + "." + parts[1].slice(0, 2);

                                setEditingSlide((prev) => ({
                                  ...prev,
                                  categorysExpenses: {
                                    ...prev.categorysExpenses,
                                    [selectedCategory]: rawValue,
                                  },
                                }));
                                showCategoryChangeNotification(); // Show notification once
                              }}
                              onBlur={() => {
                                const raw = editingSlide.categorysExpenses[selectedCategory!] as string;
                                const parsed = parseFloat(raw || "0");
                                if (!isNaN(parsed)) {
                                  setEditingSlide((prev) => ({
                                    ...prev,
                                    categorysExpenses: {
                                      ...prev.categorysExpenses,
                                      [selectedCategory!]: parsed,
                                    },
                                  }));
                                }
                              }}
                              inputMode="decimal"
                            />
                          </div>

                          {/* Botão de deletar categoria */}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button
                                className="text-red-600 hover:text-red-800 transition-all"
                                title="Excluir categoria"
                              >
                                <FiTrash2 className="w-5 h-5 ml-2 mt-4" />
                              </button>
                            </AlertDialogTrigger>

                            <AlertDialogContent className="rounded-2xl shadow-lg p-6 w-[380px] flex flex-col items-center bg-white">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-lg font-semibold text-gray-900 text-center">
                                  Tem certeza que deseja excluir essa categoria?
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-gray-600 text-center mt-2">
                                  Isso fará com que todos os seus registros sejam apagados.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter className="flex gap-4 mt-4">
                                <AlertDialogCancel className="bg-gray-200 text-gray-800 rounded-full px-6 py-3 hover:bg-gray-300 transition-all w-full sm:w-auto">
                                  Cancelar
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-500 text-white rounded-full px-6 py-3 hover:bg-red-600 transition-all w-full sm:w-auto"
                                  onClick={() => {
                                    setEditingSlide((prev) => {
                                      const updated = { ...prev.categorysExpenses };
                                      delete updated[selectedCategory!];
                                      return {
                                        ...prev,
                                        categorysExpenses: updated,
                                        spent: calculateSpent(updated),
                                      };
                                    });
                                    setSelectedCategory(null);
                                    showCategoryChangeNotification(); // Show notification once
                                  }}                                  
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>

                        </>
                      )}


                    </div>

                    {/* Adicionar Nova Categoria */}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        className="flex-1 p-3 border border-gray-300 rounded-[16px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
                        placeholder="Nova categoria"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                      />
                      <button
                        className="p-3 bg-blue-500 text-white rounded-[16px] hover:bg-blue-600 transition-all"
                        onClick={() => {
                          if (
                            newCategory.trim() !== "" &&
                            !editingSlide.categorysExpenses?.[newCategory.trim()]
                          ) {
                            const updated = {
                              ...editingSlide.categorysExpenses,
                              [newCategory.trim()]: 0,
                            };
                            setEditingSlide({
                              ...editingSlide,
                              categorysExpenses: updated,
                              spent: calculateSpent(updated),
                            });
                            setNewCategory("");
                            showCategoryChangeNotification(); // Show notification once
                          }
                        }}                        
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Total Gasto (Spent) */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Total Gasto (R$)</label>
                    <input
                      type="text"
                      className="w-full mt-1 p-4 border border-gray-300 rounded-[16px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all bg-gray-100 cursor-not-allowed"
                      value={
                        editingSlide?.spent !== undefined && editingSlide?.spent !== null
                          ? (typeof editingSlide.spent === 'string' 
                              ? parseFloat(editingSlide.spent) 
                              : editingSlide.spent)
                              .toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                          : ""
                      }
                      readOnly
                      disabled
                    />
                  </div>
                </div>
                {!editingSlide?.id && !imagePreview && (
                  <div className="mt-6 w-full bg-red-100 border border-red-400 text-red-700 text-sm px-4 py-3 rounded-[16px]">
                    ⚠️ É necessário adicionar uma imagem para criar a ação.
                  </div>
                )}
                </>
              )}

              {modalTab === "imagem" && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700">
                    Imagem da Ação {editingSlide?.id ? null : <span className="text-red-500">*</span>}
                  </label>
                  <div className="flex flex-col items-center gap-2 border border-gray-300 p-4 rounded-[16px] mt-2">
                    <label
                      htmlFor="file-upload"
                      className="w-full flex justify-center items-center bg-gray-200 text-gray-700 py-2 px-4 rounded-[16px] cursor-pointer hover:bg-gray-300 transition-all"
                    >
                      <UploadCloud className="mr-2 text-blue-500" /> Escolher Arquivo
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    {imagePreview && (
                      <img
                        src={imagePreview}
                        alt="Pré-visualização"
                        className="mt-4 rounded-lg w-full h-auto"
                      />
                    )}
                  </div>

                  {!editingSlide?.id && !imagePreview && (
                    <div className="mt-3 w-full bg-red-100 border border-red-400 text-red-700 text-sm px-4 py-3 rounded-[16px]">
                      ⚠️ É necessário adicionar uma imagem para criar a ação.
                    </div>
                  )}
                </div>
              )}

              <div className="mt-6 pt-4 flex justify-between">
                <button
                  className="px-5 py-2 border border-gray-400 text-gray-600 rounded-[16px] hover:bg-gray-300 transition-all duration-200"
                  onClick={() => setIsOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  id="salvarBotao"
                  className="px-5 py-2 bg-blue-600 text-white rounded-[16px] hover:bg-blue-500/90 transition-all duration-200"
                  onClick={() => {
                    if (document.activeElement instanceof HTMLElement) {
                      document.activeElement.blur();
                    }
                    handleSave();
                  }}
                  disabled={isSaving}
                >
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin mr-2 inline" /> : null}
                  {isSaving ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      <ModalPortal>
        {showGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="relative w-[90%] max-w-4xl bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-10 overflow-y-auto max-h-[90vh] animate-fade-in">

              <button
                onClick={() => setShowGuide(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-all text-xl"
                title="Fechar"
              >
                ✕
              </button>

              <h2 className="text-4xl font-extrabold text-center text-[#294BB6] mb-4">
                👋 Bem-vindo ao Painel de Ações
              </h2>

              <p className="text-center text-gray-500 mb-8 text-base max-w-2xl mx-auto">
                Este é um guia detalhado e interativo para entender cada funcionalidade desta página.
                Passe o mouse em cada item para ver dicas úteis e exemplos práticos 👇
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-gray-700 text-[15px]">
                <div className="group p-4 rounded-2xl hover:bg-[#F4F7FF] transition-all border">
                  <div className="flex items-center gap-3 mb-1">
                    <HelpCircle className="text-blue-600 w-5 h-5" />
                    <h3 className="font-semibold text-[#2E4049]">Ações</h3>
                  </div>
                  <p>Adicione, edite ou compartilhe ações que sua ONG está realizando.</p>
                  <div className="opacity-0 group-hover:opacity-100 mt-2 transition-all">
                    <span className="inline-block bg-blue-100 text-blue-600 text-xs px-3 py-1 rounded-full">
                      Ex: Campanha "Natal Solidário"
                    </span>
                  </div>
                </div>

                <div className="group p-4 rounded-2xl hover:bg-[#F5FFF6] transition-all border">
                  <div className="flex items-center gap-3 mb-1">
                    <Search className="text-green-600 w-5 h-5" />
                    <h3 className="font-semibold text-[#2E4049]">Busca Rápida</h3>
                  </div>
                  <p>Filtre ações por nome ou tipo com poucos caracteres.</p>
                  <div className="opacity-0 group-hover:opacity-100 mt-2 transition-all">
                    <input
                      className="w-full p-2 rounded-lg border border-green-300 text-sm"
                      value="ex: alimento"
                      disabled
                    />
                  </div>
                </div>

                <div className="group p-4 rounded-2xl hover:bg-[#F9F5FF] transition-all border">
                  <div className="flex items-center gap-3 mb-1">
                    <Target className="text-purple-600 w-5 h-5" />
                    <h3 className="font-semibold text-[#2E4049]">Progresso</h3>
                  </div>
                  <p>Acompanhe o progresso da arrecadação da meta da ação.</p>
                  <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mt-2">
                    <div className="h-full bg-purple-400 group-hover:bg-purple-600 w-3/4 transition-all"></div>
                  </div>
                </div>

                <div className="group p-4 rounded-2xl hover:bg-[#FFF5F7] transition-all border">
                  <div className="flex items-center gap-3 mb-1">
                    <UploadCloud className="text-pink-600 w-5 h-5" />
                    <h3 className="font-semibold text-[#2E4049]">Imagem</h3>
                  </div>
                  <p>Faça upload de uma imagem que represente a ação.</p>
                  <div className="opacity-0 group-hover:opacity-100 mt-2 transition-all">
                    <span className="inline-block text-xs text-pink-500">Formatos aceitos: JPG, PNG</span>
                  </div>
                </div>

                <div className="group p-4 rounded-2xl hover:bg-[#E9F6FF] transition-all border">
                  <div className="flex items-center gap-3 mb-1">
                    <FiChevronDown className="text-sky-600 w-5 h-5" />
                    <h3 className="font-semibold text-[#2E4049]">Categorias</h3>
                  </div>
                  <p>Crie e edite categorias de gastos para organização financeira.</p>
                  <div className="opacity-0 group-hover:opacity-100 mt-2 transition-all">
                    <div className="flex gap-2">
                      <span className="bg-sky-100 text-sky-700 px-3 py-1 rounded-full text-xs">Transporte</span>
                      <span className="bg-sky-100 text-sky-700 px-3 py-1 rounded-full text-xs">Alimentação</span>
                    </div>
                  </div>
                </div>

                <div className="group p-4 rounded-2xl hover:bg-[#FFFCEB] transition-all border">
                  <div className="flex items-center gap-3 mb-1">
                    <FiChevronDown className="text-yellow-600 w-5 h-5" />
                    <h3 className="font-semibold text-[#2E4049]">Aba de Navegação</h3>
                  </div>
                  <p>Gerencie dados de cada ação pelas abas: Galeria, Balanço e Documentos.</p>
                  <div className="opacity-0 group-hover:opacity-100 mt-2 transition-all">
                    <div className="flex gap-2 text-sm">
                      <button className="bg-yellow-200 text-yellow-800 px-3 py-1 rounded-full">Galeria</button>
                      <button className="bg-yellow-200 text-yellow-800 px-3 py-1 rounded-full">Balanço</button>
                      <button className="bg-yellow-200 text-yellow-800 px-3 py-1 rounded-full">Documentos</button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-10 flex justify-center">
                <button
                  onClick={() => setShowGuide(false)}
                  className="bg-gradient-to-r from-[#294BB6] to-[#2BAFF1] text-white font-bold px-8 py-3 rounded-full hover:opacity-90 transition-all shadow-lg"
                >
                  Entendi! Vamos lá 🚀
                </button>
              </div>
            </div>
          </div>
        )}
      </ModalPortal>




      
        {/* Tabs */}
        <div className="w-full flex justify-center border-b border-gray-300 mt-6">
            <div className="flex space-x-6">
            {["gallery", "balance", "documents"].map((tab) => (
                <button
                id="tab"
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