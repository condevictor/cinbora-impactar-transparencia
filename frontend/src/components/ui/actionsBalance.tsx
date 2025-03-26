"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { FaChevronDown } from "react-icons/fa"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"

// Define type interfaces for API response
interface DailyRecord {
  day: number;
  categorysExpenses: { [key: string]: number };
}

interface MonthData {
  month: number;
  dailyRecords: DailyRecord[];
}

interface YearData {
  year: number;
  months: MonthData[];
}

interface ActionData {
  actionGrafic?: [{
    categorysExpenses: YearData[];
  }];
}

// Existing code for month names
const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]

const fullMonthNames = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
]

const generateUniqueColor = (usedColors: Set<string>) => {
  let color
  do {
    const hue = Math.floor(Math.random() * 360)
    color = `hsl(${hue}, 70%, 50%)`
  } while (usedColors.has(color))
  usedColors.add(color)
  return color
}

export default function Balance() {
  const searchParams = useSearchParams()
  const actionId = searchParams.get("action_id")

  const [selectedYear, setSelectedYear] = useState<string>("")
  const [availableYears, setAvailableYears] = useState<string[]>([])
  const [data, setData] = useState<Array<{[key: string]: any}>>([])
  const [visibleLines, setVisibleLines] = useState<{ [key: string]: boolean }>({})
  const [actionColors, setActionColors] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    const fetchData = async () => {
      if (!actionId) return

      try {
        const res = await fetch(`http://localhost:3333/ongs/actions/${actionId}`)
        const data: ActionData = await res.json()
        const grafics = data.actionGrafic?.[0]?.categorysExpenses

        if (!Array.isArray(grafics)) return

        const allYears = new Set<string>()
        const allCategories = new Set<string>()
        const expensesByMonth: { [month: string]: any } = {}
        const lastMonthUsed: { [category: string]: number } = {}

        for (let i = 0; i < 12; i++) {
          expensesByMonth[monthNames[i]] = { month: monthNames[i] }
        }

        grafics.forEach((yearData) => {
          const yearStr = yearData.year.toString()
          allYears.add(yearStr)

          if (yearStr !== selectedYear) return

          yearData.months.forEach((monthData) => {
            const monthIndex = monthData.month - 1
            const monthName = monthNames[monthIndex]

            monthData.dailyRecords.forEach((record) => {
              Object.entries(record.categorysExpenses).forEach(([category, value]) => {
                allCategories.add(category)

                if (!expensesByMonth[monthName][category]) {
                  expensesByMonth[monthName][category] = 0
                }

                expensesByMonth[monthName][category] += Number(value)
                lastMonthUsed[category] = monthIndex
              })
            })
          })
        })

        Object.entries(expensesByMonth).forEach(([monthName, monthData], index) => {
          allCategories.forEach((category) => {
            if (!(category in monthData)) {
              monthData[category] = index <= (lastMonthUsed[category] ?? -1) ? 0 : null
            }
          })
        })

        const usedColors = new Set<string>()
        const newColors: { [key: string]: string } = {}
        const initialVisibility: { [key: string]: boolean } = {}

        allCategories.forEach((category) => {
          initialVisibility[category] = true
          if (!actionColors[category]) {
            newColors[category] = generateUniqueColor(usedColors)
          }
        })

        setData(Object.values(expensesByMonth))
        setVisibleLines(initialVisibility)
        setActionColors((prev) => ({ ...prev, ...newColors }))
        setAvailableYears(Array.from(allYears).sort().reverse())

        if (!selectedYear && allYears.size > 0) {
          setSelectedYear(Array.from(allYears).sort().reverse()[0])
        }
      } catch (error) {
        console.error("Error fetching action data:", error)
      }
    }

    fetchData()
  }, [actionId, selectedYear, actionColors])

  return (
    <div className="flex justify-center py-10">
      <div className="w-[95%] max-w-[1400px]">
        <h2 className="text-center font-bold text-5xl mb-16">Balanço de gastos</h2>

        <div className="flex justify-between items-center mb-4 relative text-lg">
          <DropdownMenu>
            <DropdownMenuTrigger className="cursor-pointer text-gray-800 flex items-center text-2xl">
              Categorias <FaChevronDown className="ml-1" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {Object.keys(visibleLines).map((line) => (
                <DropdownMenuCheckboxItem
                  key={line}
                  checked={visibleLines[line]}
                  onCheckedChange={() =>
                    setVisibleLines((prev) => ({ ...prev, [line]: !prev[line] }))
                  }
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
                  className={`text-2xl text-gray-800 font-normal ${
                    selectedYear === year ? "font-bold" : ""
                  }`}
                  onSelect={() => setSelectedYear(year)}
                >
                  {year}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="rounded-3xl border-4 border-[#00B3FF] p-0 shadow-xl">
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
                label={{
                  
                  angle: -90,
                  position: "insideLeft",
                  fontSize: 18,
                }}
                tick={{ fontSize: 16 }}
              />
              <Tooltip
                formatter={(value: any) =>
                  `R$ ${Number(value).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}`
                }
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
                <span
                  className="w-48 h-4 rounded-full"
                  style={{ backgroundColor: actionColors[key] }}
                ></span>
                <span className="text-gray-700 font-bold text-3xl">{key}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
