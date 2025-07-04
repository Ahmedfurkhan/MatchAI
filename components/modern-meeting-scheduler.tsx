"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, Clock, Video, Phone, MapPin, Plus, Users, Check, X, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { supabase } from "@/lib/supabase-client"
import { useAuth } from "@/lib/auth"

interface Meeting {
  id: string
  title: string
  description: string
  scheduled_at: string
  duration_minutes: number
  meeting_type: string
  status: string
  meeting_url?: string
  location?: string
  organizer?: {
    full_name: string
    avatar_url: string
  }
  participants?: Array<{
    user: {
      full_name: string
      avatar_url: string
    }
    response_status: string
  }>
}

// Mock meetings for demo
const mockMeetings: Meeting[] = [
  {
    id: "meeting-1",
    title: "AI Ethics Discussion",
    description: "Let's discuss the intersection of AI research and practical applications in ethical AI development.",
    scheduled_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
    duration_minutes: 45,
    meeting_type: "video",
    status: "scheduled",
    organizer: {
      full_name: "Demo User",
      avatar_url: "/placeholder.svg?height=32&width=32",
    },
    participants: [
      {
        user: {
          full_name: "Sarah Chen",
          avatar_url: "/placeholder.svg?height=32&width=32",
        },
        response_status: "accepted",
      },
    ],
  },
  {
    id: "meeting-2",
    title: "Fintech Trends Discussion",
    description: "Exploring current trends in financial technology and sustainable finance.",
    scheduled_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    duration_minutes: 30,
    meeting_type: "video",
    status: "scheduled",
    organizer: {
      full_name: "Demo User",
      avatar_url: "/placeholder.svg?height=32&width=32",
    },
    participants: [
      {
        user: {
          full_name: "Marcus Johnson",
          avatar_url: "/placeholder.svg?height=32&width=32",
        },
        response_status: "pending",
      },
    ],
  },
]

export function ModernMeetingScheduler() {
  const { user, loading: authLoading } = useAuth()
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [newMeeting, setNewMeeting] = useState({
    title: "",
    description: "",
    scheduled_at: "",
    duration_minutes: 30,
    meeting_type: "video",
    location: "",
  })

  useEffect(() => {
    if (!authLoading) {
      loadMeetings()
    }
  }, [authLoading])

  const loadMeetings = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("meetings")
        .select(`
          *,
          organizer:users!meetings_organizer_id_fkey(full_name, avatar_url),
          meeting_participants(
            response_status,
            user:users(full_name,  avatar_url)
          )
        `)
        .gte("scheduled_at", new Date().toISOString())
        .order("scheduled_at", { ascending: true })

      if (data && data.length > 0) {
        setMeetings(data)
      } else {
        // Fallback to mock data for demo
        console.log("No database meetings found, using mock data")
        setMeetings(mockMeetings)
      }
    } catch (error) {
      console.error("Error loading meetings:", error)
      // Fallback to mock data
      setMeetings(mockMeetings)
    } finally {
      setIsLoading(false)
    }
  }

  const createMeeting = async () => {
    if (!newMeeting.title || !newMeeting.scheduled_at || !user) return

    setIsCreating(true)
    try {
      const { error } = await supabase.from("meetings").insert({
        ...newMeeting,
        organizer_id: user.id,
        status: "scheduled",
      })

      if (error) throw error

      setNewMeeting({
        title: "",
        description: "",
        scheduled_at: "",
        duration_minutes: 30,
        meeting_type: "video",
        location: "",
      })
      loadMeetings()
    } catch (error) {
      console.error("Error creating meeting:", error)
    } finally {
      setIsCreating(false)
    }
  }

  const updateMeetingStatus = async (meetingId: string, status: string) => {
    try {
      const { error } = await supabase.from("meetings").update({ status }).eq("id", meetingId)

      if (error) throw error
      loadMeetings()
    } catch (error) {
      console.error("Error updating meeting:", error)
    }
  }

  const getMeetingIcon = (type: string) => {
    switch (type) {
      case "video":
        return Video
      case "audio":
        return Phone
      case "in_person":
        return MapPin
      default:
        return Calendar
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "in_progress":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-gray-100 text-gray-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30 pb-20 md:pb-8 md:ml-64">
      <div className="p-4 md:p-8">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col md:flex-row md:items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Meeting Scheduler
            </h1>
            <p className="text-gray-600">Manage your upcoming meetings and schedule new ones</p>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Schedule Meeting
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Schedule New Meeting</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Meeting Title</Label>
                  <Input
                    id="title"
                    value={newMeeting.title}
                    onChange={(e) => setNewMeeting((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter meeting title"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newMeeting.description}
                    onChange={(e) => setNewMeeting((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Meeting description"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Date & Time</Label>
                    <Input
                      id="date"
                      type="datetime-local"
                      value={newMeeting.scheduled_at}
                      onChange={(e) => setNewMeeting((prev) => ({ ...prev, scheduled_at: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="duration">Duration (min)</Label>
                    <Select
                      value={newMeeting.duration_minutes.toString()}
                      onValueChange={(value) =>
                        setNewMeeting((prev) => ({ ...prev, duration_minutes: Number.parseInt(value) }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="90">1.5 hours</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="type">Meeting Type</Label>
                  <Select
                    value={newMeeting.meeting_type}
                    onValueChange={(value) => setNewMeeting((prev) => ({ ...prev, meeting_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">Video Call</SelectItem>
                      <SelectItem value="audio">Audio Call</SelectItem>
                      <SelectItem value="in_person">In Person</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {newMeeting.meeting_type === "in_person" && (
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={newMeeting.location}
                      onChange={(e) => setNewMeeting((prev) => ({ ...prev, location: e.target.value }))}
                      placeholder="Meeting location"
                    />
                  </div>
                )}
                <Button
                  onClick={createMeeting}
                  disabled={isCreating || !newMeeting.title || !newMeeting.scheduled_at}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  {isCreating ? "Creating..." : "Schedule Meeting"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Calendar View */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                <span>Upcoming Meetings</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <AnimatePresence>
                  {meetings.length === 0 ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No meetings scheduled</h3>
                      <p className="text-gray-600">Schedule your first meeting to get started</p>
                    </motion.div>
                  ) : (
                    meetings.map((meeting, index) => {
                      const { date, time } = formatDateTime(meeting.scheduled_at)
                      const MeetingIcon = getMeetingIcon(meeting.meeting_type)

                      return (
                        <motion.div
                          key={meeting.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.02 }}
                          className="p-4 rounded-xl bg-gradient-to-r from-white to-purple-50/30 border border-gray-200/50 shadow-sm"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
                                <MeetingIcon className="h-4 w-4 text-white" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">{meeting.title}</h3>
                                <p className="text-sm text-gray-600">{meeting.description}</p>
                              </div>
                            </div>
                            <Badge className={getStatusColor(meeting.status)}>{meeting.status}</Badge>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>{date}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>{time}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Users className="h-4 w-4" />
                                <span>{meeting.duration_minutes}m</span>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              {meeting.status === "scheduled" && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateMeetingStatus(meeting.id, "completed")}
                                    className="text-green-600 border-green-200 hover:bg-green-50"
                                  >
                                    <Check className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateMeetingStatus(meeting.id, "cancelled")}
                                    className="text-red-600 border-red-200 hover:bg-red-50"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </>
                              )}
                              <Button size="sm" variant="ghost">
                                <Edit className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>

                          {meeting.participants && meeting.participants.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-200/50">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-600">Participants:</span>
                                <div className="flex -space-x-2">
                                  {meeting.participants.slice(0, 3).map((participant, idx) => (
                                    <Avatar key={idx} className="h-6 w-6 border-2 border-white">
                                      <AvatarImage src={participant.user.avatar_url || "/placeholder.svg"} />
                                      <AvatarFallback className="text-xs">
                                        {participant.user.full_name
                                          .split(" ")
                                          .map((n) => n[0])
                                          .join("")}
                                      </AvatarFallback>
                                    </Avatar>
                                  ))}
                                  {meeting.participants.length > 3 && (
                                    <div className="h-6 w-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                                      <span className="text-xs text-gray-600">+{meeting.participants.length - 3}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )
                    })
                  )}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            {
              label: "Today's Meetings",
              value: meetings.filter((m) => new Date(m.scheduled_at).toDateString() === new Date().toDateString())
                .length,
              icon: Calendar,
              color: "from-blue-500 to-cyan-500",
            },
            {
              label: "This Week",
              value: meetings.filter((m) => {
                const meetingDate = new Date(m.scheduled_at)
                const today = new Date()
                const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
                return meetingDate >= today && meetingDate <= weekFromNow
              }).length,
              icon: Clock,
              color: "from-green-500 to-emerald-500",
            },
            {
              label: "Video Calls",
              value: meetings.filter((m) => m.meeting_type === "video").length,
              icon: Video,
              color: "from-purple-500 to-pink-500",
            },
            {
              label: "Completed",
              value: meetings.filter((m) => m.status === "completed").length,
              icon: Check,
              color: "from-orange-500 to-red-500",
            },
          ].map((stat, index) => (
            <Card key={stat.label} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                  </div>
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.color}`}>
                    <stat.icon className="h-4 w-4 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
