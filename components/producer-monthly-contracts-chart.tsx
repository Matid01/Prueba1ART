"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Legend, CartesianGrid } from "recharts" // Removed Brush
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { ContratosMensuales } from "@/lib/data-loader"

interface ProducerMonthlyContractsChartProps {
  producerName: string
  monthlyData: ContratosMensuales[]
}

export function ProducerMonthlyContractsChart({ producerName, monthlyData }: ProducerMonthlyContractsChartProps) {
  // Sort data by year and month
  const sortedData = [...monthlyData].sort((a, b) => {
    if (a.Año !== b.Año) {
      return a.Año - b.Año
    }
    return a.Mes - b.Mes
  })

  // Format data for chart: combine year and month for X-axis label
  const chartData = sortedData.map((item) => ({
    name: `${item.NombreMes} ${item.Año}`,
    Contratos: item.TotalContratos,
  }))

  return (
    <Card className="shadow-lg transition-shadow hover:shadow-xl">
      <CardHeader className="bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
        <CardTitle className="text-[#1e3a8a] dark:text-gray-100">Contratos Mensuales para {producerName}</CardTitle>
        <CardDescription className="dark:text-gray-400">Visualización del total de contratos por mes.</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <ChartContainer
          config={{
            Contratos: {
              label: "Contratos",
              color: "hsl(var(--chart-3))",
            },
          }}
          className="h-[300px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              isAnimationActive={true} // Re-added
              animationDuration={1500} // Re-added
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={30} // Reverted minTickGap
                angle={-45}
                textAnchor="end"
                // Removed interval
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Legend />
              <Bar dataKey="Contratos" fill="var(--color-Contratos)" radius={8} />
              {/* Removed Brush component */}
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
