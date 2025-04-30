"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";

interface ChatbotModalProps {
  open: boolean;
  onClose: () => void;
  geminiApiKey: string | undefined;
  context: string;
}

const ChatbotModal: React.FC<ChatbotModalProps> = ({
  open,
  onClose,
  geminiApiKey,
  context,
}) => {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{
    type: "user" | "ai";
    message: string;
    recommendations?: string[];
  }>>([
    {
      type: "ai",
      message: "Hello! I'm your contract analysis assistant.",
      recommendations: [],
    },
  ]);
  const [isThinking, setIsThinking] = useState(false);

  // Ref for auto-scrolling
  const bottomRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever chat updates
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isThinking]);

  const handleSendMessage = async (customMessage?: string) => {
    const inputMessage = customMessage || message;

    if (!inputMessage.trim() || !geminiApiKey) {
      if (!geminiApiKey) {
        setChatHistory((prev) => [
          ...prev,
          { type: "ai", message: "Error: Gemini API key not provided.", recommendations: [] },
        ]);
      }
      return;
    }

    setChatHistory((prev) => [...prev, { type: "user", message: inputMessage }]);
    setMessage("");
    setIsThinking(true);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are a helpful legal assistant for contract review. Respond in the following JSON format:
{
  "answer": "string",
  "recommendations": ["short question", "short question", ...]
}

Guidelines:
- Keep recommended questions short (max 8 words).
- Be concise and use plain language.
- Only include relevant, logical follow-up questions.

Context:
${context}

User: ${inputMessage}`,
                  },
                ],
              },
            ],
          }),
        }
      );

      const data = await response.json();
      const textResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (textResponse) {
        const cleanedText = textResponse
          .replace(/```(?:json)?/g, "")
          .replace(/```/g, "")
          .trim();

        try {
          const parsed = JSON.parse(cleanedText);
          if (parsed.answer) {
            setChatHistory((prev) => [
              ...prev,
              {
                type: "ai",
                message: parsed.answer,
                recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
              },
            ]);
          }
        } catch (e) {
          setChatHistory((prev) => [
            ...prev,
            { type: "ai", message: cleanedText, recommendations: [] },
          ]);
        }
      } else if (data?.error?.message) {
        setChatHistory((prev) => [
          ...prev,
          { type: "ai", message: `Error: ${data.error.message}`, recommendations: [] },
        ]);
      } else {
        setChatHistory((prev) => [
          ...prev,
          { type: "ai", message: "Error: Could not retrieve response.", recommendations: [] },
        ]);
      }
    } catch (error: any) {
      console.error("Error calling Gemini API:", error);
      setChatHistory((prev) => [
        ...prev,
        {
          type: "ai",
          message: `Error: ${error.message || "Something went wrong."}`,
          recommendations: [],
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
  className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl w-[70vw] rounded-md border bg-white p-6 shadow-lg fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
>
        <div className="absolute right-4 top-4" style={{ display: "none" }}>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <DialogHeader className="p-0 pb-4 pt-2">
          <DialogTitle>AI Chat</DialogTitle>
        </DialogHeader>

        {/* Chat History */}
        <div className="py-4 overflow-y-auto h-96 space-y-4 pr-2">
          {chatHistory.map((item, index) => (
            <div
              key={index}
              className={`flex ${item.type === "user" ? "justify-end" : "justify-start"} w-full`}
            >
              <div
                className={`rounded-lg p-3 text-sm max-w-3/4 whitespace-pre-wrap break-words ${
                  item.type === "user"
                    ? "bg-blue-500 text-white ml-auto rounded-tr-none"
                    : "bg-gray-100 text-gray-800 mr-auto rounded-tl-none"
                }`}
                style={{ maxWidth: "75%" }}
              >
                {item.message}

                {/* Recommendations */}
                {item.type === "ai" &&
                  item.recommendations &&
                  item.recommendations.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="text-sm font-medium mb-2">Follow-up suggestions:</div>
                      <div className="flex flex-wrap gap-2">
                        {item.recommendations.map((question, idx) => (
                          <Button
                            key={idx}
                            variant="outline"
                            size="sm"
                            className="bg-white hover:bg-gray-50 text-gray-800 border-gray-200 max-w-full truncate"
                            onClick={() => handleSendMessage(question)}
                          >
                            {question}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          ))}
          {isThinking && (
            <div className="flex justify-start w-full">
              <div
                className="rounded-lg p-3 text-sm bg-gray-100 text-gray-800 mr-auto rounded-tl-none animate-pulse"
                style={{ maxWidth: "75%" }}
              >
                Thinking...
              </div>
            </div>
          )}

          {/* 👇 Auto-scroll target */}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="flex items-center space-x-2 mt-4 w-full overflow-hidden">
          <input
            type="text"
            className="w-full rounded-full border border-gray-300 px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Ask your question..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            disabled={isThinking}
          />
          <Button
            onClick={() => handleSendMessage()}
            size="sm"
            disabled={isThinking}
            className="rounded-full bg-blue-500 hover:bg-blue-600"
          >
            Send
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatbotModal;
