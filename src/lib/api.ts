import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080', // Default to localhost:8080
  withCredentials: true, // Important for sending cookies with requests
});

export const logout = async () => {
  const response = await api.get("/auth/logout");
  return response.data;
};

export const deleteAccount = async () => {
  try {
    const response = await api.delete("/api/users/delete-account");
    return response.data;
  } catch (error) {
    console.error("Error in deleteAccount function:", error);
    
    // Extract and throw meaningful error messages
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.message || "Failed to delete account";
      throw new Error(message);
    }
    
    throw error;
  }
};

/**
 * Delete a contract by ID
 * @param contractId The ID of the contract to delete
 * @returns Promise with the deletion result
 */
export const deleteContract = async (contractId: string) => {
  try {
    // Remove /api prefix as it seems your API doesn't have this in the path
    const response = await api.delete(`/contracts/${contractId}`);
    console.log("Delete contract response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error deleting contract:", error);
    
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.error || 
                      error.response?.data?.message || 
                      error.message || 
                      "Failed to delete contract";
      throw new Error(message);
    }
    
    throw error;
  }
};

/**
 * Get all contracts for the current user
 * @returns Promise with the contracts data
 */
export const getUserContracts = async () => {
  try {
    // Make sure this matches your backend route exactly
    const response = await api.get("/contracts/user-contracts");
    console.log("Fetched contracts:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching user contracts:", error);
    
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.error || 
                      error.response?.data?.message || 
                      error.message || 
                      "Failed to fetch contracts";
      throw new Error(message);
    }
    
    throw error;
  }
};