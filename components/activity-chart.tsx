"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Tooltip } from "recharts"

const data = [
  { time: "10:00", participants: 65, qualified: 45, meetings: 25 },
  { time: "11:00", participants: 78, qualified: 52, meetings: 32 },
  { time: "12:00", participants: 85, qualified: 58, meetings: 38 },
  { time: "13:00", participants: 92, qualified: 65, meetings: 42 },
  { time: "14:00", participants: 105, qualified: 75, meetings: 48 },
  { time: "15:00", participants: 98, qualified: 70, meetings: 45 },
  { time: "16:00", participants: 88, qualified: 62, meetings: 40 },
]

export function ActivityChart() {
  return (
    <Card className="col-span-1 lg:col-span-2 h-full">
      <CardHeader>
        <CardTitle className="text-base sm:text-lg font-semibold">Activity by Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] sm:h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#666" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#666" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="participants"
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, stroke: "#8b5cf6", strokeWidth: 2 }}
                name="Participants"
              />
              <Line
                type="monotone"
                dataKey="qualified"
                stroke="#06b6d4"
                strokeWidth={3}
                dot={{ fill: "#06b6d4", strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, stroke: "#06b6d4", strokeWidth: 2 }}
                name="Qualified"
              />
              <Line
                type="monotone"
                dataKey="meetings"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ fill: "#10b981", strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, stroke: "#10b981", strokeWidth: 2 }}
                name="Meetings"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
