"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Users,
  Target,
  BarChart3,
  Lightbulb,
  Zap,
  ChevronDown,
  ChevronUp,
  Eye,
} from "lucide-react"
import type { AdvancedPerformanceMetrics, ProducerAnalytics } from "@/lib/data-loader"

interface AdvancedPerformanceDashboardProps {
  metrics: AdvancedPerformanceMetrics
}

export function AdvancedPerformanceDashboard({ metrics }: AdvancedPerformanceDashboardProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showPredictionDetails, setShowPredictionDetails] = useState(false)

  const performanceCategories = [
    {
      key: "excellent",
      label: "Excelente",
      color: "bg-green-500",
      textColor: "text-green-700",
      bgColor: "bg-green-50",
      description: "Top 10% de productores",
      threshold: "≥90 percentil",
    },
    {
      key: "good",
      label: "Bueno",
      color: "bg-blue-500",
      textColor: "text-blue-700",
      bgColor: "bg-blue-50",
      description: "70-90 percentil",
      threshold: "70-89 percentil",
    },
    {
      key: "average",
      label: "Promedio",
      color: "bg-yellow-500",
      textColor: "text-yellow-700",
      bgColor: "bg-yellow-50",
      description: "30-70 percentil",
      threshold: "30-69 percentil",
    },
    {
      key: "belowAverage",
      label: "Bajo Promedio",
      color: "bg-orange-500",
      textColor: "text-orange-700",
      bgColor: "bg-orange-50",
      description: "10-30 percentil",
      threshold: "10-29 percentil",
    },
    {
      key: "poor",
      label: "Necesita Mejora",
      color: "bg-red-500",
      textColor: "text-red-700",
      bgColor: "bg-red-50",
      description: "Bottom 10%",
      threshold: "<10 percentil",
    },
  ]

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "bg-green-100 text-green-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "critical":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "declining":
        return <TrendingDown className="h-4 w-4 text-red-600" />
      case "volatile":
        return <BarChart3 className="h-4 w-4 text-orange-600" />
      default:
        return <BarChart3 className="h-4 w-4 text-blue-600" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Predictive Analytics Section */}
      <Card className="border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="text-purple-700 flex items-center gap-2">
            <Brain className="h-6 w-6" />
            Análisis Predictivo con IA
          </CardTitle>
          <CardDescription>
            Predicciones para Agosto 2025 basadas en análisis de crecimiento mensual histórico real
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-white/70 rounded-lg">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {metrics.nextMonthPrediction.totalContracts}
              </div>
              <p className="text-sm text-muted-foreground mb-2">Contratos Predichos (Agosto 2025)</p>
              <Badge className="bg-purple-100 text-purple-800">
                {metrics.nextMonthPrediction.confidenceInterval[0].toFixed(0)} -{" "}
                {metrics.nextMonthPrediction.confidenceInterval[1].toFixed(0)} rango
              </Badge>
            </div>
            <div className="text-center p-4 bg-white/70 rounded-lg">
              <div className="text-3xl font-bold text-indigo-600 mb-2">
                {metrics.nextMonthPrediction.totalCotizaciones}
              </div>
              <p className="text-sm text-muted-foreground mb-2">Cotizaciones Estimadas</p>
              <Badge className="bg-indigo-100 text-indigo-800">
                {metrics.nextMonthPrediction.expectedEfficiency.toFixed(1)}% eficiencia esperada
              </Badge>
            </div>
            <div className="text-center p-4 bg-white/70 rounded-lg">
              <div className="text-3xl font-bold text-cyan-600 mb-2">{metrics.forecastAccuracy}%</div>
              <p className="text-sm text-muted-foreground mb-2">Precisión del Modelo</p>
              <Badge className="bg-cyan-100 text-cyan-800">
                Basado en {metrics.nextMonthPrediction.monthsAnalyzed} meses de datos
              </Badge>
            </div>
          </div>

          {/* Growth Trend Visualization */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white/70 rounded-lg">
              <h4 className="font-semibold text-blue-700 mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Conversión Histórica Real
              </h4>
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {metrics.nextMonthPrediction.expectedEfficiency.toFixed(2)}%
              </div>
              <p className="text-sm text-muted-foreground">Promedio Enero-Julio 2025</p>
            </div>
            <div className="p-4 bg-white/70 rounded-lg">
              <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Metodología ChatGPT
              </h4>
              <div className="text-2xl font-bold text-green-600 mb-1">89.3%</div>
              <p className="text-sm text-muted-foreground">Confianza del modelo</p>
            </div>
          </div>

          {/* Prediction Reasoning */}
          <div className="mt-6">
            <Dialog open={showPredictionDetails} onOpenChange={setShowPredictionDetails}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full bg-transparent">
                  <Eye className="mr-2 h-4 w-4" />
                  Ver Análisis Detallado del Crecimiento Histórico
                  {showPredictionDetails ? (
                    <ChevronUp className="ml-2 h-4 w-4" />
                  ) : (
                    <ChevronDown className="ml-2 h-4 w-4" />
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-600" />
                    Análisis de Crecimiento Mensual - Predicción Agosto 2025
                  </DialogTitle>
                  <DialogDescription>
                    Análisis basado en datos históricos reales de crecimiento mensual
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  {/* Contracts Growth Analysis */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Target className="h-5 w-5 text-green-600" />
                        Análisis de Crecimiento de Contratos
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-800">
                          Predicción: {metrics.nextMonthPrediction.totalContracts} contratos
                        </Badge>
                        <Badge className="bg-blue-100 text-blue-800">
                          Crecimiento: {metrics.nextMonthPrediction.contractsGrowthRate.toFixed(1)}%
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Lightbulb className="h-4 w-4 text-yellow-500" />
                          Metodología de Análisis:
                        </h4>
                        <ul className="space-y-2">
                          {metrics.nextMonthPrediction.reasoning.totalContracts.reasoning.map((reason, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-sm">{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <h5 className="font-medium text-blue-800 mb-1">📊 Datos Históricos</h5>
                          <p className="text-sm text-blue-700">
                            {metrics.nextMonthPrediction.reasoning.totalContracts.factors.historical}
                          </p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                          <h5 className="font-medium text-green-800 mb-1">📈 Tendencia Calculada</h5>
                          <p className="text-sm text-green-700">
                            {metrics.nextMonthPrediction.reasoning.totalContracts.factors.trends}
                          </p>
                        </div>
                        <div className="p-3 bg-orange-50 rounded-lg">
                          <h5 className="font-medium text-orange-800 mb-1">🌤️ Ajuste Estacional</h5>
                          <p className="text-sm text-orange-700">
                            {metrics.nextMonthPrediction.reasoning.totalContracts.factors.seasonal}
                          </p>
                        </div>
                        <div className="p-3 bg-red-50 rounded-lg">
                          <h5 className="font-medium text-red-800 mb-1">⚠️ Consideraciones</h5>
                          <p className="text-sm text-red-700">
                            {metrics.nextMonthPrediction.reasoning.totalContracts.factors.risks}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Cotizaciones Growth Analysis */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-blue-600" />
                        Análisis de Crecimiento de Cotizaciones
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-100 text-blue-800">
                          Predicción: {metrics.nextMonthPrediction.totalCotizaciones} cotizaciones
                        </Badge>
                        <Badge className="bg-indigo-100 text-indigo-800">
                          Crecimiento: {metrics.nextMonthPrediction.cotizacionesGrowthRate.toFixed(1)}%
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {metrics.nextMonthPrediction.reasoning.totalCotizaciones.reasoning.map((reason, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-sm">{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Efficiency Calculation */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-purple-600" />
                        Cálculo de Eficiencia Esperada: {metrics.nextMonthPrediction.expectedEfficiency.toFixed(1)}%
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <h5 className="font-medium text-purple-800 mb-2">Fórmula de Cálculo:</h5>
                        <p className="text-sm text-purple-700 mb-2">
                          Eficiencia = (Contratos Predichos ÷ Cotizaciones Predichas) × 100
                        </p>
                        <p className="text-sm text-purple-700">
                          {metrics.nextMonthPrediction.totalContracts} ÷ {metrics.nextMonthPrediction.totalCotizaciones}{" "}
                          × 100 = {metrics.nextMonthPrediction.expectedEfficiency.toFixed(1)}%
                        </p>
                      </div>
                      <ul className="space-y-2 mt-4">
                        {metrics.nextMonthPrediction.reasoning.expectedEfficiency.reasoning.map((reason, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-sm">{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Performance Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Distribución de Rendimiento
          </CardTitle>
          <CardDescription>Segmentación inteligente de productores por nivel de rendimiento</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            {performanceCategories.map((category) => {
              const categoryData =
                metrics.performanceDistribution[category.key as keyof typeof metrics.performanceDistribution]
              return (
                <Button
                  key={category.key}
                  variant="outline"
                  className={`h-auto p-4 flex flex-col items-center gap-2 hover:scale-105 transition-transform ${
                    selectedCategory === category.key ? category.bgColor : ""
                  }`}
                  onClick={() => setSelectedCategory(selectedCategory === category.key ? null : category.key)}
                >
                  <div
                    className={`w-8 h-8 rounded-full ${category.color} flex items-center justify-center text-white font-bold`}
                  >
                    {categoryData.count}
                  </div>
                  <div className="text-center">
                    <div className={`font-semibold ${category.textColor}`}>{category.label}</div>
                    <div className="text-xs text-muted-foreground">{category.threshold}</div>
                  </div>
                </Button>
              )
            })}
          </div>

          {selectedCategory && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">
                  Productores en Categoría: {performanceCategories.find((c) => c.key === selectedCategory)?.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Código</th>
                        <th className="text-left p-2">Productor</th>
                        <th className="text-center p-2">Score</th>
                        <th className="text-center p-2">Percentil</th>
                        <th className="text-center p-2">Tendencia</th>
                        <th className="text-center p-2">Riesgo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metrics.performanceDistribution[
                        selectedCategory as keyof typeof metrics.performanceDistribution
                      ].producers.map((producer: ProducerAnalytics) => (
                        <tr key={producer.CodigoProductor} className="border-b hover:bg-gray-50">
                          <td className="p-2 font-mono text-sm">{producer.CodigoProductor}</td>
                          <td className="p-2">{producer.productor}</td>
                          <td className="p-2 text-center">
                            <Badge variant="secondary">{producer.performanceScore.toFixed(1)}</Badge>
                          </td>
                          <td className="p-2 text-center">{producer.percentileRank.toFixed(0)}%</td>
                          <td className="p-2 text-center">{getTrendIcon(producer.efficiencyTrend)}</td>
                          <td className="p-2 text-center">
                            <Badge className={getRiskBadgeColor(producer.riskLevel)}>{producer.riskLevel}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Insights Tabs */}
      <Tabs defaultValue="drivers" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="drivers" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Drivers de Éxito
          </TabsTrigger>
          <TabsTrigger value="bottlenecks" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Cuellos de Botella
          </TabsTrigger>
          <TabsTrigger value="opportunities" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Oportunidades
          </TabsTrigger>
        </TabsList>

        <TabsContent value="drivers">
          <Card>
            <CardHeader>
              <CardTitle className="text-green-700 flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Principales Drivers de Eficiencia
              </CardTitle>
              <CardDescription>Factores que más contribuyen al éxito de los productores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metrics.efficiencyInsights.topEfficiencyDrivers.map((driver, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <span className="text-green-800">{driver}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bottlenecks">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-700 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Principales Cuellos de Botella
              </CardTitle>
              <CardDescription>Obstáculos que limitan el rendimiento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metrics.efficiencyInsights.bottlenecks.map((bottleneck, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                    <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <span className="text-red-800">{bottleneck}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="opportunities">
          <Card>
            <CardHeader>
              <CardTitle className="text-blue-700 flex items-center gap-2">
                <Target className="h-5 w-5" />
                Oportunidades de Optimización
              </CardTitle>
              <CardDescription>Recomendaciones para mejorar el rendimiento general</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metrics.efficiencyInsights.optimizationOpportunities.map((opportunity, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <span className="text-blue-800">{opportunity}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
