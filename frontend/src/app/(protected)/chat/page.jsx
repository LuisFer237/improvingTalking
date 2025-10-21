import { AudioButton } from "@/components/audioButton"
import { Mic } from "lucide-react"

const Page = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 h-screen flex flex-col">
        <h1 className="font-bold text-4xl mb-6 text-foreground">Conversation Topic</h1>

        {/* Main Flex Layout - responsive grid on mobile, flex on desktop */}
        <div className="flex flex-col lg:flex-row flex-1 gap-6 overflow-hidden">
          {/* Left: Chatting Space */}
          <div className="flex-1 lg:flex-[5] flex flex-col border shadow-lg rounded-lg p-4">
            <div className="px-6 py-4">
              <h2 className="text-2xl font-semibold">Chatting Space</h2>
              <p className="text-sm text-muted-foreground mt-1.5">Click the button to start chatting with voice</p>
            </div>
            <div className="flex-1 flex flex-col px-6 pb-6">
              <div className="flex justify-center items-center flex-1 bg-muted/50 rounded-lg border-2 border-dashed border-border">
                <AudioButton />
              </div>
            </div>
          </div>

          {/* Right: Conversation History */}
          <div className="flex-1 lg:flex-[4] flex flex-col border shadow-lg rounded-lg p-4">
            <div className="px-6 py-4">
              <h2 className="text-2xl font-semibold">Conversation History</h2>
              <p className="text-sm text-muted-foreground mt-1.5">See what you talked about</p>
            </div>
            <div className="flex-1 flex flex-col min-h-0 px-6 pb-6">
              <div className="flex-1 rounded-lg border bg-muted/30 p-4">
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="rounded-full bg-muted p-4 mb-4">
                    <Mic className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground text-sm">No conversations yet</p>
                  <p className="text-muted-foreground text-xs mt-1">Start chatting to see your history here</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Page