"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Smile, Paperclip, MoreVertical, Phone, Video, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { useUser } from "@/lib/auth"

interface Message {
  id: string
  content: string
  sender_id: string
  sender_name: string
  sender_avatar?: string
  created_at: string
  is_ai_generated?: boolean
}

interface ChatUser {
  id: string
  name: string
  avatar_url?: string
  is_online: boolean
  last_seen?: string
}

// Mock data for when database is not available
const mockMessages: Message[] = [
  {
    id: "1",
    content: "Hi! I saw your profile and thought we might have some great synergies in the tech space.",
    sender_id: "mock-user-1",
    sender_name: "Sarah Chen",
    sender_avatar: "/placeholder.svg?height=40&width=40",
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "2",
    content: "That sounds interesting! I'd love to learn more about your work in AI.",
    sender_id: "550e8400-e29b-41d4-a716-446655440000",
    sender_name: "Demo User",
    sender_avatar: "/placeholder.svg?height=40&width=40",
    created_at: new Date(Date.now() - 3000000).toISOString(),
  },
  {
    id: "3",
    content:
      "I'm currently working on some exciting projects involving machine learning and natural language processing. Would you be interested in a quick call this week?",
    sender_id: "mock-user-1",
    sender_name: "Sarah Chen",
    sender_avatar: "/placeholder.svg?height=40&width=40",
    created_at: new Date(Date.now() - 1800000).toISOString(),
  },
]

const mockChatUsers: ChatUser[] = [
  {
    id: "mock-user-1",
    name: "Sarah Chen",
    avatar_url: "/placeholder.svg?height=40&width=40",
    is_online: true,
  },
  {
    id: "mock-user-2",
    name: "Michael Rodriguez",
    avatar_url: "/placeholder.svg?height=40&width=40",
    is_online: false,
    last_seen: "2 hours ago",
  },
  {
    id: "mock-user-3",
    name: "Emily Johnson",
    avatar_url: "/placeholder.svg?height=40&width=40",
    is_online: true,
  },
]

// Helper function to safely get initials from a name
const getInitials = (name?: string): string => {
  if (!name || typeof name !== "string") return "U"
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

// Helper function to safely get user ID
const getUserId = (user: any): string => {
  if (!user) return "550e8400-e29b-41d4-a716-446655440000" // Default demo user ID
  return user.id || "550e8400-e29b-41d4-a716-446655440000"
}

// Helper function to safely get user name
const getUserName = (user: any): string => {
  if (!user) return "Demo User"
  return user.user_metadata?.full_name || user.email?.split("@")[0] || "Demo User"
}

export function ModernChat() {
  const { user, loading: authLoading } = useUser()
  const [messages, setMessages] = useState<Message[]>([])
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([])
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const currentUserId = getUserId(user)
  const currentUserName = getUserName(user)

  // State for mobile chat navigation
  const [mobileChatUser, setMobileChatUser] = useState<ChatUser | null>(null)

  // Helper to determine if mobile
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // On mobile, selectedUser is mobileChatUser; on desktop, it's selectedUser
  const activeUser = isMobile ? mobileChatUser : selectedUser

  useEffect(() => {
    if (!authLoading) {
      loadInitialData()
    }
  }, [authLoading, user])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadInitialData = async () => {
    try {
      if (isSupabaseConfigured && supabase && user) {
        // Try to load real data from users table
        const { data: users, error: usersError } = await supabase
          .from("users")
          .select("id, full_name, avatar_url, is_active")
          .neq("id", currentUserId)
          .limit(10)

        if (!usersError && users && users.length > 0) {
          const chatUsersData = users.map((u) => ({
            id: u.id,
            name: u.full_name || "Unknown User",
            avatar_url: u.avatar_url,
            is_online: u.is_active || Math.random() > 0.5, // Random online status for demo
            last_seen: Math.random() > 0.5 ? undefined : "2 hours ago",
          }))
          setChatUsers(chatUsersData)
          setSelectedUser(chatUsersData[0])

          // Load messages for the first user
          await loadMessages(chatUsersData[0].id)
        } else {
          // Fallback to mock data
          setChatUsers(mockChatUsers)
          setSelectedUser(mockChatUsers[0])
          setMessages(mockMessages)
        }
      } else {
        // Use mock data when Supabase is not configured or user is not authenticated
        setChatUsers(mockChatUsers)
        setSelectedUser(mockChatUsers[0])
        setMessages(mockMessages)
      }
    } catch (error) {
      console.warn("Failed to load chat data, using mock data:", error)
      setChatUsers(mockChatUsers)
      setSelectedUser(mockChatUsers[0])
      setMessages(mockMessages)
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async (otherUserId: string) => {
    try {
      if (isSupabaseConfigured && supabase && user) {
        // First, try to find existing conversation
        const { data: conversations, error: convError } = await supabase
          .from("conversations")
          .select("id")
          .or(`match_id.in.(${currentUserId},${otherUserId})`)
          .limit(1)

        if (!convError && conversations && conversations.length > 0) {
          const conversationId = conversations[0].id

          // Load messages for this conversation
          const { data: messagesData, error: messagesError } = await supabase
            .from("messages")
            .select("*")
            .eq("conversation_id", conversationId)
            .order("created_at", { ascending: true })

          if (!messagesError && messagesData) {
            setMessages(messagesData)
            return
          }
        }
      }
      // Fallback to mock messages
      setMessages(mockMessages)
    } catch (error) {
      console.warn("Failed to load messages, using mock data:", error)
      setMessages(mockMessages)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeUser) return

    const messageData = {
      id: Date.now().toString(),
      content: newMessage.trim(),
      sender_id: currentUserId,
      sender_name: currentUserName,
      sender_avatar: user?.user_metadata?.avatar_url || "/placeholder.svg",
      created_at: new Date().toISOString(),
    }

    try {
      if (isSupabaseConfigured && supabase && user) {
        // Try to save to database
        const { error } = await supabase.from("messages").insert({
          conversation_id: `conv_${currentUserId}_${activeUser.id}`,
          sender_id: currentUserId,
          content: newMessage.trim(),
          created_at: new Date().toISOString(),
        })

        if (error) {
          console.warn("Failed to save message to database:", error)
        }
      }
    } catch (error) {
      console.warn("Failed to send message:", error)
    }

    // Add message to local state
    setMessages((prev) => [...prev, messageData])
    setNewMessage("")
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleUserSelect = async (chatUser: ChatUser) => {
    if (isMobile) setMobileChatUser(chatUser)
    else setSelectedUser(chatUser)
    await loadMessages(chatUser.id)
  }

  const getLastMessage = (chatUserId: string) => {
    const lastMsg = messages.filter(m => m.sender_id === chatUserId || m.sender_id === currentUserId).pop()
    if (!lastMsg) return { text: "No messages yet", time: "" }
    return {
      text: lastMsg.content.length > 30 ? lastMsg.content.slice(0, 30) + '…' : lastMsg.content,
      time: new Date(lastMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  }

  if (authLoading || loading) {
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
    <div className="flex flex-col md:flex-row w-full bg-white rounded-lg border border-gray-200 overflow-hidden h-[calc(100vh-200px)]">
      {/* Chat List Sidebar */}
      <div className={`z-50 bg-white w-full md:w-80 min-w-[16rem] border-b md:border-b-0 md:border-r border-gray-200 flex flex-col h-64 md:h-full ${isMobile && mobileChatUser ? 'hidden' : 'block'}`}>
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input placeholder="Search conversations..." className="pl-10 bg-gray-50 border-0" />
          </div>
        </div>
        {/* Current User at the top */}
        <div className="flex items-center space-x-3 p-4 bg-purple-50 border-b border-purple-200">
          <div className="relative">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user?.user_metadata?.avatar_url || "/placeholder.svg"} />
              <AvatarFallback>{getInitials(getUserName(user))}</AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 truncate">{getUserName(user) || "You"}</p>
            <p className="text-xs text-purple-600 font-semibold">You</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {chatUsers.map((chatUser) => {
            const last = getLastMessage(chatUser.id)
            return (
              <motion.div
                key={chatUser.id}
                whileHover={{ backgroundColor: "#f8fafc" }}
                onClick={() => handleUserSelect(chatUser)}
                className={`p-4 cursor-pointer border-b border-gray-100 ${activeUser?.id === chatUser.id ? "bg-green-50 border-green-200" : ""}`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={chatUser.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback>{getInitials(chatUser.name)}</AvatarFallback>
                    </Avatar>
                    {chatUser.is_online && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <p className="font-semibold text-gray-900 truncate">{chatUser.name || "Unknown User"}</p>
                      <span className="text-xs text-gray-400 ml-2">{last.time}</span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{last.text}</p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
      {/* Chat Area */}
      <div className={`flex-1 flex flex-col min-h-0 relative ${isMobile && !mobileChatUser ? 'hidden' : 'flex'}`}>
        {activeUser ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center space-x-3">
                {/* Back arrow for mobile */}
                {isMobile && (
                  <Button variant="ghost" size="icon" className="mr-2" onClick={() => setMobileChatUser(null)}>
                    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-arrow-left"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
                  </Button>
                )}
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={activeUser.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback>{getInitials(activeUser.name)}</AvatarFallback>
                  </Avatar>
                  {activeUser.is_online && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    {activeUser.name || "Unknown User"}
                    {activeUser.id === currentUserId && (
                      <span className="ml-2 px-2 py-0.5 text-xs rounded bg-green-100 text-green-700 font-semibold">You</span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {activeUser.is_online ? "Online" : activeUser.last_seen || "Offline"}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon">
                  <Phone className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Video className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </div>
            </div>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-2 md:p-4 space-y-2 md:space-y-4 bg-gray-50">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`flex ${message.sender_id === currentUserId ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`flex items-end space-x-2 max-w-[80vw] md:max-w-md ${
                        message.sender_id === currentUserId ? "flex-row-reverse space-x-reverse" : ""
                      }`}
                    >
                      <Avatar className="h-7 w-7 md:h-8 md:w-8">
                        <AvatarImage src={message.sender_avatar || "/placeholder.svg"} />
                        <AvatarFallback>{getInitials(message.sender_name)}</AvatarFallback>
                      </Avatar>
                      <div
                        className={`px-3 py-2 md:px-4 md:py-2 rounded-2xl relative text-sm md:text-base ${
                          message.sender_id === currentUserId
                            ? "bg-green-100 text-gray-900 rounded-br-none"
                            : "bg-white text-gray-900 border border-gray-200 rounded-bl-none"
                        }`}
                      >
                        <p>{message.content}</p>
                        <span className="absolute bottom-1 right-2 text-[10px] text-gray-400 select-none">
                          {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {message.is_ai_generated && (
                          <Badge variant="secondary" className="mt-1 text-xs">
                            AI Suggested
                          </Badge>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>
            {/* Message Input */}
            <div className="p-2 md:p-4 border-t border-gray-200 bg-white sticky bottom-0 z-10">
              <div className="flex items-center space-x-1 md:space-x-2">
                <Button variant="ghost" size="icon">
                  <Smile className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Paperclip className="h-5 w-5" />
                </Button>
                <div className="flex-1 relative">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="pr-12"
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  />
                </div>
                <Button
                  onClick={sendMessage}
                  className="bg-green-500 hover:bg-green-600 px-3 py-2 md:px-4 md:py-2 text-white"
                  disabled={!newMessage.trim()}
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a chat to start messaging</h3>
              <p className="text-gray-500">Choose a contact from the list to begin</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
