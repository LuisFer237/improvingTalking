"use client"

import { useEffect, useState } from "react"
import { MdDelete } from "react-icons/md"
import { useRouter } from "next/navigation"
import { MdChatBubbleOutline } from "react-icons/md"
import { GoPlus } from "react-icons/go"
import { Button } from "@/components/ui/button"

export default function ConversationsPage() {
  const router = useRouter()
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const handleOpenConversation = (id) => {
    router.push(`/chat/${id}`)
  }

  useEffect(() => {
    const loadConversations = async () => {
      try {
        const res = await fetch("/api/auth/conversations")
        if (!res.ok) throw new Error("Network response was not ok, failed to fetch")
        const data = await res.json()
        setConversations(data?.conversations || [])
      } catch (error) {
        setError("Failed to load conversations.")
        console.error("Error fetching conversations:", error)
      } finally {
        setLoading(false)
      }
    }
    loadConversations()
  }, [])

  const handleNewConversation = async () => {
    const res = await fetch("/api/auth/conversations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title: "New Conversation", summary: "" }),
    })

    if (!res.ok) {
      setError("Failed to create a new conversation.")
      return
    }

    const data = await res.json()
    router.push(`/chat/${data.conversation.id}`)
  }

  const handleDeleteConversation = async (id) => {
    const res = await fetch(`/api/auth/conversations/${id}`, {
      method: "DELETE",
    })

    if (!res.ok) {
      setError("Failed to delete conversation.")
      return
    }

    setConversations((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">Conversations</h1>

          <Button variant="outline" onClick={handleNewConversation} className="w-full sm:w-auto bg-transparent">
            <GoPlus className="mr-2 h-4 w-4" />
            New Conversation
          </Button>
        </div>

        <div className="mt-8 space-y-3 sm:mt-10 sm:space-y-4">
          {loading && <p className="text-center text-muted-foreground">Loading conversations...</p>}

          {error && (
            <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {!loading && conversations.length === 0 && !error && (
            <div className="flex min-h-[50vh] flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-6">
                <MdChatBubbleOutline className="h-12 w-12 text-muted-foreground" />
              </div>
              <p className="mt-4 text-lg font-medium text-foreground">No conversations yet</p>
              <p className="mt-2 text-sm text-muted-foreground">Start a new conversation to get started</p>
            </div>
          )}

          {conversations.map((c) => (
            <div
              key={c.id}
              className="group rounded-lg border border-border bg-card p-6 transition-all duration-200 hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <div onClick={() => handleOpenConversation(c.id)} className="flex-1 cursor-pointer">
                  <h3 className="text-xl font-semibold leading-none tracking-tight text-card-foreground sm:text-2xl">
                    {c.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">No messages yet</p>
                </div>

                <Button
                  variant="destructive"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteConversation(c.id)
                  }}
                  className="shrink-0"
                  aria-label="Delete conversation"
                >
                  <MdDelete className="h-5 w-5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
