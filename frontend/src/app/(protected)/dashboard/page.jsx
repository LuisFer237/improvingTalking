"use client";

import React, { useEffect, useState } from "react";
import { MdDelete } from "react-icons/md";
import { useRouter } from "next/navigation";
import { MdChatBubbleOutline } from "react-icons/md";
import { GoPlus } from "react-icons/go";
import { Button } from "@/components/ui/button";

const page = () => {
  const router = useRouter();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleOpenConversation = (id) => {
    // Logic to get the id and redirect to chat page
    router.push(`/chat/${id}`);
  };

  useEffect(() => {
    const loadConversations = async () => {
      try {
        const res = await fetch("/api/auth/conversations");
        if (!res.ok)
          throw new Error("Network response was not ok, failed to fetch");
        const data = await res.json();
        setConversations(data?.conversations || []);
      } catch (error) {
        setError("Failed to load conversations.");
        console.error("Error fetching conversations:", error);
      } finally {
        setLoading(false);
      }
    };
    loadConversations();
  }, []);

  const handleNewConversation = async () => {
    const res = await fetch("/api/auth/conversations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title: "New Conversation", summary: "" }),
    });

    if (!res.ok) {
      setError("Failed to create a new conversation.");
      return;
    }

    const data = await res.json();

    router.push(`/chat/${data.conversation.id}`);
  };

  const handleDeleteConversation = async (id) => {
    const res = await fetch(`/api/auth/conversations/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      setError("Failed to delete conversation.");
      return;
    }

    setConversations((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="px-24 py-8 ">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-5 text-foreground">
          Conversations
        </h1>

        <Button variant="outline" onClick={() => handleNewConversation()}>
          <GoPlus className="" />
          New Conversation
        </Button>
      </div>

      <div className="mt-10 space-y-4 px-2">
        {loading && <p>Loading conversations...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && conversations.length === 0 && (
          <div
            className="flex flex-col justify-center items-center py-8 text-gray-500
                          min-h-[60vh]"
          >
            <MdChatBubbleOutline size={48} className="mb-4" />
            <p>No conversations found. Start a new one!</p>
          </div>
        )}

        {conversations.map((c) => (
          <div key={c.id}>
            <div className="border-1 shadow-sm rounded-lg p-5 hover:bg-gray-100 cursor-pointer hover:scale-[100.5%] transition duration-300">
              <div className="flex items-center">
                <div onClick={() => handleOpenConversation(c.id)} className="flex-5">
                  <h2 className="font-semibold text-2xl">{c.title}</h2>
                  <p className="text-gray-600">
                    {/* API does not return messages; show fallback */}
                    No messages yet
                  </p>
                </div>

                <div>
                  <button
                    onClick={() => handleDeleteConversation(c.id)}
                    className="px-2 py-1 border border-gray-300 shadow-sm bg-red-400 hover:bg-red-500
                 rounded-md transition duration-300 flex items-center justify-center z-100"
                  >
                    <MdDelete size={25} color="white" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default page;
