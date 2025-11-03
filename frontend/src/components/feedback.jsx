import React, { useEffect, useState, useRef } from "react";
import { Button } from "./ui/button";

const Feedback = ({ messages, conversation, refetchMessages }) => {
  const [generating, setGenerating] = useState(false);
  const [feedbacks, setFeedbacks] = useState({});
  const feedbackEndRef = useRef(null);

  const messagesWithoutFeedback = messages.filter(
    (msg) => !msg.feedback && msg.sender === "user"
  );

  useEffect(() => {
    if (feedbackEndRef.current) {
      feedbackEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [feedbacks]);

  const generateFeedback = async () => {
    setGenerating(true);
    try {
      for (const msg of messagesWithoutFeedback) {
        // Filter messages from the same conversation
        const conversationMessages = messages
          .filter((m) => m.conversationId === msg.conversationId)
          .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

        // Get the last 4 messages before the current one, plus the current one
        const index = conversationMessages.findIndex((m) => m.id === msg.id);
        const lastMessages = [
          ...conversationMessages.slice(Math.max(0, index - 4), index),
          msg,
        ];

        // Format last messages as plain text to include in the prompt
        const formattedHistory = lastMessages
          .map(
            (m) => `${m.sender === "user" ? "User" : "AI"}: ${m.content.trim()}`
          )
          .join("\n");

        // Build the full prompt with embedded conversation history
        const prompt = `
You are a friendly and helpful English tutor.

Below is the recent conversation between a learner and you:
${formattedHistory}

Your task is to analyze the **last user message** from this conversation.

Provide your response strictly in JSON format with the following structure:

{
  "improved_sentence": "A more natural or grammatically correct version of the user's sentence.",
  "detailed_feedback": "A longer explanation describing grammar, phrasing, and vocabulary improvements. Be encouraging and easy to understand."
}

Example:
Input: "He go to school every day."
Output:
{
  "improved_sentence": "He goes to school every day.",
  "detailed_feedback": "The verb 'go' must agree with the third person singular ('he'), so it changes to 'goes'. Overall, your sentence is clear and simple — great job!"
}

Now, analyze the last user message and return only the JSON response with no extra text.
      `;

        // Build payload (no message history here — it's now inside the prompt)
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_LM_STUDIO_SERVER_URL}/v1/chat/completions`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              messages: [
                {
                  role: "system",
                  content: prompt,
                },
              ],
            }),
          }
        );

        const data = await res.json();

        // Save feedback in DB
        await fetch(`/api/auth/messages/${msg.id}/feedback`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            feedback:
              data.choices?.[0]?.message?.content || "No feedback generated.",
          }),
        });

        setFeedbacks((prev) => ({
          ...prev,
          [msg.id]:
            data.choices?.[0]?.message?.content || "No feedback generated.",
        }));
      }

      if (refetchMessages) refetchMessages();
    } catch (error) {
      console.error("Error generating feedback:", error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="flex flex-col border border-border shadow-lg rounded-lg overflow-hidden">
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-border">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
              Feedback Space
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-1.5">
              Check out feedback about your conversations
            </p>
          </div>
          <Button
            onClick={generateFeedback}
            disabled={generating || messagesWithoutFeedback.length === 0}
          >
            {generating ? "Generating..." : "Generate Feedback"}
          </Button>
        </div>
      </div>
      <div className="flex-1 flex flex-col min-h-0 p-4 sm:p-6">
        <div className="flex-1 rounded-lg border border-border bg-muted/50 p-3 sm:p-4 overflow-y-auto max-h-[400px] space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className="bg-background border border-border rounded-lg p-4"
            >
              {/* Original message section */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                  Your Message
                </p>
                <p className="text-foreground text-sm leading-relaxed bg-muted/40 p-3 rounded border border-border/50">
                  {msg.content}
                </p>
              </div>

              {/* Feedback section */}
              <div className="space-y-3">
                {(() => {
                  const feedback = msg.feedback || feedbacks[msg.id];
                  if (!feedback)
                    return (
                      <div className="text-sm text-muted-foreground italic py-2">
                        No feedback yet
                      </div>
                    );
                  try {
                    const parsed = JSON.parse(feedback);
                    return (
                      <>
                        {/* Improved sentence */}
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                            Improved Version
                          </p>
                          <p className="text-sm text-foreground bg-green-500/10 border border-green-500/30 rounded p-3 leading-relaxed">
                            {parsed.improved_sentence}
                          </p>
                        </div>

                        {/* Detailed feedback */}
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                            Detailed Feedback
                          </p>
                          <p className="text-sm text-foreground leading-relaxed bg-blue-500/10 border border-blue-500/30 rounded p-3">
                            {parsed.detailed_feedback}
                          </p>
                        </div>
                      </>
                    );
                  } catch {
                    // If feedback is not valid JSON, show as plain text
                    return (
                      <div className="text-sm text-foreground leading-relaxed bg-muted p-3 rounded border border-border/50">
                        {feedback}
                      </div>
                    );
                  }
                })()}
              </div>
            </div>
          ))}
          <div ref={feedbackEndRef} />
        </div>
      </div>
    </div>
  );
};

export default Feedback;
