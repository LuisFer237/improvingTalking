"use client";

import { AudioButton } from "@/components/audioButton";
import { useRouter } from "next/navigation";
import { Mic } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { IoIosReturnLeft } from "react-icons/io";

const Page = () => {
  const router = useRouter();
  const { id } = useParams();
  const [conversation, setConversation] = useState({});
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getConversationData = async () => {
      try {
        const res = await fetch(`/api/auth/conversations/${id}`);
        if (!res.ok) throw new Error("Failed to fetch conversation");
        const data = await res.json();
        setConversation(data.conversation);
      } catch (error) {
        setConversation(null);
      } finally {
        setLoading(false);
      }
    };
    getConversationData();

    const fetchMessages = async () => {
      const res = await fetch(`/api/auth/messages?conversationId=${id}`);
      const data = await res.json();
      console.log("Fetched messages:", data.messages);
      setMessages(data.messages || []);
    };
    fetchMessages();
  }, [id]);

  const handleMessageSend = async (text) => {
    try {
      const res = await fetch("/api/auth/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId: id,
          content: text,
          sender: "user",
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to send message");
      }

      const data = await res.json();

      setMessages((prevMessages) => [...prevMessages, data.message]);
    } catch (error) {
      console.error(error);
      setError("Error sending message: " + error.message);
    }
  };

  const returnDashboard = () => {
    
    router.push("/dashboard");

  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-10 py-8 h-screen flex flex-col">
        <div className="flex justify-between items-center">
          <h1 className="font-bold text-4xl mb-6 text-foreground">
            {conversation.title}
          </h1>
          <Button variant="outline" onClick={returnDashboard}>
            <IoIosReturnLeft />
            Go Back to Dashboard
          </Button>
        </div>

        {/* Main Flex Layout - responsive grid on mobile, flex on desktop */}
        <div className="flex flex-col lg:flex-row flex-1 gap-6 overflow-hidden">
          {/* Left: Chatting Space */}
          <div className="flex-1 lg:flex-[5] flex flex-col border shadow-lg rounded-lg p-4">
            <div className="px-6 py-4">
              <h2 className="text-2xl font-semibold">Chatting Space</h2>
              <p className="text-sm text-muted-foreground mt-1.5">
                Click the button to start chatting with voice
              </p>
            </div>
            <div className="flex-1 flex flex-col px-6 pb-6">
              <div className="flex justify-center items-center flex-1 bg-muted/100 rounded-lg border-2 border-dashed border-border">
                <AudioButton onTranscription={handleMessageSend} />
              </div>
            </div>
          </div>

          {/* Right: Conversation History */}
          <div className="flex-1 lg:flex-[4] flex flex-col border shadow-lg rounded-lg p-4">
            <div className="px-6 py-4">
              <h2 className="text-2xl font-semibold">Conversation History</h2>
              <p className="text-sm text-muted-foreground mt-1.5">
                See what you talked about
              </p>
            </div>
            <div className="flex-1 flex flex-col min-h-0 px-6 pb-6">
              <div className="flex-1 rounded-lg border bg-muted/100 p-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <div className="rounded-full bg-muted p-4 mb-4">
                      <Mic className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground text-sm">
                      No conversations yet
                    </p>
                    <p className="text-muted-foreground text-xs mt-1">
                      Start chatting to see your history here
                    </p>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {messages.map((msg) => (
                      <li
                        key={msg.id}
                        className="bg-white rounded shadow p-3 text-left"
                      >
                        <span className="font-semibold">
                          {msg.sender || "User"}:
                        </span>
                        <span className="ml-2">{msg.content}</span>
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(msg.createdAt).toLocaleString()}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
