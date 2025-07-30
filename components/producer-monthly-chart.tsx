"use client"

import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts" // Removed Brush
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { EficienciaMensual } from "@/lib/data-loader"
import { monthNames } from "@/lib/data-loader" // Import monthNames

interface ProducerMonthlyChartProps {
  producerName: string
  monthlyData: EficienciaMensual[]
}

export function ProducerMonthlyChart({ producerName, monthlyData }: ProducerMonthlyChartProps) {
  const sortedData = [...monthlyData]
    .sort((a, b) => {
      if (a.Año !== b.Año) {
        return a.Año - b.Año
      }
      return a.Mes - b.Mes
    })
    .map((item) => ({
      ...item,
      monthYear: `${monthNames[item.Mes - 1]} ${item.Año}`,
    }))

  return (
    <Card className="shadow-lg transition-shadow hover:shadow-xl">
      <CardHeader className="bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
        <CardTitle className="text-[#1e3a8a] dark:text-gray-100">Eficiencia Mensual para {producerName}</CardTitle>
        <CardDescription className="dark:text-gray-400">
          Tendencias de Cotizaciones, Contratos y Eficiencia a lo largo del tiempo.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <ChartContainer
          config={{
            cotizaciones: {
              label: "Cotizaciones",
              color: "hsl(var(--chart-1))",
            },
            contratos: {
              label: "Contratos",
              color: "hsl(var(--chart-2))",
            },
            eficiencia: {
              label: "Eficiencia (%)",
              color: "hsl(var(--chart-3))",
            },
          }}
          className="h-[350px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sortedData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              isAnimationActive={true} // Re-added
              animationDuration={1500} // Re-added
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="monthYear" /> {/* Reverted XAxis */}
              <YAxis yAxisId="left" stroke="var(--color-cotizaciones)" />
              <YAxis yAxisId="right" orientation="right" stroke="var(--color-eficiencia)" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar yAxisId="left" dataKey="TotalCotizaciones" fill="var(--color-cotizaciones)" name="Cotizaciones" />
              <Bar yAxisId="left" dataKey="TotalContratos" fill="var(--color-contratos)" name="Contratos" />
              <Bar yAxisId="right" dataKey="Eficiencia" fill="var(--color-eficiencia)" name="Eficiencia (%)" />
              {/* Removed Brush component */}
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
