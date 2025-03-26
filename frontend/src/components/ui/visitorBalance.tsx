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

// Define interface for expense data
interface ExpenseData {
  month: string;
  [action: string]: string | number | null;
}

export default function Balance() {
  const [selectedYear, setSelectedYear] = useState("");
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [data, setData] = useState<ExpenseData[]>([]); // Fix the type here
  const [visibleLines, setVisibleLines] = useState<{ [key: string]: boolean }>({});
  const [actionColors, setActionColors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    // Replace cookie extraction with URL parameter extraction
    const urlParams = new URLSearchParams(window.location.search);
    const ngoId = urlParams.get("ngo_id");
    if (!ngoId) return;

    fetch(`http://127.0.0.1:3333/ongs/${ngoId}`)
      .then((res) => res.json())
      .then((response) => {
        if (!response?.ngoGrafic) return;

        const { expensesByAction } = response.ngoGrafic;
        if (!expensesByAction || expensesByAction.length === 0) return;

        const allYears = new Set<string>();
        const expensesByMonth: { [month: string]: any } = {};
        const allActions = new Set<string>();
        const lastRecordedMonth: { [key: string]: number } = {};

        for (let month = 0; month < 12; month++) {
          expensesByMonth[monthNames[month]] = { month: monthNames[month] };
        }

        expensesByAction.forEach((yearData: any) => {
          const yearStr = yearData.year.toString();
          allYears.add(yearStr);

          if (yearStr !== selectedYear) return;

          yearData.months.forEach((monthData: any) => {
            const monthIndex = monthData.month - 1;
            const monthName = monthNames[monthIndex];

            monthData.dailyRecords.forEach((record: any) => {
              Object.entries(record.expensesByAction).forEach(([action, value]) => {
                allActions.add(action);

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
          allActions.forEach((action) => {
            if (!(action in monthData)) {
              monthData[action] = index <= lastRecordedMonth[action] ? 0 : null;
            }
          });
        });

        const formattedData = Object.values(expensesByMonth);
        setData(formattedData);

        const initialVisibility: { [key: string]: boolean } = {};
        const newColors: { [key: string]: string } = {};
        const usedColors = new Set<string>();

        allActions.forEach((action) => {
          initialVisibility[action] = true;
          if (!actionColors[action]) {
            newColors[action] = generateUniqueColor(usedColors);
          }
        });

        setVisibleLines(initialVisibility);
        setActionColors((prevColors) => ({ ...prevColors, ...newColors }));

        const sortedYears = Array.from(allYears).sort().reverse();
        setAvailableYears(sortedYears);
        if (!selectedYear) setSelectedYear(sortedYears[0]);
      });
  }, [selectedYear]);

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
                  checked={visibleLines[line]}
                  onCheckedChange={() => setVisibleLines((prev) => ({ ...prev, [line]: !prev[line] }))}
                  className="text-2xl text-gray-800 font-normal"
                >
                  {line}
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
                formatter={(value: any) => value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                labelFormatter={(label: string) => {
                  const index = monthNames.indexOf(label)
                  return index >= 0 ? fullMonthNames[index] : label
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
              <div key={key} className="flex flex-col items-center">
                <span className="w-48 h-4 rounded-full" style={{ backgroundColor: actionColors[key] }}></span>
                <span className="text-gray-700 font-bold text-3xl">{key}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
