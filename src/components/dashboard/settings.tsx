"use client";

import { useState, useEffect } from "react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useSubscription } from "@/hooks/use-subscription";
import { api, deleteAccount, logout } from "@/lib/api";
import stripePromise from "@/lib/stripe";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { User, CreditCard, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";

export default function GlobalSettings() {
  const {
    subscriptionStatus,
    isSubscriptionLoading,
    isSubscriptionError,
    setLoading,
  } = useSubscription();
  
  const { user } = useCurrentUser();
  const [isClient, setIsClient] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  
  // Use this effect to confirm we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, [user]);
  
  // If we haven't confirmed client-side rendering yet, show a loading state
  if (!isClient) {
    return (
      <div className="container mx-auto py-10">
        <p className="text-gray-500">Loading your settings...</p>
      </div>
    );
  }
  
  // Check subscriptionStatus or user.isPremium directly
  const isActive = subscriptionStatus?.status === "active" || user?.isPremium === true;
  
  const handleUpgrade = async () => {
    setLoading(true);
    if (!isActive) {
      try {
        const response = await api.get("/payments/create-checkout-session");
        const stripe = await stripePromise;
        
        if (response.data && response.data.sessionId) {
          await stripe?.redirectToCheckout({
            sessionId: response.data.sessionId,
          });
        } else {
          throw new Error("Invalid response from server");
        }
      } catch (error) {
        console.error("Upgrade error:", error);
        toast.error("Failed to process upgrade. Please try again or contact support.");
      } finally {
        setLoading(false);
      }
    } else {
      toast.error("You are already a premium member");
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      // Show loading toast
      toast.loading("Deleting account...");
      
      // Call our API delete function
      const result = await deleteAccount();
      
      // Close the dialog
      setShowDeleteConfirmation(false);
      
      // Show success message
      toast.success(result.message || "Account deleted successfully");
      
      // Redirect to the home page - no need to manually logout since the server handles it
      window.location.href = "/";
    } catch (error) {
      // Show error message
      const errorMessage = error instanceof Error ? error.message : "Failed to delete account. Please try again.";
      toast.error(errorMessage);
      
      console.error("Error deleting account:", error);
      setShowDeleteConfirmation(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex items-center mb-2">
            <User className="mr-2 h-5 w-5" />
            <h2 className="text-lg font-semibold">Personal information</h2>
          </div>
          <p className="text-sm text-gray-500 mb-6">Your account details</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <Input 
                value={user?.displayName || "Not Set"} 
                readOnly 
                className="bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <Input 
                value={user?.email || "Enter your email address"} 
                readOnly 
                className="bg-gray-50"
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex items-center mb-2">
            <CreditCard className="mr-2 h-5 w-5" />
            <h2 className="text-lg font-semibold">Lifetime membership</h2>
          </div>
          <p className="text-sm text-gray-500 mb-6">Your Membership details</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <Input 
                value={user?.displayName || "Not Set"} 
                readOnly 
                className="bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <Input 
                value={user?.email || "Enter your email address"} 
                readOnly 
                className="bg-gray-50"
              />
            </div>
          </div>
          
          <div className="mt-6 flex items-center">
            <div className="flex items-center">
              <div className="h-4 w-4 rounded-full bg-green-500 mr-2"></div>
              <span className="text-sm font-medium">Active membership</span>
            </div>
            <div className="ml-6">
              <span className="text-sm">Lifetime access guaranteed</span>
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <p className="text-sm">
            Thank you for being a lifetime member! Enjoy unlimited access to all our premium features
          </p>
        </CardContent>
      </Card>
      
      <div className="border-l-4 border-red-500 bg-red-50 p-6 rounded-sm">
        <div className="flex items-start">
          <div className="bg-red-100 rounded-md p-1 mr-2">
            <X className="h-5 w-5 text-red-500" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-red-600">Danger Zone</h3>
            <p className="text-sm text-red-600 mb-4">
              Warning: This section contains irreversible actions that will permanently delete your account and all associated data
            </p>
            <Button 
              variant="destructive" 
              className="bg-red-500 hover:bg-red-600"
              onClick={() => setShowDeleteConfirmation(true)}
            >
              Delete Account
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirmation} onOpenChange={setShowDeleteConfirmation}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle className="text-xl font-semibold">
            Are you absolutely sure?
          </DialogTitle>
          <DialogDescription className="py-4">
            This action cannot be undone. This will permanently delete your account and remove your data from our servers
          </DialogDescription>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => setShowDeleteConfirmation(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              className="flex-1 bg-red-500 hover:bg-red-600 text-white"
              onClick={handleDeleteConfirm}
            >
              Yes, delete my account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}