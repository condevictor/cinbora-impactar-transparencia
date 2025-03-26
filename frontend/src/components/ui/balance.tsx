"use client";

import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { FaChevronDown } from "react-icons/fa";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";

// Add TypeScript interfaces for API response
interface DailyRecord {
  day: number;
  expensesByAction: { [key: string]: number };
}

interface MonthData {
  month: number;
  dailyRecords: DailyRecord[];
}

interface YearData {
  year: number;
  months: MonthData[];
}

interface NgoData {
  ngoGrafic?: {
    expensesByAction: YearData[];
  };
}

const monthNames = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez"
];

const fullMonthNames = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const generateUniqueColor = (usedColors: Set<string>) => {
  let color;
  do {
    const hue = Math.floor(Math.random() * 360);
    color = `hsl(${hue}, 70%, 50%)`;
  } while (usedColors.has(color));
  usedColors.add(color);
  return color;
};

export default function Balance() {
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [data, setData] = useState<Array<{[key: string]: any}>>([]);
  const [visibleLines, setVisibleLines] = useState<{ [key: string]: boolean }>({});
  const [actionColors, setActionColors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const ngoId = Cookies.get("ngo_id");
    if (!ngoId) return;
  
    fetch(`http://127.0.0.1:3333/ongs/${ngoId}`)
      .then((res) => res.json())
      .then((response: NgoData) => {
        if (!response?.ngoGrafic?.expensesByAction?.length) return;
  
        const { expensesByAction } = response.ngoGrafic;
  
        const lastYearData = expensesByAction.reduce((acc, curr) =>
          curr.year > acc.year ? curr : acc
        );
  
        const lastMonthData = lastYearData.months.reduce((acc, curr) =>
          curr.month > acc.month ? curr : acc
        );
  
        const lastDayRecord = lastMonthData.dailyRecords.reduce((acc, curr) =>
          curr.day > acc.day ? curr : acc
        );
  
        const actionsToDisplay = Object.keys(lastDayRecord.expensesByAction || {});
        const allYears = new Set<string>();
        const expensesByMonth: { [month: string]: any } = {};
        const lastRecordedMonth: { [key: string]: number } = {};
  
        for (let i = 0; i < 12; i++) {
          expensesByMonth[monthNames[i]] = { month: monthNames[i] };
        }
  
        expensesByAction.forEach((yearData) => {
          const yearStr = yearData.year.toString();
          allYears.add(yearStr);
  
          if (yearStr !== selectedYear) return;
  
          yearData.months.forEach((monthData) => {
            const monthIndex = monthData.month - 1;
            const monthName = monthNames[monthIndex];
  
            monthData.dailyRecords.forEach((record) => {
              Object.entries(record.expensesByAction).forEach(([action, value]) => {
                if (!actionsToDisplay.includes(action)) return;
  
                if (!expensesByMonth[monthName][action]) {
                  expensesByMonth[monthName][action] = 0;
                }
  
                expensesByMonth[monthName][action] += Number(value);
                lastRecordedMonth[action] = monthIndex;
              });
            });
          });
        });
  
        Object.entries(expensesByMonth).forEach(([monthName, monthData], index) => {
          actionsToDisplay.forEach((action) => {
            if (!(action in monthData)) {
              monthData[action] = index <= (lastRecordedMonth[action] || 0) ? 0 : null;
            }
          });
        });
  
        const formattedData = Object.values(expensesByMonth);
        setData(formattedData);
  
        const initialVisibility: { [key: string]: boolean } = {};
        const newColors: { [key: string]: string } = {};
        const usedColors = new Set<string>();
  
        actionsToDisplay.forEach((action) => {
          initialVisibility[action] = true;
          if (!actionColors[action]) {
            newColors[action] = generateUniqueColor(usedColors);
          }
        });
  
        setVisibleLines(initialVisibility);
        setActionColors((prev) => ({ ...prev, ...newColors }));
  
        const sortedYears = Array.from(allYears).sort().reverse();
        setAvailableYears(sortedYears);
        if (!selectedYear) setSelectedYear(sortedYears[0]);
      })
      .catch(error => console.error("Error fetching NGO data:", error));
  }, [selectedYear, actionColors]);
  

  return (
    <div className="flex justify-center py-10">
      <div className="w-[95%] max-w-[1400px]">
        <h2 className="text-center font-bold text-5xl mb-16">Balanço de gastos</h2>

        <div className="flex justify-between items-center mb-4 relative text-lg">
          <DropdownMenu>
            <DropdownMenuTrigger className="cursor-pointer text-gray-800 flex items-center text-2xl">
              Ações <FaChevronDown className="ml-1" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {Object.keys(visibleLines).map((line) => (
                <DropdownMenuCheckboxItem
                  key={line}
                  title={line}
                  checked={visibleLines[line]}
                  onCheckedChange={() =>
                    setVisibleLines((prev) => ({ ...prev, [line]: !prev[line] }))
                  }
                  className="text-2xl text-gray-800 font-normal"
                >
                  {line.length > 20 ? line.slice(0, 30) + "..." : line}
                </DropdownMenuCheckboxItem>

              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger className="cursor-pointer text-gray-800 flex items-center text-2xl">
              {selectedYear}
              <FaChevronDown className="ml-1" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {availableYears.map((year) => (
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

        <div className="rounded-3xl border-4 border-[#00B3FF] p-6 shadow-xl">
          <ResponsiveContainer width="100%" height={700}>
            <LineChart data={data} margin={{ top: 40, right: 40, left: 20, bottom: 50 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                angle={-45}
                textAnchor="end"
                height={70}
                interval={0}
                tick={{ fontSize: 16 }}
              />
              <YAxis
                label={{ value: "", angle: -90, position: "insideLeft", fontSize: 18 }}
                tick={{ fontSize: 16 }}
              />
              <Tooltip
                formatter={(value: any, name: string) => {
                  const truncated = name.length > 30 ? name.slice(0, 30) + "..." : name;
                  return [`${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, truncated];
                }}
                labelFormatter={(label: string) => {
                  const index = monthNames.indexOf(label);
                  return index >= 0 ? fullMonthNames[index] : label;
                }}
              />

              {Object.keys(visibleLines).map((key) =>
                visibleLines[key] ? (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={actionColors[key]}
                    strokeWidth={3}
                    dot={true}
                    connectNulls={true}
                  />
                ) : null
              )}
            </LineChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-4 gap-6 mt-6 text-xl">
            {Object.keys(visibleLines).map((key) => (
              <div key={key} className="flex flex-col items-center" title={key}>
                <span className="w-48 h-4 rounded-full" style={{ backgroundColor: actionColors[key] }}></span>
                <span className="text-gray-700 font-bold text-3xl">
                  {key.length > 15 ? key.slice(0, 15) + "..." : key}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
