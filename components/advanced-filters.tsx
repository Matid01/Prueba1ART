"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { DatePicker } from "@/components/date-picker"
import { Filter, X, RotateCcw, Search } from "lucide-react"
import type { SearchFilters } from "@/lib/data-loader"

interface AdvancedFiltersProps {
  filters: Partial<SearchFilters>
  onFiltersChange: (filters: Partial<SearchFilters>) => void
  onReset: () => void
  totalResults: number
  isVisible: boolean
  onToggle: () => void
}

export function AdvancedFilters({
  filters,
  onFiltersChange,
  onReset,
  totalResults,
  isVisible,
  onToggle,
}: AdvancedFiltersProps) {
  const [localFilters, setLocalFilters] = useState<Partial<SearchFilters>>(filters)

  const handleApplyFilters = () => {
    onFiltersChange(localFilters)
  }

  const handleResetFilters = () => {
    const resetFilters: Partial<SearchFilters> = {
      searchTerm: "",
      minConversion: 0,
      maxConversion: 100,
      minCotizaciones: 0,
      maxCotizaciones: 1000,
      dateRange: { start: null, end: null },
    }
    setLocalFilters(resetFilters)
    onReset()
  }

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }))
  }

  const activeFiltersCount = Object.values(filters).filter((value) => {
    if (typeof value === "string") return value !== ""
    if (typeof value === "number") return value !== 0 && value !== 100 && value !== 1000
    if (typeof value === "object" && value !== null) {
      return Object.values(value).some((v) => v !== null)
    }
    return false
  }).length

  return (
    <div className="space-y-4">
      {/* Filter Toggle Button */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onToggle} className="flex items-center gap-2 bg-transparent">
          <Filter className="h-4 w-4" />
          Filtros Avanzados
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>

        <div className="text-sm text-muted-foreground">{totalResults} resultados encontrados</div>
      </div>

      {/* Advanced Filters Panel */}
      {isVisible && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-primary dark:text-accent-blue flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros Avanzados
            </CardTitle>
            <CardDescription>
              Refina tu búsqueda con filtros específicos para encontrar exactamente lo que necesitas.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Search Term */}
            <div className="space-y-2">
              <Label htmlFor="search">Búsqueda por Texto</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Buscar por nombre o código de productor..."
                  value={localFilters.searchTerm || ""}
                  onChange={(e) => updateFilter("searchTerm", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Conversion Range */}
            <div className="space-y-3">
              <Label>Rango de Conversión (%)</Label>
              <div className="px-3">
                <Slider
                  value={[localFilters.minConversion || 0, localFilters.maxConversion || 100]}
                  onValueChange={([min, max]) => {
                    updateFilter("minConversion", min)
                    updateFilter("maxConversion", max)
                  }}
                  max={100}
                  min={0}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{localFilters.minConversion || 0}%</span>
                <span>{localFilters.maxConversion || 100}%</span>
              </div>
            </div>

            {/* Cotizaciones Range */}
            <div className="space-y-3">
              <Label>Rango de Cotizaciones</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="min-cotizaciones" className="text-xs">
                    Mínimo
                  </Label>
                  <Input
                    id="min-cotizaciones"
                    type="number"
                    placeholder="0"
                    value={localFilters.minCotizaciones || ""}
                    onChange={(e) => updateFilter("minCotizaciones", Number(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label htmlFor="max-cotizaciones" className="text-xs">
                    Máximo
                  </Label>
                  <Input
                    id="max-cotizaciones"
                    type="number"
                    placeholder="1000"
                    value={localFilters.maxCotizaciones || ""}
                    onChange={(e) => updateFilter("maxCotizaciones", Number(e.target.value) || 1000)}
                  />
                </div>
              </div>
            </div>

            {/* Date Range */}
            <div className="space-y-3">
              <Label>Rango de Fechas</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start-date" className="text-xs">
                    Fecha Inicio
                  </Label>
                  <DatePicker
                    date={localFilters.dateRange?.start || undefined}
                    setDate={(date) =>
                      updateFilter("dateRange", {
                        ...localFilters.dateRange,
                        start: date || null,
                      })
                    }
                    placeholder="Fecha inicio"
                  />
                </div>
                <div>
                  <Label htmlFor="end-date" className="text-xs">
                    Fecha Fin
                  </Label>
                  <DatePicker
                    date={localFilters.dateRange?.end || undefined}
                    setDate={(date) =>
                      updateFilter("dateRange", {
                        ...localFilters.dateRange,
                        end: date || null,
                      })
                    }
                    placeholder="Fecha fin"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button onClick={handleApplyFilters} className="flex-1">
                Aplicar Filtros
              </Button>
              <Button variant="outline" onClick={handleResetFilters} className="flex items-center gap-2 bg-transparent">
                <RotateCcw className="h-4 w-4" />
                Resetear
              </Button>
            </div>

            {/* Active Filters Summary */}
            {activeFiltersCount > 0 && (
              <div className="pt-4 border-t">
                <Label className="text-sm font-medium">Filtros Activos:</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {filters.searchTerm && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Búsqueda: "{filters.searchTerm}"
                      <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter("searchTerm", "")} />
                    </Badge>
                  )}
                  {(filters.minConversion !== 0 || filters.maxConversion !== 100) && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Conversión: {filters.minConversion}%-{filters.maxConversion}%
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => {
                          updateFilter("minConversion", 0)
                          updateFilter("maxConversion", 100)
                        }}
                      />
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
