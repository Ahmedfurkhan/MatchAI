import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Clock } from "lucide-react"

interface Meeting {
  id: string
  title: string
  scheduled_at: string
  status: string
}

interface MeetingAnticipationListProps {
  meetings?: Meeting[]
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "scheduled":
      return "text-blue-600"
    case "in-progress":
      return "text-green-600"
    case "completed":
      return "text-gray-600"
    default:
      return "text-gray-600"
  }
}

const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

const extractParticipantNames = (title: string) => {
  // Extract names from title like "Meeting between Name1 and Name2"
  const match = title.match(/Meeting between (.+) and (.+)/)
  if (match) {
    return [match[1], match[2]]
  }
  return ["Participant 1", "Participant 2"]
}

export function MeetingAnticipationList({ meetings = [] }: MeetingAnticipationListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg font-semibold">Meeting in Anticipation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        {meetings.slice(0, 5).map((meeting) => {
          const participantNames = extractParticipantNames(meeting.title)

          return (
            <div key={meeting.id} className="flex items-center gap-2 sm:gap-3">
              <div className="flex -space-x-1 sm:-space-x-2">
                {participantNames.map((name, index) => (
                  <Avatar key={index} className="h-6 w-6 sm:h-8 sm:w-8 border-2 border-white">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" />
                    <AvatarFallback>
                      {name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{participantNames.join(" & ")}</p>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  <span>{formatTime(meeting.scheduled_at)}</span>
                </div>
              </div>
              <div className={`text-xs font-medium ${getStatusColor(meeting.status)} flex-shrink-0`}>
                {meeting.status.replace("-", " ")}
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
