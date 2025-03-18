"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"

export default function ActionDetail() {
  const searchParams = useSearchParams()
  const ngoId = searchParams.get("ngo_Id")
  const acaoId = searchParams.get("acao_id")
  const [action, setAction] = useState(null)

  useEffect(() => {
    if (ngoId && acaoId) {
      fetch(`http://127.0.0.1:3333/ongs/${ngoId}/actions/${acaoId}`)
        .then(res => res.json())
        .then(data => {
        
          setAction(data.action)
        })
        .catch(err => console.error("Erro ao buscar ação:", err))
    }
  }, [ngoId, acaoId])

  if (!action) return <p className="p-4">Carregando...</p>

  return (
    <Card>
      <h2>{action.name}</h2>
      <p>{action.type}</p>
      
    </Card>
  )
}