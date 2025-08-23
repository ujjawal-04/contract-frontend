"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { Send, Crown } from "lucide-react";

interface GoldChatModalProps {
  open: boolean;
  onClose: () => void;
  contractId: string;
}

export function GoldChatModal({ open, onClose, contractId }: GoldChatModalProps) {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{
    type: "user" | "ai";
    message: string;
  }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = message;
    setMessage("");
    setChatHistory(prev => [...prev, { type: "user", message: userMessage }]);
    setIsLoading(true);

    try {
      const response = await api.post("/contracts/chat", {
        contractId,
        message: userMessage
      });

      setChatHistory(prev => [...prev, { 
        type: "ai", 
        message: response.data.response 
      }]);
    } catch (error) {
      console.error("Error sending chat message:", error);
      setChatHistory(prev => [...prev, { 
        type: "ai", 
        message: "Sorry, I encountered an error. Please try again." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Gold AI Chat
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 p-4 border rounded-lg">
          {chatHistory.length === 0 && (
            <div className="text-center text-gray-500">
              Start a conversation about your contract...
            </div>
          )}
          
          {chatHistory.map((chat, index) => (
            <div
              key={index}
              className={`flex ${chat.type === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  chat.type === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {chat.message}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-800 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full"></div>
                  AI is thinking...
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-4">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask about your contract..."
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            disabled={isLoading}
          />
          <Button onClick={handleSendMessage} disabled={isLoading || !message.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}