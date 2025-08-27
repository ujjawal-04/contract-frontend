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
import { Send, Crown, Zap, Lock, FileText, Clock, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ChatbotModalProps {
  open: boolean;
  onClose: () => void;
  geminiApiKey: string | undefined;
  context: string;
  userPlan: "basic" | "premium" | "gold";
  contractTitle?: string;
  contractType?: string;
}

interface ChatMessage {
  type: "user" | "ai";
  message: string;
  recommendations?: string[];
  timestamp?: Date;
}

// Enhanced component for formatting AI responses with proper structure
const FormattedMessage = ({ message }: { message: string }) => {
  const formatMessage = (text: string) => {
    const lines = text.split('\n');
    const formattedElements: JSX.Element[] = [];
    let currentIndex = 0;
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;
      
      // Handle main headers with ###
      if (trimmedLine.startsWith('###')) {
        const headerText = trimmedLine.replace(/^###\s*/, '');
        formattedElements.push(
          <div key={currentIndex++} className="font-bold text-lg mt-6 mb-3 first:mt-2 border-b pb-2 text-blue-800 border-blue-200">
            {headerText}
          </div>
        );
        return;
      }
      
      // Handle triple asterisk headers (***text***)
      if (trimmedLine.match(/^\*\*\*.*\*\*\*$/)) {
        const headerText = trimmedLine.replace(/^\*\*\*|\*\*\*$/g, '');
        formattedElements.push(
          <div key={currentIndex++} className="font-bold text-blue-800 mt-4 mb-2 first:mt-0">
            {headerText}
          </div>
        );
        return;
      }
      
      // Handle bullet points starting with • followed by **text**
      if (trimmedLine.startsWith('•')) {
        const content = trimmedLine.substring(1).trim();
        
        if (content.match(/^\*\*.*\*\*/)) {
          const parts = content.split(/(\*\*[^*]+\*\*)/);
          formattedElements.push(
            <div key={currentIndex++} className="ml-4 mb-3 flex items-start">
              <span className="text-blue-600 mr-3 mt-1 flex-shrink-0">•</span>
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
          formattedElements.push(
            <div key={currentIndex++} className="ml-4 mb-3 flex items-start">
              <span className="text-blue-600 mr-3 mt-1 flex-shrink-0">•</span>
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
          <div key={currentIndex++} className="mb-3 leading-relaxed">
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
          <div key={currentIndex++} className="ml-4 mb-2 leading-relaxed">
            {trimmedLine}
          </div>
        );
        return;
      }
      
      // Regular paragraphs
      formattedElements.push(
        <div key={currentIndex++} className="mb-3 leading-relaxed">
          {trimmedLine}
        </div>
      );
    });

    return formattedElements;
  };

  return <div className="text-sm">{formatMessage(message)}</div>;
};

const ChatbotModal: React.FC<ChatbotModalProps> = ({
  open,
  onClose,
  geminiApiKey,
  context,
  userPlan = "basic",
  contractTitle = "Your Contract",
  contractType = "Contract"
}) => {
  // Plan limits - CRITICAL: Premium has 15 messages per 24 hours
  const MESSAGE_LIMITS = {
    basic: 5,
    premium: 15,
    gold: Infinity
  };

  // FIXED: Premium 24-hour tracking system
  const getPremium24HourKey = () => {
    const now = new Date();
    return `premium_24h_limit_${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  };

  // Get premium usage data with proper 24-hour reset
  const getPremiumUsage = () => {
    if (userPlan !== "premium") return { count: 0, date: getPremium24HourKey() };
    
    try {
      const key = getPremium24HourKey();
      const stored = localStorage.getItem(key);
      
      if (stored) {
        return JSON.parse(stored);
      }
      
      // Clear any old premium usage keys
      Object.keys(localStorage).forEach(storageKey => {
        if (storageKey.startsWith('premium_24h_limit_') && storageKey !== key) {
          localStorage.removeItem(storageKey);
        }
      });
      
    } catch (error) {
      console.error('Error reading premium usage:', error);
    }
    
    return { count: 0, date: getPremium24HourKey() };
  };

  // Set premium usage data
  const setPremiumUsage = (count: number) => {
    if (userPlan !== "premium") return;
    
    try {
      const key = getPremium24HourKey();
      const data = { count, date: key };
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving premium usage:', error);
    }
  };

  // Check if premium 24-hour limit exceeded
  const isPremiumLimitReached = () => {
    if (userPlan !== "premium") return false;
    const usage = getPremiumUsage();
    return usage.count >= MESSAGE_LIMITS.premium;
  };

  // Get current premium count
  const getCurrentPremiumCount = () => {
    if (userPlan !== "premium") return 0;
    return getPremiumUsage().count;
  };

  // Get time until 24-hour reset
  const getTimeUntilReset = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const timeLeft = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  // Enhanced welcome messages with better contract integration
  function getWelcomeMessage(plan: string): string {
    switch (plan) {
      case "gold":
        return `👑 **Welcome to Gold AI Assistant!**

I can help you analyze, modify, and understand your **${contractTitle}** in detail. I have access to your complete contract and can provide:

• **Advanced Risk Analysis** - Deep dive into potential legal issues and liability concerns
• **Contract Modifications** - Suggest specific clause improvements and amendments  
• **Clause-by-Clause Analysis** - Detailed examination of each contract section
• **Legal Compliance** - Check against industry standards and regulations
• **Custom Recommendations** - Tailored advice based on your specific contract terms

I'll analyze your ${contractType} comprehensively using the provided contract context. What specific aspect would you like me to examine first?`;

      case "premium":
        return `⭐ **Premium Contract Analysis**

Analyzing your **${contractTitle}** (${contractType})

**You have ${MESSAGE_LIMITS.premium - getCurrentPremiumCount()}/${MESSAGE_LIMITS.premium} AI messages available in your 24-hour period**

I'll provide:
• **Detailed Risk Analysis** - Comprehensive identification of potential issues in your contract
• **Professional Insights** - Industry-standard recommendations based on contract content  
• **Clause Explanations** - Clear breakdown of complex legal terms and conditions
• **Compliance Assessment** - Verification against regulatory requirements

I'll analyze your specific contract content and provide targeted advice. What would you like me to examine in your ${contractType.toLowerCase()}?`;

      default:
        return `**Contract Analysis Assistant**

Analyzing your **${contractTitle}** (${contractType})

I have **${MESSAGE_LIMITS.basic - messageCount}/${MESSAGE_LIMITS.basic} messages available** to help with:

• **Basic Explanations** - Simple contract term definitions
• **Risk Identification** - Highlight major concerns in your contract
• **General Guidance** - Basic insights about your contract terms

What would you like to know about your ${contractType.toLowerCase()}?`;
    }
  }

  // Generate contextual recommendations based on user input (like GoldChatModal)
  const generateRecommendations = (userMessage: string): string[] => {
    if (userPlan === "premium") return []; // No recommendations for premium

    const message = userMessage.toLowerCase();
    
    if (message.includes('risk') || message.includes('danger') || message.includes('problem')) {
      return ["Analyze specific risks", "Mitigation strategies", "Legal implications"];
    } else if (message.includes('modify') || message.includes('change') || message.includes('edit')) {
      return ["Suggest modifications", "Review alternatives", "Impact analysis"];
    } else if (message.includes('payment') || message.includes('money') || message.includes('cost')) {
      return ["Review payment terms", "Cost analysis", "Financial risks"];
    } else if (message.includes('clause') || message.includes('term') || message.includes('section')) {
      return ["Explain clauses", "Compare terms", "Legal interpretation"];
    } else if (message.includes('compliance') || message.includes('legal') || message.includes('law')) {
      return ["Check compliance", "Legal requirements", "Regulatory issues"];
    }
    
    // Plan-specific default recommendations
    if (userPlan === "gold") {
      return [
        "Analyze risks",
        "Review clauses", 
        "Suggest improvements",
        "Check compliance",
        "Compare standards"
      ];
    }
    
    return [
      "What are the main risks?",
      "Explain key terms",
      "Contract summary"
    ];
  };

  // Get initial recommendations (no recommendations for premium)
  function getInitialRecommendations(plan: string): string[] {
    switch (plan) {
      case "gold":
        return [
          "Analyze key risks in this contract",
          "Review payment and termination terms", 
          "Check liability and indemnification clauses",
          "Assess compliance requirements",
          "Suggest contract improvements"
        ];
      case "premium":
        return []; // NO recommendations for premium
      default:
        return [
          "What is this contract about?",
          "Are there any major risks?", 
          "Give me a contract summary"
        ];
    }
  }

  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

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

  // Initialize chat when modal opens
  useEffect(() => {
    if (open && !isInitialized) {
      setChatHistory([
        {
          type: "ai",
          message: getWelcomeMessage(userPlan),
          recommendations: getInitialRecommendations(userPlan),
          timestamp: new Date(),
        },
      ]);
      
      // Set initial message count
      if (userPlan === "premium") {
        setMessageCount(getCurrentPremiumCount());
      } else {
        setMessageCount(0);
      }
      
      setIsInitialized(true);
    } else if (!open) {
      setIsInitialized(false);
      setChatHistory([]);
      setMessage("");
      setMessageCount(0);
    }
  }, [open, userPlan, contractTitle, contractType, isInitialized]);

  const handleSendMessage = async (customMessage?: string) => {
    const inputMessage = customMessage || message;

    if (!inputMessage.trim()) return;

    if (!geminiApiKey) {
      setChatHistory((prev) => [
        ...prev,
        { 
          type: "ai", 
          message: "**API Configuration Error**\n\nGemini API key not provided. Please configure your API key to use the AI assistant.", 
          recommendations: [],
          timestamp: new Date()
        },
      ]);
      return;
    }

    // CRITICAL: Check 24-hour limit for premium users
    if (userPlan === "premium" && isPremiumLimitReached()) {
      const timeLeft = getTimeUntilReset();
      setChatHistory((prev) => [
        ...prev,
        { 
          type: "ai", 
          message: `**24-Hour Limit Reached**

You've used all **15/15 Premium AI conversations** in the current 24-hour period.

**🕒 Reset Time:** in ${timeLeft}

**Upgrade Benefits:**
• **Gold Plan:** Unlimited AI conversations
• **Advanced contract analysis and modifications**
• **Priority support and premium features**

Your limit will automatically reset in ${timeLeft}.`, 
          recommendations: [],
          timestamp: new Date()
        },
      ]);
      return;
    }

    // Check basic plan limits
    if (userPlan === "basic" && messageCount >= MESSAGE_LIMITS.basic) {
      setChatHistory((prev) => [
        ...prev,
        { 
          type: "ai", 
          message: `**Message Limit Reached**

You've used all **5/5 messages** in your Basic plan.

**Upgrade Benefits:**
• **Premium:** 15 AI conversations per 24-hour period
• **Gold:** Unlimited conversations with advanced analysis
• **Better contract insights and recommendations**

Upgrade now for continued AI assistance!`, 
          recommendations: [],
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
    
    // Update message count and save for premium users
    const newCount = messageCount + 1;
    setMessageCount(newCount);
    
    if (userPlan === "premium") {
      setPremiumUsage(newCount);
    }

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
                    text: generateAdvancedPrompt(inputMessage, context, userPlan, contractTitle, contractType),
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.3, // More focused for contract analysis
              topK: 40,
              topP: 0.8,
              maxOutputTokens: 2048,
              stopSequences: ["Human:", "User:"],
            },
          }),
        }
      );

      const data = await response.json();
      
      if (data?.error) {
        throw new Error(data.error.message || 'API Error occurred');
      }

      const textResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (textResponse) {
        // Clean and process the response
        let cleanedText = textResponse
          .replace(/```(?:json)?/g, "")
          .replace(/```/g, "")
          .replace(/^\s*[\{\[]?\s*"?(?:answer|response|message)"?\s*:\s*"?/i, '') // Remove JSON wrapper start
          .replace(/,?\s*"?recommendations"?\s*:\s*\[.*?\]\s*[\}\]]?\s*$/i, '') // Remove JSON wrapper end
          .trim();

        // Remove quotes if the entire response is wrapped in them
        if (cleanedText.startsWith('"') && cleanedText.endsWith('"')) {
          cleanedText = cleanedText.slice(1, -1);
        }

        // Process escaped characters
        cleanedText = cleanedText
          .replace(/\\n/g, '\n')
          .replace(/\\"/g, '"')
          .replace(/\\\\/g, '\\')
          .replace(/\n\s*\n/g, '\n')
          .trim();

        const aiMessage: ChatMessage = {
          type: "ai",
          message: cleanedText,
          recommendations: generateRecommendations(inputMessage),
          timestamp: new Date()
        };

        setChatHistory((prev) => [...prev, aiMessage]);

      } else {
        setChatHistory((prev) => [
          ...prev,
          { 
            type: "ai", 
            message: "**Response Error**\n\nI received your question but couldn't generate a proper response. Please try rephrasing your question or ask something specific about your contract.", 
            recommendations: generateRecommendations(inputMessage),
            timestamp: new Date()
          },
        ]);
      }
    } catch (error: any) {
      console.error("Error calling Gemini API:", error);
      
      let errorMessage = "Sorry, I encountered an error while analyzing your contract. Please try again.";
      
      if (error?.message?.includes('API key')) {
        errorMessage = "**API Key Error**\n\nPlease check your Gemini API key configuration.";
      } else if (error?.message?.includes('quota') || error?.message?.includes('limit')) {
        errorMessage = "**API Limit Reached**\n\nThe AI service has reached its usage limit. Please try again later.";
      } else if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
        errorMessage = "**Connection Error**\n\nPlease check your internet connection and try again.";
      } else if (error?.message) {
        errorMessage = `**Error**\n\n${error.message}`;
      }

      setChatHistory((prev) => [
        ...prev,
        {
          type: "ai",
          message: errorMessage,
          recommendations: ["Try again", "Rephrase question", "Ask something else"],
          timestamp: new Date()
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  // ENHANCED prompt generation with much better contract analysis (like GoldChatModal quality)
 function generateAdvancedPrompt(inputMessage: string, context: string, plan: string, contractTitle: string, contractType: string): string {
  const contractSummary = context ? context.substring(0, 2000) : "Contract content not available";
  
  const baseSystemPrompt = `You are a helpful contract analysis assistant. Answer questions naturally and conversationally.

CONTRACT: "${contractTitle}" (${contractType})
CONTENT: ${contractSummary}

USER QUESTION: "${inputMessage}"

INSTRUCTIONS:
- Answer directly in 1-2 sentences
- Reference specific contract details when relevant
- Be conversational, not formal
- No headers, bullets, or structured formatting
- Just give a straightforward answer like you're talking to a friend`;

  if (plan === "gold") {
    return `${baseSystemPrompt}

Give a direct, conversational answer that references the contract specifics. If there are risks or recommendations, mention them naturally in the response. Keep it under 3 sentences total.`;
  }

  if (plan === "premium") {
    return `${baseSystemPrompt}

Provide a direct answer referencing the contract content. Keep it conversational and under 2 sentences. If relevant, briefly mention any important considerations.`;
  }

  return `${baseSystemPrompt}

Give a simple, direct answer about what the contract says regarding their question. Keep it to 1-2 sentences maximum.`;
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

  // FIXED: Get remaining messages with proper 24-hour tracking
  const getRemainingMessages = () => {
    if (userPlan === "gold") return "Unlimited";
    
    if (userPlan === "premium") {
      if (isPremiumLimitReached()) {
        return `Resets in ${getTimeUntilReset()}`;
      }
      const remaining = MESSAGE_LIMITS.premium - messageCount;
      return `${remaining}/${MESSAGE_LIMITS.premium} in 24h`;
    }
    
    const remaining = MESSAGE_LIMITS.basic - messageCount;
    return `${remaining}/${MESSAGE_LIMITS.basic} remaining`;
  };

  // Format timestamp
  const formatTime = (timestamp?: Date) => {
    if (!timestamp) return "";
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Check if user can send messages
  const canSendMessage = () => {
    if (userPlan === "gold") return true;
    if (userPlan === "premium") return !isPremiumLimitReached();
    return messageCount < MESSAGE_LIMITS.basic;
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
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-700 font-medium">{contractTitle}</span>
                <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                  {contractType}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-2">
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

        {/* CRITICAL: Premium 24-hour limit warning */}
        {userPlan === "premium" && isPremiumLimitReached() && (
          <div className="px-4 py-3 bg-red-50 border-b border-red-200">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">
                24-hour limit reached (15/15 messages used). Resets in {getTimeUntilReset()}
              </span>
            </div>
          </div>
        )}

        {/* Usage warning for approaching limits */}
        {userPlan !== "gold" && !isPremiumLimitReached() && messageCount >= MESSAGE_LIMITS[userPlan] - 2 && messageCount < MESSAGE_LIMITS[userPlan] && (
          <div className="px-4 py-2 bg-amber-50 border-b border-amber-200">
            <div className="flex items-center gap-2 text-amber-800">
              <Clock className="h-4 w-4" />
              <span className="text-sm">
                {userPlan === "premium" 
                  ? `${MESSAGE_LIMITS[userPlan] - messageCount} messages remaining in 24-hour period`
                  : `${MESSAGE_LIMITS[userPlan] - messageCount} messages remaining`
                }. Upgrade to Gold for unlimited access!
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
                  <div className="leading-relaxed">
                    <FormattedMessage message={item.message} />
                  </div>
                  
                  <div className={`text-xs mt-2 opacity-70 ${
                    item.type === "user" ? "text-blue-100" : "text-gray-500"
                  }`}>
                    {formatTime(item.timestamp)}
                  </div>

                  {/* Recommendations - Only for Gold and Basic, NOT Premium */}
                  {item.type === "ai" &&
                    userPlan !== "premium" &&
                    item.recommendations &&
                    item.recommendations.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="text-sm font-medium mb-2 flex items-center gap-1">
                          {userPlan === "gold" && <Crown className="h-3 w-3 text-yellow-600" />}
                          <span className={
                            userPlan === "gold" 
                              ? "text-yellow-700" 
                              : "text-gray-700"
                          }>
                            {userPlan === "gold" ? "Advanced suggestions:" : "Quick questions:"}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {item.recommendations.map((suggestion, idx) => (
                            <Button
                              key={idx}
                              variant="outline"
                              size="sm"
                              className={`${
                                userPlan === "gold" 
                                  ? "bg-gradient-to-r from-yellow-50 to-amber-50 hover:from-yellow-100 hover:to-amber-100 text-yellow-800 border-yellow-200"
                                  : "bg-white hover:bg-gray-50 text-gray-800 border-gray-200"
                              } text-xs py-1 h-auto rounded-full transition-all duration-200 hover:scale-105`}
                              onClick={() => handleSendMessage(suggestion)}
                              disabled={!canSendMessage()}
                            >
                              {suggestion}
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
                      Analyzing {contractTitle}...
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
                    : "border-blue-200 focus:border-blue-400 focus:ring-blue-100"
                }`}
                placeholder={
                  !canSendMessage()
                    ? userPlan === "premium" 
                      ? `24-hour limit reached - Resets in ${getTimeUntilReset()}`
                      : "Message limit reached - Upgrade for more"
                    : `Ask your AI assistant anything about your contract...`
                }
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                disabled={isThinking || !canSendMessage()}
              />
            </div>
            <Button
              onClick={() => handleSendMessage()}
              size="lg"
              disabled={isThinking || !message.trim() || !canSendMessage()}
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
                Gold AI: Unlimited contract analysis with detailed risk assessment and modification suggestions
              </span>
            )}
            {userPlan === "premium" && (
              <span className="text-blue-700">
                Premium AI: 15 detailed contract conversations per 24-hour period ({messageCount}/15 used)
              </span>
            )}
            {userPlan === "basic" && messageCount >= 3 && (
              <span className="text-gray-500">
                Upgrade to Premium (15 messages/day) or Gold (unlimited) for advanced AI contract analysis
              </span>
            )}
            {userPlan === "premium" && messageCount >= 12 && !isPremiumLimitReached() && (
              <span className="text-amber-600">
                Only {MESSAGE_LIMITS.premium - messageCount} messages remaining in 24-hour period
              </span>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatbotModal;