"use client";

import React, { JSX } from "react";
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
  userPlan: "basic" | "premium" | "gold";
}

interface ChatMessage {
  type: "user" | "ai";
  message: string;
  recommendations?: string[];
  timestamp?: Date;
}

// Component for formatting AI responses with proper structure
const FormattedMessage = ({ message, userPlan }: { message: string; userPlan: string }): JSX.Element => {
  // Function to format the message with proper structure
  const formatMessage = (text: string): JSX.Element[] => {
    // First, let's handle the text line by line for better control
    const lines = text.split('\n');
    const formattedElements: JSX.Element[] = [];
    
    let currentIndex = 0;
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Skip empty lines
      if (!trimmedLine) return;
      
      // Handle triple asterisk headers (***text***)
      if (trimmedLine.match(/^\*\*\*.*\*\*\*$/)) {
        const headerText = trimmedLine.replace(/^\*\*\*|\*\*\*$/g, '');
        formattedElements.push(
          <div key={currentIndex++} className={`font-bold mt-4 mb-2 first:mt-0 ${
            userPlan === 'gold' ? 'text-yellow-800' : 
            userPlan === 'premium' ? 'text-blue-800' : 'text-gray-800'
          }`}>
            {headerText}
          </div>
        );
        return;
      }
      
      // Handle bullet points starting with • followed by **text**
      if (trimmedLine.startsWith('•')) {
        // Remove the bullet and get the rest
        const content = trimmedLine.substring(1).trim();
        
        // Check if the content has **text** pattern
        if (content.match(/^\*\*.*\*\*/)) {
          const parts = content.split(/(\*\*[^*]+\*\*)/);
          formattedElements.push(
            <div key={currentIndex++} className="ml-4 mb-2 flex items-start">
              <span className={`mr-3 mt-1 flex-shrink-0 ${
                userPlan === 'gold' ? 'text-yellow-600' : 
                userPlan === 'premium' ? 'text-blue-600' : 'text-gray-600'
              }`}>•</span>
              <div>
                {parts.map((part, partIndex) => {
                  if (part.startsWith('**') && part.endsWith('**')) {
                    const boldText = part.replace(/^\*\*|\*\*$/g, '');
                    return (
                      <span key={partIndex} className="font-semibold text-gray-900">
                        {boldText}
                      </span>
                    );
                  }
                  return <span key={partIndex}>{part}</span>;
                })}
              </div>
            </div>
          );
        } else {
          // Regular bullet point
          formattedElements.push(
            <div key={currentIndex++} className="ml-4 mb-2 flex items-start">
              <span className={`mr-3 mt-1 flex-shrink-0 ${
                userPlan === 'gold' ? 'text-yellow-600' : 
                userPlan === 'premium' ? 'text-blue-600' : 'text-gray-600'
              }`}>•</span>
              <span>{content}</span>
            </div>
          );
        }
        return;
      }
      
      // Handle double asterisk bold text (**text**)
      if (trimmedLine.includes('**')) {
        const parts = trimmedLine.split(/(\*\*[^*]+\*\*)/);
        formattedElements.push(
          <div key={currentIndex++} className="mb-2">
            {parts.map((part, partIndex) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                const boldText = part.replace(/^\*\*|\*\*$/g, '');
                return (
                  <span key={partIndex} className="font-semibold text-gray-900">
                    {boldText}
                  </span>
                );
              }
              return <span key={partIndex}>{part}</span>;
            })}
          </div>
        );
        return;
      }
      
      // Handle numbered lists
      if (/^\d+\./.test(trimmedLine)) {
        formattedElements.push(
          <div key={currentIndex++} className="ml-4 mb-2">
            {trimmedLine}
          </div>
        );
        return;
      }
      
      // Regular paragraphs
      formattedElements.push(
        <div key={currentIndex++} className="mb-2">
          {trimmedLine}
        </div>
      );
    });

    return formattedElements;
  };

  return <div>{formatMessage(message)}</div>;
};

const ChatbotModal: React.FC<ChatbotModalProps> = ({
  open,
  onClose,
  geminiApiKey,
  context,
  userPlan = "basic",
}) => {
  // Plan limits
  const MESSAGE_LIMITS = {
    basic: 5,
    premium: 15, // Changed from 50 to 15
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
          "Identify main risks",
          "Review obligations", 
          "Suggest improvements",
          "Check compliance issues",
          "Clarify payment terms"
        ];
      default:
        return [
          "What is this contract about?",
          "Are there any risks?",
          "Summary please"
        ];
    }
  }

  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      type: "ai",
      message: getWelcomeMessage(userPlan),
      recommendations: getInitialRecommendations(userPlan),
      timestamp: new Date(),
    },
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const [messageCount, setMessageCount] = useState(0);

  // Refs for auto-scrolling and input focus
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

  // Reset chat history and message count when modal opens
  useEffect(() => {
    if (open) {
      setChatHistory([
        {
          type: "ai",
          message: getWelcomeMessage(userPlan),
          recommendations: getInitialRecommendations(userPlan),
          timestamp: new Date(),
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
          { 
            type: "ai", 
            message: "Error: Gemini API key not provided.", 
            recommendations: [],
            timestamp: new Date()
          },
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
          recommendations: ["Upgrade to Gold"],
          timestamp: new Date()
        },
      ]);
      return;
    }

    // Add user message
    setChatHistory((prev) => [...prev, { 
      type: "user", 
      message: inputMessage,
      timestamp: new Date()
    }]);
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
        // Clean the response text
        const cleanedText = textResponse
          .replace(/```(?:json)?/g, "")
          .replace(/```/g, "")
          .trim();

        let aiMessage: ChatMessage;

        try {
          // Try to parse as JSON
          const parsed = JSON.parse(cleanedText);
          
          aiMessage = {
            type: "ai",
            message: parsed.answer || parsed.message || cleanedText,
            recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
            timestamp: new Date()
          };
        } catch (e) {
          // If JSON parsing fails, use the cleaned text as is
          aiMessage = {
            type: "ai",
            message: cleanedText,
            recommendations: [],
            timestamp: new Date()
          };
        }

        setChatHistory((prev) => [...prev, aiMessage]);

      } else if (data?.error?.message) {
        setChatHistory((prev) => [
          ...prev,
          { 
            type: "ai", 
            message: `Error: ${data.error.message}`, 
            recommendations: ["Try again", "Ask differently"],
            timestamp: new Date()
          },
        ]);
      } else {
        setChatHistory((prev) => [
          ...prev,
          { 
            type: "ai", 
            message: "Error: Could not retrieve response.", 
            recommendations: ["Try again", "Check connection"],
            timestamp: new Date()
          },
        ]);
      }
    } catch (error: any) {
      console.error("Error calling Gemini API:", error);
      setChatHistory((prev) => [
        ...prev,
        {
          type: "ai",
          message: `Error: ${error.message || "Something went wrong."}`,
          recommendations: ["Try again", "Check connection"],
          timestamp: new Date()
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
  "answer": "string - your detailed response here",
  "recommendations": ["short question", "short question", ...]
}

Guidelines:
- Keep recommended questions short (max 8 words).
- Be concise and use plain language.
- Only include relevant, logical follow-up questions.
- Provide clear, actionable answers.

Context:
${context}

User: ${inputMessage}`;

    if (plan === "gold") {
      return `${basePrompt}

As a GOLD assistant, provide comprehensive analysis with proper formatting:

**Direct Answer:** [Answer the specific question in detail]

**Comprehensive Analysis:**
• [Analysis point 1]
• [Analysis point 2]
• [Analysis point 3]
• [Analysis point 4]

**Legal Precedents:** [If applicable]
• [Precedent 1]
• [Precedent 2]

**Risk Assessment with Impact Levels:**
• **High Risk:** [Description]
• **Medium Risk:** [Description]
• **Low Risk:** [Description]

**Detailed Recommendations:**
• [Specific recommendation 1]
• [Specific recommendation 2]
• [Specific recommendation 3]
• [Specific recommendation 4]

**Industry Best Practices:**
• [Practice 1]
• [Practice 2]

**Actionable Next Steps:**
• [Step 1]
• [Step 2]
• [Step 3]

You have unlimited scope - provide detailed legal analysis, precedents, industry comparisons, and specific clause modifications as needed.`;
    }

    if (plan === "premium") {
      return `${basePrompt}

As a PREMIUM assistant, provide SPECIFIC answers to the user's question. Do NOT give generic responses. 

Structure your response as follows:
**Direct Answer:** [Answer the specific question asked]

**Key Points:**
• [Point 1]
• [Point 2] 
• [Point 3]

**Risk/Considerations:**
• [Risk 1]
• [Risk 2]

**Recommendations:**
• [Recommendation 1]
• [Recommendation 2]
• [Recommendation 3]

Guidelines:
- Answer the EXACT question asked, not generic contract analysis
- Use bullet points and proper formatting
- Keep each section concise (2-3 points maximum)
- Focus on actionable insights
- Limit total response to 250-350 words
- If asked about obligations, focus ONLY on obligations
- If asked about risks, focus ONLY on risks
- If asked about specific terms, explain ONLY those terms`;
    }

    return `${basePrompt}

As a BASIC assistant, provide simple answers with basic formatting:

**Answer:** [Simple, direct answer to the question]

**Key Points:**
• [Point 1 - simple explanation]
• [Point 2 - simple explanation]

**What This Means:**
[Explain in simple terms what this means for the user]

**Basic Suggestion:**
[One simple recommendation]

Guidelines:
- Use simple language anyone can understand
- Answer the specific question asked
- Keep total response under 150 words
- No legal jargon or complex analysis
- Focus on practical, easy-to-understand explanations`;
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

  // Format timestamp
  const formatTime = (timestamp?: Date) => {
    if (!timestamp) return "";
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-4xl max-h-[90vh] p-0 rounded-lg overflow-hidden flex flex-col"
        style={{
          width: "95vw", 
          height: "90vh",
          maxWidth: "900px"
        }}
      >
        <DialogHeader className={`p-4 border-b ${
          userPlan === "gold" 
            ? "bg-gradient-to-r from-yellow-50 to-amber-50" 
            : userPlan === "premium" 
            ? "bg-gradient-to-r from-blue-50 to-indigo-50"
            : "bg-gray-50"
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg font-semibold mb-1">
                Contract AI Assistant
              </DialogTitle>
              <div className="flex items-center gap-3">
                {getPlanBadge()}
                <span className={`text-sm font-medium ${
                  userPlan === "gold" ? "text-yellow-700" :
                  userPlan === "premium" ? "text-blue-700" : "text-gray-700"
                }`}>
                  Messages: {getRemainingMessages()}
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Usage warning for non-Gold users approaching limit */}
        {userPlan !== "gold" && messageCount >= MESSAGE_LIMITS[userPlan] - 2 && messageCount < MESSAGE_LIMITS[userPlan] && (
          <div className="px-4 py-2 bg-amber-50 border-b border-amber-200">
            <div className="flex items-center gap-2 text-amber-800">
              <Lock className="h-4 w-4" />
              <span className="text-sm">
                {MESSAGE_LIMITS[userPlan] - messageCount} messages remaining. Upgrade to Gold for unlimited access!
              </span>
            </div>
          </div>
        )}

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {chatHistory.map((item, index) => (
            <div
              key={index}
              className={`flex ${item.type === "user" ? "justify-end" : "justify-start"} w-full`}
            >
              <div className={`max-w-[85%] ${item.type === "user" ? "ml-12" : "mr-12"}`}>
                <div
                  className={`rounded-lg p-3 shadow-sm ${
                    item.type === "user"
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-tr-sm"
                      : "bg-white text-gray-800 border border-gray-200 rounded-tl-sm"
                  }`}
                >
                  {/* Message content with proper formatting */}
                  <div className="text-sm leading-relaxed">
                    <FormattedMessage message={item.message} userPlan={userPlan} />
                  </div>
                  
                  {/* Timestamp */}
                  <div className={`text-xs mt-2 opacity-70 ${
                    item.type === "user" ? "text-blue-100" : "text-gray-500"
                  }`}>
                    {formatTime(item.timestamp)}
                  </div>

                  {/* Recommendations with plan-specific styling */}
                  {item.type === "ai" &&
                    item.recommendations &&
                    item.recommendations.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="text-sm font-medium mb-2 flex items-center gap-1">
                          {userPlan === "gold" && <Crown className="h-3 w-3 text-yellow-600" />}
                          {userPlan === "premium" && <Zap className="h-3 w-3 text-blue-600" />}
                          <span className={
                            userPlan === "gold" 
                              ? "text-yellow-700" 
                              : userPlan === "premium" 
                              ? "text-blue-700" 
                              : "text-gray-700"
                          }>
                            {userPlan === "gold" ? "Advanced suggestions:" : "Follow-up suggestions:"}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
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
                              } text-xs py-1 h-auto rounded-full transition-all duration-200 hover:scale-105`}
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
            </div>
          ))}

          {/* Thinking indicator */}
          {isThinking && (
            <div className="flex justify-start w-full">
              <div className="max-w-[85%] mr-12">
                <div className="rounded-lg p-3 bg-white border border-gray-200 rounded-tl-sm shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className={`h-2 w-2 ${
                        userPlan === "gold" ? "bg-yellow-500" : "bg-blue-500"
                      } rounded-full animate-bounce delay-0`}></div>
                      <div className={`h-2 w-2 ${
                        userPlan === "gold" ? "bg-yellow-500" : "bg-blue-500"
                      } rounded-full animate-bounce delay-150`}></div>
                      <div className={`h-2 w-2 ${
                        userPlan === "gold" ? "bg-yellow-500" : "bg-blue-500"
                      } rounded-full animate-bounce delay-300`}></div>
                    </div>
                    <span className="text-sm text-gray-600">
                      {userPlan === "gold" ? "Analyzing..." : userPlan === "premium" ? "Processing..." : "Thinking..."}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Auto-scroll target */}
          <div ref={bottomRef} />
        </div>

        {/* Input section */}
        <div className="p-4 border-t bg-white">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                className={`w-full h-12 rounded-full border-2 px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 transition-all duration-200 ${
                  userPlan === "gold"
                    ? "border-yellow-200 focus:border-yellow-400 focus:ring-yellow-100"
                    : "border-gray-200 focus:border-blue-400 focus:ring-blue-100"
                }`}
                placeholder={
                  userPlan !== "gold" && messageCount >= MESSAGE_LIMITS[userPlan]
                    ? "Message limit reached - Upgrade to Gold"
                    : userPlan === "gold"
                    ? "Ask your Gold AI assistant anything about your contract..."
                    : "Ask your question..."
                }
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                disabled={isThinking || (userPlan !== "gold" && messageCount >= MESSAGE_LIMITS[userPlan])}
              />
            </div>
            <Button
              onClick={() => handleSendMessage()}
              size="lg"
              disabled={isThinking || !message.trim() || (userPlan !== "gold" && messageCount >= MESSAGE_LIMITS[userPlan])}
              className={`rounded-full h-12 px-6 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 ${
                userPlan === "gold"
                  ? "bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white"
                  : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
              }`}
            >
              <Send className="h-4 w-4 mr-2" />
              <span>Send</span>
            </Button>
          </div>
          
          {/* Plan-specific hint */}
          <div className="mt-2 text-xs text-center">
            {userPlan === "gold" && (
              <span className="text-yellow-700">
                ✨ Gold AI can analyze risks, suggest modifications, and provide detailed contract insights
              </span>
            )}
            {userPlan === "premium" && (
              <span className="text-blue-700">
                ⭐ Premium AI provides detailed contract analysis and professional insights
              </span>
            )}
            {userPlan === "basic" && messageCount >= 3 && (
              <span className="text-gray-500">
                💡 Upgrade to Premium or Gold for more advanced AI features and unlimited conversations
              </span>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatbotModal;