"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Download, FileSpreadsheet, FileText, Loader2, Settings } from "lucide-react"
import * as XLSX from "xlsx"
import { useToast } from "@/components/ui/use-toast"

interface ExportOptions {
  format: "xlsx" | "csv" | "pdf"
  includeCharts: boolean
  includeSummary: boolean
  dateRange: "all" | "current-month" | "last-3-months" | "custom"
  tables: string[]
}

interface DataExportManagerProps {
  data: any
  isVisible: boolean
  onToggle: () => void
}

export function DataExportManager({ data, isVisible, onToggle }: DataExportManagerProps) {
  const { toast } = useToast()
  const [isExporting, setIsExporting] = useState(false)
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: "xlsx",
    includeCharts: false,
    includeSummary: true,
    dateRange: "all",
    tables: ["eficienciaTotal"],
  })

  const availableTables = [
    { id: "eficienciaTotal", label: "Eficiencia Total", description: "Resumen general por productor" },
    { id: "eficienciaMensual", label: "Eficiencia Mensual", description: "Datos mensuales detallados" },
    { id: "cotizacionesMensuales", label: "Cotizaciones Mensuales", description: "Historial de cotizaciones" },
    { id: "contratosMensuales", label: "Contratos Mensuales", description: "Historial de contratos" },
    { id: "cotizacionesTotal", label: "Resumen Cotizaciones", description: "Estadísticas de cotizaciones" },
    { id: "contratosTotal", label: "Resumen Contratos", description: "Estadísticas de contratos" },
  ]

  const handleTableToggle = (tableId: string, checked: boolean) => {
    setExportOptions((prev) => ({
      ...prev,
      tables: checked ? [...prev.tables, tableId] : prev.tables.filter((id) => id !== tableId),
    }))
  }

  const generateAdvancedExcel = async () => {
    setIsExporting(true)
    try {
      const wb = XLSX.utils.book_new()

      // Add summary sheet if requested
      if (exportOptions.includeSummary && data.performanceMetrics) {
        const summaryData = [
          ["Métrica", "Valor"],
          ["Conversión Promedio", `${data.performanceMetrics.averageConversion.toFixed(1)}%`],
          ["Ingresos Estimados", data.performanceMetrics.totalRevenue.toLocaleString()],
          ["Productores Mejorando", data.performanceMetrics.trendsAnalysis.improving],
          ["Productores Estables", data.performanceMetrics.trendsAnalysis.stable],
          ["Productores en Declive", data.performanceMetrics.trendsAnalysis.declining],
          ["", ""],
          ["Top 5 Productores", ""],
          ["Productor", "Conversión %"],
          ...data.performanceMetrics.topPerformers.map((p: any) => [p.productor, `${p.Porcentaje_Conversion}%`]),
        ]
        const wsSummary = XLSX.utils.aoa_to_sheet(summaryData)
        XLSX.utils.book_append_sheet(wb, wsSummary, "Resumen Ejecutivo")
      }

      // Add selected data tables
      exportOptions.tables.forEach((tableId) => {
        if (data[tableId] && data[tableId].length > 0) {
          const tableData = data[tableId]
          const ws = XLSX.utils.json_to_sheet(tableData)

          // Get table label
          const tableInfo = availableTables.find((t) => t.id === tableId)
          const sheetName = tableInfo?.label || tableId

          XLSX.utils.book_append_sheet(wb, ws, sheetName)
        }
      })

      // Generate and download
      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" })
      const blob = new Blob([excelBuffer], { type: "application/octet-stream" })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `Dashboard_Productores_${new Date().toISOString().split("T")[0]}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast({
        title: "Exportación exitosa",
        description: `Archivo Excel generado con ${exportOptions.tables.length} tablas.`,
      })
    } catch (error) {
      console.error("Export error:", error)
      toast({
        title: "Error de exportación",
        description: "Hubo un problema al generar el archivo. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const generateCSV = async () => {
    setIsExporting(true)
    try {
      // For CSV, we'll export the main table
      const mainData = data.eficienciaTotal || []
      const csv = XLSX.utils.json_to_sheet(mainData)
      const csvString = XLSX.utils.sheet_to_csv(csv)

      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `Dashboard_Productores_${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast({
        title: "Exportación CSV exitosa",
        description: "Archivo CSV generado correctamente.",
      })
    } catch (error) {
      toast({
        title: "Error de exportación",
        description: "Hubo un problema al generar el CSV.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleExport = async () => {
    if (exportOptions.tables.length === 0) {
      toast({
        title: "Selección requerida",
        description: "Debes seleccionar al menos una tabla para exportar.",
        variant: "destructive",
      })
      return
    }

    switch (exportOptions.format) {
      case "xlsx":
        await generateAdvancedExcel()
        break
      case "csv":
        await generateCSV()
        break
      case "pdf":
        toast({
          title: "Próximamente",
          description: "La exportación a PDF estará disponible pronto.",
        })
        break
    }
  }

  if (!isVisible) {
    return (
      <Button variant="outline" onClick={onToggle} className="flex items-center gap-2 bg-transparent">
        <Settings className="h-4 w-4" />
        Opciones de Exportación
      </Button>
    )
  }

  return (
    <Card className="border-info/20 bg-info/5">
      <CardHeader>
        <CardTitle className="text-info dark:text-accent-cyan flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Exportación Avanzada
        </CardTitle>
        <CardDescription>Personaliza tu exportación con opciones avanzadas y múltiples formatos.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Format Selection */}
        <div className="space-y-2">
          <Label>Formato de Exportación</Label>
          <Select
            value={exportOptions.format}
            onValueChange={(value: "xlsx" | "csv" | "pdf") => setExportOptions((prev) => ({ ...prev, format: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="xlsx">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-success" />
                  Excel (.xlsx) - Recomendado
                </div>
              </SelectItem>
              <SelectItem value="csv">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-info" />
                  CSV (.csv) - Datos básicos
                </div>
              </SelectItem>
              <SelectItem value="pdf" disabled>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  PDF (.pdf) - Próximamente
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table Selection */}
        <div className="space-y-3">
          <Label>Tablas a Incluir</Label>
          <div className="grid grid-cols-1 gap-3">
            {availableTables.map((table) => (
              <div key={table.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                <Checkbox
                  id={table.id}
                  checked={exportOptions.tables.includes(table.id)}
                  onCheckedChange={(checked) => handleTableToggle(table.id, checked as boolean)}
                />
                <div className="flex-1">
                  <Label htmlFor={table.id} className="font-medium cursor-pointer">
                    {table.label}
                  </Label>
                  <p className="text-sm text-muted-foreground">{table.description}</p>
                  {data[table.id] && (
                    <Badge variant="secondary" className="mt-1">
                      {data[table.id].length} registros
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Options */}
        <div className="space-y-3">
          <Label>Opciones Adicionales</Label>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-summary"
                checked={exportOptions.includeSummary}
                onCheckedChange={(checked) =>
                  setExportOptions((prev) => ({ ...prev, includeSummary: checked as boolean }))
                }
              />
              <Label htmlFor="include-summary">Incluir resumen ejecutivo</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-charts"
                checked={exportOptions.includeCharts}
                onCheckedChange={(checked) =>
                  setExportOptions((prev) => ({ ...prev, includeCharts: checked as boolean }))
                }
                disabled
              />
              <Label htmlFor="include-charts" className="text-muted-foreground">
                Incluir gráficos (próximamente)
              </Label>
            </div>
          </div>
        </div>

        {/* Export Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <Button onClick={handleExport} disabled={isExporting || exportOptions.tables.length === 0} className="flex-1">
            {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            Exportar {exportOptions.format.toUpperCase()}
          </Button>
          <Button variant="outline" onClick={onToggle}>
            Cerrar
          </Button>
        </div>

        {/* Export Summary */}
        {exportOptions.tables.length > 0 && (
          <div className="p-3 bg-background rounded-lg border">
            <p className="text-sm font-medium mb-2">Resumen de Exportación:</p>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• Formato: {exportOptions.format.toUpperCase()}</p>
              <p>• Tablas: {exportOptions.tables.length} seleccionadas</p>
              <p>• Resumen ejecutivo: {exportOptions.includeSummary ? "Incluido" : "No incluido"}</p>
              <p>
                • Total de registros:{" "}
                {exportOptions.tables.reduce((sum, tableId) => sum + (data[tableId]?.length || 0), 0)}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
