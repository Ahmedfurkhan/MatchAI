import { ModernChat } from "@/components/modern-chat"
import { ModernNavigation } from "@/components/modern-navigation"

export default function ChatPage() {
  return (
    <>
      <ModernNavigation />
      <div className="flex min-h-screen w-full bg-gray-50">
        <ModernChat />
      </div>
    </>
  )
}
