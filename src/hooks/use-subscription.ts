import { useQuery } from "@tanstack/react-query";
import { useCurrentUser } from "./use-current-user";
import { useState } from "react";
import { api } from "@/lib/api";

type SubscriptionStatus = {
  status: string;
  // Add other properties that might be in the response
};

export function useSubscription() {
  const {
    isLoading: isUserLoading,
    isError: isUserError,
    user,
  } = useCurrentUser();

  const [loading, setLoading] = useState<boolean>(true);

  const {
    data: apiSubscriptionStatus,
    isLoading: isSubscriptionLoading,
    isError: isSubscriptionError,
    refetch,
  } = useQuery({
    queryKey: ["subscriptionStatus"],
    queryFn: fetchSubscriptionStatus,
    enabled: !!user,
    select: (data: SubscriptionStatus) => {
      if (user?.isPremium && data?.status !== "active") {
        return { ...data, status: "active" };
      }
      return data;
    },
    // Remove the onError handler that was causing TypeScript errors
  });

  async function fetchSubscriptionStatus(): Promise<SubscriptionStatus> {
    try {
      const response = await api.get("/payments/membership-status");
      if (response.status !== 200) {
        throw new Error("Failed to fetch subscription status");
      }
      return response.data;
    } catch (error) {
      console.error("Error fetching subscription status:", error);
      // If user has isPremium flag, return a fallback status even when API fails
      if (user?.isPremium) {
        return { status: "active" };
      }
      throw error; // Re-throw to let React Query handle the error state
    }
  }

  // Create a derived subscription status that considers both API response and user.isPremium
  const subscriptionStatus: SubscriptionStatus | undefined = 
    user?.isPremium 
      ? { ...apiSubscriptionStatus, status: "active" } 
      : apiSubscriptionStatus;

  return {
    subscriptionStatus,
    isUserLoading,
    isUserError,
    isSubscriptionLoading,
    isSubscriptionError,
    loading,
    setLoading,
    refreshStatus: refetch,
  };
}