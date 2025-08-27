// src/lib/api.ts
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

/**
 * Chat with contract AI (Gold feature)
 * @param contractId The ID of the contract
 * @param message The user's message
 * @returns Promise with the AI response
 */
export const chatWithContract = async (contractId: string, message: string) => {
  try {
    const response = await api.post("/contracts/chat", {
      contractId,
      message
    });
    return response.data;
  } catch (error) {
    console.error("Error in contract chat:", error);
    
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.error || 
                      error.response?.data?.message || 
                      error.message || 
                      "Failed to send message";
      throw new Error(message);
    }
    
    throw error;
  }
};

/**
 * Modify contract with AI (Gold feature)
 * @param contractId The ID of the contract
 * @param modifications Array of modifications to apply
 * @param useRecommendations Whether to use AI recommendations
 * @param customModifications Array of custom modifications
 * @returns Promise with the modification result
 */
export const modifyContract = async (
  contractId: string, 
  modifications: string[], 
  useRecommendations?: boolean, 
  customModifications?: string[]
) => {
  try {
    const response = await api.post("/contracts/modify", {
      contractId,
      modifications,
      useRecommendations,
      customModifications
    });
    return response.data;
  } catch (error) {
    console.error("Error modifying contract:", error);
    
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.error || 
                      error.response?.data?.message || 
                      error.message || 
                      "Failed to modify contract";
      throw new Error(message);
    }
    
    throw error;
  }
};

/**
 * Download contract version as PDF (Gold feature)
 * @param contractId The ID of the contract
 * @param version The version to download ("original" or version number)
 * @returns Promise with the PDF blob
 */
export const downloadContractPDF = async (contractId: string, version: string | number = "original") => {
  try {
    const response = await api.get(`/contracts/download/${contractId}/version/${version}`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error("Error downloading contract:", error);
    
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.error || 
                      error.response?.data?.message || 
                      error.message || 
                      "Failed to download contract";
      throw new Error(message);
    }
    
    throw error;
  }
};

/**
 * Generate custom recommendations (Gold feature)
 * @param contractId The ID of the contract
 * @param focusAreas Array of focus areas for recommendations
 * @returns Promise with the generated recommendations
 */
export const generateCustomRecommendations = async (contractId: string, focusAreas: string[]) => {
  try {
    const response = await api.post("/contracts/recommendations", {
      contractId,
      focusAreas
    });
    return response.data;
  } catch (error) {
    console.error("Error generating recommendations:", error);
    
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.error || 
                      error.response?.data?.message || 
                      error.message || 
                      "Failed to generate recommendations";
      throw new Error(message);
    }
    
    throw error;
  }
};

/**
 * Track changes between contract versions (Gold feature)
 * @param contractId The ID of the contract
 * @param version1 First version to compare
 * @param version2 Second version to compare
 * @returns Promise with the changes comparison
 */
export const trackContractChanges = async (contractId: string, version1: string, version2: string) => {
  try {
    const response = await api.get("/contracts/track-changes", {
      params: {
        contractId,
        version1,
        version2
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error tracking changes:", error);
    
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.error || 
                      error.response?.data?.message || 
                      error.message || 
                      "Failed to track changes";
      throw new Error(message);
    }
    
    throw error;
  }
};

/**
 * Get contract with full details including modification history
 * @param contractId The ID of the contract
 * @returns Promise with the contract data
 */
export const getContractWithHistory = async (contractId: string) => {
  try {
    const response = await api.get(`/contracts/contract/${contractId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching contract with history:", error);
    
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.error || 
                      error.response?.data?.message || 
                      error.message || 
                      "Failed to fetch contract details";
      throw new Error(message);
    }
    
    throw error;
  }
};

/**
 * Get user's contract statistics
 * @returns Promise with the user statistics
 */
export const getUserContractStats = async () => {
  try {
    const response = await api.get("/contracts/user-stats");
    return response.data;
  } catch (error) {
    console.error("Error fetching user contract stats:", error);
    
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.error || 
                      error.response?.data?.message || 
                      error.message || 
                      "Failed to fetch user statistics";
      throw new Error(message);
    }
    
    throw error;
  }
};

/**
 * Helper function to download a blob as a file
 * @param blob The blob data
 * @param filename The filename for download
 */
export const downloadBlob = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

/**
 * Helper function to handle contract download with automatic filename
 * @param contractId The ID of the contract
 * @param version The version to download
 * @param contractType The type of contract (for filename)
 */
export const handleContractDownload = async (
  contractId: string, 
  version: string | number, 
  contractType: string = "contract"
) => {
  try {
    const blob = await downloadContractPDF(contractId, version);
    const filename = `${contractType.toLowerCase().replace(/\s+/g, '-')}-v${version}.pdf`;
    downloadBlob(blob, filename);
  } catch (error) {
    console.error("Error downloading contract:", error);
    throw error;
  }
};