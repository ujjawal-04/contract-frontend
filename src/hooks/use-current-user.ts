import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api";

export interface User {
  _id: string;
  googleId: string;
  email: string;
  displayName: string;
  profilePicture: string;
  plan: "basic" | "premium" | "gold";
  isPremium: boolean;
}

export const useCurrentUser = () => {
  const {
    isLoading,
    isError,
    data: user,
    refetch
  } = useQuery<User | null>({
    queryKey: ["currentUser"],
    queryFn: async () => {
      try {
        const response = await api.get("/auth/current-user");
        console.log("Current user data:", response.data);
        return response.data;
      } catch (error: any) {
        // If 401, user is not authenticated
        if (error.response?.status === 401) {
          return null;
        }
        console.error("Error fetching current user:", error);
        throw error;
      }
    },
    retry: (failureCount, error: any) => {
      // Don't retry on 401 (unauthorized)
      if (error?.response?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return { 
    isLoading, 
    isError, 
    user,
    refetch 
  };
};