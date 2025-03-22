"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress";

import ActionsGallery from "@/components/ui/actionsGallery"
import ActionsDocuments from "@/components/ui/actionsDocuments"
import ActionsBalance from "@/components/ui/actionsBalance"

export default function ActionDetail() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const acaoId = searchParams.get("action_id")
  const [action, setAction] = useState(null)
  const [activeTab, setActiveTab] = useState("gallery");

  if (!acaoId) {
    router.push("/")
    return null
  }

  useEffect(() => {
    if (acaoId) {
      fetch(`http://127.0.0.1:3333/ongs/actions/${acaoId}`)
        .then(res => res.json())
        .then(data => {
          if (!data.action) {
            router.push("/")
            return;
          }
          setAction(data.action)
        })
        .catch(err => {
          console.error("Erro ao buscar ação:", err)
          router.push("/")
        })
    }
  }, [acaoId, router])

  if (!action) return <p className="p-4">Carregando...</p>

  return (
    <main>
      <CardContent className="relative p-4 min-w-72">
        <div className="relative z-10 bg-white mt-32 w-5/6 m-auto">
          <div className="flex flex-col justify-between p-4 w-full h-64 border-solid border border-white rounded shadow-[0_1px_4px_1px_rgba(16,24,40,0.1)]">
            <div>
              <p className="inline text-sm font-semibold text-[#294BB6] px-2 py-1 bg-[#2BAFF1] bg-opacity-20 rounded">
                {action.type}
              </p>
            </div>
            <div className="font-semibold">{action.name}</div>
            <div>
              <Progress className="w-full bg-[#EAECF0]" indicatorClass="bg-[#2BAFF150]" value={(action.colected / action.goal) * 100} />
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
      </CardContent>

      <div className="w-full flex justify-center border-b border-gray-300 mt-6">
        <div className="flex space-x-6">
          {["gallery", "balance", "documents"].map((tab) => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)} 
              className={`px-4 py-2 text-sm font-medium transition-all ${activeTab === tab ? "text-[#294BB6] border-b-2 border-[#294BB6]" : "text-gray-500 hover:text-[#2E4049]"}`}
            >
              {tab === "gallery" && "Galeria"}
              {tab === "balance" && "Balanço de Gastos"}
              {tab === "documents" && "Documentos"}
            </button>
          ))}
        </div>
      </div>
      <div className="w-full mt-6">
        {activeTab === "gallery" && <ActionsGallery />}
        {activeTab === "balance" && <ActionsBalance />}
        {activeTab === "documents" && <ActionsDocuments />}
      </div>
    </main>
  )
}