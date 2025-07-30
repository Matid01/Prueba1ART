"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, ArrowUp, ArrowDown, Loader2, Download, ExternalLink, FileSpreadsheet } from "lucide-react"
import { loadAllData, type EficienciaTotal } from "@/lib/data-loader"
import { Button } from "@/components/ui/button"
import * as XLSX from "xlsx"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"

type SortKey = keyof EficienciaTotal
type SortDirection = "asc" | "desc"

interface SortConfig {
  key: SortKey | null
  direction: SortDirection
}

const productoresHeaders = [
  { key: "CodigoProductor", label: "Código", type: "string" },
  { key: "productor", label: "Productor", type: "string" },
  { key: "Cotizaciones", label: "Cotizaciones", type: "number" },
  { key: "Contratos", label: "Contratos", type: "number" },
  { key: "Porcentaje_Conversion", label: "% Conversión", type: "percentage" },
  { key: "Fecha_Actualizacion", label: "Última Actualización", type: "date" },
]

export default function ProductoresPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialProducerName = searchParams.get("producerName") || ""
  const { toast } = useToast()

  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState(initialProducerName)
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: "asc" })
  const [isDownloading, setIsDownloading] = useState<boolean>(false)
  const [downloadingProducer, setDownloadingProducer] = useState<string | null>(null)

  useEffect(() => {
    loadAllData()
      .then((loadedData) => {
        setData(loadedData)
        setLoading(false)
        toast({
          title: "Datos cargados",
          description: "La lista de productores se ha actualizado.",
        })
      })
      .catch((err) => {
        console.error("Failed to load data:", err)
        setError("Error al cargar los datos")
        setLoading(false)
        toast({
          title: "Error al cargar datos",
          description: "No se pudieron cargar los datos de productores. Inténtalo de nuevo.",
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
      generateTableExcel(sortedAndFilteredProducers, productoresHeaders, "Productores", "productores_filtrado")
      toast({
        title: "Descarga exitosa",
        description: "El archivo 'productores_filtrado.xlsx' ha sido descargado.",
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
    event.stopPropagation() // Prevent row click navigation
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

      // Sheet 2: Eficiencia Mensual
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

      // Sheet 3: Cotizaciones Mensuales
      const cotizacionesMensuales = data.cotizacionesMensuales.filter(
        (item: any) => item.CodigoProductor === producer.CodigoProductor,
      )
      if (cotizacionesMensuales.length > 0) {
        const cotizacionesHeaders = [
          "Año",
          "Mes",
          "Nombre Mes",
          "Total Cotizaciones",
          "Primera Cotización",
          "Última Cotización",
        ]
        const cotizacionesData = cotizacionesMensuales.map((item: any) => [
          item.Año,
          item.Mes,
          item.NombreMes,
          item.TotalCotizaciones,
          item.PrimeraCotizacion ? new Date(item.PrimeraCotizacion).toLocaleDateString("es-ES") : "N/A",
          item.UltimaCotizacion ? new Date(item.UltimaCotizacion).toLocaleDateString("es-ES") : "N/A",
        ])
        const wsCotizaciones = XLSX.utils.aoa_to_sheet([cotizacionesHeaders, ...cotizacionesData])
        XLSX.utils.book_append_sheet(wb, wsCotizaciones, "Cotizaciones Mensuales")
      }

      // Sheet 4: Contratos Mensuales
      const contratosMensuales = data.contratosMensuales.filter(
        (item: any) => item.codigoProductor === producer.CodigoProductor,
      )
      if (contratosMensuales.length > 0) {
        const contratosHeaders = ["Año", "Mes", "Nombre Mes", "Total Contratos"]
        const contratosData = contratosMensuales.map((item: any) => [
          item.Año,
          item.Mes,
          item.NombreMes,
          item.TotalContratos,
        ])
        const wsContratos = XLSX.utils.aoa_to_sheet([contratosHeaders, ...contratosData])
        XLSX.utils.book_append_sheet(wb, wsContratos, "Contratos Mensuales")
      }

      // Sheet 5: Resumen de Cotizaciones
      const cotizacionesTotal = data.cotizacionesTotal.filter(
        (item: any) => item.CodigoProductor === producer.CodigoProductor,
      )
      if (cotizacionesTotal.length > 0) {
        const cotizacionesTotalData = cotizacionesTotal.map((item: any) => [
          item.CodigoProductor,
          item.productor,
          item.MesesActivos,
          item.TotalCotizaciones,
          item.PromedioCotizacionesMes,
          item.PrimeraCotizacion ? new Date(item.PrimeraCotizacion).toLocaleDateString("es-ES") : "N/A",
          item.UltimaCotizacion ? new Date(item.UltimaCotizacion).toLocaleDateString("es-ES") : "N/A",
        ])
        const wsCotizacionesTotal = XLSX.utils.aoa_to_sheet([
          ["Código", "Productor", "Meses Activos", "Total Cotizaciones", "Promedio/Mes", "Primera", "Última"],
          ...cotizacionesTotalData,
        ])
        XLSX.utils.book_append_sheet(wb, wsCotizacionesTotal, "Resumen Cotizaciones")
      }

      // Sheet 6: Resumen de Contratos
      const contratosTotal = data.contratosTotal.filter(
        (item: any) => item.codigoProductor === producer.CodigoProductor,
      )
      if (contratosTotal.length > 0) {
        const contratosTotalData = contratosTotal.map((item: any) => [
          item.codigoProductor,
          item.productor,
          item.TotalContratos,
          item.CantidadMeses,
          item.PromedioMensual,
        ])
        const wsContratosTotal = XLSX.utils.aoa_to_sheet([
          ["Código", "Productor", "Total Contratos", "Cantidad Meses", "Promedio Mensual"],
          ...contratosTotalData,
        ])
        XLSX.utils.book_append_sheet(wb, wsContratosTotal, "Resumen Contratos")
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
    // Loading state is handled by app/productores/loading.tsx
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
          <h2 className="text-3xl font-bold text-foreground mb-2">Listado de Productores</h2>
          <p className="text-muted-foreground">
            Explora la eficiencia de cada productor. Haz clic en cualquier fila para ver el dashboard detallado o
            descarga un resumen completo.
          </p>
        </div>

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
            className="ml-auto bg-transparent border-success text-success hover:bg-success hover:text-success-foreground dark:border-accent-green dark:text-accent-green dark:hover:bg-accent-green dark:hover:text-background"
          >
            {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            Descargar Todos
          </Button>
        </div>

        <Card className="shadow-lg mb-8 transition-shadow hover:shadow-xl bg-card border-border">
          <CardHeader className="bg-background border-b border-border">
            <CardTitle className="text-primary dark:text-accent-blue">
              Productores ({sortedAndFilteredProducers.length} registros)
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Haz clic en los encabezados para ordenar. Haz clic en una fila para ver el dashboard o usa el botón de
              descarga para obtener un resumen completo.
            </CardDescription>
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
                    <th className="px-4 py-3 text-center font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedAndFilteredProducers.length > 0 ? (
                    sortedAndFilteredProducers.map((item: EficienciaTotal, index: number) => (
                      <tr
                        key={item.CodigoProductor}
                        className="border-b border-border hover:bg-muted transition-colors cursor-pointer group"
                        onClick={() => handleProducerClick(item)}
                      >
                        <td className="px-4 py-3 font-mono text-sm">{item.CodigoProductor}</td>
                        <td className="px-4 py-3 font-medium text-primary dark:text-accent-blue group-hover:text-primary/80 dark:group-hover:text-accent-blue/80">
                          {item.productor}
                        </td>
                        <td className="px-4 py-3 text-info dark:text-accent-cyan font-semibold">{item.Cotizaciones}</td>
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
                            <ExternalLink className="h-4 w-4 text-primary dark:text-accent-blue" />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-4 py-3 text-center text-muted-foreground">
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
