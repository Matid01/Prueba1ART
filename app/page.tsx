"use client"

import { useState, useEffect, useMemo, useCallback, memo } from "react"
import { useSearchParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, FileText, TrendingUp, ArrowUp, ArrowDown, RotateCcw, BarChart3, Brain, Calendar } from "lucide-react"
import {
  loadAllData,
  type EficienciaTotal,
  type EficienciaMensual,
  type CotizacionesMensuales,
  type ContratosMensuales,
  type CotizacionesTotal,
  type ContratosTotal,
} from "@/lib/data-loader"
import { ProducerMonthlyChart } from "@/components/producer-monthly-chart"
import { DatePicker } from "@/components/date-picker"
import { Button } from "@/components/ui/button"
import { AdvancedPerformanceDashboard } from "@/components/advanced-performance-dashboard"
import { DataExportManager } from "@/components/data-export-manager"
import { useToast } from "@/components/ui/use-toast"
import { ProducerMonthlyQuotesChart } from "@/components/producer-monthly-quotes-chart"
import { ProducerMonthlyContractsChart } from "@/components/producer-monthly-contracts-chart"

type SortKey =
  | keyof EficienciaTotal
  | keyof EficienciaMensual
  | keyof CotizacionesMensuales
  | keyof ContratosMensuales
  | keyof CotizacionesTotal
  | keyof ContratosTotal

type SortDirection = "asc" | "desc"

interface SortConfig {
  key: SortKey | null
  direction: SortDirection
}

// Memoized table row components for better performance
const EficienciaTotalRow = memo(
  ({
    item,
    index,
    safeToFixed,
  }: {
    item: EficienciaTotal
    index: number
    safeToFixed: (value: any, decimals?: number) => string
  }) => (
    <tr key={`${item.CodigoProductor}-${index}`} className="border-b border-border hover:bg-muted transition-colors">
      <td className="px-4 py-3 font-mono text-sm">{item.CodigoProductor}</td>
      <td className="px-4 py-3 font-medium">{item.productor}</td>
      <td className="px-4 py-3 text-info dark:text-accent-cyan font-semibold">{item.Cotizaciones}</td>
      <td className="px-4 py-3 text-success dark:text-accent-green font-semibold">{item.Contratos}</td>
      <td className="px-4 py-3">
        <Badge
          variant={item.Porcentaje_Conversion > 50 ? "default" : "secondary"}
          className={
            item.Porcentaje_Conversion > 50
              ? "bg-success text-success-foreground dark:bg-accent-green dark:text-background font-bold"
              : "bg-muted text-muted-foreground"
          }
        >
          {safeToFixed(item.Porcentaje_Conversion, 1)}%
        </Badge>
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {item.Fecha_Actualizacion ? new Date(item.Fecha_Actualizacion).toLocaleDateString() : "N/A"}
      </td>
    </tr>
  ),
)

const EficienciaMensualRow = memo(
  ({
    item,
    index,
    safeToFixed,
  }: {
    item: EficienciaMensual
    index: number
    safeToFixed: (value: any, decimals?: number) => string
  }) => (
    <tr
      key={`${item.codigoProductor}-${item.Año}-${item.Mes}-${index}`}
      className="border-b border-border hover:bg-muted transition-colors"
    >
      <td className="px-4 py-3 font-mono text-sm">{item.codigoProductor}</td>
      <td className="px-4 py-3 font-medium">{item.productor}</td>
      <td className="px-4 py-3">{item.Año}</td>
      <td className="px-4 py-3">
        <Badge variant="outline">{item.Mes}</Badge>
      </td>
      <td className="px-4 py-3 text-success dark:text-accent-green font-semibold">{item.TotalContratos}</td>
      <td className="px-4 py-3 text-info dark:text-accent-cyan font-semibold">{item.TotalCotizaciones}</td>
      <td className="px-4 py-3">
        <Badge
          variant={item.Eficiencia > 10 ? "default" : "secondary"}
          className={
            item.Eficiencia > 10
              ? "bg-success text-success-foreground dark:bg-accent-green dark:text-background font-bold"
              : "bg-muted text-muted-foreground"
          }
        >
          {safeToFixed(item.Eficiencia, 1)}%
        </Badge>
      </td>
    </tr>
  ),
)

const CotizacionesMensualesRow = memo(
  ({
    item,
    index,
  }: {
    item: CotizacionesMensuales
    index: number
  }) => (
    <tr
      key={`${item.CodigoProductor}-${item.Año}-${item.Mes}-${index}`}
      className="border-b border-border hover:bg-muted transition-colors"
    >
      <td className="px-4 py-3 font-mono text-sm">{item.CodigoProductor}</td>
      <td className="px-4 py-3 font-medium">{item.productor}</td>
      <td className="px-4 py-3">{item.Año}</td>
      <td className="px-4 py-3">
        <Badge variant="outline">{item.NombreMes}</Badge>
      </td>
      <td className="px-4 py-3 text-info dark:text-accent-cyan font-semibold">{item.TotalCotizaciones}</td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {item.PrimeraCotizacion ? new Date(item.PrimeraCotizacion).toLocaleDateString() : "N/A"}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {item.UltimaCotizacion ? new Date(item.UltimaCotizacion).toLocaleDateString() : "N/A"}
      </td>
    </tr>
  ),
)

const ContratosMensualesRow = memo(
  ({
    item,
    index,
  }: {
    item: ContratosMensuales
    index: number
  }) => (
    <tr
      key={`${item.codigoProductor}-${item.Año}-${item.Mes}-${index}`}
      className="border-b border-border hover:bg-muted transition-colors"
    >
      <td className="px-4 py-3 font-mono text-sm">{item.codigoProductor}</td>
      <td className="px-4 py-3 font-medium">{item.productor}</td>
      <td className="px-4 py-3">{item.Año}</td>
      <td className="px-4 py-3">
        <Badge variant="outline">{item.NombreMes}</Badge>
      </td>
      <td className="px-4 py-3 text-success dark:text-accent-green font-semibold">{item.TotalContratos}</td>
    </tr>
  ),
)

const CotizacionesTotalRow = memo(
  ({
    item,
    index,
    safeToFixed,
  }: {
    item: CotizacionesTotal
    index: number
    safeToFixed: (value: any, decimals?: number) => string
  }) => (
    <tr key={`${item.CodigoProductor}-${index}`} className="border-b border-border hover:bg-muted transition-colors">
      <td className="px-4 py-3 font-mono text-sm">{item.CodigoProductor}</td>
      <td className="px-4 py-3 font-medium">{item.productor}</td>
      <td className="px-4 py-3">
        <Badge variant="outline">{item.MesesActivos}</Badge>
      </td>
      <td className="px-4 py-3 text-info dark:text-accent-cyan font-semibold">{item.TotalCotizaciones}</td>
      <td className="px-4 py-3 text-warning dark:text-accent-orange font-semibold">
        {safeToFixed(item.PromedioCotizacionesMes, 1)}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {item.PrimeraCotizacion ? new Date(item.PrimeraCotizacion).toLocaleDateString() : "N/A"}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {item.UltimaCotizacion ? new Date(item.UltimaCotizacion).toLocaleDateString() : "N/A"}
      </td>
    </tr>
  ),
)

const ContratosTotalRow = memo(
  ({
    item,
    index,
    safeToFixed,
  }: {
    item: ContratosTotal
    index: number
    safeToFixed: (value: any, decimals?: number) => string
  }) => (
    <tr key={`${item.codigoProductor}-${index}`} className="border-b border-border hover:bg-muted transition-colors">
      <td className="px-4 py-3 font-mono text-sm">{item.codigoProductor}</td>
      <td className="px-4 py-3 font-medium">{item.productor}</td>
      <td className="px-4 py-3 text-success dark:text-accent-green font-semibold">{item.TotalContratos}</td>
      <td className="px-4 py-3">
        <Badge variant="outline">{item.CantidadMeses}</Badge>
      </td>
      <td className="px-4 py-3 text-warning dark:text-accent-orange font-semibold">
        {safeToFixed(item.PromedioMensual, 1)}
      </td>
    </tr>
  ),
)

// Add display names for better debugging
EficienciaTotalRow.displayName = "EficienciaTotalRow"
EficienciaMensualRow.displayName = "EficienciaMensualRow"
CotizacionesMensualesRow.displayName = "CotizacionesMensualesRow"
ContratosMensualesRow.displayName = "ContratosMensualesRow"
CotizacionesTotalRow.displayName = "CotizacionesTotalRow"
ContratosTotalRow.displayName = "ContratosTotalRow"

export default function ProducerDashboard() {
  const searchParams = useSearchParams()
  const producerNameFromUrl = searchParams.get("producerName")
  const { toast } = useToast()

  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("advanced-performance")
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: "asc" })

  // Export manager state
  const [showExportManager, setShowExportManager] = useState(false)

  // State for date filters
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)

  useEffect(() => {
    loadAllData()
      .then((loadedData) => {
        setData(loadedData)
        setLoading(false)
        if (producerNameFromUrl) {
          toast({
            title: "Productor seleccionado",
            description: `Mostrando datos para ${decodeURIComponent(producerNameFromUrl)}`,
          })
        } else {
          toast({
            title: "🧠 Dashboard Avanzado Cargado",
            description: "Análisis predictivo y segmentación de mercado disponibles.",
          })
        }
      })
      .catch((err) => {
        console.error("Failed to load data:", err)
        setError("Error al cargar los datos")
        setLoading(false)
        toast({
          title: "Error al cargar datos",
          description: "No se pudieron cargar los datos avanzados. Inténtalo de nuevo.",
          variant: "destructive",
        })
      })
  }, [producerNameFromUrl, toast])

  // Memoized helper function to safely format numbers
  const safeToFixed = useCallback((value: any, decimals = 1): string => {
    if (typeof value === "number" && !isNaN(value)) {
      return value.toFixed(decimals)
    }
    if (typeof value === "string") {
      const num = Number.parseFloat(value)
      if (!isNaN(num)) {
        return num.toFixed(decimals)
      }
    }
    return "0.0"
  }, [])

  // Helper function to check if a month/year is within the selected date range
  const isMonthYearWithinRange = useCallback(
    (year: number, month: number, start: Date | undefined, end: Date | undefined): boolean => {
      const currentMonthDate = new Date(year, month - 1, 1)

      if (start && currentMonthDate < new Date(start.getFullYear(), start.getMonth(), 1)) {
        return false
      }
      if (end && currentMonthDate > new Date(end.getFullYear(), end.getMonth(), 1)) {
        return false
      }
      return true
    },
    [],
  )

  // Optimized data processing with better memoization and producer filtering
  const processedData = useMemo(() => {
    if (!data) return null

    const eficienciaTotal = data.eficienciaTotal || []
    const eficienciaMensual = data.eficienciaMensual || []
    const cotizacionesMensuales = data.cotizacionesMensuales || []
    const contratosMensuales = data.contratosMensuales || []
    const cotizacionesTotal = data.cotizacionesTotal || []
    const contratosTotal = data.contratosTotal || []

    // Filter by producer name if specified in URL
    const filterByProducer = (items: any[], producerField: string) => {
      if (!producerNameFromUrl) return items

      const decodedProducerName = decodeURIComponent(producerNameFromUrl).toLowerCase()

      return items.filter((item: any) => {
        const producerName = item[producerField]?.toLowerCase() || ""
        return producerName.includes(decodedProducerName)
      })
    }

    // Apply date filter to monthly data only once
    const dateFilteredEficienciaMensual = eficienciaMensual.filter((item: EficienciaMensual) =>
      isMonthYearWithinRange(item.Año, item.Mes, startDate, endDate),
    )

    const dateFilteredCotizacionesMensuales = cotizacionesMensuales.filter((item: CotizacionesMensuales) =>
      isMonthYearWithinRange(item.Año, item.Mes, startDate, endDate),
    )

    const dateFilteredContratosMensuales = contratosMensuales.filter((item: ContratosMensuales) =>
      isMonthYearWithinRange(item.Año, item.Mes, startDate, endDate),
    )

    return {
      eficienciaTotal: filterByProducer(eficienciaTotal, "productor"),
      eficienciaMensual: filterByProducer(dateFilteredEficienciaMensual, "productor"),
      cotizacionesMensuales: filterByProducer(dateFilteredCotizacionesMensuales, "productor"),
      contratosMensuales: filterByProducer(dateFilteredContratosMensuales, "productor"),
      cotizacionesTotal: filterByProducer(cotizacionesTotal, "productor"),
      contratosTotal: filterByProducer(contratosTotal, "productor"),
    }
  }, [data, startDate, endDate, isMonthYearWithinRange, producerNameFromUrl])

  // Separate memoization for sorted data per tab
  const sortedData = useMemo(() => {
    if (!processedData) return null

    const applySort = <T extends Record<string, any>>(items: T[], currentSortKey: SortKey | null): T[] => {
      if (!currentSortKey || !items || items.length === 0) return items

      return [...items].sort((a, b) => {
        const aValue = a[currentSortKey]
        const bValue = b[currentSortKey]

        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortConfig.direction === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
        }
        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue
        }
        return 0
      })
    }

    // Only sort the data for the active tab to improve performance
    const result = { ...processedData }

    switch (activeTab) {
      case "eficiencia-total":
        result.eficienciaTotal = applySort(processedData.eficienciaTotal, sortConfig.key as keyof EficienciaTotal)
        break
      case "eficiencia-mensual":
        result.eficienciaMensual = applySort(processedData.eficienciaMensual, sortConfig.key as keyof EficienciaMensual)
        break
      case "cotizaciones-mensuales":
        result.cotizacionesMensuales = applySort(
          processedData.cotizacionesMensuales,
          sortConfig.key as keyof CotizacionesMensuales,
        )
        break
      case "contratos-mensuales":
        result.contratosMensuales = applySort(
          processedData.contratosMensuales,
          sortConfig.key as keyof ContratosMensuales,
        )
        break
      case "cotizaciones-total":
        result.cotizacionesTotal = applySort(processedData.cotizacionesTotal, sortConfig.key as keyof CotizacionesTotal)
        break
      case "contratos-total":
        result.contratosTotal = applySort(processedData.contratosTotal, sortConfig.key as keyof ContratosTotal)
        break
    }

    return result
  }, [processedData, sortConfig, activeTab])

  // Calculate summary metrics based on filtered data
  const summaryMetrics = useMemo(() => {
    if (!processedData) {
      return {
        totalProductores: 0,
        totalCotizaciones: 0,
        totalContratos: 0,
        eficienciaPromedio: "0",
      }
    }

    // For date-filtered metrics, we need to use monthly data when dates are applied
    let totalCotizaciones = 0
    let totalContratos = 0
    let totalProductores = 0

    if (startDate || endDate) {
      // When date filters are applied, calculate from monthly data
      const uniqueProducers = new Set<string>()

      // Sum from monthly efficiency data (which is already date-filtered)
      processedData.eficienciaMensual.forEach((item: EficienciaMensual) => {
        totalCotizaciones += item.TotalCotizaciones || 0
        totalContratos += item.TotalContratos || 0
        uniqueProducers.add(item.codigoProductor)
      })

      // If we have monthly data, use it; otherwise fall back to monthly quotes/contracts
      if (processedData.eficienciaMensual.length === 0) {
        // Fallback to separate monthly data if efficiency data is not available
        processedData.cotizacionesMensuales.forEach((item: CotizacionesMensuales) => {
          totalCotizaciones += item.TotalCotizaciones || 0
          uniqueProducers.add(item.CodigoProductor)
        })

        processedData.contratosMensuales.forEach((item: ContratosMensuales) => {
          totalContratos += item.TotalContratos || 0
          uniqueProducers.add(item.codigoProductor)
        })
      }

      totalProductores = uniqueProducers.size
    } else {
      // When no date filters, use total data
      const uniqueProducers = new Set<string>()

      processedData.eficienciaTotal.forEach((item: EficienciaTotal) => {
        totalCotizaciones += item.Cotizaciones || 0
        totalContratos += item.Contratos || 0
        uniqueProducers.add(item.CodigoProductor)
      })

      totalProductores = uniqueProducers.size
    }

    const eficienciaPromedio = totalCotizaciones > 0 ? ((totalContratos / totalCotizaciones) * 100).toFixed(1) : "0"

    return {
      totalProductores,
      totalCotizaciones,
      totalContratos,
      eficienciaPromedio,
    }
  }, [processedData, startDate, endDate])

  const requestSort = useCallback((key: SortKey) => {
    setSortConfig((prevConfig) => {
      let direction: SortDirection = "asc"
      if (prevConfig.key === key && prevConfig.direction === "asc") {
        direction = "desc"
      }
      return { key, direction }
    })
  }, [])

  const getSortIcon = useCallback(
    (key: SortKey) => {
      if (sortConfig.key !== key) {
        return null
      }
      return sortConfig.direction === "asc" ? (
        <ArrowUp className="ml-1 h-3 w-3 inline" />
      ) : (
        <ArrowDown className="ml-1 h-3 w-3 inline" />
      )
    },
    [sortConfig],
  )

  const handleResetDates = useCallback(() => {
    setStartDate(undefined)
    setEndDate(undefined)
    toast({
      title: "Filtros de fecha reseteados",
      description: "Se han eliminado los filtros de fecha.",
    })
  }, [toast])

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value)
    setSortConfig({ key: null, direction: "asc" })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando análisis avanzado con IA...</p>
          <p className="text-xs text-muted-foreground mt-2">Procesando algoritmos predictivos...</p>
        </div>
      </div>
    )
  }

  if (error || !data || !sortedData) {
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

  const selectedProducerForChart = sortedData.eficienciaTotal.length === 1 ? sortedData.eficienciaTotal[0] : null

  const producerMonthlyEfficiencyChartData = selectedProducerForChart
    ? data.eficienciaMensual.filter(
        (item: EficienciaMensual) =>
          item.codigoProductor === selectedProducerForChart.CodigoProductor &&
          isMonthYearWithinRange(item.Año, item.Mes, startDate, endDate),
      )
    : []

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
            <Brain className="h-8 w-8 text-purple-600" />
            Dashboard Avanzado con IA
            {producerNameFromUrl && (
              <Badge variant="outline" className="ml-2 text-lg px-3 py-1">
                {decodeURIComponent(producerNameFromUrl)}
              </Badge>
            )}
          </h2>
          <p className="text-muted-foreground">
            {producerNameFromUrl
              ? `Análisis detallado para ${decodeURIComponent(producerNameFromUrl)}`
              : "Análisis predictivo, segmentación inteligente y métricas avanzadas de rendimiento"}
          </p>
        </div>

        {/* Data Export Manager */}
        <div className="mb-6">
          <DataExportManager
            data={data}
            isVisible={showExportManager}
            onToggle={() => setShowExportManager(!showExportManager)}
          />
        </div>

        {/* Date Filters */}
        <div className="mb-2 flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex-1">
            <label htmlFor="start-date" className="block text-sm font-medium text-foreground mb-1">
              Fecha de Inicio
            </label>
            <DatePicker date={startDate} setDate={setStartDate} placeholder="Seleccionar fecha de inicio" />
          </div>
          <div className="flex-1">
            <label htmlFor="end-date" className="block text-sm font-medium text-foreground mb-1">
              Fecha de Fin
            </label>
            <DatePicker date={endDate} setDate={setEndDate} placeholder="Seleccionar fecha de fin" />
          </div>
          <Button
            variant="outline"
            onClick={handleResetDates}
            className="mt-auto h-10 px-4 py-2 text-sm font-medium text-foreground border-input hover:bg-accent bg-background"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Resetear Filtro
          </Button>
        </div>

        {/* Date Filter Status Indicator */}
        {(startDate || endDate) && (
          <div className="mb-4 p-3 bg-info/10 border border-info/20 rounded-lg">
            <div className="flex items-center gap-2 text-info dark:text-accent-cyan">
              <Calendar className="h-4 w-4" />
              <span className="text-sm font-medium">
                Filtros de fecha activos:
                {startDate && ` Desde ${startDate.toLocaleDateString()}`}
                {endDate && ` Hasta ${endDate.toLocaleDateString()}`}
                {!startDate && endDate && ` Hasta ${endDate.toLocaleDateString()}`}
                {startDate && !endDate && ` Desde ${startDate.toLocaleDateString()}`}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Las métricas mostradas reflejan únicamente los datos del período seleccionado.
            </p>
          </div>
        )}

        {/* Enhanced Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-primary transition-shadow hover:shadow-xl bg-card relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent dark:from-primary/10"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Productores</CardTitle>
              <Users className="h-4 w-4 text-primary dark:text-accent-blue" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-2xl font-bold text-primary dark:text-accent-blue">
                {summaryMetrics.totalProductores}
              </div>
              <p className="text-xs text-muted-foreground">
                {producerNameFromUrl
                  ? "Productor seleccionado"
                  : startDate || endDate
                    ? "En el período filtrado"
                    : `${data.performanceMetrics?.producerAnalytics.length} con análisis completo`}
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-info transition-shadow hover:shadow-xl bg-card relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-info/5 to-transparent dark:from-info/10"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Cotizaciones</CardTitle>
              <FileText className="h-4 w-4 text-info dark:text-accent-cyan" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-2xl font-bold text-info dark:text-accent-cyan">
                {summaryMetrics.totalCotizaciones.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {producerNameFromUrl
                  ? "Del productor seleccionado"
                  : startDate || endDate
                    ? "En el período filtrado"
                    : `Predicción próximo mes: ${data.performanceMetrics?.nextMonthPrediction.totalCotizaciones}`}
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-success transition-shadow hover:shadow-xl bg-card relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-success/5 to-transparent dark:from-success/10"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Contratos</CardTitle>
              <BarChart3 className="h-4 w-4 text-success dark:text-accent-green" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-2xl font-bold text-success dark:text-accent-green">
                {summaryMetrics.totalContratos.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {producerNameFromUrl
                  ? "Del productor seleccionado"
                  : startDate || endDate
                    ? "En el período filtrado"
                    : `Predicción próximo mes: ${data.performanceMetrics?.nextMonthPrediction.totalContracts}`}
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-warning transition-shadow hover:shadow-xl bg-card relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-warning/5 to-transparent dark:from-warning/10"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-muted-foreground">Eficiencia Promedio</CardTitle>
              <TrendingUp className="h-4 w-4 text-warning dark:text-accent-orange" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-2xl font-bold text-warning dark:text-accent-orange">
                {summaryMetrics.eficienciaPromedio}%
              </div>
              <p className="text-xs text-muted-foreground">
                {producerNameFromUrl
                  ? "Tasa de conversión"
                  : startDate || endDate
                    ? "En el período filtrado"
                    : `Precisión predictiva: ${data.performanceMetrics?.forecastAccuracy}%`}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="advanced-performance" className="space-y-4" onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 bg-muted">
            <TabsTrigger
              value="advanced-performance"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white transition-colors flex items-center gap-2"
            >
              <Brain className="h-4 w-4" />🧠 IA Avanzada
            </TabsTrigger>
            <TabsTrigger
              value="eficiencia-total"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-colors"
            >
              Eficiencia Total
            </TabsTrigger>
            <TabsTrigger
              value="eficiencia-mensual"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-colors"
            >
              Eficiencia Mensual
            </TabsTrigger>
            <TabsTrigger
              value="cotizaciones-mensuales"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-colors"
            >
              Cotizaciones
            </TabsTrigger>
            <TabsTrigger
              value="contratos-mensuales"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-colors"
            >
              Contratos
            </TabsTrigger>
            <TabsTrigger
              value="cotizaciones-total"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-colors"
            >
              Resumen Cotizaciones
            </TabsTrigger>
            <TabsTrigger
              value="contratos-total"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-colors"
            >
              Resumen Contratos
            </TabsTrigger>
          </TabsList>

          {/* 🧠 Advanced Performance Dashboard Tab */}
          <TabsContent value="advanced-performance">
            {data.performanceMetrics && <AdvancedPerformanceDashboard metrics={data.performanceMetrics} />}
          </TabsContent>

          {/* Eficiencia Total Tab */}
          <TabsContent value="eficiencia-total">
            {selectedProducerForChart && producerMonthlyEfficiencyChartData.length > 0 && (
              <div className="mb-8">
                <ProducerMonthlyChart
                  producerName={selectedProducerForChart.productor}
                  monthlyData={producerMonthlyEfficiencyChartData}
                />
              </div>
            )}
            <Card className="shadow-lg transition-shadow hover:shadow-xl bg-card border-border">
              <CardHeader className="bg-background border-b border-border">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-primary dark:text-accent-blue">
                      Eficiencia Total por Productor ({sortedData.eficienciaTotal.length} registros)
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Resumen general de cotizaciones, contratos y porcentaje de conversión
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-primary text-primary-foreground dark:bg-primary/90">
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
                      </tr>
                    </thead>
                    <tbody>
                      {sortedData.eficienciaTotal.length > 0 ? (
                        sortedData.eficienciaTotal.map((item: EficienciaTotal, index: number) => (
                          <EficienciaTotalRow
                            key={`${item.CodigoProductor}-${index}`}
                            item={item}
                            index={index}
                            safeToFixed={safeToFixed}
                          />
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-4 py-3 text-center text-muted-foreground">
                            No se encontraron registros que coincidan con los filtros aplicados.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Eficiencia Mensual Tab */}
          <TabsContent value="eficiencia-mensual">
            {selectedProducerForChart && producerMonthlyEfficiencyChartData.length > 0 && (
              <div className="mb-8">
                <ProducerMonthlyChart
                  producerName={selectedProducerForChart.productor}
                  monthlyData={producerMonthlyEfficiencyChartData}
                />
              </div>
            )}
            <Card className="shadow-lg transition-shadow hover:shadow-xl bg-card border-border">
              <CardHeader className="bg-background border-b border-border">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-primary dark:text-accent-blue">
                      Eficiencia Mensual por Productor ({sortedData.eficienciaMensual.length} registros)
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Detalle mensual de contratos, cotizaciones y eficiencia por productor
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-primary text-primary-foreground dark:bg-primary/90">
                        <th
                          className="px-4 py-3 text-left font-medium cursor-pointer hover:bg-primary/90 transition-colors"
                          onClick={() => requestSort("codigoProductor")}
                        >
                          Código {getSortIcon("codigoProductor")}
                        </th>
                        <th
                          className="px-4 py-3 text-left font-medium cursor-pointer hover:bg-primary/90 transition-colors"
                          onClick={() => requestSort("productor")}
                        >
                          Productor {getSortIcon("productor")}
                        </th>
                        <th
                          className="px-4 py-3 text-left font-medium cursor-pointer hover:bg-primary/90 transition-colors"
                          onClick={() => requestSort("Año")}
                        >
                          Año {getSortIcon("Año")}
                        </th>
                        <th
                          className="px-4 py-3 text-left font-medium cursor-pointer hover:bg-primary/90 transition-colors"
                          onClick={() => requestSort("Mes")}
                        >
                          Mes {getSortIcon("Mes")}
                        </th>
                        <th
                          className="px-4 py-3 text-left font-medium cursor-pointer hover:bg-primary/90 transition-colors"
                          onClick={() => requestSort("TotalContratos")}
                        >
                          Contratos {getSortIcon("TotalContratos")}
                        </th>
                        <th
                          className="px-4 py-3 text-left font-medium cursor-pointer hover:bg-primary/90 transition-colors"
                          onClick={() => requestSort("TotalCotizaciones")}
                        >
                          Cotizaciones {getSortIcon("TotalCotizaciones")}
                        </th>
                        <th
                          className="px-4 py-3 text-left font-medium cursor-pointer hover:bg-primary/90 transition-colors"
                          onClick={() => requestSort("Eficiencia")}
                        >
                          Eficiencia % {getSortIcon("Eficiencia")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedData.eficienciaMensual.length > 0 ? (
                        sortedData.eficienciaMensual.map((item: EficienciaMensual, index: number) => (
                          <EficienciaMensualRow
                            key={`${item.codigoProductor}-${item.Año}-${item.Mes}-${index}`}
                            item={item}
                            index={index}
                            safeToFixed={safeToFixed}
                          />
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="px-4 py-3 text-center text-muted-foreground">
                            No se encontraron registros que coincidan con los filtros aplicados.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cotizaciones Mensuales Tab */}
          <TabsContent value="cotizaciones-mensuales">
            {selectedProducerForChart && (
              <div className="mb-8">
                <ProducerMonthlyQuotesChart
                  producerName={selectedProducerForChart.productor}
                  monthlyData={data.cotizacionesMensuales.filter(
                    (item: CotizacionesMensuales) =>
                      item.CodigoProductor === selectedProducerForChart.CodigoProductor &&
                      isMonthYearWithinRange(item.Año, item.Mes, startDate, endDate),
                  )}
                />
              </div>
            )}
            <Card className="shadow-lg transition-shadow hover:shadow-xl bg-card border-border">
              <CardHeader className="bg-background border-b border-border">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-primary dark:text-accent-blue">
                      Cotizaciones Mensuales ({sortedData.cotizacionesMensuales.length} registros)
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Historial mensual de cotizaciones por productor con fechas de primera y última cotización
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-primary text-primary-foreground dark:bg-primary/90">
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
                          onClick={() => requestSort("Año")}
                        >
                          Año {getSortIcon("Año")}
                        </th>
                        <th
                          className="px-4 py-3 text-left font-medium cursor-pointer hover:bg-primary/90 transition-colors"
                          onClick={() => requestSort("NombreMes")}
                        >
                          Mes {getSortIcon("NombreMes")}
                        </th>
                        <th
                          className="px-4 py-3 text-left font-medium cursor-pointer hover:bg-primary/90 transition-colors"
                          onClick={() => requestSort("TotalCotizaciones")}
                        >
                          Total Cotizaciones {getSortIcon("TotalCotizaciones")}
                        </th>
                        <th className="px-4 py-3 text-left font-medium">Primera Cotización</th>
                        <th className="px-4 py-3 text-left font-medium">Última Cotización</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedData.cotizacionesMensuales.length > 0 ? (
                        sortedData.cotizacionesMensuales.map((item: CotizacionesMensuales, index: number) => (
                          <CotizacionesMensualesRow
                            key={`${item.CodigoProductor}-${item.Año}-${item.Mes}-${index}`}
                            item={item}
                            index={index}
                          />
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="px-4 py-3 text-center text-muted-foreground">
                            No se encontraron registros que coincidan con los filtros aplicados.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contratos Mensuales Tab */}
          <TabsContent value="contratos-mensuales">
            {selectedProducerForChart && (
              <div className="mb-8">
                <ProducerMonthlyContractsChart
                  producerName={selectedProducerForChart.productor}
                  monthlyData={data.contratosMensuales.filter(
                    (item: ContratosMensuales) =>
                      item.codigoProductor === selectedProducerForChart.CodigoProductor &&
                      isMonthYearWithinRange(item.Año, item.Mes, startDate, endDate),
                  )}
                />
              </div>
            )}
            <Card className="shadow-lg transition-shadow hover:shadow-xl bg-card border-border">
              <CardHeader className="bg-background border-b border-border">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-primary dark:text-accent-blue">
                      Contratos Mensuales ({sortedData.contratosMensuales.length} registros)
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Historial mensual de contratos cerrados por productor
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-primary text-primary-foreground dark:bg-primary/90">
                        <th
                          className="px-4 py-3 text-left font-medium cursor-pointer hover:bg-primary/90 transition-colors"
                          onClick={() => requestSort("codigoProductor")}
                        >
                          Código {getSortIcon("codigoProductor")}
                        </th>
                        <th
                          className="px-4 py-3 text-left font-medium cursor-pointer hover:bg-primary/90 transition-colors"
                          onClick={() => requestSort("productor")}
                        >
                          Productor {getSortIcon("productor")}
                        </th>
                        <th
                          className="px-4 py-3 text-left font-medium cursor-pointer hover:bg-primary/90 transition-colors"
                          onClick={() => requestSort("Año")}
                        >
                          Año {getSortIcon("Año")}
                        </th>
                        <th
                          className="px-4 py-3 text-left font-medium cursor-pointer hover:bg-primary/90 transition-colors"
                          onClick={() => requestSort("NombreMes")}
                        >
                          Mes {getSortIcon("NombreMes")}
                        </th>
                        <th
                          className="px-4 py-3 text-left font-medium cursor-pointer hover:bg-primary/90 transition-colors"
                          onClick={() => requestSort("TotalContratos")}
                        >
                          Total Contratos {getSortIcon("TotalContratos")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedData.contratosMensuales.length > 0 ? (
                        sortedData.contratosMensuales.map((item: ContratosMensuales, index: number) => (
                          <ContratosMensualesRow
                            key={`${item.codigoProductor}-${item.Año}-${item.Mes}-${index}`}
                            item={item}
                            index={index}
                          />
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-4 py-3 text-center text-muted-foreground">
                            No se encontraron registros que coincidan con los filtros aplicados.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cotizaciones Total Tab */}
          <TabsContent value="cotizaciones-total">
            <Card className="shadow-lg transition-shadow hover:shadow-xl bg-card border-border">
              <CardHeader className="bg-background border-b border-border">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-primary dark:text-accent-blue">
                      Resumen Total de Cotizaciones ({sortedData.cotizacionesTotal.length} registros)
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Estadísticas generales de cotizaciones por productor con promedios mensuales
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-primary text-primary-foreground dark:bg-primary/90">
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
                          onClick={() => requestSort("MesesActivos")}
                        >
                          Meses Activos {getSortIcon("MesesActivos")}
                        </th>
                        <th
                          className="px-4 py-3 text-left font-medium cursor-pointer hover:bg-primary/90 transition-colors"
                          onClick={() => requestSort("TotalCotizaciones")}
                        >
                          Total Cotizaciones {getSortIcon("TotalCotizaciones")}
                        </th>
                        <th
                          className="px-4 py-3 text-left font-medium cursor-pointer hover:bg-primary/90 transition-colors"
                          onClick={() => requestSort("PromedioCotizacionesMes")}
                        >
                          Promedio/Mes {getSortIcon("PromedioCotizacionesMes")}
                        </th>
                        <th className="px-4 py-3 text-left font-medium">Primera Cotización</th>
                        <th className="px-4 py-3 text-left font-medium">Última Cotización</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedData.cotizacionesTotal.length > 0 ? (
                        sortedData.cotizacionesTotal.map((item: CotizacionesTotal, index: number) => (
                          <CotizacionesTotalRow
                            key={`${item.CodigoProductor}-${index}`}
                            item={item}
                            index={index}
                            safeToFixed={safeToFixed}
                          />
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="px-4 py-3 text-center text-muted-foreground">
                            No se encontraron registros que coincidan con los filtros aplicados.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contratos Total Tab */}
          <TabsContent value="contratos-total">
            <Card className="shadow-lg transition-shadow hover:shadow-xl bg-card border-border">
              <CardHeader className="bg-background border-b border-border">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-primary dark:text-accent-blue">
                      Resumen Total de Contratos ({sortedData.contratosTotal.length} registros)
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Estadísticas generales de contratos por productor con promedios mensuales
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-primary text-primary-foreground dark:bg-primary/90">
                        <th
                          className="px-4 py-3 text-left font-medium cursor-pointer hover:bg-primary/90 transition-colors"
                          onClick={() => requestSort("codigoProductor")}
                        >
                          Código {getSortIcon("codigoProductor")}
                        </th>
                        <th
                          className="px-4 py-3 text-left font-medium cursor-pointer hover:bg-primary/90 transition-colors"
                          onClick={() => requestSort("productor")}
                        >
                          Productor {getSortIcon("productor")}
                        </th>
                        <th
                          className="px-4 py-3 text-left font-medium cursor-pointer hover:bg-primary/90 transition-colors"
                          onClick={() => requestSort("TotalContratos")}
                        >
                          Total Contratos {getSortIcon("TotalContratos")}
                        </th>
                        <th
                          className="px-4 py-3 text-left font-medium cursor-pointer hover:bg-primary/90 transition-colors"
                          onClick={() => requestSort("CantidadMeses")}
                        >
                          Meses Activos {getSortIcon("CantidadMeses")}
                        </th>
                        <th
                          className="px-4 py-3 text-left font-medium cursor-pointer hover:bg-primary/90 transition-colors"
                          onClick={() => requestSort("PromedioMensual")}
                        >
                          Promedio Mensual {getSortIcon("PromedioMensual")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedData.contratosTotal.length > 0 ? (
                        sortedData.contratosTotal.map((item: ContratosTotal, index: number) => (
                          <ContratosTotalRow
                            key={`${item.codigoProductor}-${index}`}
                            item={item}
                            index={index}
                            safeToFixed={safeToFixed}
                          />
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-4 py-3 text-center text-muted-foreground">
                            No se encontraron registros que coincidan con los filtros aplicados.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
