"use client"

import { useState } from "react"
import { Mic } from "lucide-react"

export function AudioButton() {
  const [isRecording, setIsRecording] = useState(false)

  return (
    <button
      onClick={() => setIsRecording(!isRecording)}
      className={`
        relative flex items-center justify-center gap-3
        transition-all duration-500 ease-out
        ${
          isRecording
            ? "w-56 h-16 rounded-full bg-emerald-500 hover:bg-emerald-600"
            : // Changed inactive state to black
              "w-20 h-20 rounded-full bg-black hover:bg-gray-900"
        }
      `}
      aria-label={isRecording ? "Stop recording" : "Start recording"}
    >
      {isRecording && (
        <div className="flex items-center gap-1 h-8">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-1 rounded-full bg-white animate-waveform"
              style={{
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Microphone icon */}
      <Mic
        className={`
          text-white transition-all duration-500
          ${isRecording ? "w-5 h-5" : "w-6 h-6"}
        `}
      />

      {/* Recording text */}
      {isRecording && <span className="text-sm font-medium text-white animate-pulse">Recording</span>}

      <style jsx>{`
        @keyframes waveform {
          0%, 100% { height: 8px; }
          50% { height: 32px; }
        }
        .animate-waveform {
          animation: waveform 0.8s ease-in-out infinite;
        }
      `}</style>
    </button>
  )
}
