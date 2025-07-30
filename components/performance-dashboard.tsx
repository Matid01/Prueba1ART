"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Award, AlertTriangle, FileText, BarChart3, Users, Target } from "lucide-react"
import type { PerformanceMetrics } from "@/lib/data-loader"

interface PerformanceDashboardProps {
  metrics: PerformanceMetrics
  className?: string
}

export function PerformanceDashboard({ metrics, className = "" }: PerformanceDashboardProps) {
  const getPerformanceBadge = (conversion: number) => {
    if (conversion >= 80) return { variant: "default" as const, label: "Excelente", color: "text-success" }
    if (conversion >= 60) return { variant: "secondary" as const, label: "Bueno", color: "text-info" }
    if (conversion >= 40) return { variant: "secondary" as const, label: "Regular", color: "text-warning" }
    return { variant: "destructive" as const, label: "Bajo", color: "text-destructive" }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-success">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversión Promedio</CardTitle>
            <Target className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{metrics.averageConversion.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">+2.1% desde el mes pasado</p>
          </CardContent>
        </Card>

        {/* 🔄 CHANGED: Revenue replaced with Contract Growth */}
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Crecimiento Contratos</CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{metrics.contractGrowth.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+{metrics.growthRate}% crecimiento</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-info">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productores Activos</CardTitle>
            <Users className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-info">
              {metrics.topPerformers.length + metrics.opportunityProducers.length}
            </div>
            <p className="text-xs text-muted-foreground">En el período actual</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warning">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tendencia General</CardTitle>
            <BarChart3 className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Positiva
            </div>
            <p className="text-xs text-muted-foreground">{metrics.trendsAnalysis.improving} productores mejorando</p>
          </CardContent>
        </Card>
      </div>

      {/* Top and Opportunity Producers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 🔄 CHANGED: Top Performers now based on contract count */}
        <Card>
          <CardHeader>
            <CardTitle className="text-success dark:text-accent-green flex items-center gap-2">
              <Award className="h-5 w-5" />
              Top 5 Productores por Contratos
            </CardTitle>
            <CardDescription>Los productores con mayor cantidad de contratos cerrados</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {metrics.topPerformers.length > 0 ? (
              metrics.topPerformers.map((producer, index) => {
                const badge = getPerformanceBadge(producer.Porcentaje_Conversion)
                return (
                  <div
                    key={producer.CodigoProductor}
                    className="flex items-center justify-between p-3 bg-success/5 rounded-lg border border-success/20"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-success text-success-foreground rounded-full text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{producer.productor}</p>
                        <p className="text-sm text-muted-foreground">
                          <span className="font-semibold text-success">{producer.Contratos} contratos</span> de{" "}
                          {producer.Cotizaciones} cotizaciones
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-success">{producer.Contratos}</div>
                      <Badge className={`${badge.color} font-bold text-xs`}>{producer.Porcentaje_Conversion}%</Badge>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay productores con contratos disponibles</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 🔄 CHANGED: Opportunity Producers with specific criteria */}
        <Card>
          <CardHeader>
            <CardTitle className="text-warning dark:text-accent-orange flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Productores con Gran Oportunidad
            </CardTitle>
            <CardDescription>
              Productores con más de 100 cotizaciones pero 0 contratos - Alto potencial de conversión
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {metrics.opportunityProducers.length > 0 ? (
              metrics.opportunityProducers.map((producer, index) => (
                <div
                  key={producer.CodigoProductor}
                  className="flex items-center justify-between p-3 bg-warning/5 rounded-lg border border-warning/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-warning text-warning-foreground rounded-full text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{producer.productor}</p>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-semibold text-info">{producer.Cotizaciones} cotizaciones</span> sin
                        contratos
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-info">{producer.Cotizaciones}</div>
                    <Badge variant="destructive" className="font-bold text-xs">
                      0% conversión
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay productores con +100 cotizaciones y 0 contratos</p>
                <p className="text-xs mt-2">¡Excelente! Todos están convirtiendo</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Opportunity Analysis */}
      {metrics.opportunityProducers.length > 0 && (
        <Card className="border-warning/30 bg-warning/5">
          <CardHeader>
            <CardTitle className="text-warning dark:text-accent-orange flex items-center gap-2">
              🎯 Análisis de Oportunidades
            </CardTitle>
            <CardDescription>
              Insights sobre productores con alto potencial de conversión no aprovechado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-background rounded-lg border">
                <div className="text-2xl font-bold text-warning">
                  {metrics.opportunityProducers.reduce((sum, p) => sum + p.Cotizaciones, 0)}
                </div>
                <p className="text-sm text-muted-foreground">Cotizaciones sin convertir</p>
              </div>
              <div className="text-center p-4 bg-background rounded-lg border">
                <div className="text-2xl font-bold text-info">
                  {Math.round(
                    metrics.opportunityProducers.reduce((sum, p) => sum + p.Cotizaciones, 0) /
                      metrics.opportunityProducers.length,
                  )}
                </div>
                <p className="text-sm text-muted-foreground">Promedio cotizaciones/productor</p>
              </div>
              <div className="text-center p-4 bg-background rounded-lg border">
                <div className="text-2xl font-bold text-success">
                  {Math.round(
                    (metrics.opportunityProducers.reduce((sum, p) => sum + p.Cotizaciones, 0) *
                      metrics.averageConversion) /
                      100,
                  )}
                </div>
                <p className="text-sm text-muted-foreground">Contratos potenciales</p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-background rounded-lg border">
              <h4 className="font-semibold mb-2 text-warning">💡 Recomendaciones:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Revisar el proceso de seguimiento de estos productores</li>
                <li>• Implementar capacitación específica en técnicas de cierre</li>
                <li>• Analizar las razones por las que no se están cerrando contratos</li>
                <li>• Considerar asignación de mentor o apoyo adicional</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trends Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="text-primary dark:text-accent-blue flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Análisis de Tendencias
          </CardTitle>
          <CardDescription>Distribución del rendimiento de todos los productores</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-success/10 rounded-lg">
              <TrendingUp className="h-8 w-8 text-success mx-auto mb-2" />
              <div className="text-2xl font-bold text-success">{metrics.trendsAnalysis.improving}</div>
              <p className="text-sm text-muted-foreground">Mejorando</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="h-8 w-8 bg-muted rounded-full mx-auto mb-2 flex items-center justify-center">
                <div className="h-1 w-4 bg-muted-foreground rounded"></div>
              </div>
              <div className="text-2xl font-bold text-muted-foreground">{metrics.trendsAnalysis.stable}</div>
              <p className="text-sm text-muted-foreground">Estables</p>
            </div>
            <div className="text-center p-4 bg-destructive/10 rounded-lg">
              <TrendingDown className="h-8 w-8 text-destructive mx-auto mb-2" />
              <div className="text-2xl font-bold text-destructive">{metrics.trendsAnalysis.declining}</div>
              <p className="text-sm text-muted-foreground">Necesitan Atención</p>
            </div>
          </div>

          {/* Progress Bars */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Productores con Alto Rendimiento</span>
                <span>
                  {(
                    (metrics.trendsAnalysis.improving /
                      (metrics.trendsAnalysis.improving +
                        metrics.trendsAnalysis.stable +
                        metrics.trendsAnalysis.declining)) *
                    100
                  ).toFixed(1)}
                  %
                </span>
              </div>
              <Progress
                value={
                  (metrics.trendsAnalysis.improving /
                    (metrics.trendsAnalysis.improving +
                      metrics.trendsAnalysis.stable +
                      metrics.trendsAnalysis.declining)) *
                  100
                }
                className="h-2"
              />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Productores Estables</span>
                <span>
                  {(
                    (metrics.trendsAnalysis.stable /
                      (metrics.trendsAnalysis.improving +
                        metrics.trendsAnalysis.stable +
                        metrics.trendsAnalysis.declining)) *
                    100
                  ).toFixed(1)}
                  %
                </span>
              </div>
              <Progress
                value={
                  (metrics.trendsAnalysis.stable /
                    (metrics.trendsAnalysis.improving +
                      metrics.trendsAnalysis.stable +
                      metrics.trendsAnalysis.declining)) *
                  100
                }
                className="h-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
