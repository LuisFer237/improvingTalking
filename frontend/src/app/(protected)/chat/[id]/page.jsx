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
  const lmStudioServerUrl = process.env.LM_STUDIO_SERVER_URL;
  const fastApiServerUrl = process.env.FAST_API_URL;

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
          `${lmStudioServerUrl}/v1/chat/completions`,
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
      const response = await fetch(`${fastApiServerUrl}/tts`, {
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
        `${lmStudioServerUrl}/v1/chat/completions`,
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
      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-4 sm:py-6 md:py-8 h-screen flex flex-col">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <h1 className="font-bold text-2xl sm:text-3xl lg:text-4xl text-foreground">
            {conversation.title}
          </h1>
          <Button
            variant="outline"
            onClick={returnDashboard}
            className="self-start sm:self-auto bg-transparent"
          >
            <IoIosReturnLeft className="sm:mr-2" />
            <span className="hidden sm:inline">Go Back to Dashboard</span>
            <span className="sm:hidden">Back</span>
          </Button>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive border border-destructive/20 p-3 sm:p-4 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="flex flex-col lg:flex-row flex-1 gap-4 sm:gap-6 overflow-hidden min-h-0">
          {/* Left: Chatting Space */}
          <div className="flex-1 lg:flex-[3] flex flex-col border border-border shadow-lg rounded-lg overflow-hidden">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-border">
              <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
                Chatting Space
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-1.5">
                Click the button to start chatting with voice
              </p>
            </div>
            <div className="flex-1 flex flex-col p-4 sm:p-6 min-h-0">
              <div className="flex justify-center items-center flex-1 bg-muted/50 rounded-lg border-2 border-dashed border-border min-h-[200px] sm:min-h-[300px]">
                <div className="flex flex-col items-center justify-center flex-1">
                  {/* Button or speaking animation */}
                  {assistantAnswering ? (
                    <div className="relative flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-indigo-600 to-purple-700 shadow-xl shadow-indigo-500/50">
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
                      <Volume2 className="w-6 h-6 sm:w-8 sm:h-8 text-white animate-pulse z-10" />
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
          <div className="flex-1 lg:flex-[2] flex flex-col border border-border shadow-lg rounded-lg overflow-hidden">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-border">
              <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
                Conversation History
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-1.5">
                See what you talked about
              </p>
            </div>
            <div className="flex-1 flex flex-col min-h-0 p-4 sm:p-6">
              <div className="flex-1 rounded-lg border border-border bg-muted/50 p-3 sm:p-4 overflow-y-auto">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-8 sm:py-12">
                    <div className="rounded-full bg-muted p-3 sm:p-4 mb-3 sm:mb-4">
                      <Mic className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground text-xs sm:text-sm">
                      No conversations yet
                    </p>
                    <p className="text-muted-foreground text-xs mt-1">
                      Start chatting to see your history here
                    </p>
                  </div>
                ) : (
                  <ul className="space-y-2 sm:space-y-3">
                    {messages.map((msg) => (
                      <li
                        key={msg.id}
                        className="bg-card border border-border rounded-lg shadow-sm p-2.5 sm:p-3 text-left"
                      >
                        <span className="font-semibold text-foreground text-sm sm:text-base">
                          {msg.sender || "User"}:
                        </span>
                        <span className="ml-2 text-foreground text-sm sm:text-base">
                          {msg.content}
                        </span>
                        <div className="text-xs text-muted-foreground mt-1">
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
