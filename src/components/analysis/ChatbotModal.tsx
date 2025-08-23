"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { Send, Crown, Zap, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ChatbotModalProps {
  open: boolean;
  onClose: () => void;
  geminiApiKey: string | undefined;
  context: string;
  userPlan: "basic" | "premium" | "gold"; // Add user plan prop
}

const ChatbotModal: React.FC<ChatbotModalProps> = ({
  open,
  onClose,
  geminiApiKey,
  context,
  userPlan = "basic", // Default to basic plan
}) => {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{
    type: "user" | "ai";
    message: string;
    recommendations?: string[];
  }>>([
    {
      type: "ai",
      message: getWelcomeMessage(userPlan),
      recommendations: getInitialRecommendations(userPlan),
    },
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const [messageCount, setMessageCount] = useState(0);

  // Ref for auto-scrolling
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Plan limits
  const MESSAGE_LIMITS = {
    basic: 5,
    premium: 50,
    gold: Infinity
  };

  // Get welcome message based on user plan
  function getWelcomeMessage(plan: string): string {
    switch (plan) {
      case "gold":
        return "👑 Welcome to Gold AI Assistant! I can help you analyze, modify, and understand your contract in detail. What would you like to know?";
      case "premium":
        return "⭐ Hello! I'm your Premium contract analysis assistant. I can provide detailed insights about your contract. How can I help you today?";
      default:
        return "Hello! I'm your contract analysis assistant. I can help answer questions about your contract.";
    }
  }

  // Get initial recommendations based on user plan
  function getInitialRecommendations(plan: string): string[] {
    switch (plan) {
      case "gold":
        return [
          "Analyze key risks",
          "Suggest modifications",
          "Review clauses",
          "Compare standards",
          "Export summary"
        ];
      case "premium":
        return [
          "Explain key terms",
          "Identify risks",
          "Review obligations",
          "Suggest improvements"
        ];
      default:
        return [
          "What is this contract about?",
          "Are there any risks?",
          "Summary please"
        ];
    }
  }

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

  // Reset chat history and message count when modal opens
  useEffect(() => {
    if (open) {
      setChatHistory([
        {
          type: "ai",
          message: getWelcomeMessage(userPlan),
          recommendations: getInitialRecommendations(userPlan),
        },
      ]);
      setMessageCount(0);
    }
  }, [open, userPlan]);

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

    // Check message limits for non-Gold users
    if (userPlan !== "gold" && messageCount >= MESSAGE_LIMITS[userPlan]) {
      setChatHistory((prev) => [
        ...prev,
        { 
          type: "ai", 
          message: `You've reached your ${userPlan} plan limit of ${MESSAGE_LIMITS[userPlan]} messages. Upgrade to Gold for unlimited AI conversations!`, 
          recommendations: [] 
        },
      ]);
      return;
    }

    setChatHistory((prev) => [...prev, { type: "user", message: inputMessage }]);
    setMessage("");
    setIsThinking(true);
    setMessageCount(prev => prev + 1);

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
                    text: generatePrompt(inputMessage, context, userPlan),
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

  // Generate prompt based on user plan
  function generatePrompt(inputMessage: string, context: string, plan: string): string {
    const basePrompt = `You are a helpful legal assistant for contract review. Respond in the following JSON format:
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

User: ${inputMessage}`;

    if (plan === "gold") {
      return `${basePrompt}

As a GOLD assistant, provide:
- Comprehensive analysis with legal precedents
- Specific clause recommendations and modifications
- Risk assessment with impact levels
- Industry best practices comparison
- Actionable next steps

You have access to advanced features including contract modification suggestions and detailed legal analysis.`;
    }

    if (plan === "premium") {
      return `${basePrompt}

As a PREMIUM assistant, provide:
- Detailed contract analysis
- Risk identification with explanations
- Key terms clarification
- Basic improvement recommendations
- Professional insights

Focus on thorough explanations and practical advice.`;
    }

    return `${basePrompt}

As a BASIC assistant, provide:
- Simple, clear answers
- Basic contract information
- General guidance only
- Keep responses concise and accessible

Limit technical jargon and focus on easy-to-understand explanations.`;
  }

  // Get plan badge
  const getPlanBadge = () => {
    switch (userPlan) {
      case "gold":
        return (
          <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white border-0">
            <Crown className="h-3 w-3 mr-1" />
            Gold
          </Badge>
        );
      case "premium":
        return (
          <Badge className="bg-blue-600 text-white">
            <Zap className="h-3 w-3 mr-1" />
            Premium
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-700">
            Basic
          </Badge>
        );
    }
  };

  // Get remaining messages info
  const getRemainingMessages = () => {
    if (userPlan === "gold") return "Unlimited";
    const limit = MESSAGE_LIMITS[userPlan];
    const remaining = limit - messageCount;
    return `${remaining} of ${limit} remaining`;
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
        <DialogHeader className="p-3 sm:p-4 border-b flex flex-row items-center justify-between space-y-0">
          <div className="flex flex-col space-y-2">
            <DialogTitle className="text-base sm:text-lg font-medium">
              Contract AI Assistant
            </DialogTitle>
            <div className="flex items-center gap-2">
              {getPlanBadge()}
              <span className="text-xs text-gray-500">
                Messages: {getRemainingMessages()}
              </span>
            </div>
          </div>
        </DialogHeader>

        {/* Usage warning for non-Gold users approaching limit */}
        {userPlan !== "gold" && messageCount >= MESSAGE_LIMITS[userPlan] - 2 && messageCount < MESSAGE_LIMITS[userPlan] && (
          <div className="px-3 sm:px-4 py-2 bg-amber-50 border-b border-amber-200">
            <div className="flex items-center gap-2 text-amber-800">
              <Lock className="h-4 w-4" />
              <span className="text-xs sm:text-sm">
                {MESSAGE_LIMITS[userPlan] - messageCount} messages remaining. Upgrade to Gold for unlimited access!
              </span>
            </div>
          </div>
        )}

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

                {/* Recommendations with plan-specific styling */}
                {item.type === "ai" &&
                  item.recommendations &&
                  item.recommendations.length > 0 && (
                    <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-200">
                      <div className="text-xs sm:text-sm font-medium mb-2">
                        {userPlan === "gold" ? "Advanced suggestions:" : "Follow-up suggestions:"}
                      </div>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        {item.recommendations.map((question, idx) => (
                          <Button
                            key={idx}
                            variant="outline"
                            size="sm"
                            className={`${
                              userPlan === "gold" 
                                ? "bg-gradient-to-r from-yellow-50 to-amber-50 hover:from-yellow-100 hover:to-amber-100 text-yellow-800 border-yellow-200"
                                : userPlan === "premium"
                                ? "bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-200"
                                : "bg-white hover:bg-gray-50 text-gray-800 border-gray-200"
                            } text-xs sm:text-sm py-1 h-auto max-w-full truncate`}
                            onClick={() => handleSendMessage(question)}
                            disabled={userPlan !== "gold" && messageCount >= MESSAGE_LIMITS[userPlan]}
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
                  <span className="ml-1 text-gray-500">
                    {userPlan === "gold" ? "Analyzing..." : userPlan === "premium" ? "Processing..." : "Thinking..."}
                  </span>
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
              placeholder={
                userPlan !== "gold" && messageCount >= MESSAGE_LIMITS[userPlan]
                  ? "Message limit reached - Upgrade to Gold"
                  : "Ask your question..."
              }
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              disabled={isThinking || (userPlan !== "gold" && messageCount >= MESSAGE_LIMITS[userPlan])}
            />
            <Button
              onClick={() => handleSendMessage()}
              size="sm"
              disabled={isThinking || (userPlan !== "gold" && messageCount >= MESSAGE_LIMITS[userPlan])}
              className={`rounded-full h-9 sm:h-10 px-3 sm:px-4 ${
                userPlan === "gold"
                  ? "bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700"
                  : "bg-blue-500 hover:bg-blue-600"
              } text-white`}
            >
              <Send className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">Send</span>
            </Button>
          </div>
          
          {/* Plan upgrade hint for basic users */}
          {userPlan === "basic" && messageCount >= 3 && (
            <div className="mt-2 text-xs text-gray-500 text-center">
              💡 Upgrade to Premium or Gold for more advanced AI features and unlimited conversations
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatbotModal;