import React from "react";
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
        <div>
            
        </div>
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger >
              <div className=" border-1 shadow-sm rounded-full size-10 flex items-center justify-center">
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
