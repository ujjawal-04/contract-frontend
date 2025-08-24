"use client";

import { useState, useEffect, ForwardRefExoticComponent, RefAttributes } from "react";
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
  AlertCircle,
  Bell,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Info,
  LucideProps,
  Crown,
  Zap,
  Star,
  Check,
  Sparkles
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
import { useQuery } from "@tanstack/react-query";

export default function GlobalSettings() {
  const {
    subscriptionStatus,
    isSubscriptionLoading,
    isSubscriptionError,
    setLoading,
    isPremium: isUserPremium,
    hasGoldAccess,
    getUserPlan
  } = useSubscription();
  
  const { user } = useCurrentUser();
  const [isClient, setIsClient] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  
  // Get user plan and access levels
  const userPlan = getUserPlan();
  const isPremium = isUserPremium();
  const isGold = hasGoldAccess();
  
  // Fetch user's contract statistics
  const { data: userStats, isLoading: isStatsLoading } = useQuery({
    queryKey: ["user-contract-stats"],
    queryFn: async () => {
      try {
        const response = await api.get("/contracts/user-stats");
        return response.data;
      } catch (err) {
        console.error("Error fetching user contract stats:", err);
        // Default fallback values
        return { contractCount: 0, contractLimit: isPremium ? Infinity : 2, plan: userPlan };
      }
    },
    enabled: !!user,
  });

  // Use this effect to confirm we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, [user]);

  // Check if user should see upgrade dialog for free plan limits
  useEffect(() => {
    if (userStats && !isPremium) {
      const { contractCount, contractLimit } = userStats;
      if (contractCount >= contractLimit) {
        setShowUpgradeDialog(true);
      }
    }
  }, [userStats, isPremium]);
  
  // If we haven't confirmed client-side rendering yet, show a loading state
  if (!isClient) {
    return (
      <div className="w-full max-w-full min-h-[50vh] flex items-center justify-center px-4">
        <div className="flex flex-col items-center justify-center">
          <div className={`animate-spin h-8 w-8 border-4 ${isGold ? 'border-yellow-500' : 'border-blue-500'} border-t-transparent rounded-full mb-4`}></div>
          <p className="text-gray-500 text-center">Loading your settings...</p>
        </div>
      </div>
    );
  }

  const handleUpgrade = async (targetPlan: "premium" | "gold" = "premium") => {
    setLoading(true);
    if (!isPremium || (targetPlan === "gold" && !isGold)) {
      try {
        const response = await api.get(`/payments/create-checkout-session?plan=${targetPlan}`);
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
        // Fallback to generic upgrade if plan-specific fails
        try {
          const response = await api.get("/payments/create-checkout-session");
          const stripe = await stripePromise;
          await stripe?.redirectToCheckout({
            sessionId: response.data.sessionId,
          });
        } catch (fallbackError) {
          toast.error("Failed to process upgrade. Please try again or contact support.");
        }
      } finally {
        setLoading(false);
      }
    } else {
      toast.error(`You already have ${targetPlan} access`);
      setLoading(false);
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

  // Plan-specific features for comparison
  const planFeatures = {
    basic: [
      "Basic contract analysis",
      "2 projects",
      "Limited risk detection",
      "Brief contract summary",
      "Standard support"
    ],
    premium: [
      "Advanced contract analysis",
      "Unlimited projects",
      "Basic AI chat (50 messages)",
      "10+ opportunities with impact levels",
      "Comprehensive contract summary",
      "Improvement recommendations",
      "Key clauses identification",
      "Priority support"
    ],
    gold: [
      "Everything in Premium plus:",
      "Unlimited AI chat",
      "Advanced contract modifications",
      "15+ risk identifications",
      "Custom recommendations",
      "Industry best practices",
      "Legal precedent analysis",
      "24/7 priority support"
    ]
  };

  // Generate notifications based on user status and usage
  const generateNotifications = () => {
    const notifications: { 
      id: number; 
      type: string; 
      icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>; 
      title: string; 
      message: string; 
      timestamp: string; 
      action: string | null; 
    }[] = [];
    
    if (!userStats) return notifications;

    const { contractCount, contractLimit } = userStats;
    const usagePercentage = isPremium ? 0 : Math.round((contractCount / contractLimit) * 100);

    if (isGold) {
      // Gold plan notifications
      notifications.push({
        id: 1,
        type: "gold",
        icon: Crown,
        title: "Gold member benefits active",
        message: `You have unlimited access to all features. You've analyzed ${contractCount} contracts with advanced AI assistance.`,
        timestamp: "Active",
        action: null
      });
      
      if (contractCount > 20) {
        notifications.push({
          id: 2,
          type: "gold",
          icon: Sparkles,
          title: "Power user achievement!",
          message: `Incredible! You've analyzed ${contractCount} contracts with our Gold AI. You're maximizing your legal efficiency.`,
          timestamp: "This month",
          action: null
        });
      }
    } else if (isPremium) {
      // Premium plan notifications
      notifications.push({
        id: 3,
        type: "success",
        icon: Zap,
        title: "Premium member",
        message: `You have unlimited contract analyses and AI chat. You've analyzed ${contractCount} contracts this month.`,
        timestamp: "Active",
        action: null
      });
      
      if (contractCount > 10) {
        notifications.push({
          id: 4,
          type: "info",
          icon: Star,
          title: "Consider Gold upgrade",
          message: `You're a heavy user! Upgrade to Gold for unlimited AI chat and advanced contract modifications.`,
          timestamp: "Suggestion",
          action: "upgrade_gold"
        });
      }
    } else {
      // Free plan notifications
      if (contractCount === 0) {
        notifications.push({
          id: 5,
          type: "info",
          icon: Info,
          title: "Welcome to your free plan!",
          message: `You have ${contractLimit} contract analyses available. Start analyzing your first contract now.`,
          timestamp: "Just now",
          action: null
        });
      } else if (contractCount === contractLimit - 1) {
        notifications.push({
          id: 6,
          type: "warning",
          icon: AlertTriangle,
          title: "Almost at your limit",
          message: `You have used ${contractCount} of ${contractLimit} free analyses. Only 1 remaining.`,
          timestamp: "Recent",
          action: "upgrade"
        });
      } else if (contractCount >= contractLimit) {
        notifications.push({
          id: 7,
          type: "error",
          icon: XCircle,
          title: "Free plan limit reached",
          message: `You've used all ${contractLimit} free contract analyses. Upgrade to continue.`,
          timestamp: "Now",
          action: "upgrade"
        });
      } else {
        notifications.push({
          id: 8,
          type: "success",
          icon: TrendingUp,
          title: "Great progress!",
          message: `You've analyzed ${contractCount} of ${contractLimit} contracts. ${contractLimit - contractCount} analyses remaining.`,
          timestamp: "Recent",
          action: null
        });
      }
    }

    // Account status notification
    notifications.push({
      id: 9,
      type: isGold ? "gold" : "info",
      icon: Shield,
      title: "Account Status",
      message: `Your account is active and secure. Plan: ${isGold ? 'Gold (Premium)' : isPremium ? 'Premium (Lifetime)' : 'Basic (Free)'}`,
      timestamp: `${isGold ? 'Gold Access' : isPremium ? 'Lifetime' : 'Free till 2 contracts'}`,
      action: null
    });

    return notifications;
  };

  const notifications = generateNotifications();

  const getNotificationStyle = (type: string) => {
    switch (type) {
      case "error":
        return {
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          iconColor: "text-red-500",
          textColor: "text-red-800"
        };
      case "warning":
        return {
          bgColor: "bg-amber-50",
          borderColor: "border-amber-200",
          iconColor: "text-amber-500",
          textColor: "text-amber-800"
        };
      case "success":
        return {
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          iconColor: "text-green-500",
          textColor: "text-green-800"
        };
      case "gold":
        return {
          bgColor: "bg-gradient-to-br from-yellow-50 to-amber-50",
          borderColor: "border-yellow-200",
          iconColor: "text-yellow-600",
          textColor: "text-yellow-800"
        };
      case "info":
      default:
        return {
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          iconColor: "text-blue-500",
          textColor: "text-blue-800"
        };
    }
  };

  // Get plan-specific badge
  const getPlanBadge = () => {
    if (isGold) {
      return (
        <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white border-0 font-semibold shadow-md">
          <Crown className="h-3 w-3 mr-1" />
          Gold
        </Badge>
      );
    }
    if (isPremium) {
      return (
        <Badge className="bg-blue-600 text-white font-semibold">
          <Zap className="h-3 w-3 mr-1" />
          Premium
        </Badge>
      );
    }
    return (
      <Badge className="bg-gray-100 text-gray-700 font-medium">
        Basic
      </Badge>
    );
  };

  // Get current plan features
  const getCurrentPlanFeatures = () => {
    if (isGold) return planFeatures.gold;
    if (isPremium) return planFeatures.premium;
    return planFeatures.basic;
  };

  // Gold Features Section - enhanced with better styling
  const GoldFeaturesSection = () => {
    if (!isGold) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gradient-to-r from-yellow-50 via-amber-50 to-yellow-50 border-2 border-yellow-300 shadow-lg mb-6 overflow-hidden relative">
          {/* Sparkle animation background */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-4 right-4 animate-pulse">
              <Sparkles className="h-6 w-6 text-yellow-500" />
            </div>
            <div className="absolute top-8 left-8 animate-pulse delay-300">
              <Star className="h-4 w-4 text-yellow-400" />
            </div>
            <div className="absolute bottom-6 right-8 animate-pulse delay-700">
              <Crown className="h-5 w-5 text-yellow-500" />
            </div>
          </div>
          
          <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6 relative">
            <CardTitle className="text-yellow-800 text-lg flex items-center gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-yellow-200 rounded-full">
                  <Crown className="h-5 w-5 text-yellow-700" />
                </div>
                <span className="bg-gradient-to-r from-yellow-700 to-amber-700 bg-clip-text text-transparent font-bold">
                  Gold Features Active
                </span>
              </div>
            </CardTitle>
            <CardDescription className="text-yellow-700 text-sm">
              You have access to our most advanced AI features and unlimited everything
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-6 relative">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <motion.div 
                className="flex items-center gap-2 text-sm text-yellow-700"
                whileHover={{ scale: 1.02 }}
              >
                <div className="p-0.5 bg-yellow-200 rounded-full">
                  <Check className="h-3 w-3 text-yellow-700" />
                </div>
                <span className="font-medium">Unlimited AI chat</span>
              </motion.div>
              <motion.div 
                className="flex items-center gap-2 text-sm text-yellow-700"
                whileHover={{ scale: 1.02 }}
              >
                <div className="p-0.5 bg-yellow-200 rounded-full">
                  <Check className="h-3 w-3 text-yellow-700" />
                </div>
                <span className="font-medium">Advanced contract modifications</span>
              </motion.div>
              <motion.div 
                className="flex items-center gap-2 text-sm text-yellow-700"
                whileHover={{ scale: 1.02 }}
              >
                <div className="p-0.5 bg-yellow-200 rounded-full">
                  <Check className="h-3 w-3 text-yellow-700" />
                </div>
                <span className="font-medium">15+ risk identifications</span>
              </motion.div>
              <motion.div 
                className="flex items-center gap-2 text-sm text-yellow-700"
                whileHover={{ scale: 1.02 }}
              >
                <div className="p-0.5 bg-yellow-200 rounded-full">
                  <Check className="h-3 w-3 text-yellow-700" />
                </div>
                <span className="font-medium">24/7 priority support</span>
              </motion.div>
            </div>
            
            {/* Gold member exclusive badge */}
            <div className="mt-4 flex justify-center">
              <Badge className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-4 py-2 text-sm font-bold shadow-md">
                <Crown className="h-4 w-4 mr-2" />
                Gold Member Exclusive
              </Badge>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className={`w-full max-w-full mx-auto py-4 xs:py-6 sm:py-8 md:py-10 px-3 xs:px-4 sm:px-6 ${isGold ? 'bg-gradient-to-br from-yellow-50/30 to-amber-50/30 min-h-screen' : ''}`}>
      <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3 mb-4 sm:mb-6">
        <div className="flex items-center">
          <div className={`p-2 rounded-lg mr-3 ${isGold ? 'bg-gradient-to-r from-yellow-400 to-amber-500' : 'bg-blue-600'}`}>
            <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-white flex-shrink-0" />
          </div>
          <h1 className={`text-xl sm:text-2xl font-bold ${isGold ? 'bg-gradient-to-r from-yellow-700 to-amber-700 bg-clip-text text-transparent' : ''}`}>
            Account Settings
          </h1>
          {isGold && (
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Crown className="h-6 w-6 text-yellow-600 ml-2" />
            </motion.div>
          )}
        </div>
        
        {/* Enhanced subscription status indicator */}
        {isSubscriptionError ? (
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-red-100 text-red-800 mt-1 xs:mt-0 self-start xs:self-auto">
            <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
            <span className="truncate">Error loading subscription</span>
          </div>
        ) : (
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium mt-1 xs:mt-0 self-start xs:self-auto ${isGold ? 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border border-yellow-200' : 'bg-gray-100 text-gray-800'}`}>
            {isSubscriptionLoading ? (
              <div className="flex items-center">
                <div className={`animate-spin h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 border-b-2 rounded-full ${isGold ? 'border-yellow-500' : 'border-gray-500'}`}></div>
                <span className="truncate">Loading...</span>
              </div>
            ) : (
              <>
                <Shield className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0 ${isGold ? 'text-yellow-600' : 'text-blue-500'}`} />
                <span className="mr-1 sm:mr-2 hidden xs:inline">Plan:</span>
                {getPlanBadge()}
              </>
            )}
          </div>
        )}
      </div>

      {/* Gold Features Section - only show for Gold users */}
      <GoldFeaturesSection />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Personal Information Card */}
          <Card className={`overflow-hidden ${isGold ? 'shadow-lg border-yellow-200 bg-gradient-to-br from-white to-yellow-50/20' : 'shadow-sm'}`}>
            <CardHeader className={`pb-3 sm:pb-4 px-4 sm:px-6 ${isGold ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-b border-yellow-200' : 'bg-slate-50'}`}>
              <div className="flex items-center">
                <User className={`mr-2 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 ${isGold ? 'text-yellow-600' : 'text-blue-600'}`} />
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
                    className={`text-sm h-9 ${isGold ? 'bg-yellow-50/50 border-yellow-200' : 'bg-gray-50'}`}
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">Email</label>
                  <Input 
                    value={user?.email || "Enter your email address"} 
                    readOnly 
                    className={`text-sm h-9 ${isGold ? 'bg-yellow-50/50 border-yellow-200' : 'bg-gray-50'}`}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Membership Card */}
          <Card className={`overflow-hidden ${isGold ? 'shadow-lg border-yellow-200 bg-gradient-to-br from-white to-yellow-50/20' : 'shadow-sm'}`}>
            <CardHeader className={`pb-3 sm:pb-4 px-4 sm:px-6 ${isGold ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-b border-yellow-200' : 'bg-slate-50'}`}>
              <div className="flex items-center">
                <CreditCard className={`mr-2 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 ${isGold ? 'text-yellow-600' : 'text-blue-600'}`} />
                <CardTitle className="text-base sm:text-lg">Membership Status</CardTitle>
              </div>
              <CardDescription className="text-xs sm:text-sm">Your subscription details and features</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
              {/* Current Plan Status */}
              <div className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg border ${isGold ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200' : 'bg-slate-50'}`}>
                <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3 sm:gap-4">
                  <div>
                    <div className="flex items-center mb-1 sm:mb-2">
                      <div className={`h-2 w-2 sm:h-3 sm:w-3 rounded-full mr-2 flex-shrink-0 ${isGold ? 'bg-gradient-to-r from-yellow-400 to-amber-500' : isPremium ? 'bg-blue-500' : 'bg-gray-500'}`}></div>
                      <span className="font-medium text-sm sm:text-base">
                        {isGold ? 'Gold Plan' : isPremium ? 'Premium Plan' : 'Basic Plan'}
                      </span>
                      {(isGold || isPremium) && (
                        <Badge className={`ml-2 text-xs ${isGold ? 'bg-gradient-to-r from-yellow-200 to-amber-200 text-yellow-800 border-yellow-300' : 'bg-green-100 text-green-800'} hover:bg-green-100`}>
                          {isGold ? 'Gold Access' : 'Lifetime'}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600">
                      {isGold 
                        ? "You have access to our most advanced AI features and unlimited everything" 
                        : isPremium 
                        ? "You have full access to all premium features" 
                        : "Limited access to basic features"
                      }
                    </p>
                  </div>
                  
                  {/* Show appropriate upgrade buttons */}
                  {!isPremium && !isSubscriptionLoading && (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4 whitespace-nowrap"
                        onClick={() => handleUpgrade("premium")}
                      >
                        <Zap className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        Upgrade to Premium
                      </Button>
                      <Button
                        className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4 whitespace-nowrap shadow-md"
                        onClick={() => handleUpgrade("gold")}
                      >
                        <Crown className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        Upgrade to Gold
                      </Button>
                    </div>
                  )}

                  {isPremium && !isGold && !isSubscriptionLoading && (
                    <Button
                      className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4 whitespace-nowrap shadow-md"
                      onClick={() => handleUpgrade("gold")}
                    >
                      <Crown className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                      Upgrade to Gold
                    </Button>
                  )}
                </div>
              </div>

              {/* Usage Statistics */}
              {userStats && !isStatsLoading && (
                <div className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg border ${isGold ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200' : 'bg-blue-50'}`}>
                  <h3 className={`font-medium text-sm sm:text-base mb-2 ${isGold ? 'text-yellow-800' : 'text-blue-800'}`}>Usage Statistics</h3>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs sm:text-sm ${isGold ? 'text-yellow-700' : 'text-blue-700'}`}>Contracts Analyzed</span>
                    <span className={`font-semibold text-sm sm:text-base ${isGold ? 'text-yellow-800' : 'text-blue-800'}`}>
                      {userStats.contractCount}{!isPremium && ` / ${userStats.contractLimit}`}
                    </span>
                  </div>
                  
                  {!isPremium && (
                    <>
                      <div className={`w-full rounded-full h-2 mb-2 ${isGold ? 'bg-yellow-200' : 'bg-blue-200'}`}>
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${isGold ? 'bg-gradient-to-r from-yellow-400 to-amber-500' : 'bg-blue-600'}`} 
                          style={{ width: `${Math.min((userStats.contractCount / userStats.contractLimit) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs ${isGold ? 'text-yellow-600' : 'text-blue-600'}`}>
                          {userStats.contractLimit - userStats.contractCount} remaining
                        </span>
                        <span className={`text-xs ${isGold ? 'text-yellow-600' : 'text-blue-600'}`}>
                          {Math.round((userStats.contractCount / userStats.contractLimit) * 100)}% used
                        </span>
                      </div>
                    </>
                  )}
                  
                  {/* Gold/Premium usage metrics */}
                  {(isPremium || isGold) && (
                    <div className="mt-3 grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className={`text-lg font-bold ${isGold ? 'text-yellow-800' : 'text-blue-800'}`}>∞</div>
                        <div className={`text-xs ${isGold ? 'text-yellow-600' : 'text-blue-600'}`}>AI Messages</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-lg font-bold ${isGold ? 'text-yellow-800' : 'text-blue-800'}`}>∞</div>
                        <div className={`text-xs ${isGold ? 'text-yellow-600' : 'text-blue-600'}`}>Analyses</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Enhanced Feature Comparison */}
              <div className="mt-4 sm:mt-6">
                <h3 className="font-medium text-sm sm:text-base mb-3 sm:mb-4">Your plan includes:</h3>
                <div className="space-y-1 sm:space-y-2">
                  {getCurrentPlanFeatures().map((feature, index) => (
                    <motion.div 
                      key={index} 
                      className="flex items-start"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className={`p-0.5 rounded-full mr-1.5 sm:mr-2 mt-0.5 flex-shrink-0 ${isGold ? 'bg-yellow-200' : ''}`}>
                        <CheckCircle2 className={`h-4 w-4 sm:h-5 sm:w-5 ${isGold ? 'text-yellow-600' : 'text-green-500'}`} />
                      </div>
                      <span className={`text-xs sm:text-sm ${isGold ? 'text-yellow-800 font-medium' : 'text-slate-700'}`}>{feature}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Upgrade section for non-Gold users */}
                {!isGold && (
                  <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-dashed border-slate-200">
                    {!isPremium ? (
                      <>
                        <h3 className="font-medium text-sm sm:text-base mb-2 sm:mb-3 text-blue-600">
                          Upgrade to Premium to unlock:
                        </h3>
                        <div className="space-y-1 sm:space-y-2 mb-4">
                          {planFeatures.premium.filter(f => !planFeatures.basic.includes(f)).map((feature, index) => (
                            <div key={index} className="flex items-start">
                              <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400 mr-1.5 sm:mr-2 mt-0.5 flex-shrink-0" />
                              <span className="text-xs sm:text-sm text-slate-500">{feature}</span>
                            </div>
                          ))}
                        </div>

                        <h3 className="font-medium text-sm sm:text-base mb-2 sm:mb-3 text-yellow-600 flex items-center gap-2">
                          <Crown className="h-4 w-4" />
                          Or upgrade to Gold for everything:
                        </h3>
                        <div className="space-y-1 sm:space-y-2 mb-4">
                          {planFeatures.gold.filter(f => !planFeatures.basic.includes(f)).map((feature, index) => (
                            <div key={index} className="flex items-start">
                              <Crown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-500 mr-1.5 sm:mr-2 mt-0.5 flex-shrink-0" />
                              <span className="text-xs sm:text-sm text-yellow-700">{feature}</span>
                            </div>
                          ))}
                        </div>
                        
                        <motion.div 
                          className="space-y-3"
                          initial={{ opacity: 0.8 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                        >
                          <Button
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm h-9 sm:h-10"
                            onClick={() => handleUpgrade("premium")}
                          >
                            <Zap className="mr-2 h-4 w-4" />
                            Upgrade to Premium
                          </Button>
                          <Button
                            className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white text-xs sm:text-sm h-9 sm:h-10 shadow-md"
                            onClick={() => handleUpgrade("gold")}
                          >
                            <Crown className="mr-2 h-4 w-4" />
                            Upgrade to Gold (Recommended)
                          </Button>
                        </motion.div>
                      </>
                    ) : (
                      <>
                        <h3 className="font-medium text-sm sm:text-base mb-2 sm:mb-3 text-yellow-600 flex items-center gap-2">
                          <Crown className="h-4 w-4" />
                          Upgrade to Gold to unlock:
                        </h3>
                        <div className="space-y-1 sm:space-y-2">
                          {planFeatures.gold.filter(f => !planFeatures.premium.includes(f) && f !== "Everything in Premium plus:").map((feature, index) => (
                            <div key={index} className="flex items-start">
                              <Crown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-500 mr-1.5 sm:mr-2 mt-0.5 flex-shrink-0" />
                              <span className="text-xs sm:text-sm text-yellow-700">{feature}</span>
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
                            className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white text-xs sm:text-sm h-9 sm:h-10 shadow-md"
                            onClick={() => handleUpgrade("gold")}
                          >
                            <Crown className="mr-2 h-4 w-4" />
                            Upgrade to Gold
                          </Button>
                        </motion.div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-4 sm:space-y-6">
          {/* Enhanced Notifications Card */}
          <Card className={`overflow-hidden ${isGold ? 'shadow-lg border-yellow-200 bg-gradient-to-br from-white to-yellow-50/20' : 'shadow-sm'}`}>
            <CardHeader className={`pb-3 sm:pb-4 px-4 sm:px-6 ${isGold ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-b border-yellow-200' : 'bg-slate-50'}`}>
              <div className="flex items-center">
                <Bell className={`mr-2 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 ${isGold ? 'text-yellow-600' : 'text-blue-600'}`} />
                <CardTitle className="text-base sm:text-lg">Notifications</CardTitle>
              </div>
              <CardDescription className="text-xs sm:text-sm">Account alerts and updates</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {isStatsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className={`animate-spin h-6 w-6 border-2 border-t-transparent rounded-full ${isGold ? 'border-yellow-500' : 'border-blue-500'}`}></div>
                  </div>
                ) : (
                  notifications.map((notification) => {
                    const styles = getNotificationStyle(notification.type);
                    const IconComponent = notification.icon;
                    
                    return (
                      <motion.div 
                        key={notification.id} 
                        className={`p-3 rounded-lg border ${styles.bgColor} ${styles.borderColor}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: notification.id * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            <div className={`p-1 rounded-full ${notification.type === 'gold' ? 'bg-yellow-200' : ''}`}>
                              <IconComponent className={`h-4 w-4 ${styles.iconColor} mt-0.5`} />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className={`font-medium text-xs sm:text-sm ${styles.textColor} mb-1`}>
                              {notification.title}
                            </h4>
                            <p className={`text-xs ${styles.textColor} opacity-90 mb-2`}>
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className={`text-xs ${styles.textColor} opacity-75 flex items-center`}>
                                <Clock className="h-3 w-3 mr-1" />
                                {notification.timestamp}
                              </span>
                              {notification.action === "upgrade" && (
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    className="h-6 px-2 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                                    onClick={() => handleUpgrade("premium")}
                                  >
                                    Premium
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="h-6 px-2 text-xs bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white shadow-md"
                                    onClick={() => handleUpgrade("gold")}
                                  >
                                    <Crown className="h-3 w-3 mr-1" />
                                    Gold
                                  </Button>
                                </div>
                              )}
                              {notification.action === "upgrade_gold" && (
                                <Button
                                  size="sm"
                                  className="h-6 px-2 text-xs bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white shadow-md"
                                  onClick={() => handleUpgrade("gold")}
                                >
                                  <Crown className="h-3 w-3 mr-1" />
                                  Gold
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Card */}
          <Card className={`overflow-hidden ${isGold ? 'shadow-lg border-yellow-200 bg-gradient-to-br from-white to-yellow-50/20' : 'shadow-sm'}`}>
            <CardHeader className={`pb-3 sm:pb-4 px-4 sm:px-6 ${isGold ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-b border-yellow-200' : 'bg-slate-50'}`}>
              <div className="flex items-center">
                <Settings className={`mr-2 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 ${isGold ? 'text-yellow-600' : 'text-blue-600'}`} />
                <CardTitle className="text-base sm:text-lg">Account Actions</CardTitle>
              </div>
              <CardDescription className="text-xs sm:text-sm">Manage your account</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
              <div className="space-y-4">
                {/* Gold Member Status for Gold users */}
                {isGold && (
                  <div className="border-l-4 border-yellow-500 bg-gradient-to-r from-yellow-50 to-amber-50 p-3 sm:p-4 rounded-sm mb-4">
                    <div className="flex items-start">
                      <div className="bg-yellow-200 rounded-md p-1 mr-2 flex-shrink-0">
                        <Crown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-xs sm:text-sm text-yellow-800">Gold Member Status</h3>
                        <p className="text-xs text-yellow-700 mb-2 sm:mb-3 mt-0.5">
                          You're enjoying the highest tier of our service with unlimited access to all premium features
                        </p>
                        <Badge className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-xs px-2 py-1">
                          <Sparkles className="h-3 w-3 mr-1" />
                          Gold Member
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}

                {/* Upgrade Actions for non-Gold users */}
                {!isGold && (
                  <div className={`border-l-4 p-3 sm:p-4 rounded-sm mb-4 ${isPremium ? 'border-yellow-500 bg-gradient-to-r from-yellow-50 to-amber-50' : 'border-blue-500 bg-blue-50'}`}>
                    <div className="flex items-start">
                      <div className={`rounded-md p-1 mr-2 flex-shrink-0 ${isPremium ? 'bg-yellow-200' : 'bg-blue-100'}`}>
                        {!isPremium ? (
                          <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500" />
                        ) : (
                          <Crown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-semibold text-xs sm:text-sm ${isPremium ? 'text-yellow-800' : 'text-blue-600'}`}>
                          {!isPremium ? "Upgrade Available" : "Gold Upgrade Available"}
                        </h3>
                        <p className={`text-xs mb-2 sm:mb-3 mt-0.5 ${isPremium ? 'text-yellow-700' : 'text-blue-600'}`}>
                          {!isPremium 
                            ? "Unlock unlimited contract analysis and advanced features" 
                            : "Get unlimited AI chat and advanced contract modifications"
                          }
                        </p>
                        <div className="flex gap-2">
                          {!isPremium && (
                            <Button 
                              className="bg-blue-500 hover:bg-blue-600 text-xs px-2 sm:px-3 py-0.5 sm:py-1 h-auto text-white"
                              onClick={() => handleUpgrade("premium")}
                            >
                              <Zap className="h-3 w-3 mr-1" />
                              Premium
                            </Button>
                          )}
                          <Button 
                            className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-xs px-2 sm:px-3 py-0.5 sm:py-1 h-auto text-white shadow-md"
                            onClick={() => handleUpgrade("gold")}
                          >
                            <Crown className="h-3 w-3 mr-1" />
                            Gold
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

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