"use client";

import { useCurrentUser } from "@/hooks/use-current-user";
import { Loader2, LockIcon, AlertCircle } from "lucide-react";
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import Link from "next/link";
import { useModalStore } from "@/store/zustand";
import { motion } from "framer-motion";

export function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useCurrentUser();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-blue-50 to-white">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center gap-3"
        >
          <Loader2 className="size-10 text-blue-600 animate-spin" />
          <p className="text-slate-600 font-medium">Loading your account...</p>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white py-10 px-4">
        <AuthCard />
      </div>
    );
  }

  return <>{children}</>;
}

export default function AuthCard() {
  const { openModal } = useModalStore();

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const buttonVariants = {
    hover: { scale: 1.03 },
    tap: { scale: 0.98 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-3xl"
    >
      <Card className="overflow-hidden border border-blue-100 shadow-lg">
        <div className="flex flex-col sm:flex-row">
          <div className="sm:w-1/4 bg-blue-50 flex items-center justify-center p-8 border-r border-blue-100 ml-4 rounded-2xl">
            <motion.div
              initial={{ rotate: -5 }}
              animate={{ rotate: 5 }}
              transition={{ 
                repeat: Infinity, 
                repeatType: "reverse", 
                duration: 2 
              }}
            >
              <LockIcon className="size-16 text-blue-600" />
            </motion.div>
          </div>
          
          <div className="sm:w-3/4 p-6">
            <CardHeader className="space-y-2 px-0 pb-4">
              <CardTitle className="text-2xl font-bold text-slate-800">
                Authentication required
              </CardTitle>
              <CardDescription className="text-slate-600 text-base">
                You need to be logged in to access this page. Please connect your account to continue.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="px-0 py-2">
              <div className="flex flex-col sm:flex-row gap-3">
                <motion.div 
                  className="flex-1"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Button 
                    onClick={() => openModal("connectAccountModal")} 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    size="lg"
                  >
                    Connect Google Account
                  </Button>
                </motion.div>
                
                <motion.div
                  className="flex-1"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Link href={"/"} className="w-full">
                    <Button 
                      className="w-full border-blue-200 text-blue-600 hover:bg-blue-50" 
                      variant={"outline"}
                      size="lg"
                    >
                      Back to Home
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </CardContent>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}