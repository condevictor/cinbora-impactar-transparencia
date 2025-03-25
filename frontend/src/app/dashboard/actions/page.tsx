"use client"
import { useSearchParams, useRouter } from "next/navigation"
import Cookies from "js-cookie"
import { useEffect, useState } from "react"
import { CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Gallery from "@/components/ui/DAgallery"
import Balance from "@/components/ui/DAbalance"
import Documents from "@/components/ui/DAdocuments"
import { FiChevronDown } from "react-icons/fi"
import { UploadCloud, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface Action {
  id: number;
  name: string;
  type: string;
  spent: number;
  goal: number;
  colected: number;
  categorysExpenses?: Record<string, number>;
  aws_url?: string;
}

export default function DashboardAction() {
  const searchParams = useSearchParams()
  const router = useRouter();
  const token = Cookies.get("auth_token");
  const acaoId = searchParams.get("action_id")
  const [action, setAction] = useState<Action | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingAction, setEditingAction] = useState<Action | null>(null)
  const [activeTab, setActiveTab] = useState("gallery")
  const [modalTab, setModalTab] = useState("detalhes")
  const [categories, setCategories] = useState<string[]>([])
  const [newCategory, setNewCategory] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [originalCategorysExpenses, setOriginalCategorysExpenses] = useState({})
  const [isSaving, setIsSaving] = useState(false)
  const [hoveredCard, setHoveredCard] = useState(false);
  
  useEffect(() => {
    if (!token) {
      router.push("/login");
    }
  }, [token, router])

  useEffect(() => {
    if (acaoId) {
      fetch(`http://127.0.0.1:3333/ongs/actions/${acaoId}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
        .then((res) => res.json())
        .then((data) => {
          setAction(data.action)
        })
        .catch((err) => console.error("Erro ao buscar ação:", err))
    }
  }, [acaoId, token])

  useEffect(() => {
    if (!acaoId) {
      router.push("/dashboard/ongs");
    }
  }, [acaoId, router])

  // Update spent when categorysExpenses changes
  useEffect(() => {
    if (editingAction?.categorysExpenses) {
      setEditingAction((prev) => ({
        ...prev!,
        spent: Object.values(prev?.categorysExpenses || {}).reduce((acc, val) => acc + (parseFloat(val as any) || 0), 0),
      }));
    }
  }, [editingAction?.categorysExpenses]);

  const generateHash = async (name: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(name);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
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

  const fetchActionDetails = async (actionId: number | string) => {
    try {
      const response = await fetch(`http://127.0.0.1:3333/ongs/actions/${actionId}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error("Erro ao buscar detalhes da ação.");

      const data = await response.json();

      // Objeto para armazenar a soma total de cada categoria
      let aggregatedExpenses = {};

      // Percorre todos os registros diários e soma os valores de cada categoria
      data?.actionGrafic?.[0]?.categorysExpenses?.forEach((year) => {
        year.months.forEach((month) => {
          month.dailyRecords.forEach((record) => {
            Object.entries(record.categorysExpenses).forEach(([category, value]) => {
              aggregatedExpenses[category] = (aggregatedExpenses[category] || 0) + value;
            });
          });
        });
      });

      setOriginalCategorysExpenses(aggregatedExpenses);
      setEditingAction((prev) => ({
        ...prev!,
        ...data.action,
        aws_url: data.action.aws_url || "",
        categorysExpenses: aggregatedExpenses,
      }));

      setImagePreview(data.action.aws_url || null);
    } catch (error) {
      console.error("Erro ao carregar detalhes da ação:", error);
      toast.error("Erro ao carregar detalhes da ação.");
    }
  };

  const updateSlideImage = async (slideId: number | string) => {
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
      
      setEditingAction((prev) => ({
        ...prev!,
        aws_url: updatedImage.aws_url,
      }));
      
      // Update the action with new image
      if (action) {
        setAction({
          ...action,
          aws_url: updatedImage.aws_url
        });
      }
    } catch (error) {
      console.log("Erro ao atualizar a imagem:", error);
    }
  };

  const validateAndFixCategories = () => {
    if (!editingAction?.categorysExpenses) return {};
    
    let updatedCategories = { ...editingAction.categorysExpenses };
  
    Object.keys(updatedCategories).forEach((category) => {
      const currentValue = updatedCategories[category];
      const originalValue = originalCategorysExpenses[category] || 0;
  
      if (currentValue === "" || currentValue === null || currentValue === undefined) {
        updatedCategories[category] = 0;
      } else if (currentValue < originalValue) {
        toast.error(
          `O valor de "${category}" não pode ser menor que ${originalValue.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}.`
        );
        updatedCategories[category] = originalValue;
      }
    });
  
    setEditingAction((prev) => ({
      ...prev!,
      categorysExpenses: updatedCategories,
    }));
  
    return updatedCategories;
  };

  const updateCategoryExpenses = async (actionId: number | string, categorysExpenses: Record<string, number>) => {
    try {
      const response = await fetch(`http://127.0.0.1:3333/ongs/actions/${actionId}/grafic`, {
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
    
      // Removed the success toast from here as it was creating duplicate notifications
      return true;
    } catch (error) {
      console.error("Erro ao atualizar categorias de despesas:", error);
      toast.error("Erro ao atualizar categorias de despesas.");
      return false;
    }
  };

  const handleEditAction = async () => {
    if (isSaving) return;
    setIsSaving(true);

    if (!editingAction?.name || !editingAction?.type) {
      toast.error("Nome e tipo são obrigatórios.");
      setIsSaving(false);
      return;
    }

    const updatedCategories = validateAndFixCategories();

    try {
      // Basic action update
      const response = await fetch(`http://127.0.0.1:3333/ongs/actions/${editingAction.id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: editingAction.name,
          type: editingAction.type,
          spent: editingAction.spent,
          goal: editingAction.goal,
          colected: editingAction.colected
        })
      });
      
      if (!response.ok) {
        throw new Error("Erro ao atualizar ação");
      }
      
      // Update categories if needed
      if (Object.keys(updatedCategories).length > 0) {
        const categoryRes = await updateCategoryExpenses(editingAction.id, updatedCategories);
        if (categoryRes === false) throw new Error("Erro nas categorias.");
      }
      
      // Update image if needed
      if (imageFile) {
        await updateSlideImage(editingAction.id);
      }

      // Refresh action data
      const getResponse = await fetch(`http://127.0.0.1:3333/ongs/actions/${editingAction.id}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if(getResponse.ok) {
        const getData = await getResponse.json();
        setAction(getData.action);
      } else {
        console.error("Erro ao buscar ação atualizada");
      }
      
      toast.success("Ação atualizada com sucesso!");
      setIsEditModalOpen(false);
    } catch (err) {
      console.error("Erro:", err);
      toast.error("Erro ao atualizar a ação.");
    } finally {
      setIsSaving(false);
    }
  };

  const openEditModal = (action: Action) => {
    setEditingAction(action);
    setModalTab('detalhes');
    setImagePreview(action.aws_url || null);
    setImageFile(null);
    fetchActionDetails(action.id);
    setIsEditModalOpen(true);
  };

  if (!action) return <p className="p-4">Carregando...</p>

  return (
    <>
      <main className="p-4">
        
        <h1 title={action.name} className="text-4xl text-center font-bold mt-10 whitespace-nowrap overflow-hidden text-ellipsis">{action.name}</h1>
        <CardContent className="relative p-4 min-w-72">
          <div className="relative z-10 bg-white mt-8 w-5/6 m-auto">
            <div className="relative">
              <button 
                onClick={() => openEditModal(action)}
                className="absolute right-4 top-4 bg-[#0056D2] text-white text-xs font-bold px-4 py-1 rounded shadow-sm hover:bg-[#003C99] transition-all">
                Editar
              </button>
              <div className="flex flex-col justify-between p-6 w-full border-solid border border-gray-200 rounded-lg shadow-lg">
                <div>
                  <p title={action.type} className="inline text-xs font-semibold text-[#0056D2] bg-[#E9F2FF] px-3 py-1 rounded-lg uppercase whitespace-nowrap overflow-hidden text-ellipsis">
                    {action.type}
                  </p>
                </div>
                <h2 title={action.name} className="text-lg font-semibold mt-3 text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis">{action.name}</h2>
                
                <div className="relative w-full mt-3">
                  {/* Barra de Progresso */}
                  <div
                    className="relative w-full h-2 rounded-full bg-gray-300 overflow-hidden transition-all duration-300 hover:bg-gray-400"
                    onMouseEnter={() => setHoveredCard(true)}
                    onMouseLeave={() => setHoveredCard(false)}
                  >
                    <div
                      className="h-full bg-[#2BAFF150] transition-all duration-300"
                      style={{ width: `${Math.min((action.spent / action.goal) * 100, 100).toFixed(2)}%` }}
                    />
                  </div>
                  <p className="text-sm text-center text-gray-500 mt-2 mb-1 italic">
                    Representa o quanto foi gasto da meta
                  </p>
                  
                  {/* Tooltip acima da barra */}
                  {hoveredCard && (
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-4 bg-white/90 backdrop-blur-sm text-gray-800 shadow-xl rounded-2xl px-5 py-4 w-[240px] text-sm z-50">
                      {action.spent >= action.goal ? (
                        <p className="text-center font-semibold text-green-600">🎉 Meta Concluída!</p>
                      ) : (
                        <p className="text-center font-semibold text-blue-600">
                          🎯 {(action.spent / action.goal * 100).toFixed(2)}% da Meta Atingida
                        </p>
                      )}
                      <div className="mt-2 space-y-1">
                        <p className="flex justify-between">
                          <span className="font-medium text-gray-600">🔹 Arrecadado:</span>
                          <span className="font-semibold">
                            R$ {new Intl.NumberFormat("pt-BR", {
                              notation: "compact",
                              compactDisplay: "short",
                            }).format(action.colected)}
                          </span>
                        </p>
                        <p className="flex justify-between text-red-500">
                          <span className="font-medium">📉 Gasto:</span>
                          <span className="font-semibold">
                            R$ {new Intl.NumberFormat("pt-BR", {
                              notation: "compact",
                              compactDisplay: "short",
                            }).format(action.spent)}
                          </span>
                        </p>
                        <p className="flex justify-between">
                          <span className="font-medium text-gray-600">🏆 Meta:</span>
                          <span className="font-semibold">
                            R$ {new Intl.NumberFormat("pt-BR", {
                              notation: "compact",
                              compactDisplay: "short",
                            }).format(action.goal)}
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
                      R$ {new Intl.NumberFormat("pt-BR", { notation: "compact", compactDisplay: "short" }).format(action.colected)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Gasto</p>
                    <p className="text-lg font-bold text-red-500 whitespace-nowrap">
                      R$ {new Intl.NumberFormat("pt-BR", { notation: "compact", compactDisplay: "short" }).format(action.spent)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Meta</p>
                    <p className="text-lg font-bold whitespace-nowrap">
                      R$ {new Intl.NumberFormat("pt-BR", { notation: "compact", compactDisplay: "short" }).format(action.goal)}
                    </p>
                  </div>
                </div>
                <hr className="mt-4" />
              </div>
            </div>
          </div>
        </CardContent>
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
        <div className="w-full mt-6">
          {activeTab === "gallery" && <Gallery />}
          {activeTab === "balance" && <Balance />}
          {activeTab === "documents" && <Documents />}
        </div>
      </main>

      {isEditModalOpen && editingAction && (
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="bg-white rounded-xl shadow-2xl p-8 border border-[#2E4049] w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold text-gray-900">
                Editar Ação
              </DialogTitle>
              <p className="text-gray-500 text-sm">Preencha os detalhes da ação</p>
            </DialogHeader>
            
            {/* Tabs for Details and Image */}
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
              <div className="space-y-4">
                <Input
                  value={editingAction.name}
                  onChange={(e) => setEditingAction({ ...editingAction, name: e.target.value })}
                  placeholder="Nome"
                />
                <Input
                  value={editingAction.type}
                  onChange={(e) => setEditingAction({ ...editingAction, type: e.target.value })}
                  placeholder="Tipo"
                />
                <Input
                  type="number"
                  value={editingAction.colected}
                  onChange={(e) => setEditingAction({ ...editingAction, colected: +e.target.value })}
                  placeholder="Coletado"
                />
                <Input
                  type="number"
                  value={editingAction.goal}
                  onChange={(e) => setEditingAction({ ...editingAction, goal: +e.target.value })}
                  placeholder="Meta"
                />
                
                {/* Categorias de Despesas */}
                <div>
                  <label className="block text-sm mb-2 font-medium text-gray-700">
                    Categorias de Despesas
                  </label>

                  <div className="flex gap-4 mb-2">
                    {/* Dropdown de Seleção de Categoria */}
                    <div className="relative flex-1">
                      <select
                        className="appearance-none rounded w-full p-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all pr-10"
                        value={selectedCategory || ""}
                        onChange={(e) => setSelectedCategory(e.target.value || null)}
                      >
                        <option value="">Selecione uma categoria</option>
                        {Object.keys(editingAction.categorysExpenses || {}).map((category, index) => (
                          <option key={index} value={category}>{category}</option>
                        ))}
                      </select>
                      <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                    </div>

                    {/* Valor da Categoria Selecionada */}
                    {selectedCategory && (
                      <div className="flex-1">
                        <Input
                          type="number"
                          value={(editingAction.categorysExpenses?.[selectedCategory] || 0).toString()}
                          onChange={(e) => {
                            const value = e.target.value;
                            setEditingAction({
                              ...editingAction,
                              categorysExpenses: {
                                ...editingAction.categorysExpenses,
                                [selectedCategory]: +value
                              }
                            });
                          }}
                          placeholder="Valor"
                        />
                      </div>
                    )}
                  </div>

                  {/* Adicionar Nova Categoria */}
                  <div className="flex items-center gap-2">
                    <Input
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      placeholder="Nova categoria"
                      className="flex-1"
                    />
                    <Button
                      onClick={() => {
                        if (newCategory.trim() !== "" && !editingAction.categorysExpenses?.[newCategory.trim()]) {
                          setEditingAction({
                            ...editingAction,
                            categorysExpenses: {
                              ...editingAction.categorysExpenses,
                              [newCategory.trim()]: 0
                            }
                          });
                          setNewCategory("");
                        }
                      }}
                    >
                      +
                    </Button>
                  </div>
                </div>
                
                {/* Total Gasto (Spent) - calculado automaticamente */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Total Gasto (R$)</label>
                  <Input
                    type="text"
                    value={editingAction.spent !== undefined ? editingAction.spent : ""}
                    readOnly
                    disabled
                    className="bg-gray-100 cursor-not-allowed"
                  />
                </div>
              </div>
            )}
            
            {modalTab === "imagem" && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700">
                  Imagem da Ação
                </label>
                <div className="flex flex-col items-center gap-2 border border-gray-300 p-4 rounded mt-2">
                  <label
                    htmlFor="file-upload"
                    className="w-full flex justify-center items-center bg-gray-200 text-gray-700 py-2 px-4 rounded cursor-pointer hover:bg-gray-300 transition-all"
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
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancelar</Button>
              <Button 
                onClick={handleEditAction}
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                {isSaving ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
