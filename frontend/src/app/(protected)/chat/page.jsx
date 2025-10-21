import React from "react";
import { button } from "@/components/ui/button";
import { FaMicrophone } from "react-icons/fa";

const Page = () => {
  return (
    <div className="w-screen h-screen overflow-hidden">
      <div className="px-10 py-8 h-full flex flex-col">
        <h1 className="font-bold text-4xl italic mb-6">Chat Page</h1>

        {/* Main Flex Layout - flex-1 makes it take remaining space */}
        <div className="flex flex-1 gap-5 w-full overflow-hidden">
          {/* Left: Chatting Space */}
          <div className="flex-[5] border border-gray-500 shadow-sm rounded-lg p-5 ">
            <h2 className="font-semibold text-2xl mb-5">Chatting space</h2>
            <p className="text-gray-400 mb-4">
              Click the button to start chatting.
            </p>
            <div className="flex justify-center items-center h-full">
              <div className="bg-gray-100 size-30 rounded-full flex justify-center items-center animate-pulse">
                <FaMicrophone color="black" size={35} className="" />
              </div>
            </div>
          </div>

          {/* Right: Chat with User */}
          <div className="flex-[4] border border-gray-500 shadow-sm rounded-lg p-5 flex flex-col overflow-y-auto">
            <h2 className="font-semibold text-2xl mb-5">
              Conversation History
            </h2>
            <p className="text-gray-600 mb-3">See what you talked about</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
