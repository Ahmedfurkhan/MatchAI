import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface Participant {
  id: string
  name: string
  avatar_url: string | null
  qualification_score: number
  satisfaction_rating: number
}

interface MatchingTopListProps {
  participants?: Participant[]
}

const getStatusFromScore = (score: number) => {
  if (score >= 90) return "qualified"
  if (score >= 80) return "active"
  return "pending"
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "qualified":
      return "bg-green-100 text-green-800"
    case "active":
      return "bg-blue-100 text-blue-800"
    case "pending":
      return "bg-gray-100 text-gray-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

const getRankColor = (rank: number) => {
  switch (rank) {
    case 1:
      return "bg-yellow-500"
    case 2:
      return "bg-purple-500"
    case 3:
      return "bg-blue-500"
    default:
      return "bg-gray-500"
  }
}

export function MatchingTopList({ participants = [] }: MatchingTopListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg font-semibold">Matching Top 5</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        {participants.slice(0, 5).map((participant, index) => {
          const rank = index + 1
          const status = getStatusFromScore(participant.qualification_score)

          return (
            <div key={participant.id} className="flex items-center gap-2 sm:gap-3">
              <div
                className={`flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full text-xs font-bold text-white ${getRankColor(rank)}`}
              >
                {rank}
              </div>
              <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
                <AvatarImage src={participant.avatar_url || "/placeholder.svg"} />
                <AvatarFallback>
                  {participant.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{participant.name}</p>
                <p className="text-xs text-gray-500">Score: {participant.qualification_score}</p>
              </div>
              <Badge className={`${getStatusColor(status)} text-xs`}>{status}</Badge>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
