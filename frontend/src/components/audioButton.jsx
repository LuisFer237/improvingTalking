"use client";
import { useState, useRef } from "react";
import { Mic } from "lucide-react";
import { IoReloadOutline } from "react-icons/io5";

export function AudioButton({
  onTranscription,
  isRecording,
  setIsRecording,
  uploading,
  setUploading,
  assistantAnswering,
  setAssistantAnswering,
  assistantPreparingAudio,
  setAssistantPreparingAudio,
}) {
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [transcription, setTranscription] = useState("");
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const fastApiUrl = process.env.NEXT_PUBLIC_FAST_API_URL;

  const getSupportedMimeType = () => {
    const possibleTypes = ["audio/webm", "audio/mp4", "audio/wav"];
    return (
      possibleTypes.find((type) => MediaRecorder.isTypeSupported(type)) || ""
    );
  };

  const handleButtonClick = async () => {
    if (!isRecording) {
      if (
        typeof window === "undefined" ||
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        alert("Audio recording is not supported in this environment.");
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const mimeType = getSupportedMimeType();
        mediaRecorderRef.current = new MediaRecorder(
          stream,
          mimeType ? { mimeType } : undefined
        );
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorderRef.current.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, {
            type: mimeType || "audio/webm",
          });
          setAudioBlob(audioBlob);
          setAudioUrl(URL.createObjectURL(audioBlob));
          handleTranscribe(audioBlob);
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
      } catch (err) {
        alert("Could not access microphone. Please allow microphone access.");
        setIsRecording(false);
      }
    } else {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleTranscribe = async (blob) => {
    if (!blob) return;
    setUploading(true);
    setTranscription("");
    const formData = new FormData();
    formData.append("file", blob, "recording.webm");

    try {
      const res = await fetch(`${fastApiUrl}/transcribe`, {
        headers:{
          'bypass-tunnel-reminder': '1'
        },
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setTranscription(data.text || JSON.stringify(data));

      if (onTranscription) {
        onTranscription(data.text || "");
      }
    } catch (error) {
      console.error("Error transcribing audio:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      {assistantAnswering ? (
        <div
          className="relative flex items-center justify-center gap-3 w-56 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-purple-700 shadow-xl shadow-indigo-500/50 transition-all duration-500 ease-out"
        >
          {/* Ripple effect */}
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute inset-0 rounded-full border-2 border-indigo-400"
              style={{
                animation: `ripple 2s ease-out infinite ${i * 0.6}s`,
              }}
            />
          ))}
          <Volume2 className="w-10 h-10 text-white animate-pulse z-10" />
          <span className="text-lg font-medium text-white animate-pulse ml-4 z-10">
            Speaking...
          </span>
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
        <button
          onClick={handleButtonClick}
          className={`
            relative flex items-center justify-center gap-3
            transition-all duration-500 ease-out
            ${isRecording
              ? "w-56 h-16 rounded-full bg-emerald-500 hover:bg-emerald-600"
              : "w-20 h-20 rounded-full bg-black hover:bg-gray-900"}
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
          {isRecording && (
            <span className="text-sm font-medium text-white animate-pulse">
              Recording
            </span>
          )}
          <style jsx>{`
            @keyframes waveform {
              0%,
              100% {
                height: 8px;
              }
              50% {
                height: 32px;
              }
            }
            .animate-waveform {
              animation: waveform 0.8s ease-in-out infinite;
            }
          `}</style>
        </button>
      )}
      {/* Unified status message area */}
      <div style={{ minHeight: "32px" }} className="flex items-center gap-2 mt-5">
        {isRecording && <span className="text-gray-600">Recording...</span>}
        {uploading && (
          <>
            <IoReloadOutline className="animate-spin" />
            <span className="text-gray-600">Transcribing...</span>
          </>
        )}
        {assistantPreparingAudio && (
          <>
            <IoReloadOutline className="animate-spin" />
            <span className="text-gray-600">Preparing assistant response...</span>
          </>
        )}
      </div>
    </div>
  );
}
