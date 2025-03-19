"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import shareButton from "../../assets/share.svg";
import Link from "next/link";

import VisitorGallery from "@/components/ui/visitorGallery";
import VisitorBalance from "@/components/ui/visitorBalance";
import VisitorDocuments from "@/components/ui/visitorDocuments";

export default function Visitor() {
  const searchParams = useSearchParams();
  const ngoId = searchParams.get("ngo_id");

  const [slides, setSlides] = useState([]);
  const [activeTab, setActiveTab] = useState("gallery");
  const [loading, setLoading] = useState(true); // novo estado

  useEffect(() => {
    if (ngoId) {
      fetch(`http://127.0.0.1:3333/ongs/${ngoId}/actions`)
        .then((res) => res.json())
        .then((data) => {
          setSlides(data);
          setLoading(false); // finaliza carregamento
        })
        .catch((error) => {
          console.log("Erro ao buscar ações:", error);
          setLoading(false); // finaliza carregamento mesmo com erro
        });
    }
  }, [ngoId]);

  return (
    <main className="flex flex-col items-center">
      <h1 className="text-center text-5xl font-bold text-[#2E4049] mt-20">
        Transparência
      </h1>
      <h1 className="text-center text-4xl font-bold text-[#2E4049] mt-20">
        Ações
      </h1>
      {loading ? null : (slides.length > 0 ? (
        <Carousel opts={{ align: "start" }} className="w-full p-4 mt-16">
          <CarouselContent>
            {slides.map((slide, index) => (
              <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4 border-none shadow-none">
                  <CardContent className="relative p-4 min-w-72">
                  
                    <div
                      className="absolute inset-0 bg-no-repeat bg-center bg-cover bg-top max-h-48"
                      style={{ backgroundImage: `url(${slide.aws_url})` }}
                    />
                    <div className="relative z-10 bg-white mt-32 w-full">
                      <div className="flex flex-col justify-between p-4 w-full h-64 border-solid border border-white rounded shadow-[0_1px_4px_1px_rgba(16,24,40,0.1)]">
                        <div>
                          
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
                          <Link href={`/actions?ngo_Id=${ngoId}&acao_id=${slide.id}`} className="w-4/5 h-full font-bold rounded-[34px] bg-[#294BB6] text-white border-solid border-[#2E4049] border">
                            <Button className="w-full h-full font-bold rounded-[34px] bg-[#294BB6] text-white border-solid border-[#2E4049] border hover:text-[#294BB6] hover:bg-white">
                              TRANSPARÊNCIA
                            </Button>
                          </Link>
                          <div className="w-2/12 rounded-full h-full bg-[#F2F4F7] flex justify-center items-center">
                            <Image className="w-6 h-6" src={shareButton} alt="share" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex justify-center mt-4 gap-4 pb-4 w-full">
            <CarouselPrevious />
            <CarouselNext />
          </div>
        </Carousel>
      ) : (
        <div className="mt-10 text-red-600">
          Nenhuma ação criada ainda
        </div>
      ))}
      
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
        {activeTab === "gallery" && <VisitorGallery />}
        {activeTab === "balance" && <VisitorBalance />}
        {activeTab === "documents" && <VisitorDocuments />}
      </div>
    </main>
  );
}
