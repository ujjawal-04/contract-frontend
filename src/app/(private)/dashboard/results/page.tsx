"use client"

import ContractAnalysisResults from "@/components/analysis/contract-analysis-results";
import EmptyState from "@/components/analysis/empty-state";
import { useSubscription } from "@/hooks/use-subscription";
import { useContractStore } from "@/store/zustand"

export default function ContractResultPage() {
    const analysisResults = useContractStore((state) => state.analysisResults);
    
if(!analysisResults) {
    return (
        <EmptyState
            title="No Analysis"
            description="Please try again."
        />
    );
}

    return (
    <ContractAnalysisResults
    contractId={analysisResults._id}
    isActive={true}
    analysisResults={analysisResults}
    />
    )
}