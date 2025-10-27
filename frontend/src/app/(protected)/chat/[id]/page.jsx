"use client";

import { AudioButton } from "@/components/audioButton";
import { useRouter } from "next/navigation";
import { Mic, Volume2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { IoIosReturnLeft } from "react-icons/io";
import { IoReloadOutline } from "react-icons/io5";

const Page = () => {
  const router = useRouter();
  const { id } = useParams();
  const [conversation, setConversation] = useState({});
  const [assistantAnswering, setAssistantAnswering] = useState(false);
  const [assistantPreparingAudio, setAssistantPreparingAudio] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

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
      setMessages(data.messages || []);
    };
    fetchMessages();
  }, [id]);

  useEffect(() => {
    if (loading) return;
    if (messages.length !== 0) return;

    const startConversation = async () => {
      try {
        const res = await fetch(
          "http://192.168.1.69:1234/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messages: [
                {
                  role: "user",
                  content: `You are a friendly English conversation partner.
                    Your goal is to have natural, fluent conversations with the user to help them practice speaking.

                    Guidelines:
                    - Speak naturally and in a friendly tone, like in a real chat between two people.
                    - Keep your messages short and conversational (2–4 sentences).
                    - Ask open questions to keep the conversation flowing.
                    - Use simple and clear English suitable for English learners.
                    - Avoid long or complex answers.
                    - If the user wants to change topics, follow their lead.
                    - End the conversation politely when the user says goodbye.

                    Now start the conversation with a friendly greeting and an open question.`,
                },
              ],
            }),
          }
        );

        if (!res.ok) {
          throw new Error("Failed to start conversation");
        }

        const data = await res.json();
        const aiMessage = data.choices?.[0]?.message?.content || "No response";

        const saveMessage = await fetch("/api/auth/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            conversationId: id,
            content: aiMessage,
            sender: "assistant",
          }),
        });

        if (!saveMessage.ok) {
          throw new Error("Failed to save assistant message");
        }

        const savedData = await saveMessage.json();

        playAssistantAudio(aiMessage);

        setMessages((prev) => [...prev, savedData.message]);
      } catch (error) {
        setError("Error starting conversation: " + error.message);
      }
    };

    startConversation();
  }, [loading, messages.length, id]);

  const playAssistantAudio = async (text) => {
    try {
      setAssistantPreparingAudio(true);
      const response = await fetch("http://127.0.0.1:8000/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ text }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate audio");
      }

      setAssistantPreparingAudio(false);

      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);

      setAssistantAnswering(true);

      audio.onended = () => {
        setAssistantAnswering(false);
      };

      audio.play();
    } catch (error) {
      console.error("Error playing assistant audio:", error);
      setAssistantPreparingAudio(false);
      setAssistantAnswering(false);
    }
  };

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

      if (!res.ok) throw new Error("Failed to send message");
      const userData = await res.json();

      setMessages((prevMessages) => [...prevMessages, userData.message]);

      const formattedMessages = [
        {
          role: "system",
          content:
            "You are a friendly English conversation partner. Always keep your responses short (2–4 sentences), simple, and conversational. Ask open questions to keep the conversation flowing.",
        },
        ...messages,
        { sender: "user", content: text },
      ].map((msg) => ({
        role: msg.sender === "assistant" ? "assistant" : "user",
        content: msg.content,
      }));

      // Don't set assistantAnswering here, let playAssistantAudio handle it

      const aiRes = await fetch(
        "http://192.168.1.69:1234/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: formattedMessages,
          }),
        }
      );

      if (!aiRes.ok) throw new Error("Failed to get AI response");
      const data = await aiRes.json();
      const aiMessage = data.choices?.[0]?.message?.content || "No response";

      const saveAI = await fetch("/api/auth/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId: id,
          content: aiMessage,
          sender: "assistant",
        }),
      });

      if (!saveAI.ok) throw new Error("Failed to save AI message");
      const savedAI = await saveAI.json();

      playAssistantAudio(aiMessage);

      setMessages((prev) => [...prev, savedAI.message]);
    } catch (error) {
      console.error(error);
      setError("Error sending message: " + error.message);
      setAssistantAnswering(false);
    }
  };

  const returnDashboard = () => {
    router.push("/dashboard");
  };

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

        {error && (
          <div className="bg-red-100 text-red-800 p-4 rounded mb-4">
            {error}
          </div>
        )}

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
                <div className="flex flex-col items-center justify-center flex-1">
                  {/* Button or speaking animation */}
                  {assistantAnswering ? (
                    <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-indigo-600 to-purple-700 shadow-xl shadow-indigo-500/50">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute inset-0 rounded-full border-2 border-indigo-400"
                          style={{
                            animation: `ripple 2s ease-out infinite ${
                              i * 0.6
                            }s`,
                          }}
                        />
                      ))}
                      <Volume2 className="w-8 h-8 text-white animate-pulse z-10" />
                      <style jsx>{`
                        @keyframes ripple {
                          0% {
                            transform: scale(0.8);
                            opacity: 1;
                          }
                          100% {
                            transform: scale(1.5);
                            opacity: 0;
                          }
                        }
                      `}</style>
                    </div>
                  ) : (
                    <AudioButton
                      onTranscription={handleMessageSend}
                      isRecording={isRecording}
                      setIsRecording={setIsRecording}
                      uploading={uploading}
                      setUploading={setUploading}
                      assistantAnswering={assistantAnswering}
                      setAssistantAnswering={setAssistantAnswering}
                      assistantPreparingAudio={assistantPreparingAudio}
                      setAssistantPreparingAudio={setAssistantPreparingAudio}
                    />
                  )}
                </div>
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
              <div className="flex-1 rounded-lg border bg-muted/100 p-4 overflow-y-auto">
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
                    <div ref={messagesEndRef} />
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
