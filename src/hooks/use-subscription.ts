import { useQuery } from "@tanstack/react-query";
import { useCurrentUser } from "./use-current-user";
import { useState } from "react";
import { api } from "@/lib/api";

type UserPlan = "basic" | "premium" | "gold";

type SubscriptionStatus = {
  status: string;
  plan?: UserPlan;
  isPremium?: boolean;
  isGold?: boolean;
  hasGoldAccess?: boolean;
};

type ExtendedSubscriptionStatus = SubscriptionStatus & {
  userPlan: UserPlan;
  isPremium: boolean;
  isGold: boolean;
  hasGoldAccess: boolean;
};

export function useSubscription() {
  const {
    isLoading: isUserLoading,
    isError: isUserError,
    user,
  } = useCurrentUser();

  const [loading, setLoading] = useState<boolean>(false);

  const {
    data: apiSubscriptionStatus,
    isLoading: isSubscriptionLoading,
    isError: isSubscriptionError,
    refetch,
  } = useQuery({
    queryKey: ["subscriptionStatus", user?._id], // Include user ID to refetch when user changes
    queryFn: fetchSubscriptionStatus,
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    select: (data: SubscriptionStatus): ExtendedSubscriptionStatus => {
      // Determine user plan from multiple sources with priority
      const userPlan: UserPlan = determineUserPlan(user, data);
      
      const isPremium = userPlan === "premium" || userPlan === "gold";
      const isGold = userPlan === "gold";
      
      return {
        ...data,
        userPlan,
        isPremium,
        isGold,
        hasGoldAccess: isGold,
        status: isPremium ? "active" : (data?.status || "inactive")
      };
    },
  });

  // Helper function to determine user plan from various sources
  function determineUserPlan(user: any, apiData: SubscriptionStatus | undefined): UserPlan {
    // Debug logging
    console.log("determineUserPlan - user:", user);
    console.log("determineUserPlan - apiData:", apiData);
    
    // Priority order: 
    // 1. API response plan (most up-to-date from database)
    // 2. User object plan (from session)
    // 3. API response isPremium/isGold flags
    // 4. User object isPremium flag (legacy)
    // 5. Default to basic
    
    // Check API response plan first (most reliable)
    if (apiData?.plan) {
      const planLower = apiData.plan.toLowerCase();
      if (planLower === "gold") return "gold";
      if (planLower === "premium") return "premium";
      if (planLower === "basic") return "basic";
    }
    
    // Check API response flags
    if (apiData?.isGold) return "gold";
    if (apiData?.isPremium) return "premium";
    
    // Check user object plan (from session)
    if (user?.plan) {
      const planLower = user.plan.toLowerCase();
      if (planLower === "gold") return "gold";
      if (planLower === "premium") return "premium";
      if (planLower === "basic") return "basic";
    }
    
    // Legacy fallback to isPremium flag
    if (user?.isPremium) return "premium";
    
    // Check API status for legacy compatibility
    if (apiData?.status === "active") return "premium";
    
    return "basic";
  }

  async function fetchSubscriptionStatus(): Promise<SubscriptionStatus> {
    try {
      console.log("Fetching subscription status...");
      const response = await api.get("/payments/membership-status");
      
      if (response.status !== 200) {
        throw new Error("Failed to fetch subscription status");
      }
      
      console.log("Subscription API response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching subscription status:", error);
      
      // If user has plan information locally, return a fallback status
      if (user?.plan && user.plan !== "basic") {
        console.log("Using fallback user plan:", user.plan);
        return { 
          status: "active", 
          plan: user.plan as UserPlan,
          isPremium: user.plan === "premium" || user.plan === "gold",
          isGold: user.plan === "gold",
          hasGoldAccess: user.plan === "gold"
        };
      }
      
      // Legacy support: if user has isPremium flag
      if (user?.isPremium) {
        console.log("Using fallback isPremium flag");
        return { 
          status: "active", 
          plan: "premium",
          isPremium: true,
          isGold: false,
          hasGoldAccess: false
        };
      }
      
      // Return basic plan as fallback instead of throwing error
      console.log("Using basic fallback");
      return {
        status: "inactive",
        plan: "basic",
        isPremium: false,
        isGold: false,
        hasGoldAccess: false
      };
    }
  }

  // Direct plan checking methods that prioritize the latest data
  const getUserPlan = (): UserPlan => {
    if (apiSubscriptionStatus?.userPlan) {
      return apiSubscriptionStatus.userPlan;
    }
    
    // Fallback to user data if API data not available
    if (user?.plan) {
      const planLower = user.plan.toLowerCase();
      if (planLower === "gold") return "gold";
      if (planLower === "premium") return "premium";
      if (planLower === "basic") return "basic";
    }
    
    return "basic";
  };

  const isPremium = (): boolean => {
    const plan = getUserPlan();
    return plan === "premium" || plan === "gold";
  };

  const isGold = (): boolean => {
    const plan = getUserPlan();
    return plan === "gold";
  };

  const hasGoldAccess = (): boolean => {
    return isGold();
  };

  return {
    subscriptionStatus: apiSubscriptionStatus,
    isUserLoading,
    isUserError,
    isSubscriptionLoading,
    isSubscriptionError,
    loading,
    setLoading,
    refreshStatus: refetch,
    // Convenience methods for plan checking
    getUserPlan,
    isPremium,
    isGold,
    hasGoldAccess,
  };
}