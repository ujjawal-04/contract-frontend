export interface Risk {
    risk: string;
    explanation: string;
    severity: "low" | "medium" | "high";
  }
  
  export interface Opportunity {
    opportunity: string;
    explanation: string;
    impact: "low" | "medium" | "high";
  }
  
  export interface CompensationStructure {
    baseSalary: string;
    bonuses: string;
    equity: string;
    otherBenefits: string;
  }
  
  export interface FinancialTerms {
    description: string;
    details: string[];
  }
  
  export interface UserFeedback {
    rating: number;
    comments: string;
  }
  
  export interface ContractAnalysis {
    _id: string;
    userId: string;
    projectId: string;
    contractText: string;
    risks: Risk[];
    opportunities: Opportunity[];
    summary: string;
    recommendations: string[];
    keyClauses: string[];
    legalCompliance: string;
    negotiationPoints: string[];
    contractDuration: string;
    terminationConditions: string;
    overallScore: number | string;
    compensationStructure: CompensationStructure;
    performanceMetrics: string[];
    intellectualPropertyClauses: string | string[];
    createdAt: string;
    updatedAt: string;
    version: number;
    userFeedback: UserFeedback;
    customFields: Record<string, string>;
    expirationDate?: string;
    language: string;
    aimodel: string;
    contractType: string;
    financialTerms?: FinancialTerms;
    specificClauses?: string;
  }
  
  // You can also create a partial interface for creating new contract analyses
  export interface CreateContractAnalysisDto {
    contractType: string;
    file: File;
  }
  
  // Interface for contract analysis results summary
  export interface ContractAnalysisSummary {
    _id: string;
    contractType: string;
    overallScore: number | string;
    createdAt: string;
    risks: number; // Number of risks
    opportunities: number; // Number of opportunities
  }
  
  // Interface for API response when fetching contract analyses
  export interface ContractAnalysisResponse {
    success: boolean;
    data: ContractAnalysis;
    message?: string;
  }
  
  // Interface for API response when fetching multiple contract analyses
  export interface ContractAnalysesListResponse {
    success: boolean;
    data: ContractAnalysisSummary[];
    total: number;
    message?: string;
  }