import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "lucide-react";

export default function ChatLayout({ children }) {
  return (
    <div className="min-h-screen bg-background">
      <nav className="flex justify-between items-center border-b border-border bg-card px-4 py-3 shadow-sm md:px-6 lg:px-8">
        <div className="flex items-center gap-2 font-bold text-lg md:text-xl text-foreground">
          <Image
            src="/logo.png"
            alt="Logo"
            width={40}
            height={40}
            className="rounded-full"
          />
          <span className="hidden sm:inline">Improving Talking</span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-full">
            <div className="flex items-center justify-center size-10 rounded-full border border-border bg-muted shadow-sm hover:bg-muted/80 transition-colors">
              <User className="size-5 text-muted-foreground" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuItem>Team</DropdownMenuItem>
            <DropdownMenuItem>Subscription</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>

      <main>{children}</main>
    </div>
  );
}