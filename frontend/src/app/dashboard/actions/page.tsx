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
import Balance from "@/components/ui/balance"
import Documents from "@/components/ui/documents"

interface Action {
  id: number;
  name: string;
  type: string;
  spent: number;
  goal: number;
  colected: number;
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

  if (!action) return <p className="p-4">Carregando...</p>

  return (
    <>
      <main className="p-4">
        <CardContent className="relative p-4 min-w-72">
          <div className="relative z-10 bg-white mt-8 w-5/6 m-auto">
            <div className="relative">
              <button 
                onClick={() => {
                  setEditingAction(action)
                  setIsEditModalOpen(true)
                }}
                className="absolute right-4 top-4 bg-[#0056D2] text-white text-xs font-bold px-4 py-1 rounded shadow-sm hover:bg-[#003C99] transition-all">
                Editar
              </button>
              <div className="flex flex-col justify-between p-4 w-full h-64 border-solid border border-white rounded shadow-[0_1px_4px_1px_rgba(16,24,40,0.1)]">
                <div>
                  <p className="inline text-sm font-semibold text-[#294BB6] px-2 py-1 bg-[#2BAFF1] bg-opacity-20 rounded">
                    {action.type}
                  </p>
                </div>
                <div className="font-semibold">{action.name}</div>
                <div>
                  <Progress 
                    className="w-full bg-[#EAECF0]" 
                    indicatorClass="bg-[#2BAFF150]" 
                    value={(action.colected / action.goal) * 100} 
                  />
                </div>
                <div className="flex justify-around font-semibold">
                  <div className="flex flex-col">
                    <p className="text-xs font-light text-gray-600">Gasto</p>
                    <p>R${action.spent}</p>
                  </div>
                  <div className="flex flex-col">
                    <p className="text-xs font-light text-gray-600">Coletado</p>
                    <p>R${action.colected}</p>
                  </div>
                  <div className="flex flex-col">
                    <p className="text-xs font-light text-gray-600">Meta</p>
                    <p>R${action.goal}</p>
                  </div>
                </div>
                <hr className="border-solide border borde-gray-500" />
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
              <DialogTitle>Editar Ação</DialogTitle>
            </DialogHeader>
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
                value={editingAction.spent}
                onChange={(e) => setEditingAction({ ...editingAction, spent: +e.target.value })}
                placeholder="Gasto"
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
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancelar</Button>
              <Button onClick={async () => {
                const token = Cookies.get("auth_token")
                try {
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
                  })
                  if (response.ok) {
                  
                    const getResponse = await fetch(`http://127.0.0.1:3333/ongs/actions/${editingAction.id}`, {
                      headers: {
                        "Authorization": `Bearer ${token}`
                      }
                    });
                    if(getResponse.ok) {
                      const getData = await getResponse.json();
                      setAction(getData.action)
                      setEditingAction(getData.action)
                    } else {
                      console.error("Erro ao buscar ação atualizada")
                    }
                    setIsEditModalOpen(false)
                  } else {
                    console.error("Erro ao atualizar ação")
                  }
                } catch (err) {
                  console.error("Erro:", err)
                }
              }}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
