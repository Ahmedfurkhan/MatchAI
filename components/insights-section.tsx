import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, CheckCircle, Info } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Insight {
  id: string
  title: string
  description: string
  type: "warning" | "success" | "info"
}

interface InsightsSectionProps {
  insights?: Insight[]
}

const getInsightIcon = (type: string) => {
  switch (type) {
    case "warning":
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />
    case "success":
      return <CheckCircle className="h-5 w-5 text-green-500" />
    case "info":
      return <Info className="h-5 w-5 text-blue-500" />
    default:
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />
  }
}

const getBorderColor = (type: string) => {
  switch (type) {
    case "warning":
      return "border-l-yellow-400"
    case "success":
      return "border-l-green-400"
    case "info":
      return "border-l-blue-400"
    default:
      return "border-l-yellow-400"
  }
}

export function InsightsSection({ insights = [] }: InsightsSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Real-Time Insights</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        {insights.slice(0, 4).map((insight) => (
          <Card key={insight.id} className={`border-l-4 ${getBorderColor(insight.type)}`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="mt-1">{getInsightIcon(insight.type)}</div>
                <div className="flex-1 space-y-2">
                  <h4 className="font-medium text-gray-900">{insight.title}</h4>
                  <p className="text-sm text-gray-600">{insight.description}</p>
                  <Button variant="link" className="h-auto p-0 text-sm text-blue-600">
                    View detailed report →
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
