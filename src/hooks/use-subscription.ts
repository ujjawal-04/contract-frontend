import { useQuery } from "@tanstack/react-query";
import { useCurrentUser } from "./use-current-user";
import { useState } from "react";
import { api } from "@/lib/api";

type UserPlan = "basic" | "premium" | "gold";

type SubscriptionStatus = {
  status: string;
  plan?: UserPlan;
  // Add other properties that might be in the response
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
    queryKey: ["subscriptionStatus"],
    queryFn: fetchSubscriptionStatus,
    enabled: !!user,
    select: (data: SubscriptionStatus): ExtendedSubscriptionStatus => {
      // Determine user plan from multiple sources
      const userPlan: UserPlan = getUserPlan(user, data);
      
      return {
        ...data,
        userPlan,
        isPremium: userPlan === "premium" || userPlan === "gold",
        isGold: userPlan === "gold",
        hasGoldAccess: userPlan === "gold",
        status: (userPlan !== "basic") ? "active" : (data?.status || "inactive")
      };
    },
  });

  // Helper function to determine user plan from various sources
  function getUserPlan(user: any, apiData: SubscriptionStatus | undefined): UserPlan {
    // Priority order: user.plan > user.isPremium > API response > default
    if (user?.plan) {
      if (user.plan === "gold") return "gold";
      if (user.plan === "premium") return "premium";
      if (user.plan === "basic") return "basic";
    }
    
    // Fallback to isPremium flag (legacy support)
    if (user?.isPremium) return "premium";
    
    // Check API response
    if (apiData?.plan) {
      if (apiData.plan === "gold") return "gold";
      if (apiData.plan === "premium") return "premium";
    }
    
    // Check API status for legacy compatibility
    if (apiData?.status === "active") return "premium";
    
    return "basic";
  }

  async function fetchSubscriptionStatus(): Promise<SubscriptionStatus> {
    try {
      const response = await api.get("/payments/membership-status");
      if (response.status !== 200) {
        throw new Error("Failed to fetch subscription status");
      }
      return response.data;
    } catch (error) {
      console.error("Error fetching subscription status:", error);
      
      // If user has plan information locally, return a fallback status
      if (user?.plan && user.plan !== "basic") {
        return { 
          status: "active", 
          plan: user.plan as UserPlan 
        };
      }
      
      // Legacy support: if user has isPremium flag
      if (user?.isPremium) {
        return { 
          status: "active", 
          plan: "premium" 
        };
      }
      
      throw error; // Re-throw to let React Query handle the error state
    }
  }

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
    getUserPlan: () => apiSubscriptionStatus?.userPlan || "basic",
    isPremium: () => apiSubscriptionStatus?.isPremium || false,
    isGold: () => apiSubscriptionStatus?.isGold || false,
    hasGoldAccess: () => apiSubscriptionStatus?.hasGoldAccess || false,
  };
}