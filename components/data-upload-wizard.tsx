"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Download, Eye } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface DataUploadWizardProps {
  dataType: string
  onClose: () => void
}

export function DataUploadWizard({ dataType, onClose }: DataUploadWizardProps) {
  const [step, setStep] = useState(1)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const { toast } = useToast()

  const dataTypeConfig = {
    "Datos Temporales": {
      description: "Fechas y horarios exactos de cotizaciones y contratos",
      expectedColumns: ["fecha_cotizacion", "hora_cotizacion", "fecha_cierre", "tiempo_respuesta"],
      sampleData: `fecha_cotizacion,hora_cotizacion,codigo_productor,fecha_cierre,tiempo_respuesta_horas
2024-01-15,09:30:00,PROD001,2024-01-20,120
2024-01-15,14:15:00,PROD002,,
2024-01-16,11:45:00,PROD001,2024-01-18,48`,
      impact: "+15% precisión en predicciones temporales",
    },
    "Información Comercial": {
      description: "Montos, productos y detalles comerciales",
      expectedColumns: ["monto_cotizacion", "tipo_producto", "margen", "descuento"],
      sampleData: `codigo_cotizacion,monto_cotizacion,tipo_producto,margen_porcentaje,descuento_aplicado
COT001,150000,Seguro_Auto,25,5
COT002,75000,Seguro_Hogar,30,0
COT003,200000,Seguro_Vida,20,10`,
      impact: "+25% precisión en predicciones de conversión",
    },
    "Datos de Clientes": {
      description: "Información demográfica y sectorial de clientes",
      expectedColumns: ["industria", "tamaño_empresa", "ubicacion", "historial"],
      sampleData: `codigo_cliente,industria,tamaño_empresa,ubicacion,compras_previas
CLI001,Manufactura,Grande,Buenos_Aires,3
CLI002,Servicios,Mediana,Córdoba,0
CLI003,Retail,Pequeña,Rosario,1`,
      impact: "+20% precisión en segmentación",
    },
  }

  const config = dataTypeConfig[dataType as keyof typeof dataTypeConfig]

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      toast({
        title: "Archivo cargado",
        description: `${file.name} está listo para procesar`,
      })
    }
  }

  const downloadTemplate = () => {
    const blob = new Blob([config.sampleData], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `template_${dataType.replace(/\s+/g, "_").toLowerCase()}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    toast({
      title: "Template descargado",
      description: "Usa este archivo como guía para estructurar tus datos",
    })
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Asistente de Carga: {dataType}
        </CardTitle>
        <CardDescription>{config.description}</CardDescription>
        <Badge variant="secondary" className="w-fit">
          {config.impact}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-6">
        {step === 1 && (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <h4 className="font-semibold text-blue-800 mb-2">📋 Columnas Esperadas:</h4>
              <div className="flex flex-wrap gap-2">
                {config.expectedColumns.map((col, index) => (
                  <Badge key={index} variant="outline" className="bg-white">
                    {col}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={downloadTemplate}
                className="h-20 flex flex-col items-center gap-2 bg-transparent"
              >
                <Download className="h-6 w-6" />
                <span>Descargar Template</span>
              </Button>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <Input
                  type="file"
                  accept=".csv,.xlsx"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <FileSpreadsheet className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {uploadedFile ? uploadedFile.name : "Seleccionar archivo CSV/Excel"}
                  </span>
                </Label>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Ejemplo de Datos:
              </h4>
              <pre className="text-xs bg-white p-3 rounded border overflow-x-auto">{config.sampleData}</pre>
            </div>

            <div className="flex gap-3">
              <Button onClick={() => setStep(2)} disabled={!uploadedFile} className="flex-1">
                Continuar
              </Button>
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h4 className="font-semibold text-green-800">Archivo Validado</h4>
              </div>
              <p className="text-sm text-green-700">
                {uploadedFile?.name} contiene datos válidos para mejorar las predicciones.
              </p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="description">Descripción Adicional (Opcional)</Label>
              <Textarea
                id="description"
                placeholder="Describe cualquier contexto adicional sobre estos datos..."
                className="min-h-[100px]"
              />
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <h4 className="font-semibold text-yellow-800">Próximos Pasos</h4>
              </div>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Los datos se procesarán y validarán automáticamente</li>
                <li>• Se recalcularán las predicciones con la nueva información</li>
                <li>• Recibirás un reporte de mejora en la precisión</li>
                <li>• Los cambios se reflejarán en el dashboard en 5-10 minutos</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  toast({
                    title: "¡Datos procesados!",
                    description: "Las predicciones se actualizarán en breve con mayor precisión.",
                  })
                  onClose()
                }}
                className="flex-1"
              >
                Procesar Datos
              </Button>
              <Button variant="outline" onClick={() => setStep(1)}>
                Volver
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
