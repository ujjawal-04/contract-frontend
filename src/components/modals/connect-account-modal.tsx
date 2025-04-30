"use client";

import { useModalStore } from "@/store/zustand";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { motion } from "framer-motion";

function googleSignIn(): Promise<void> {
  return new Promise((resolve) => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
    resolve();
  });
}

export function ConnectAccountModel() {
  const [isAgreed, setIsAgreed] = useState(false);
  const modalKey = "connectAccountModal";
  const { isOpen, closeModal } = useModalStore();

  const mutation = useMutation({
    mutationFn: googleSignIn,
    onSuccess: () => {
      closeModal(modalKey);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleGoogleSignIn = async () => {
    if (!isAgreed) {
      toast.error("Please agree to the terms and conditions");
      return;
    }
    mutation.mutate();
  };

  const buttonVariants = {
    hover: { scale: 1.03 },
    tap: { scale: 0.98 }
  };

  return (
    <Dialog open={isOpen(modalKey)} onOpenChange={() => closeModal(modalKey)} key={modalKey}>
      <DialogContent className="sm:max-w-md border border-blue-100 p-0 overflow-hidden">
        <div className="bg-blue-50 py-4 px-6 border-b border-blue-100">
          <DialogHeader>
            <DialogTitle className="text-xl text-slate-800 font-bold">Connect Google Account</DialogTitle>
            <DialogDescription className="text-slate-600 pt-1">
              Please connect your Google account to access all features.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6">
          <div className="space-y-5">
            <div className="bg-blue-50/50 rounded-lg p-4 border border-blue-100 text-sm text-slate-700">
              <p>Connecting your Google account will allow you to:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Analyze contracts automatically</li>
                <li>Save and organize your documents</li>
                <li>Access premium features</li>
              </ul>
            </div>

            <motion.div
              whileHover="hover"
              whileTap="tap"
              variants={buttonVariants}
            >
              <Button
                onClick={handleGoogleSignIn}
                disabled={!isAgreed || mutation.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6"
                size="lg"
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 size-5 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>Connect with Google</>
                )}
              </Button>
            </motion.div>

            <div className="flex items-center space-x-3 py-2">
              <Checkbox
                id="terms"
                checked={isAgreed}
                onCheckedChange={(checked) => setIsAgreed(!!checked)}
                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              />
              <Label htmlFor="terms" className="text-sm text-slate-600 cursor-pointer">
                I agree to the <span className="text-blue-600 hover:underline">terms and conditions</span> and <span className="text-blue-600 hover:underline">privacy policy</span>.
              </Label>
            </div>
          </div>
        </div>

        <DialogFooter className="bg-slate-50 p-4 border-t border-slate-100 flex justify-center">
          <button
            onClick={() => closeModal(modalKey)}
            className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            Maybe later
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}