"use client";

import { useState, useEffect, useRef, JSX } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { Send, Crown } from "lucide-react";

// Component for formatting AI responses with proper structure
const FormattedMessage = ({ message }: { message: string }) => {
  // Function to format the message with proper structure
  const formatMessage = (text: string) => {
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
          <div key={currentIndex++} className="font-bold text-yellow-800 mt-4 mb-2 first:mt-0">
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
              <span className="text-yellow-600 mr-3 mt-1 flex-shrink-0">•</span>
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
              <span className="text-yellow-600 mr-3 mt-1 flex-shrink-0">•</span>
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

interface GoldChatModalProps {
  open: boolean;
  onClose: () => void;
  contractId: string;
}

interface ChatMessage {
  type: "user" | "ai";
  message: string;
  recommendations?: string[];
  timestamp?: Date;
}

export function GoldChatModal({ open, onClose, contractId }: GoldChatModalProps) {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      type: "ai",
      message: "👑 Welcome to Gold AI Assistant! I can help you analyze, modify, and understand your contract in detail. What would you like to know?",
      recommendations: [
        "Analyze key risks",
        "Suggest modifications", 
        "Review clauses",
        "Compare standards",
        "Export summary"
      ],
      timestamp: new Date()
    },
  ]);
  const [isThinking, setIsThinking] = useState(false);

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

  // Reset chat when modal opens
  useEffect(() => {
    if (open) {
      setChatHistory([
        {
          type: "ai",
          message: "👑 Welcome to Gold AI Assistant! I can help you analyze, modify, and understand your contract in detail. What would you like to know?",
          recommendations: [
            "Analyze key risks",
            "Suggest modifications", 
            "Review clauses",
            "Compare standards",
            "Export summary"
          ],
          timestamp: new Date()
        },
      ]);
    }
  }, [open]);

  const handleSendMessage = async (customMessage?: string) => {
    const inputMessage = customMessage || message;

    if (!inputMessage.trim()) return;

    // Add user message to chat
    setChatHistory(prev => [...prev, { 
      type: "user", 
      message: inputMessage,
      timestamp: new Date()
    }]);
    setMessage("");
    setIsThinking(true);

    try {
      const response = await api.post("/contracts/chat", {
        contractId,
        message: inputMessage,
        chatHistory: chatHistory.map(msg => ({
          role: msg.type === "user" ? "user" : "assistant",
          content: msg.message
        }))
      });

      // Parse response - handle both string and structured responses
      let aiResponse: ChatMessage;
      
      if (typeof response.data.response === 'string') {
        // Clean and format the response
        let responseText = response.data.response;
        
        // Try to parse as JSON first
        try {
          const cleanedResponse = responseText
            .replace(/```(?:json)?/g, "")
            .replace(/```/g, "")
            .trim();
          
          const parsed = JSON.parse(cleanedResponse);
          
          aiResponse = {
            type: "ai",
            message: parsed.answer || parsed.message || responseText,
            recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
            timestamp: new Date()
          };
        } catch (e) {
          // If JSON parsing fails, clean up the text formatting
          responseText = responseText
            .replace(/\*\*\*/g, '\n***') // Add line breaks before headers
            .replace(/\n\s*\n/g, '\n') // Clean up multiple line breaks
            .trim();
          
          aiResponse = {
            type: "ai",
            message: responseText,
            recommendations: [],
            timestamp: new Date()
          };
        }
      } else {
        // Handle structured response
        aiResponse = {
          type: "ai",
          message: response.data.response?.message || response.data.response?.answer || "I received your message but couldn't generate a proper response.",
          recommendations: Array.isArray(response.data.response?.recommendations) ? response.data.response.recommendations : [],
          timestamp: new Date()
        };
      }

      setChatHistory(prev => [...prev, aiResponse]);

    } catch (error: any) {
      console.error("Error sending chat message:", error);
      
      const errorMessage = error?.response?.data?.message || error?.message || "Sorry, I encountered an error. Please try again.";
      
      setChatHistory(prev => [...prev, {
        type: "ai",
        message: errorMessage,
        recommendations: ["Try again", "Ask something else", "Check connection"],
        timestamp: new Date()
      }]);
    } finally {
      setIsThinking(false);
    }
  };

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
        <DialogHeader className="p-4 border-b bg-gradient-to-r from-yellow-50 to-amber-50">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
              <Crown className="h-5 w-5 text-yellow-600" />
              <span className="bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
                Gold AI Assistant
              </span>
            </DialogTitle>
            <div className="text-xs text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full">
              Unlimited Messages
            </div>
          </div>
          <p className="text-sm text-yellow-700 mt-1">
            Advanced AI-powered contract analysis and modification
          </p>
        </DialogHeader>

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
                    <FormattedMessage message={item.message} />
                  </div>
                  
                  {/* Timestamp */}
                  <div className={`text-xs mt-2 opacity-70 ${
                    item.type === "user" ? "text-blue-100" : "text-gray-500"
                  }`}>
                    {formatTime(item.timestamp)}
                  </div>

                  {/* Gold-specific recommendations */}
                  {item.type === "ai" && item.recommendations && item.recommendations.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="text-sm font-medium mb-2 text-yellow-700 flex items-center gap-1">
                        <Crown className="h-3 w-3" />
                        Advanced suggestions:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {item.recommendations.map((suggestion, idx) => (
                          <Button
                            key={idx}
                            variant="outline"
                            size="sm"
                            className="bg-gradient-to-r from-yellow-50 to-amber-50 hover:from-yellow-100 hover:to-amber-100 text-yellow-800 border-yellow-200 text-xs py-1 h-auto rounded-full transition-all duration-200 hover:scale-105"
                            onClick={() => handleSendMessage(suggestion)}
                            disabled={isThinking}
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
                      <div className="h-2 w-2 bg-yellow-500 rounded-full animate-bounce delay-0"></div>
                      <div className="h-2 w-2 bg-yellow-500 rounded-full animate-bounce delay-150"></div>
                      <div className="h-2 w-2 bg-yellow-500 rounded-full animate-bounce delay-300"></div>
                    </div>
                    <span className="text-sm text-gray-600">Gold AI is analyzing...</span>
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
                className="w-full h-12 rounded-full border-2 border-yellow-200 px-4 py-2 text-sm shadow-sm focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 transition-all duration-200"
                placeholder="Ask your Gold AI assistant anything about your contract..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                disabled={isThinking}
              />
            </div>
            <Button
              onClick={() => handleSendMessage()}
              size="lg"
              disabled={isThinking || !message.trim()}
              className="rounded-full h-12 px-6 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
            >
              <Send className="h-4 w-4 mr-2" />
              <span>Send</span>
            </Button>
          </div>
          
          {/* Gold features hint */}
          <div className="mt-2 text-xs text-center text-yellow-700">
            ✨ Gold AI can analyze risks, suggest modifications, and provide detailed contract insights
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}