"use client";

import React from "react";
import button from "@/components/ui/button";
import { MdDelete } from "react-icons/md";
import tooltip from "@/components/ui/tooltip";
import { useRouter } from "next/navigation";

const page = () => {
  const router = useRouter();

  const handleOpenConversation = (id) => {
    // Logic to get the id and redirect to chat page

    router.push(`/chat`);
  };

  return (
    <div className="px-10 py-8 ">
      <h1 className="font-bold text-5xl ms-5 italic">Conversations</h1>

      <div className="mt-10 space-y-4 px-5">
        {/* List of conversations will go here */}
        <div>
          <div
            onClick={handleOpenConversation}
            className="border-1 shadow-sm rounded-lg p-5 hover:bg-gray-600 cursor-pointer hover:scale-[100.5%] transition duration-300"
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-semibold text-2xl">Conversation 1</h2>
                <p className="text-gray-600">
                  This is a brief preview of the conversation...
                </p>
              </div>
              
              <div>
                <button
                  className="px-2 py-1 border border-gray-300 shadow-sm bg-red-400 hover:bg-red-500
                 rounded-md transition duration-300 flex items-center justify-center"
                >
                  <MdDelete size={25} color="white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
