import React from "react";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FaUser } from "react-icons/fa6";

const layout = ({ children }) => {
  return (
    <div>
      <div className="flex justify-between items-center border-1 py-5 px-15 shadow-sm">
        <div className="font-bold text-xl  flex gap-2 items-center">
          <Image src="/logo.png" alt="Logo" width={40} height={40} className="rounded-full"/>
            Improving Talking
        </div>
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger >
              <div className=" border-1 border-gray-400 bg-gray-500 shadow-sm rounded-full size-10 flex items-center justify-center">
                <FaUser size={20} />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Billing</DropdownMenuItem>
              <DropdownMenuItem>Team</DropdownMenuItem>
              <DropdownMenuItem>Subscription</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
};

export default layout;
