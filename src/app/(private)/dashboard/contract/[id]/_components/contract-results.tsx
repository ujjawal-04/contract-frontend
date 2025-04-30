"use client";

import ContractAnalysisResults from "@/components/analysis/contract-analysis-results";
import { useCurrentUser } from "@/hooks/use-current-user";
import { ContractAnalysis } from "@/interfaces/contract.interface";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import axios from "axios";

interface IContractResultsProps {
  contractId: string;
}

export default function ContractResults({ contractId }: IContractResultsProps) {
  const { user } = useCurrentUser();
  const [analysisResults, setAnalysisResults] = useState<ContractAnalysis>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && contractId) {
      fetchAnalysisResults(contractId);
    }
  }, [user, contractId]);

  const fetchAnalysisResults = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Fetching contract with ID:", id);
      
      // The correct endpoint based on your routes file
      const response = await api.get(`/contracts/contract/${id}`);
      
      if (response?.data) {
        setAnalysisResults(response.data);
        console.log("Contract data loaded successfully");
      } else {
        setError("Contract data is empty");
      }
    } catch (error) {
      console.error("Error fetching contract:", error);
      
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        
        if (status === 404) {
          setError("Contract not found. Please check if the contract ID is correct.");
        } else if (status === 400) {
          setError("Invalid contract ID format.");
        } else if (status === 401 || status === 403) {
          setError("Authentication error. Please log in again.");
        } else {
          setError(`Error: ${error.message}`);
        }
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  // For debugging
  console.log("Current user:", user);
  console.log("Is user premium:", user?.isPremium);

  if (loading) {
    return <div className="p-4">Loading contract details...</div>;
  }

  if (error) {
    return (
      <div className="p-4 border border-red-300 bg-red-50 rounded">
        <h2 className="text-lg font-bold text-red-700">Error</h2>
        <p className="text-red-600">{error}</p>
        <button 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => fetchAnalysisResults(contractId)}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!analysisResults) {
    return <div className="p-4">No contract data found</div>;
  }

  return (
    <ContractAnalysisResults
      contractId={contractId}
      analysisResults={analysisResults}
      isActive={true}
      isPremium={user?.isPremium === true}
    />
  );
}