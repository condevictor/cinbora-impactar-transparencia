"use client"

import ActionsGallery from "@/components/ui/actionsGallery";
import ActionsBalance from "@/components/ui/actionsBalance";
import ActionsDocuments from "@/components/ui/actionsDocuments";

import { useState } from "react";
export default function Actions(){

    const [activeTab, setActiveTab] = useState("gallery");
    return(
        <main>
              <div></div>
            
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