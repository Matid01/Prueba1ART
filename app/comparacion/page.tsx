"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Search,
  ArrowUp,
  ArrowDown,
  Loader2,
  Download,
  ExternalLink,
  FileSpreadsheet,
  Plus,
  X,
  BarChart3,
} from "lucide-react"
import { loadAllData, type EficienciaTotal } from "@/lib/data-loader"
import { Button } from "@/components/ui/button"
import * as XLSX from "xlsx"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ComparisonChart } from "@/components/comparison-chart"

type SortKey = keyof EficienciaTotal
type SortDirection = "asc" | "desc"

interface SortConfig {
  key: SortKey | null
  direction: SortDirection
}

const comparacionHeaders = [
  { key: "CodigoProductor", label: "Código", type: "string" },
  { key: "productor", label: "Productor", type: "string" },
  { key: "Cotizaciones", label: "Cotizaciones", type: "number" },
  { key: "Contratos", label: "Contratos", type: "number" },
  { key: "Porcentaje_Conversion", label: "% Conversión", type: "percentage" },
  { key: "Fecha_Actualizacion", label: "Última Actualización", type: "date" },
]

export default function ComparacionPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: "asc" })
  const [isDownloading, setIsDownloading] = useState<boolean>(false)
  const [downloadingProducer, setDownloadingProducer] = useState<string | null>(null)
  const [selectedProducers, setSelectedProducers] = useState<EficienciaTotal[]>([])
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    loadAllData()
      .then((loadedData) => {
        setData(loadedData)
        setLoading(false)
        toast({
          title: "Datos cargados",
          description: "La página de comparación se ha actualizado.",
        })
      })
      .catch((err) => {
        console.error("Failed to load data:", err)
        setError("Error al cargar los datos")
        setLoading(false)
        toast({
          title: "Error al cargar datos",
          description: "No se pudieron cargar los datos de comparación. Inténtalo de nuevo.",
          variant: "destructive",
        })
      })
  }, [toast])

  const applySort = (items: EficienciaTotal[], currentSortConfig: SortConfig): EficienciaTotal[] => {
    if (!currentSortConfig.key || !items) return items

    return [...items].sort((a, b) => {
      const aValue = a[currentSortConfig.key]
      const bValue = b[currentSortConfig.key]

      if (typeof aValue === "string" && typeof bValue === "string") {
        return currentSortConfig.direction === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }
      if (typeof aValue === "number" && typeof bValue === "number") {
        return currentSortConfig.direction === "asc" ? aValue - bValue : bValue - aValue
      }
      return 0
    })
  }

  const requestSort = (key: SortKey) => {
    let direction: SortDirection = "asc"
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }
    setSortConfig({ key, direction })
  }

  const getSortIcon = (key: SortKey) => {
    if (sortConfig.key !== key) {
      return null
    }
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="ml-1 h-3 w-3 inline" />
    ) : (
      <ArrowDown className="ml-1 h-3 w-3 inline" />
    )
  }

  const filteredProducers = useMemo(() => {
    if (!data?.eficienciaTotal) return []
    return data.eficienciaTotal.filter(
      (item: EficienciaTotal) =>
        item.productor?.toLowerCase().includes(searchTerm.toLowerCase()) || item.CodigoProductor?.includes(searchTerm),
    )
  }, [data, searchTerm])

  const sortedAndFilteredProducers = useMemo(() => {
    return applySort(filteredProducers, sortConfig)
  }, [filteredProducers, sortConfig])

  const handleSelectProducer = (producer: EficienciaTotal) => {
    if (selectedProducers.find((p) => p.CodigoProductor === producer.CodigoProductor)) {
      // If already selected, remove it
      setSelectedProducers((prev) => prev.filter((p) => p.CodigoProductor !== producer.CodigoProductor))
      toast({
        title: "Productor removido",
        description: `${producer.productor} ha sido removido de la comparación.`,
      })
    } else if (selectedProducers.length < 2) {
      // If less than 2 selected, add it
      setSelectedProducers((prev) => [...prev, producer])
      toast({
        title: "Productor seleccionado",
        description: `${producer.productor} ha sido agregado a la comparación.`,
      })
    } else {
      // If 2 already selected, show warning
      toast({
        title: "Máximo alcanzado",
        description: "Solo puedes comparar 2 productores a la vez. Remueve uno para agregar otro.",
        variant: "destructive",
      })
    }
  }

  const clearSelection = () => {
    setSelectedProducers([])
    toast({
      title: "Selección limpiada",
      description: "Se han removido todos los productores de la comparación.",
    })
  }

  // Get monthly data for selected producers
  const getMonthlyDataForProducer = (producerCode: string) => {
    if (!data?.eficienciaMensual) return []
    return data.eficienciaMensual.filter((item: any) => item.codigoProductor === producerCode)
  }

  const generateComparisonExcel = async () => {
    if (selectedProducers.length !== 2) {
      toast({
        title: "Selección incompleta",
        description: "Debes seleccionar exactamente 2 productores para generar la comparación.",
        variant: "destructive",
      })
      return
    }

    setIsDownloading(true)
    try {
      const wb = XLSX.utils.book_new()
      const [producer1, producer2] = selectedProducers

      // Sheet 1: Comparación General
      const comparisonData = [
        ["Métrica", producer1.productor, producer2.productor, "Diferencia"],
        ["Código", producer1.CodigoProductor, producer2.CodigoProductor, "-"],
        [
          "Cotizaciones",
          producer1.Cotizaciones,
          producer2.Cotizaciones,
          producer2.Cotizaciones - producer1.Cotizaciones,
        ],
        ["Contratos", producer1.Contratos, producer2.Contratos, producer2.Contratos - producer1.Contratos],
        [
          "% Conversión",
          `${producer1.Porcentaje_Conversion}%`,
          `${producer2.Porcentaje_Conversion}%`,
          `${(producer2.Porcentaje_Conversion - producer1.Porcentaje_Conversion).toFixed(1)}%`,
        ],
        [
          "Última Actualización",
          producer1.Fecha_Actualizacion ? new Date(producer1.Fecha_Actualizacion).toLocaleDateString("es-ES") : "N/A",
          producer2.Fecha_Actualizacion ? new Date(producer2.Fecha_Actualizacion).toLocaleDateString("es-ES") : "N/A",
          "-",
        ],
      ]
      const wsComparison = XLSX.utils.aoa_to_sheet(comparisonData)
      XLSX.utils.book_append_sheet(wb, wsComparison, "Comparación General")

      // Sheet 2: Eficiencia Mensual Comparada
      const eficiencia1 = data.eficienciaMensual.filter(
        (item: any) => item.codigoProductor === producer1.CodigoProductor,
      )
      const eficiencia2 = data.eficienciaMensual.filter(
        (item: any) => item.codigoProductor === producer2.CodigoProductor,
      )

      if (eficiencia1.length > 0 || eficiencia2.length > 0) {
        const eficienciaHeaders = [
          "Año",
          "Mes",
          `${producer1.productor} - Eficiencia`,
          `${producer2.productor} - Eficiencia`,
          "Diferencia",
        ]
        const allMonths = new Set([
          ...eficiencia1.map((item: any) => `${item.Año}-${item.Mes}`),
          ...eficiencia2.map((item: any) => `${item.Año}-${item.Mes}`),
        ])

        const eficienciaData = Array.from(allMonths)
          .sort()
          .map((monthKey) => {
            const [year, month] = monthKey.split("-")
            const eff1 = eficiencia1.find((item: any) => item.Año.toString() === year && item.Mes.toString() === month)
            const eff2 = eficiencia2.find((item: any) => item.Año.toString() === year && item.Mes.toString() === month)

            const val1 = eff1?.Eficiencia || 0
            const val2 = eff2?.Eficiencia || 0

            return [year, month, `${val1.toFixed(1)}%`, `${val2.toFixed(1)}%`, `${(val2 - val1).toFixed(1)}%`]
          })

        const wsEficiencia = XLSX.utils.aoa_to_sheet([eficienciaHeaders, ...eficienciaData])
        XLSX.utils.book_append_sheet(wb, wsEficiencia, "Eficiencia Mensual")
      }

      // Generate and download the file
      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" })
      const blob = new Blob([excelBuffer], { type: "application/octet-stream" })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `Comparacion_${producer1.CodigoProductor}_vs_${producer2.CodigoProductor}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast({
        title: "Comparación descargada",
        description: `Archivo de comparación entre ${producer1.productor} y ${producer2.productor} descargado exitosamente.`,
      })
    } catch (error) {
      console.error("Error al generar la comparación:", error)
      toast({
        title: "Error de descarga",
        description: "Hubo un problema al generar el archivo de comparación. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsDownloading(false)
    }
  }

  const generateTableExcel = (
    dataToExport: any[],
    headers: { key: string; label: string; type?: "date" | "percentage" | "number" | "string" }[],
    sheetName: string,
    fileNamePrefix: string,
  ) => {
    const headerRow = headers.map((h) => h.label)
    const dataRows = dataToExport.map((row) =>
      headers.map((h) => {
        const value = row[h.key]
        if (h.type === "date" && value) {
          return new Date(value).toLocaleDateString("es-ES")
        }
        if (h.type === "percentage" && typeof value === "number") {
          return `${value.toFixed(1)}%`
        }
        return value
      }),
    )

    const ws = XLSX.utils.aoa_to_sheet([headerRow, ...dataRows])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, sheetName)
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" })
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${fileNamePrefix}_${sheetName.replace(/\s/g, "_")}.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  const handleDownloadFiltered = async () => {
    setIsDownloading(true)
    try {
      generateTableExcel(sortedAndFilteredProducers, comparacionHeaders, "Comparacion", "comparacion_filtrado")
      toast({
        title: "Descarga exitosa",
        description: "El archivo 'comparacion_filtrado.xlsx' ha sido descargado.",
      })
    } catch (error) {
      console.error("Error al descargar los datos filtrados:", error)
      toast({
        title: "Error de descarga",
        description: "Hubo un problema al descargar el archivo Excel filtrado. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsDownloading(false)
    }
  }

  // Function to download individual producer data
  const handleDownloadProducer = async (producer: EficienciaTotal, event: React.MouseEvent) => {
    event.stopPropagation() // Prevent row click
    setDownloadingProducer(producer.CodigoProductor)

    try {
      const wb = XLSX.utils.book_new()

      // Sheet 1: Resumen General
      const resumenData = [
        ["Código Productor", producer.CodigoProductor],
        ["Nombre", producer.productor],
        ["Total Cotizaciones", producer.Cotizaciones],
        ["Total Contratos", producer.Contratos],
        ["% Conversión", `${producer.Porcentaje_Conversion}%`],
        [
          "Última Actualización",
          producer.Fecha_Actualizacion ? new Date(producer.Fecha_Actualizacion).toLocaleDateString("es-ES") : "N/A",
        ],
      ]
      const wsResumen = XLSX.utils.aoa_to_sheet([["Campo", "Valor"], ...resumenData])
      XLSX.utils.book_append_sheet(wb, wsResumen, "Resumen General")

      // Add other sheets similar to previous implementation...
      const eficienciaMensual = data.eficienciaMensual.filter(
        (item: any) => item.codigoProductor === producer.CodigoProductor,
      )
      if (eficienciaMensual.length > 0) {
        const eficienciaHeaders = ["Año", "Mes", "Nombre Mes", "Contratos", "Cotizaciones", "Eficiencia %"]
        const eficienciaData = eficienciaMensual.map((item: any) => [
          item.Año,
          item.Mes,
          item.NombreMes || `Mes ${item.Mes}`,
          item.TotalContratos,
          item.TotalCotizaciones,
          `${item.Eficiencia?.toFixed(1) || 0}%`,
        ])
        const wsEficiencia = XLSX.utils.aoa_to_sheet([eficienciaHeaders, ...eficienciaData])
        XLSX.utils.book_append_sheet(wb, wsEficiencia, "Eficiencia Mensual")
      }

      // Generate and download the file
      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" })
      const blob = new Blob([excelBuffer], { type: "application/octet-stream" })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `Productor_${producer.CodigoProductor}_${producer.productor.replace(/\s+/g, "_")}_Completo.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast({
        title: "Descarga exitosa",
        description: `Resumen completo de ${producer.productor} descargado exitosamente.`,
      })
    } catch (error) {
      console.error("Error al descargar los datos del productor:", error)
      toast({
        title: "Error de descarga",
        description: "Hubo un problema al descargar el resumen del productor. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setDownloadingProducer(null)
    }
  }

  // Function to handle producer click and navigate to dashboard
  const handleProducerClick = (producer: EficienciaTotal) => {
    const encodedProducerName = encodeURIComponent(producer.productor)
    router.push(`/?producerName=${encodedProducerName}`)
    toast({
      title: "Navegando al dashboard",
      description: `Filtrando datos para ${producer.productor}`,
    })
  }

  if (loading) {
    // Loading state is handled by app/comparacion/loading.tsx
    return null
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <p className="text-destructive mb-4">{error || "Error al cargar los datos"}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Comparación de Productores</h2>
          <p className="text-muted-foreground">
            Selecciona 2 productores para ver una comparación visual detallada con gráficos interactivos.
          </p>
        </div>

        {/* Selection Panel */}
        {selectedProducers.length > 0 && (
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-primary dark:text-accent-blue flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Productores Seleccionados ({selectedProducers.length}/2)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 items-center">
                {selectedProducers.map((producer, index) => (
                  <div key={producer.CodigoProductor} className="flex items-center gap-2">
                    <Badge variant="outline" className="px-3 py-1 text-sm">
                      {producer.CodigoProductor} - {producer.productor}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleSelectProducer(producer)}
                      className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                    {index === 0 && selectedProducers.length === 2 && (
                      <span className="text-muted-foreground font-medium">vs</span>
                    )}
                  </div>
                ))}
                <Separator orientation="vertical" className="h-6" />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearSelection}
                  className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
                >
                  Limpiar Selección
                </Button>
                {selectedProducers.length === 2 && (
                  <Button
                    onClick={generateComparisonExcel}
                    disabled={isDownloading}
                    className="bg-success text-success-foreground hover:bg-success/90 dark:bg-accent-green dark:text-background dark:hover:bg-accent-green/90"
                  >
                    {isDownloading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="mr-2 h-4 w-4" />
                    )}
                    Descargar Comparación
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Comparison Charts - Only show when 2 producers are selected */}
        {selectedProducers.length === 2 && (
          <div className="mb-8 space-y-6">
            {/* Producer Summary Cards Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {selectedProducers.map((producer, index) => (
                <Card
                  key={producer.CodigoProductor}
                  className={`border-l-4 ${index === 0 ? "border-l-blue-500" : "border-l-red-500"}`}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-sm ${index === 0 ? "bg-blue-500" : "bg-red-500"}`} />
                      {producer.productor}
                    </CardTitle>
                    <CardDescription>Código: {producer.CodigoProductor}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {producer.Cotizaciones.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">Cotizaciones</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {producer.Contratos.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">Contratos</div>
                      </div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                      <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                        {producer.Porcentaje_Conversion.toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">% Conversión</div>
                    </div>
                    <div className="text-center text-sm text-muted-foreground">
                      Última actualización:{" "}
                      {producer.Fecha_Actualizacion
                        ? new Date(producer.Fecha_Actualizacion).toLocaleDateString("es-ES")
                        : "N/A"}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Differences Card */}
            <Card className="border-l-4 border-l-orange-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-sm bg-orange-500" />
                  Diferencias entre Productores
                </CardTitle>
                <CardDescription>
                  Comparación directa: {selectedProducers[1].productor} vs {selectedProducers[0].productor}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-950/20 rounded-lg">
                    <div
                      className={`text-2xl font-bold ${
                        selectedProducers[1].Cotizaciones - selectedProducers[0].Cotizaciones >= 0
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {selectedProducers[1].Cotizaciones - selectedProducers[0].Cotizaciones >= 0 ? "+" : ""}
                      {(selectedProducers[1].Cotizaciones - selectedProducers[0].Cotizaciones).toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Diferencia Cotizaciones</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-950/20 rounded-lg">
                    <div
                      className={`text-2xl font-bold ${
                        selectedProducers[1].Contratos - selectedProducers[0].Contratos >= 0
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {selectedProducers[1].Contratos - selectedProducers[0].Contratos >= 0 ? "+" : ""}
                      {(selectedProducers[1].Contratos - selectedProducers[0].Contratos).toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Diferencia Contratos</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-950/20 rounded-lg">
                    <div
                      className={`text-2xl font-bold ${
                        selectedProducers[1].Porcentaje_Conversion - selectedProducers[0].Porcentaje_Conversion >= 0
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {selectedProducers[1].Porcentaje_Conversion - selectedProducers[0].Porcentaje_Conversion >= 0
                        ? "+"
                        : ""}
                      {(
                        selectedProducers[1].Porcentaje_Conversion - selectedProducers[0].Porcentaje_Conversion
                      ).toFixed(1)}
                      %
                    </div>
                    <div className="text-sm text-muted-foreground">Diferencia % Conversión</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Charts - One below the other */}
            <ComparisonChart
              producer1={selectedProducers[0]}
              producer2={selectedProducers[1]}
              monthlyData1={getMonthlyDataForProducer(selectedProducers[0].CodigoProductor)}
              monthlyData2={getMonthlyDataForProducer(selectedProducers[1].CodigoProductor)}
            />
          </div>
        )}

        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar productor por nombre o código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-input text-foreground border-input focus:border-primary focus:ring-primary"
            />
          </div>
          <Button
            variant="outline"
            onClick={handleDownloadFiltered}
            disabled={isDownloading}
            className="ml-auto bg-transparent border-info text-info hover:bg-info hover:text-info-foreground dark:border-accent-cyan dark:text-accent-cyan dark:hover:bg-accent-cyan dark:hover:text-background"
          >
            {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            Descargar Todos
          </Button>
        </div>

        <Card className="shadow-lg mb-8 transition-shadow hover:shadow-xl bg-card border-border">
          <CardHeader className="bg-background border-b border-border">
            <CardTitle className="text-primary dark:text-accent-blue">
              Seleccionar Productores para Comparar ({sortedAndFilteredProducers.length} registros)
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Haz clic en una fila para seleccionar/deseleccionar productores para comparar. Máximo 2 productores.
              {selectedProducers.length === 2 && " Los gráficos de comparación aparecerán arriba."}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-primary text-primary-foreground dark:bg-primary/90">
                    <th className="px-4 py-3 text-center font-medium w-12">Sel.</th>
                    <th
                      className="px-4 py-3 text-left font-medium cursor-pointer hover:bg-primary/90 transition-colors"
                      onClick={() => requestSort("CodigoProductor")}
                    >
                      Código {getSortIcon("CodigoProductor")}
                    </th>
                    <th
                      className="px-4 py-3 text-left font-medium cursor-pointer hover:bg-primary/90 transition-colors"
                      onClick={() => requestSort("productor")}
                    >
                      Productor {getSortIcon("productor")}
                    </th>
                    <th
                      className="px-4 py-3 text-left font-medium cursor-pointer hover:bg-primary/90 transition-colors"
                      onClick={() => requestSort("Cotizaciones")}
                    >
                      Cotizaciones {getSortIcon("Cotizaciones")}
                    </th>
                    <th
                      className="px-4 py-3 text-left font-medium cursor-pointer hover:bg-primary/90 transition-colors"
                      onClick={() => requestSort("Contratos")}
                    >
                      Contratos {getSortIcon("Contratos")}
                    </th>
                    <th
                      className="px-4 py-3 text-left font-medium cursor-pointer hover:bg-primary/90 transition-colors"
                      onClick={() => requestSort("Porcentaje_Conversion")}
                    >
                      % Conversión {getSortIcon("Porcentaje_Conversion")}
                    </th>
                    <th
                      className="px-4 py-3 text-left font-medium cursor-pointer hover:bg-primary/90 transition-colors"
                      onClick={() => requestSort("Fecha_Actualizacion")}
                    >
                      Última Actualización {getSortIcon("Fecha_Actualizacion")}
                    </th>
                    <th className="px-4 py-3 text-center font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedAndFilteredProducers.length > 0 ? (
                    sortedAndFilteredProducers.map((item: EficienciaTotal, index: number) => {
                      const isSelected = selectedProducers.find((p) => p.CodigoProductor === item.CodigoProductor)
                      return (
                        <tr
                          key={item.CodigoProductor}
                          className={`border-b border-border transition-colors cursor-pointer group ${
                            isSelected ? "bg-primary/10 hover:bg-primary/15 border-primary/30" : "hover:bg-muted"
                          }`}
                          onClick={() => handleSelectProducer(item)}
                        >
                          <td className="px-4 py-3 text-center">
                            <div
                              className={`w-4 h-4 rounded border-2 mx-auto flex items-center justify-center ${
                                isSelected
                                  ? "bg-primary border-primary text-primary-foreground"
                                  : "border-muted-foreground"
                              }`}
                            >
                              {isSelected && <Plus className="h-2 w-2 rotate-45" />}
                            </div>
                          </td>
                          <td className="px-4 py-3 font-mono text-sm">{item.CodigoProductor}</td>
                          <td className="px-4 py-3 font-medium text-primary dark:text-accent-blue group-hover:text-primary/80 dark:group-hover:text-accent-blue/80">
                            {item.productor}
                          </td>
                          <td className="px-4 py-3 text-info dark:text-accent-cyan font-semibold">
                            {item.Cotizaciones}
                          </td>
                          <td className="px-4 py-3 text-success dark:text-accent-green font-semibold">
                            {item.Contratos}
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              variant={item.Porcentaje_Conversion > 50 ? "default" : "secondary"}
                              className={
                                item.Porcentaje_Conversion > 50
                                  ? "bg-success text-success-foreground dark:bg-accent-green dark:text-background font-bold"
                                  : "bg-muted text-muted-foreground"
                              }
                            >
                              {item.Porcentaje_Conversion}%
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {item.Fecha_Actualizacion ? new Date(item.Fecha_Actualizacion).toLocaleDateString() : "N/A"}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => handleDownloadProducer(item, e)}
                                disabled={downloadingProducer === item.CodigoProductor}
                                className="h-8 w-8 p-0 border-warning text-warning hover:bg-warning hover:text-warning-foreground dark:border-accent-orange dark:text-accent-orange dark:hover:bg-accent-orange dark:hover:text-background"
                                title={`Descargar resumen completo de ${item.productor}`}
                              >
                                {downloadingProducer === item.CodigoProductor ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <FileSpreadsheet className="h-3 w-3" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleProducerClick(item)
                                }}
                                className="h-8 w-8 p-0 border-primary text-primary hover:bg-primary hover:text-primary-foreground dark:border-accent-blue dark:text-accent-blue dark:hover:bg-accent-blue dark:hover:text-background"
                                title={`Ver dashboard de ${item.productor}`}
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-4 py-3 text-center text-muted-foreground">
                        No se encontraron productores que coincidan con la búsqueda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
