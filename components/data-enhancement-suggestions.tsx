"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Clock,
  DollarSign,
  Users,
  TrendingUp,
  MapPin,
  Calendar,
  Target,
  AlertCircle,
  CheckCircle,
  Upload,
} from "lucide-react"

interface DataEnhancementSuggestionsProps {
  currentAccuracy: number
  onDataUpload?: (dataType: string) => void
}

export function DataEnhancementSuggestions({ currentAccuracy, onDataUpload }: DataEnhancementSuggestionsProps) {
  const dataEnhancements = [
    {
      category: "Datos Temporales",
      icon: Clock,
      impact: "Alto",
      accuracy_boost: 15,
      items: [
        "Fechas exactas de cotizaciones (día/hora)",
        "Tiempo entre cotización y cierre",
        "Días de la semana más efectivos",
        "Horarios de mayor conversión",
      ],
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      category: "Información Comercial",
      icon: DollarSign,
      impact: "Muy Alto",
      accuracy_boost: 25,
      items: [
        "Montos de cotizaciones y contratos",
        "Tipos de productos/servicios",
        "Márgenes de ganancia",
        "Descuentos aplicados",
      ],
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      category: "Datos de Clientes",
      icon: Users,
      impact: "Alto",
      accuracy_boost: 20,
      items: ["Industria/sector del cliente", "Tamaño de empresa", "Ubicación geográfica", "Historial de compras"],
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      category: "Métricas de Proceso",
      icon: TrendingUp,
      impact: "Medio",
      accuracy_boost: 12,
      items: ["Número de seguimientos", "Tiempo de respuesta", "Motivos de rechazo", "Etapas del pipeline"],
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      category: "Factores Externos",
      icon: MapPin,
      impact: "Medio",
      accuracy_boost: 10,
      items: ["Eventos económicos", "Estacionalidad del sector", "Análisis de competencia", "Campañas de marketing"],
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  ]

  const potentialAccuracy = currentAccuracy + dataEnhancements.reduce((sum, item) => sum + item.accuracy_boost, 0)

  return (
    <div className="space-y-6">
      {/* Current vs Potential Accuracy */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Mejora Potencial de Precisión
          </CardTitle>
          <CardDescription>
            Con datos adicionales, podríamos mejorar significativamente la precisión de las predicciones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold text-gray-600 mb-2">{currentAccuracy}%</div>
              <p className="text-sm text-gray-600">Precisión Actual</p>
              <Progress value={currentAccuracy} className="mt-2" />
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600 mb-2">{Math.min(potentialAccuracy, 95)}%</div>
              <p className="text-sm text-green-600">Precisión Potencial</p>
              <Progress value={Math.min(potentialAccuracy, 95)} className="mt-2" />
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Mejora Estimada:</strong> +{Math.min(potentialAccuracy - currentAccuracy, 95 - currentAccuracy)}%
              de precisión con datos adicionales
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Data Enhancement Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {dataEnhancements.map((enhancement, index) => {
          const IconComponent = enhancement.icon
          return (
            <Card key={index} className={`${enhancement.bgColor} border-l-4 border-l-current`}>
              <CardHeader>
                <CardTitle className={`${enhancement.color} flex items-center gap-2`}>
                  <IconComponent className="h-5 w-5" />
                  {enhancement.category}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      enhancement.impact === "Muy Alto"
                        ? "default"
                        : enhancement.impact === "Alto"
                          ? "secondary"
                          : "outline"
                    }
                    className={
                      enhancement.impact === "Muy Alto"
                        ? "bg-green-100 text-green-800"
                        : enhancement.impact === "Alto"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-orange-100 text-orange-800"
                    }
                  >
                    Impacto: {enhancement.impact}
                  </Badge>
                  <Badge variant="outline" className="bg-white">
                    +{enhancement.accuracy_boost}% precisión
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {enhancement.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 w-full bg-white hover:bg-gray-50"
                  onClick={() => onDataUpload?.(enhancement.category)}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Subir Datos de {enhancement.category}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Implementation Roadmap */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-indigo-600" />
            Hoja de Ruta de Implementación
          </CardTitle>
          <CardDescription>Plan sugerido para mejorar gradualmente la precisión de las predicciones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h4 className="font-semibold text-green-800">Fase 1: Datos Comerciales (Semana 1-2)</h4>
                <p className="text-sm text-green-700">Agregar montos, tipos de productos y márgenes. Impacto: +25%</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h4 className="font-semibold text-blue-800">Fase 2: Datos de Clientes (Semana 3-4)</h4>
                <p className="text-sm text-blue-700">Segmentación por industria y tamaño. Impacto: +20%</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3 bg-purple-50 rounded-lg border-l-4 border-purple-500">
              <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h4 className="font-semibold text-purple-800">Fase 3: Datos Temporales (Semana 5-6)</h4>
                <p className="text-sm text-purple-700">Fechas exactas y patrones temporales. Impacto: +15%</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3 bg-orange-50 rounded-lg border-l-4 border-orange-500">
              <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h4 className="font-semibold text-orange-800">Fase 4: Optimización Final (Semana 7-8)</h4>
                <p className="text-sm text-orange-700">Métricas de proceso y factores externos. Impacto: +22%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Wins */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="text-yellow-800 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />🚀 Quick Wins - Implementación Inmediata
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-white rounded-lg border">
              <h4 className="font-semibold mb-2">📊 Montos de Cotizaciones</h4>
              <p className="text-sm text-gray-600">
                Agregar el valor económico de cada cotización para identificar patrones de conversión por rango de
                precio.
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg border">
              <h4 className="font-semibold mb-2">⏰ Fechas Exactas</h4>
              <p className="text-sm text-gray-600">
                Incluir día y hora exacta para detectar patrones temporales de mayor conversión.
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg border">
              <h4 className="font-semibold mb-2">🏢 Tipo de Cliente</h4>
              <p className="text-sm text-gray-600">
                Clasificar clientes por sector/industria para predicciones más específicas.
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg border">
              <h4 className="font-semibold mb-2">📞 Canal de Origen</h4>
              <p className="text-sm text-gray-600">
                Identificar qué canales generan cotizaciones con mayor probabilidad de conversión.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
