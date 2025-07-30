"use client"

import { useMemo } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { EficienciaTotal } from "@/lib/data-loader"

interface ComparisonChartProps {
  producer1: EficienciaTotal
  producer2: EficienciaTotal
  monthlyData1: any[]
  monthlyData2: any[]
}

// Custom tooltip for bar chart
const CustomBarTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border rounded-lg shadow-lg p-3">
        <p className="font-medium text-foreground mb-2">{`Métrica: ${label}`}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: entry.color }} />
            <span className="text-sm text-foreground">
              {entry.dataKey}: {label === "% Conversión" ? `${entry.value.toFixed(1)}%` : entry.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

// Custom tooltip for line chart
const CustomLineTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border rounded-lg shadow-lg p-3">
        <p className="font-medium text-foreground mb-2">{`Fecha: ${label}`}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-sm text-foreground">
              {entry.dataKey}: {entry.value.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export function ComparisonChart({ producer1, producer2, monthlyData1, monthlyData2 }: ComparisonChartProps) {
  // Define consistent colors for each producer
  const producerColors = ["#3b82f6", "#ef4444"]

  const comparisonData = useMemo(() => {
    const metrics = ["Cotizaciones", "Contratos", "% Conversión"]

    return metrics.map((metric) => {
      const dataPoint: any = { name: metric }

      if (metric === "Cotizaciones") {
        dataPoint[producer1.productor] = producer1.Cotizaciones
        dataPoint[producer2.productor] = producer2.Cotizaciones
      } else if (metric === "Contratos") {
        dataPoint[producer1.productor] = producer1.Contratos
        dataPoint[producer2.productor] = producer2.Contratos
      } else if (metric === "% Conversión") {
        dataPoint[producer1.productor] = producer1.Porcentaje_Conversion
        dataPoint[producer2.productor] = producer2.Porcentaje_Conversion
      }

      return dataPoint
    })
  }, [producer1, producer2])

  const monthlyTrendData = useMemo(() => {
    const allMonthlyData = [...(monthlyData1 || []), ...(monthlyData2 || [])]

    if (allMonthlyData.length === 0) return []

    // Group by year-month
    const monthlyMap = new Map()

    allMonthlyData.forEach((item) => {
      const key = `${item.Año}-${String(item.Mes).padStart(2, "0")}`
      const monthName = new Date(item.Año, item.Mes - 1).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "short",
      })

      if (!monthlyMap.has(key)) {
        monthlyMap.set(key, {
          month: monthName,
          date: new Date(item.Año, item.Mes - 1),
        })
      }

      const monthEntry = monthlyMap.get(key)
      monthEntry[item.productor] = item.Eficiencia
    })

    // Convert to array and sort by date
    return Array.from(monthlyMap.values())
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map(({ date, ...rest }) => rest)
  }, [monthlyData1, monthlyData2])

  return (
    <div className="space-y-6">
      {/* General Metrics Comparison */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Comparación General de Métricas
            <div className="flex gap-2 ml-auto">
              <div className="flex items-center gap-1 text-xs">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: producerColors[0] }} />
                <span style={{ color: producerColors[0] }} className="font-medium">
                  {producer1.productor}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: producerColors[1] }} />
                <span style={{ color: producerColors[1] }} className="font-medium">
                  {producer2.productor}
                </span>
              </div>
            </div>
          </CardTitle>
          <CardDescription>Comparación de cotizaciones, contratos y porcentaje de conversión</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#64748b" />
              <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
              <Tooltip content={<CustomBarTooltip />} cursor={{ fill: "rgba(59, 130, 246, 0.1)" }} />
              <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="rect" />
              <Bar dataKey={producer1.productor} fill={producerColors[0]} radius={[2, 2, 0, 0]} />
              <Bar dataKey={producer2.productor} fill={producerColors[1]} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Monthly Efficiency Trend */}
      <Card className={`border-l-4 ${monthlyTrendData.length > 0 ? "border-l-green-500" : "border-l-gray-300"}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Tendencia de Eficiencia Mensual
            <div className="flex gap-2 ml-auto">
              <div className="flex items-center gap-1 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: producerColors[0] }} />
                <span style={{ color: producerColors[0] }} className="font-medium">
                  {producer1.productor}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: producerColors[1] }} />
                <span style={{ color: producerColors[1] }} className="font-medium">
                  {producer2.productor}
                </span>
              </div>
            </div>
          </CardTitle>
          <CardDescription>Evolución del porcentaje de conversión a lo largo del tiempo</CardDescription>
        </CardHeader>
        <CardContent>
          {monthlyTrendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={monthlyTrendData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, angle: -45, textAnchor: "end" }}
                  stroke="#64748b"
                  height={80}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  stroke="#64748b"
                  domain={["dataMin - 5", "dataMax + 5"]}
                  label={{ value: "Eficiencia (%)", angle: -90, position: "insideLeft" }}
                />
                <Tooltip content={<CustomLineTooltip />} />
                <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="line" />
                <Line
                  type="monotone"
                  dataKey={producer1.productor}
                  stroke={producerColors[0]}
                  strokeWidth={3}
                  dot={{
                    fill: producerColors[0],
                    strokeWidth: 2,
                    stroke: "#ffffff",
                    r: 4,
                  }}
                  activeDot={{
                    r: 6,
                    fill: producerColors[0],
                    stroke: "#ffffff",
                    strokeWidth: 2,
                  }}
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey={producer2.productor}
                  stroke={producerColors[1]}
                  strokeWidth={3}
                  dot={{
                    fill: producerColors[1],
                    strokeWidth: 2,
                    stroke: "#ffffff",
                    r: 4,
                  }}
                  activeDot={{
                    r: 6,
                    fill: producerColors[1],
                    stroke: "#ffffff",
                    strokeWidth: 2,
                  }}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <p className="text-muted-foreground">No hay datos mensuales disponibles para mostrar</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
