"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  Mail, 
  Phone, 
  MapPin, 
  Building,
  Star,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { useUser } from "@/lib/auth"

interface Participant {
  id: string
  name: string
  email: string
  avatar_url?: string
  industry: string
  company: string
  position: string
  qualification_score: number
  satisfaction_rating: number
  is_active: boolean
  created_at: string
  last_active?: string
}

const mockParticipants: Participant[] = [
  {
    id: "1",
    name: "Sarah Chen",
    email: "sarah.chen@techcorp.com",
    avatar_url: "/placeholder.svg?height=40&width=40",
    industry: "Technology",
    company: "TechCorp",
    position: "Senior Software Engineer",
    qualification_score: 94,
    satisfaction_rating: 4.7,
    is_active: true,
    created_at: "2024-01-15T10:00:00Z",
    last_active: "2024-01-20T14:30:00Z",
  },
  {
    id: "2",
    name: "Michael Rodriguez",
    email: "michael.rodriguez@financeinc.com",
    avatar_url: "/placeholder.svg?height=40&width=40",
    industry: "Finance",
    company: "FinanceInc",
    position: "Financial Analyst",
    qualification_score: 88,
    satisfaction_rating: 4.2,
    is_active: true,
    created_at: "2024-01-10T09:00:00Z",
    last_active: "2024-01-19T16:45:00Z",
  },
  {
    id: "3",
    name: "Emily Johnson",
    email: "emily.johnson@marketpro.com",
    avatar_url: "/placeholder.svg?height=40&width=40",
    industry: "Marketing",
    company: "MarketPro",
    position: "Marketing Manager",
    qualification_score: 85,
    satisfaction_rating: 4.5,
    is_active: true,
    created_at: "2024-01-12T11:00:00Z",
    last_active: "2024-01-20T10:15:00Z",
  },
  {
    id: "4",
    name: "David Kim",
    email: "david.kim@medtech.com",
    avatar_url: "/placeholder.svg?height=40&width=40",
    industry: "Healthcare",
    company: "MedTech",
    position: "Product Manager",
    qualification_score: 82,
    satisfaction_rating: 4.1,
    is_active: false,
    created_at: "2024-01-08T08:00:00Z",
    last_active: "2024-01-15T12:20:00Z",
  },
  {
    id: "5",
    name: "Lisa Wang",
    email: "lisa.wang@educorp.com",
    avatar_url: "/placeholder.svg?height=40&width=40",
    industry: "Education",
    company: "EduCorp",
    position: "Curriculum Director",
    qualification_score: 79,
    satisfaction_rating: 3.9,
    is_active: true,
    created_at: "2024-01-05T14:00:00Z",
    last_active: "2024-01-18T09:30:00Z",
  },
]

export function ParticipantsManagement() {
  const { user } = useUser()
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all")

  useEffect(() => {
    loadParticipants()
  }, [])

  const loadParticipants = async () => {
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from("participants")
          .select("*")
          .order("created_at", { ascending: false })

        if (!error && data) {
          setParticipants(data)
        } else {
          setParticipants(mockParticipants)
        }
      } else {
        setParticipants(mockParticipants)
      }
    } catch (error) {
      console.warn("Failed to load participants, using mock data:", error)
      setParticipants(mockParticipants)
    } finally {
      setLoading(false)
    }
  }

  const filteredParticipants = participants.filter(participant => {
    const matchesSearch = participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         participant.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         participant.company.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesFilter = filterStatus === "all" || 
                         (filterStatus === "active" && participant.is_active) ||
                         (filterStatus === "inactive" && !participant.is_active)
    
    return matchesSearch && matchesFilter
  })

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
  }

  const getStatusColor = (isActive: boolean) => {
    return isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 80) return "text-yellow-600"
    return "text-red-600"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Participants Management</h1>
          <p className="text-gray-600">Manage and monitor all participants in the platform</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Participant
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Participants</p>
                <p className="text-2xl font-bold text-gray-900">{participants.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="h-5 w-5 bg-green-500 rounded-full" />
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">
                  {participants.filter(p => p.is_active).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Rating</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(participants.reduce((acc, p) => acc + p.satisfaction_rating, 0) / participants.length).toFixed(1)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="h-5 w-5 bg-purple-500 rounded-full" />
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(participants.reduce((acc, p) => acc + p.qualification_score, 0) / participants.length)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search participants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={filterStatus === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("all")}
              >
                All
              </Button>
              <Button
                variant={filterStatus === "active" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("active")}
              >
                Active
              </Button>
              <Button
                variant={filterStatus === "inactive" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("inactive")}
              >
                Inactive
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Participants Table */}
      <Card>
        <CardHeader>
          <CardTitle>Participants ({filteredParticipants.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Participant</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Qualification Score</TableHead>
                  <TableHead>Satisfaction</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredParticipants.map((participant) => (
                  <TableRow key={participant.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={participant.avatar_url} />
                          <AvatarFallback>{getInitials(participant.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900">{participant.name}</p>
                          <p className="text-sm text-gray-500">{participant.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Building className="h-4 w-4 text-gray-400" />
                        <span>{participant.company}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{participant.industry}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className={`font-semibold ${getScoreColor(participant.qualification_score)}`}>
                        {participant.qualification_score}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span>{participant.satisfaction_rating}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(participant.is_active)}>
                        {participant.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-500">
                        {participant.last_active 
                          ? new Date(participant.last_active).toLocaleDateString()
                          : "Never"
                        }
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="h-4 w-4 mr-2" />
                            Send Message
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 