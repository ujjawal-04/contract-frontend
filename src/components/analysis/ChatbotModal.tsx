"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { Send } from "lucide-react";

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
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input field when modal opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [open]);

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
          // @ts-nocheck
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
      // @ts-nocheck
    } catch (error:any) {
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
        className="sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-3xl max-h-[90vh] p-0 rounded-lg overflow-hidden flex flex-col"
        style={{
          width: "95vw", 
          height: "90vh",
          maxWidth: "850px"
        }}
      >
        <DialogHeader className="p-3 sm:p-4 border-b flex items-center justify-between">
          <DialogTitle className="text-base sm:text-lg font-medium">Contract AI Assistant</DialogTitle>
          {/* <Button 
            onClick={onClose}
            variant="ghost" 
            size="icon"
            className="h-8 w-8 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button> */}
        </DialogHeader>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
          {chatHistory.map((item, index) => (
            <div
              key={index}
              className={`flex ${item.type === "user" ? "justify-end" : "justify-start"} w-full`}
            >
              <div
                className={`rounded-lg p-2 sm:p-3 text-xs sm:text-sm whitespace-pre-wrap break-words ${
                  item.type === "user"
                    ? "bg-blue-500 text-white ml-auto rounded-tr-none"
                    : "bg-gray-100 text-gray-800 mr-auto rounded-tl-none"
                }`}
                style={{ maxWidth: "85%" }}
              >
                {item.message}

                {/* Recommendations */}
                {item.type === "ai" &&
                  item.recommendations &&
                  item.recommendations.length > 0 && (
                    <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-200">
                      <div className="text-xs sm:text-sm font-medium mb-2">Follow-up suggestions:</div>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        {item.recommendations.map((question, idx) => (
                          <Button
                            key={idx}
                            variant="outline"
                            size="sm"
                            className="bg-white hover:bg-gray-50 text-gray-800 border-gray-200 text-xs sm:text-sm py-1 h-auto max-w-full truncate"
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
                className="rounded-lg p-2 sm:p-3 text-xs sm:text-sm bg-gray-100 text-gray-800 mr-auto rounded-tl-none"
                style={{ maxWidth: "85%" }}
              >
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce delay-0"></div>
                  <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce delay-150"></div>
                  <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce delay-300"></div>
                  <span className="ml-1 text-gray-500">Thinking...</span>
                </div>
              </div>
            </div>
          )}

          {/* Auto-scroll target */}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-3 sm:p-4 border-t">
          <div className="flex items-center gap-2 w-full">
            <input
              ref={inputRef}
              type="text"
              className="flex-1 h-9 sm:h-10 rounded-full border border-gray-300 px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
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
              className="rounded-full h-9 sm:h-10 px-3 sm:px-4 bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Send className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">Send</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatbotModal;