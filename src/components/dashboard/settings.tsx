"use client";

import { useState, useEffect } from "react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useSubscription } from "@/hooks/use-subscription";
import { api, deleteAccount } from "@/lib/api";
import stripePromise from "@/lib/stripe";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  User, 
  CreditCard, 
  X, 
  CheckCircle2, 
  Shield, 
  AlertTriangle, 
  Settings,
  ArrowRight,
  AlertCircle
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

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
      <div className="w-full max-w-full min-h-[50vh] flex items-center justify-center px-4">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
          <p className="text-gray-500 text-center">Loading your settings...</p>
        </div>
      </div>
    );
  }
  
  // Check subscriptionStatus or user.isPremium directly
  const isPremium = subscriptionStatus?.status === "active" || user?.isPremium === true;
  
  const handleUpgrade = async () => {
    setLoading(true);
    if (!isPremium) {
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

  // Basic plan features for comparison
  const basicFeatures = [
    "Basic contract analysis",
    "2 projects",
    "Limited risk detection",
    "Brief contract summary",
    "Standard support"
  ];

  // Premium plan features for comparison
  const premiumFeatures = [
    "Advanced contract analysis",
    "Unlimited projects",
    "Chat with your contract",
    "10+ opportunities with impact levels",
    "Comprehensive contract summary",
    "Improvement recommendations",
    "Key clauses identification",
    "Priority support"
  ];

  return (
    <div className="w-full max-w-full mx-auto py-4 xs:py-6 sm:py-8 md:py-10 px-3 xs:px-4 sm:px-6">
      <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3 mb-4 sm:mb-6">
        <div className="flex items-center">
          <Settings className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-blue-600 flex-shrink-0" />
          <h1 className="text-xl sm:text-2xl font-bold truncate">Account Settings</h1>
        </div>
        
        {/* Subscription status indicator */}
        {isSubscriptionError ? (
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-red-100 text-red-800 mt-1 xs:mt-0 self-start xs:self-auto">
            <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
            <span className="truncate">Error loading subscription</span>
          </div>
        ) : (
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-gray-100 text-gray-800 mt-1 xs:mt-0 self-start xs:self-auto">
            {isSubscriptionLoading ? (
              <div className="flex items-center">
                <div className="animate-spin h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 border-b-2 border-gray-500 rounded-full"></div>
                <span className="truncate">Loading...</span>
              </div>
            ) : (
              <>
                <Shield className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0 text-blue-500" />
                <span className="mr-1 sm:mr-2 hidden xs:inline">Plan:</span>
                <span className={`truncate ${isPremium ? "text-green-600 font-semibold" : "text-blue-600"}`}>
                  {isPremium ? "Premium" : "Basic"}
                </span>
              </>
            )}
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Personal Information Card */}
          <Card className="overflow-hidden shadow-sm">
            <CardHeader className="bg-slate-50 pb-3 sm:pb-4 px-4 sm:px-6">
              <div className="flex items-center">
                <User className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                <CardTitle className="text-base sm:text-lg">Personal Information</CardTitle>
              </div>
              <CardDescription className="text-xs sm:text-sm">Your account details</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">Full Name</label>
                  <Input 
                    value={user?.displayName || "Not Set"} 
                    readOnly 
                    className="bg-gray-50 text-sm h-9"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">Email</label>
                  <Input 
                    value={user?.email || "Enter your email address"} 
                    readOnly 
                    className="bg-gray-50 text-sm h-9"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Membership Card */}
          <Card className="overflow-hidden shadow-sm">
            <CardHeader className="bg-slate-50 pb-3 sm:pb-4 px-4 sm:px-6">
              <div className="flex items-center">
                <CreditCard className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                <CardTitle className="text-base sm:text-lg">Membership Status</CardTitle>
              </div>
              <CardDescription className="text-xs sm:text-sm">Your subscription details</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
              {/* Current Plan Status */}
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg border bg-slate-50">
                <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3 sm:gap-4">
                  <div>
                    <div className="flex items-center mb-1 sm:mb-2">
                      <div className={`h-2 w-2 sm:h-3 sm:w-3 rounded-full ${isPremium ? 'bg-green-500' : 'bg-blue-500'} mr-2 flex-shrink-0`}></div>
                      <span className="font-medium text-sm sm:text-base">{isPremium ? 'Premium Plan' : 'Basic Plan'}</span>
                      {isPremium && (
                        <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-100 text-xs">Lifetime</Badge>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600">
                      {isPremium 
                        ? "You have full access to all premium features" 
                        : "Limited access to basic features"
                      }
                    </p>
                  </div>
                  
                  {!isPremium && !isSubscriptionLoading && (
                    <Button
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4 whitespace-nowrap"
                      onClick={handleUpgrade}
                    >
                      Upgrade to Premium
                      <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Feature Comparison Table */}
              <div className="mt-4 sm:mt-6">
                <h3 className="font-medium text-sm sm:text-base mb-3 sm:mb-4">Your plan includes:</h3>
                <div className="space-y-1 sm:space-y-2">
                  {(isPremium ? premiumFeatures : basicFeatures).map((feature, index) => (
                    <div key={index} className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-1.5 sm:mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-xs sm:text-sm text-slate-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {!isPremium && (
                  <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-dashed border-slate-200">
                    <h3 className="font-medium text-sm sm:text-base mb-2 sm:mb-3 text-blue-600">Upgrade to Premium to unlock:</h3>
                    <div className="space-y-1 sm:space-y-2">
                      {premiumFeatures.filter(f => !basicFeatures.includes(f)).map((feature, index) => (
                        <div key={index} className="flex items-start">
                          <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400 mr-1.5 sm:mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-xs sm:text-sm text-slate-500">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <motion.div 
                      className="mt-4 sm:mt-6"
                      initial={{ opacity: 0.8 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                    >
                      <Button
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm h-9 sm:h-10"
                        onClick={handleUpgrade}
                      >
                        Upgrade to Premium
                      </Button>
                    </motion.div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-4 sm:space-y-6">
          {/* Action Card */}
          <Card className="overflow-hidden shadow-sm">
            <CardHeader className="bg-slate-50 pb-3 sm:pb-4 px-4 sm:px-6">
              <div className="flex items-center">
                <Settings className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                <CardTitle className="text-base sm:text-lg">Account Actions</CardTitle>
              </div>
              <CardDescription className="text-xs sm:text-sm">Manage your account</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
              <div className="space-y-4">
                {/* Danger Zone */}
                <div className="border-l-4 border-red-500 bg-red-50 p-3 sm:p-4 rounded-sm">
                  <div className="flex items-start">
                    <div className="bg-red-100 rounded-md p-1 mr-2 flex-shrink-0">
                      <X className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-xs sm:text-sm text-red-600">Danger Zone</h3>
                      <p className="text-xs text-red-600 mb-2 sm:mb-3 mt-0.5">
                        Warning: This action will permanently delete your account and all associated data
                      </p>
                      <Button 
                        variant="destructive" 
                        className="bg-red-500 hover:bg-red-600 text-xs px-2 sm:px-3 py-0.5 sm:py-1 h-auto"
                        onClick={() => setShowDeleteConfirmation(true)}
                      >
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirmation} onOpenChange={setShowDeleteConfirmation}>
        <DialogContent className="sm:max-w-md p-4 sm:p-6 max-h-[90vh] overflow-auto">
          <DialogTitle className="text-lg sm:text-xl font-semibold">
            Are you absolutely sure?
          </DialogTitle>
          <DialogDescription className="py-3 sm:py-4 text-xs sm:text-sm">
            This action cannot be undone. This will permanently delete your account and remove your data from our servers
          </DialogDescription>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              className="flex-1 text-xs sm:text-sm h-8 sm:h-9"
              onClick={() => setShowDeleteConfirmation(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs sm:text-sm h-8 sm:h-9"
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