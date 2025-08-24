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
import { Send, Crown, Zap, Lock, FileText, Clock } from "lucide-react";
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

// Component for formatting AI responses with proper structure
const FormattedMessage = ({ message, userPlan }: { message: string; userPlan: string }): JSX.Element => {
  const formatMessage = (text: string): JSX.Element[] => {
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
          <div key={currentIndex++} className={`font-bold text-lg mt-6 mb-3 first:mt-2 border-b pb-2 ${
            userPlan === 'gold' ? 'text-yellow-800 border-yellow-200' : 
            userPlan === 'premium' ? 'text-blue-800 border-blue-200' : 'text-gray-800 border-gray-200'
          }`}>
            {headerText}
          </div>
        );
        return;
      }
      
      // Handle sub headers with **text:**
      if (trimmedLine.match(/^\*\*[^*]+:\*\*$/)) {
        const headerText = trimmedLine.replace(/^\*\*|\*\*$/g, '');
        formattedElements.push(
          <div key={currentIndex++} className={`font-semibold mt-4 mb-2 first:mt-0 ${
            userPlan === 'gold' ? 'text-yellow-800' : 
            userPlan === 'premium' ? 'text-blue-800' : 'text-gray-800'
          }`}>
            {headerText}
          </div>
        );
        return;
      }
      
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
      
      // Handle bullet points with risk levels
      if (trimmedLine.startsWith('•')) {
        const content = trimmedLine.substring(1).trim();
        
        let riskColor = "text-gray-700";
        if (content.toLowerCase().includes('high risk')) riskColor = "text-red-600";
        else if (content.toLowerCase().includes('medium risk')) riskColor = "text-orange-600";
        else if (content.toLowerCase().includes('low risk')) riskColor = "text-green-600";
        
        if (content.match(/^\*\*.*\*\*/)) {
          const parts = content.split(/(\*\*[^*]+\*\*)/);
          formattedElements.push(
            <div key={currentIndex++} className="ml-4 mb-3 flex items-start">
              <span className={`mr-3 mt-1 flex-shrink-0 ${
                userPlan === 'gold' ? 'text-yellow-600' : 
                userPlan === 'premium' ? 'text-blue-600' : 'text-gray-600'
              }`}>•</span>
              <div className={riskColor}>
                {parts.map((part, partIndex) => {
                  if (part.startsWith('**') && part.endsWith('**')) {
                    const boldText = part.replace(/^\*\*|\*\*$/g, '');
                    return (
                      <span key={partIndex} className="font-semibold">
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
              <span className={`mr-3 mt-1 flex-shrink-0 ${
                userPlan === 'gold' ? 'text-yellow-600' : 
                userPlan === 'premium' ? 'text-blue-600' : 'text-gray-600'
              }`}>•</span>
              <span className={riskColor}>{content}</span>
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
  // Plan limits
  const MESSAGE_LIMITS = {
    basic: 5,
    premium: 15,
    gold: Infinity
  };

  // Premium time-based limit key
  const PREMIUM_LIMIT_KEY = `premium_limit_${new Date().toDateString()}`;

  // Check if premium user has exceeded daily limit
  const isPremiumLimitExceeded = () => {
    if (userPlan !== "premium") return false;
    const limitData = localStorage.getItem(PREMIUM_LIMIT_KEY);
    if (!limitData) return false;
    
    const { count, timestamp } = JSON.parse(limitData);
    const now = new Date().getTime();
    const dayInMs = 24 * 60 * 60 * 1000;
    
    // Reset if more than 24 hours have passed
    if (now - timestamp > dayInMs) {
      localStorage.removeItem(PREMIUM_LIMIT_KEY);
      return false;
    }
    
    return count >= MESSAGE_LIMITS.premium;
  };

  // Get time until reset for premium users
  const getTimeUntilReset = () => {
    const limitData = localStorage.getItem(PREMIUM_LIMIT_KEY);
    if (!limitData) return "";
    
    const { timestamp } = JSON.parse(limitData);
    const now = new Date().getTime();
    const dayInMs = 24 * 60 * 60 * 1000;
    const timeLeft = dayInMs - (now - timestamp);
    
    if (timeLeft <= 0) return "";
    
    const hours = Math.floor(timeLeft / (60 * 60 * 1000));
    const minutes = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
    
    return `${hours}h ${minutes}m`;
  };

  // Get welcome message based on user plan and contract
  function getWelcomeMessage(plan: string): string {
    switch (plan) {
      case "gold":
        return `👑 **Welcome to Gold AI Assistant!**

I'm here to provide comprehensive analysis of your **${contractTitle}**. As your Gold assistant, I can help you with:

### **Advanced Capabilities:**
• **Risk Assessment** - Identify and analyze potential legal risks
• **Contract Modifications** - Suggest specific clause improvements  
• **Compliance Review** - Check against industry standards
• **Legal Precedents** - Reference relevant case law
• **Clause Analysis** - Deep dive into specific contract terms

What specific aspect of your ${contractType.toLowerCase()} would you like me to analyze?`;

      case "premium":
        return `⭐ **Premium Contract Analysis**

Analyzing your **${contractTitle}** (${contractType})

### **Premium Features:**
• **Detailed Risk Analysis** - Comprehensive risk identification
• **Professional Insights** - Industry-standard recommendations  
• **Clause Explanations** - Clear breakdown of complex terms
• **Compliance Checks** - Regulatory requirement verification

I can provide detailed analysis of your ${contractType.toLowerCase()}. What would you like me to examine?`;

      default:
        return `**Contract Analysis Assistant**

I'm analyzing your **${contractTitle}** (${contractType})

### **Available Help:**
• **Basic Explanations** - Simple contract term definitions
• **Risk Identification** - Highlight potential concerns
• **General Guidance** - Basic contract insights

What would you like to know about your ${contractType.toLowerCase()}?`;
    }
  }

  // Get initial recommendations based on user plan - NO recommendations for premium
  function getInitialRecommendations(plan: string): string[] {
    switch (plan) {
      case "gold":
        return [
          "Analyze key risks",
          "Suggest modifications",
          "Review payment terms",
          "Check compliance issues",
          "Compare to standards"
        ];
      case "premium":
        return []; // No recommendations for premium
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
      
      // Load message count for current session
      if (userPlan === "premium") {
        const limitData = localStorage.getItem(PREMIUM_LIMIT_KEY);
        if (limitData) {
          const { count } = JSON.parse(limitData);
          setMessageCount(count);
        } else {
          setMessageCount(0);
        }
      } else {
        setMessageCount(0);
      }
    }
  }, [open, userPlan, contractTitle, contractType]);

  const handleSendMessage = async (customMessage?: string) => {
    const inputMessage = customMessage || message;

    if (!inputMessage.trim() || !geminiApiKey) {
      if (!geminiApiKey) {
        setChatHistory((prev) => [
          ...prev,
          { 
            type: "ai", 
            message: "**Error:** Gemini API key not provided.", 
            recommendations: [],
            timestamp: new Date()
          },
        ]);
      }
      return;
    }

    // Check message limits
    if (userPlan === "premium" && isPremiumLimitExceeded()) {
      const timeLeft = getTimeUntilReset();
      setChatHistory((prev) => [
        ...prev,
        { 
          type: "ai", 
          message: `**Daily Limit Reached**

You've reached your Premium plan limit of ${MESSAGE_LIMITS.premium} messages for today.

**Reset Time:** ${timeLeft ? `in ${timeLeft}` : 'Soon'}

Upgrade to Gold for unlimited AI conversations!`, 
          recommendations: [],
          timestamp: new Date()
        },
      ]);
      return;
    }

    if (userPlan === "basic" && messageCount >= MESSAGE_LIMITS.basic) {
      setChatHistory((prev) => [
        ...prev,
        { 
          type: "ai", 
          message: `**Message Limit Reached**

You've used all ${MESSAGE_LIMITS.basic} messages in your Basic plan.

**Upgrade Benefits:**
• **Premium:** ${MESSAGE_LIMITS.premium} messages per day
• **Gold:** Unlimited messages with advanced analysis

Upgrade now for continued access!`, 
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
    
    // Update message count
    const newCount = messageCount + 1;
    setMessageCount(newCount);
    
    // Store premium limit data
    if (userPlan === "premium") {
      const limitData = {
        count: newCount,
        timestamp: new Date().getTime()
      };
      localStorage.setItem(PREMIUM_LIMIT_KEY, JSON.stringify(limitData));
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
                    text: generatePrompt(inputMessage, context, userPlan, contractTitle, contractType),
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

        let aiMessage: ChatMessage;

        try {
          // Try to parse as JSON
          const parsed = JSON.parse(cleanedText);
          
          // Take only the first valid response if there are multiple
          let answerText = parsed.answer || parsed.message || cleanedText;
          
          // If there are multiple JSON objects, extract the best one
          if (typeof answerText === 'string' && answerText.includes('{"answer"')) {
            const jsonMatches = answerText.match(/\{[^{}]*"answer"[^{}]*\}/g);
            if (jsonMatches && jsonMatches.length > 0) {
              try {
                const firstValid = JSON.parse(jsonMatches[0]);
                answerText = firstValid.answer || answerText;
              } catch (e) {
                // Keep original if parsing fails
              }
            }
          }
          
          // Clean up formatting based on user plan
          if (userPlan === "premium") {
            // For premium, ensure clean, single response
            answerText = answerText
              .replace(/\{[\s\S]*?"answer":\s*"([^"]*)"[\s\S]*?\}/g, '$1') // Remove JSON wrapper if present
              .replace(/Direct Answer:\s*/g, '### **Analysis**\n\n')
              .replace(/Key Analysis Points:\s*/g, '\n### **Key Points**\n')
              .replace(/Professional Assessment:\s*/g, '\n### **Assessment**\n')
              .replace(/Recommendations:\s*/g, '\n### **Recommendations**\n')
              .replace(/\* /g, '• ')
              .replace(/(\d+)\. /g, '$1. ')
              .trim();
          } else if (userPlan === "gold") {
            answerText = answerText
              .replace(/Direct Answer:\s*/g, '### **Direct Analysis**\n\n')
              .replace(/Comprehensive Analysis:\s*/g, '\n### **Comprehensive Analysis**\n')
              .replace(/Legal Precedents:\s*/g, '\n### **Legal Precedents**\n')
              .replace(/Risk Assessment with Impact Levels:\s*/g, '\n### **Risk Assessment**\n')
              .replace(/Detailed Recommendations:\s*/g, '\n### **Detailed Recommendations**\n')
              .replace(/Industry Best Practices:\s*/g, '\n### **Industry Best Practices**\n')
              .replace(/Actionable Next Steps:\s*/g, '\n### **Next Steps**\n')
              .replace(/\* /g, '• ')
              .replace(/(\d+)\. /g, '$1. ')
              .trim();
          } else {
            // Basic plan
            answerText = answerText
              .replace(/\* /g, '• ')
              .replace(/(\d+)\. /g, '$1. ')
              .trim();
          }
          
          aiMessage = {
            type: "ai",
            message: answerText,
            recommendations: userPlan === "premium" ? [] : (Array.isArray(parsed.recommendations) ? parsed.recommendations.slice(0, 6) : []),
            timestamp: new Date()
          };
        } catch (e) {
          // If JSON parsing fails, use the cleaned text as is with basic formatting
          let formattedText = cleanedText
            .replace(/\*\*\*/g, '\n***')
            .replace(/\n\s*\n/g, '\n')
            .replace(/\* /g, '• ')
            .trim();
          
          aiMessage = {
            type: "ai",
            message: formattedText,
            recommendations: userPlan === "premium" ? [] : [],
            timestamp: new Date()
          };
        }

        setChatHistory((prev) => [...prev, aiMessage]);

      } else if (data?.error?.message) {
        setChatHistory((prev) => [
          ...prev,
          { 
            type: "ai", 
            message: `**Error:** ${data.error.message}`, 
            recommendations: [],
            timestamp: new Date()
          },
        ]);
      } else {
        setChatHistory((prev) => [
          ...prev,
          { 
            type: "ai", 
            message: "**Error:** Could not retrieve response from AI.", 
            recommendations: [],
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
          message: `**Error:** ${error.message || "Something went wrong while analyzing your contract."}`,
          recommendations: [],
          timestamp: new Date()
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  // Generate prompt based on user plan and contract context
  function generatePrompt(inputMessage: string, context: string, plan: string, contractTitle: string, contractType: string): string {
    const basePrompt = `You are analyzing "${contractTitle}" which is a ${contractType}. 

Contract Context: ${context}

User Question: ${inputMessage}

Respond in JSON format:
{
  "answer": "your detailed response here",
  "recommendations": ["short question", "short question", ...]
}`;

    if (plan === "gold") {
      return `${basePrompt}

As a GOLD assistant, provide comprehensive analysis with detailed formatting:

### **Direct Answer**
[Answer the specific question about ${contractTitle}]

### **Risk Assessment**
• **High Risk:** [Critical issues if any]
• **Medium Risk:** [Moderate concerns if any] 
• **Low Risk:** [Minor considerations if any]

### **Detailed Analysis**
• [Key point 1 about this ${contractType}]
• [Key point 2 about this ${contractType}]
• [Key point 3 about this ${contractType}]

### **Professional Recommendations**
• [Specific actionable recommendation 1]
• [Specific actionable recommendation 2]
• [Specific actionable recommendation 3]

### **Industry Standards**
• [How this compares to standard ${contractType} practices]
• [Best practices for this type of contract]

Provide detailed, professional analysis with specific references to the contract content.`;
    }

    if (plan === "premium") {
      return `${basePrompt}

As a PREMIUM assistant analyzing "${contractTitle}" (${contractType}), provide structured professional analysis:

### **Direct Answer**
[Specific answer to the question about this ${contractType}]

### **Key Analysis Points**
• **Primary Concern:** [Main issue if any]
• **Important Detail:** [Key contract element]
• **Risk Factor:** [Potential risk if any]

### **Professional Assessment**
[Detailed explanation of findings related to this ${contractType}]

### **Recommendations**
• [Specific recommendation 1]
• [Specific recommendation 2]
• [Specific recommendation 3]

IMPORTANT: Do NOT include follow-up questions in recommendations array. Keep response focused and professional. Answer the EXACT question asked about this specific ${contractType}.`;
    }

    return `${basePrompt}

As a BASIC assistant for "${contractTitle}" (${contractType}):

### **Simple Answer**
[Direct, easy-to-understand answer about this ${contractType}]

### **Key Points**
• [Main point 1 in simple terms]
• [Main point 2 in simple terms]

### **What This Means**
[Explain in simple language what this means for the user's ${contractType}]

### **Basic Suggestion**
[One simple, actionable recommendation]

Use simple language. Keep under 150 words. Focus on practical understanding of this specific ${contractType}.`;
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
    
    if (userPlan === "premium") {
      if (isPremiumLimitExceeded()) {
        const timeLeft = getTimeUntilReset();
        return `Resets ${timeLeft ? `in ${timeLeft}` : 'soon'}`;
      }
      const remaining = MESSAGE_LIMITS.premium - messageCount;
      return `${remaining} today`;
    }
    
    const remaining = MESSAGE_LIMITS.basic - messageCount;
    return `${remaining} remaining`;
  };

  // Format timestamp
  const formatTime = (timestamp?: Date) => {
    if (!timestamp) return "";
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Check if user can send messages
  const canSendMessage = () => {
    if (userPlan === "gold") return true;
    if (userPlan === "premium") return !isPremiumLimitExceeded();
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

        {/* Premium time limit warning */}
        {userPlan === "premium" && isPremiumLimitExceeded() && (
          <div className="px-4 py-3 bg-amber-50 border-b border-amber-200">
            <div className="flex items-center gap-2 text-amber-800">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">
                Daily limit reached. Resets in {getTimeUntilReset()}
              </span>
            </div>
          </div>
        )}

        {/* Usage warning for approaching limits */}
        {userPlan !== "gold" && !isPremiumLimitExceeded() && messageCount >= MESSAGE_LIMITS[userPlan] - 2 && messageCount < MESSAGE_LIMITS[userPlan] && (
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
                  className={`rounded-lg p-4 shadow-sm ${
                    item.type === "user"
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-tr-sm"
                      : "bg-white text-gray-800 border border-gray-200 rounded-tl-sm"
                  }`}
                >
                  {/* Message content with proper formatting */}
                  <div className="leading-relaxed">
                    <FormattedMessage message={item.message} userPlan={userPlan} />
                  </div>
                  
                  {/* Timestamp */}
                  <div className={`text-xs mt-3 opacity-70 ${
                    item.type === "user" ? "text-blue-100" : "text-gray-500"
                  }`}>
                    {formatTime(item.timestamp)}
                  </div>

                  {/* Recommendations - Only for Gold and Basic, NOT Premium */}
                  {item.type === "ai" &&
                    userPlan !== "premium" &&
                    item.recommendations &&
                    item.recommendations.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-gray-100">
                        <div className="text-sm font-medium mb-3 flex items-center gap-1">
                          {userPlan === "gold" && <Crown className="h-3 w-3 text-yellow-600" />}
                          <span className={
                            userPlan === "gold" 
                              ? "text-yellow-700" 
                              : "text-gray-700"
                          }>
                            {userPlan === "gold" ? "Continue Analysis:" : "Quick Questions:"}
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
                                  : "bg-white hover:bg-gray-50 text-gray-800 border-gray-200"
                              } text-xs py-1 px-3 h-auto rounded-full transition-all duration-200 hover:scale-105`}
                              onClick={() => handleSendMessage(question)}
                              disabled={!canSendMessage()}
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
                <div className="rounded-lg p-4 bg-white border border-gray-200 rounded-tl-sm shadow-sm">
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
                  !canSendMessage()
                    ? userPlan === "premium" 
                      ? `Daily limit reached - Resets in ${getTimeUntilReset()}`
                      : "Message limit reached - Upgrade for more"
                    : `Ask about ${contractTitle}...`
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
              <span>Analyze</span>
            </Button>
          </div>
          
          {/* Plan-specific hint */}
          <div className="mt-2 text-xs text-center">
            {userPlan === "gold" && (
              <span className="text-yellow-700">
                ✨ Gold AI provides unlimited comprehensive analysis of {contractTitle}
              </span>
            )}
            {userPlan === "premium" && (
              <span className="text-blue-700">
                ⭐ Premium AI: Professional contract analysis with daily refresh
              </span>
            )}
            {userPlan === "basic" && messageCount >= 3 && (
              <span className="text-gray-500">
                💡 Upgrade to Premium or Gold for advanced AI features and more messages
              </span>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatbotModal;