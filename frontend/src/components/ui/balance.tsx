"use client";

import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { FaChevronDown } from "react-icons/fa";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";

type DataType = {
  name: string;
  aluguel: number;
  equipamentos: number;
  alimento: number;
  maoDeObra: number;
};

const data: DataType[] = [
  { name: "Jan", aluguel: 5, equipamentos: 5, alimento: 5, maoDeObra: 5 },
  { name: "Feb", aluguel: 15, equipamentos: 18, alimento: 16, maoDeObra: 20 },
  { name: "Mar", aluguel: 25, equipamentos: 28, alimento: 26, maoDeObra: 30 },
  { name: "Apr", aluguel: 30, equipamentos: 38, alimento: 35, maoDeObra: 40 },
  { name: "May", aluguel: 40, equipamentos: 48, alimento: 45, maoDeObra: 50 },
  { name: "Jun", aluguel: 50, equipamentos: 58, alimento: 55, maoDeObra: 60 },
  { name: "Jul", aluguel: 60, equipamentos: 65, alimento: 70, maoDeObra: 65 },
  { name: "Aug", aluguel: 70, equipamentos: 75, alimento: 80, maoDeObra: 75 },
  { name: "Sep", aluguel: 80, equipamentos: 85, alimento: 95, maoDeObra: 85 },
  { name: "Oct", aluguel: 90, equipamentos: 100, alimento: 110, maoDeObra: 100 },
  { name: "Nov", aluguel: 90.6, equipamentos: 115.3, alimento: 125.2, maoDeObra: 115.3 },
  { name: "Dec", aluguel: 90.6, equipamentos: 123.2, alimento: 125.2, maoDeObra: 115.3 },
];

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ backgroundColor: "#fff", border: "1px solid #ccc", padding: 10 }}>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Balance() {
  const [selectedYear, setSelectedYear] = useState("2024");
  const [visibleLines, setVisibleLines] = useState({
    aluguel: true,
    equipamentos: true,
    alimento: true,
    maoDeObra: true,
  });

  const toggleLineVisibility = (line: keyof typeof visibleLines) => {
    setVisibleLines((prev) => ({ ...prev, [line]: !prev[line] }));
  };

  return (
    <div className="flex justify-center py-10">
      <div className="w-[95%] max-w-[1400px]">
        {/* Título isolado */}
        <h2 className="text-center font-bold text-5xl mb-16">Balanço de gastos</h2>

        {/* Filtros e ano */}
        <div className="flex justify-between items-center mb-4 relative text-lg">
          {/* Filtro Gastos da ação */}
          <DropdownMenu>
            <DropdownMenuTrigger className="cursor-pointer text-gray-800 flex items-center text-2xl">
              Gastos da ação <FaChevronDown className="ml-1" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {Object.keys(visibleLines).map((line) => (
                <DropdownMenuCheckboxItem
                  key={line}
                  checked={visibleLines[line as keyof typeof visibleLines]}
                  onCheckedChange={() => toggleLineVisibility(line as keyof typeof visibleLines)}
                  className="text-2xl text-gray-800 font-normal"
                >
                  {line === "maoDeObra" ? "Mão de Obra" : line.charAt(0).toUpperCase() + line.slice(1)}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Ano */}
          <DropdownMenu>
            <DropdownMenuTrigger className="cursor-pointer text-gray-800 flex items-center text-2xl">
              {selectedYear}
              <FaChevronDown className="ml-1" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {["2024", "2023", "2022"].map((year) => (
                <DropdownMenuItem
                    key={year}
                    className={`text-2xl text-gray-800 font-normal ${selectedYear === year ? "font-bold" : ""}`}
                    onSelect={() => setSelectedYear(year)}
                    >
                    {year}
                    </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Gráfico */}
        <div className="rounded-3xl border-4 border-[#00B3FF] p-6 shadow-xl">
          <ResponsiveContainer width="100%" height={700}>
            <LineChart data={data} margin={{ top: 40, right: 40, left: 20, bottom: 50 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} tick={{ fontSize: 16 }} />
              <YAxis
                label={{ value: "Valor em milhares", angle: -90, position: "insideLeft", fontSize: 18 }}
                tick={{ fontSize: 16 }}
              />
              <Tooltip content={<CustomTooltip />} />

              {visibleLines.aluguel && (
                <Line type="monotone" dataKey="aluguel" stroke="#F4B400" strokeWidth={3} dot={false}>
                  <LabelList
                    dataKey="aluguel"
                    position="top"
                    formatter={(value: number, _: any, params?: any) =>
                      params?.index === data.length - 1 ? "Aluguel" : ""
                    }
                  />
                </Line>
              )}

              {visibleLines.equipamentos && (
                <Line type="monotone" dataKey="equipamentos" stroke="#5E35B1" strokeWidth={3} dot={false}>
                  <LabelList
                    dataKey="equipamentos"
                    position="top"
                    formatter={(value: number, _: any, params?: any) =>
                      params?.index === data.length - 1 ? "Equipamentos" : ""
                    }
                  />
                </Line>
              )}

              {visibleLines.alimento && (
                <Line type="monotone" dataKey="alimento" stroke="#D32F2F" strokeWidth={3} dot={false}>
                  <LabelList
                    dataKey="alimento"
                    position="top"
                    formatter={(value: number, _: any, params?: any) =>
                      params?.index === data.length - 1 ? "Alimento" : ""
                    }
                  />
                </Line>
              )}

              {visibleLines.maoDeObra && (
                <Line type="monotone" dataKey="maoDeObra" stroke="#009688" strokeWidth={3} dot={false}>
                  <LabelList
                    dataKey="maoDeObra"
                    position="top"
                    formatter={(value: number, _: any, params?: any) =>
                      params?.index === data.length - 1 ? "Mão de Obra" : ""
                    }
                  />
                </Line>
              )}
            </LineChart>
          </ResponsiveContainer>

          {/* Legendas */}
          <div className="flex justify-center gap-14 mt-4 text-xl">
            <div className="flex flex-col items-center">
              <span className="w-48 h-4 rounded-full bg-[#F4B400] mb-1"></span>
              <span className="text-gray-700 font-bold text-3xl">Aluguel</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="w-48 h-4 rounded-full bg-[#5E35B1] mb-1"></span>
              <span className="text-gray-700 font-bold text-3xl">Equipamentos</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="w-48 h-4 rounded-full bg-[#D32F2F] mb-1"></span>
              <span className="text-gray-700 font-bold text-3xl">Alimento</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="w-48 h-4 rounded-full bg-[#009688] mb-1"></span>
              <span className="text-gray-700 font-bold text-3xl">Mão de Obra</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}