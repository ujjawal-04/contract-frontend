import { ContractAnalysis } from "@/interfaces/contract.interface";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { ArrowDown, ArrowUp, Minus, Lock, AlertCircle, Check } from "lucide-react";
import OverallScoreChart from "./chart";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { Button } from "../ui/button";
import { api } from "@/lib/api";
import stripePromise from "@/lib/stripe";
import ChatbotModal from "./ChatbotModal";
import { useSubscription } from "@/hooks/use-subscription";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter,
} from "../ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

interface IContractAnalysisResultsProps {
  analysisResults: ContractAnalysis;
  contractId: string;
  isActive?: boolean;
  isPremium?: boolean; // Keep for backward compatibility
}

export default function ContractAnalysisResults({
  analysisResults,
  isPremium: externalIsPremium, // Legacy prop for backward compatibility
}: IContractAnalysisResultsProps) {
  const [activeTab, setActiveTab] = useState("summary");
  const [refreshChart, setRefreshChart] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [isPremiumDialogOpen, setIsPremiumDialogOpen] = useState(false);
  const [showLimitWarning, setShowLimitWarning] = useState(false); 
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  
  // Get user info and subscription status
  const { user } = useCurrentUser();
  const { 
    subscriptionStatus, 
    isSubscriptionLoading,
    getUserPlan,
    isPremium: isUserPremium,
    hasGoldAccess
  } = useSubscription();

  // Determine user's plan and access levels
  const userPlan = getUserPlan();
  const isPremium = externalIsPremium ?? isUserPremium();
  const isGold = hasGoldAccess();

  // Fetch user's contract count for the free plan limit
  const { data: userStats, isLoading: isStatsLoading } = useQuery({
    queryKey: ["user-contract-stats"],
    queryFn: async () => {
      // Only fetch stats if user is not premium
      if (isPremium) return { contractCount: 0, contractLimit: Infinity, plan: userPlan };
      
      try {
        const response = await api.get("/contracts/user-stats");
        return response.data;
      } catch (err) {
        console.error("Error fetching user contract stats:", err);
        // Default fallback values
        return { contractCount: 0, contractLimit: 2, plan: "basic" };
      }
    },
    enabled: !!user,
  });

  // Check if the user has reached their free plan limit
  useEffect(() => {
  if (userStats && !isPremium) {
    const { contractCount, contractLimit } = userStats;
    
    // Only show upgrade dialog when user has actually reached their limit
    if (contractCount >= contractLimit) {
      setShowUpgradeDialog(true);
    } else {
      // Ensure dialog is hidden if user hasn't reached limit
      setShowUpgradeDialog(false);
    }
  } else if (isPremium) {
    // Hide dialog for premium users
    setShowUpgradeDialog(false);
  }
}, [userStats, isPremium]);

  console.log("User Plan:", userPlan, "Premium:", isPremium, "Gold:", isGold);

  if (!analysisResults) {
    return <div>No Results</div>
  }

  const handleRefreshChart = () => {
    setRefreshChart(true);
    setTimeout(() => setRefreshChart(false), 100);
  };

  useEffect(() => {
    handleRefreshChart();
  }, []);

  const handleOpenChatModal = () => {
    setIsChatModalOpen(true);
  };

  const handleCloseChatModal = () => {
    setIsChatModalOpen(false);
  };
  
  const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  const handleUpgrade = async (targetPlan: "premium" | "gold" = "premium") => {
    try {
      // You might want to modify this endpoint to support different plan types
      const response = await api.get(`/payments/create-checkout-session?plan=${targetPlan}`);
      console.log("response", response);
      const stripe = await stripePromise;
      await stripe?.redirectToCheckout({
        sessionId: response.data.sessionId,
      });
    } catch (error) {
      console.error(error);
      // Fallback to generic upgrade if plan-specific fails
      try {
        const response = await api.get("/payments/create-checkout-session");
        const stripe = await stripePromise;
        await stripe?.redirectToCheckout({
          sessionId: response.data.sessionId,
        });
      } catch (fallbackError) {
        console.error("Upgrade failed:", fallbackError);
      }
    }
  };

  const getScore = () => {
    const score = Number(analysisResults.overallScore) || 75;
    if (score > 70)
      return { icon: ArrowUp, color: "text-green-500", text: "Favorable", displayText: "Favorable" };
    if (score > 50)
      return { icon: Minus, color: "text-yellow-500", text: "Average", displayText: "Average" };
    return { icon: ArrowDown, color: "text-red-500", text: "Bad", displayText: "Unfavorable" };
  };
  
  const scoreTrend = getScore();
  const Icon = scoreTrend.icon;
  
  const getSeverityBadge = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case "high":
        return <span className="px-2 py-1 text-xs sm:px-3 rounded-full font-medium bg-red-100 text-red-600">High</span>;
      case "medium":
        return <span className="px-2 py-1 text-xs sm:px-3 rounded-full font-medium bg-yellow-100 text-yellow-600">Medium</span>;
      case "low":
        return <span className="px-2 py-1 text-xs sm:px-3 rounded-full font-medium bg-green-100 text-green-600">Low</span>;
      default:
        return <span className="px-2 py-1 text-xs sm:px-3 rounded-full font-medium bg-gray-100 text-gray-600">Unknown</span>;
    }
  };

  const renderRisksAndOpportunities = (
    items: Array<{
      risk?: string;
      opportunity?: string;
      explanation?: string;
      severity?: string;
      impact?: string;
    }>,
    type: "risk" | "opportunity",
  ) => {
    return (
      <div className="space-y-4">
        {items.map((item, index) => {
          const severityOrImpact = type === "risk" ? item.severity : item.impact;

          return (
            <div key={index} className="border rounded-lg p-3 sm:p-4 bg-white shadow-sm">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-2">
                <h3 className="font-medium text-gray-800 text-sm sm:text-base">
                  {type === "risk" ? item.risk : item.opportunity}
                </h3>
                <div className="sm:ml-2 self-start">
                  {getSeverityBadge(severityOrImpact || "")}
                </div>
              </div>
              <p className="text-xs sm:text-sm text-gray-600">{item.explanation}</p>
            </div>
          );
        })}
      </div>
    );
  };

  const PremiumUpgradePrompt = ({ requiredPlan }: { requiredPlan?: "premium" | "gold" }) => {
    const targetPlan = requiredPlan || "premium";
    const planName = targetPlan === "gold" ? "Gold" : "Premium";
    
    return (
      <div className="flex flex-col items-center justify-center p-4 sm:p-8 text-center">
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-gray-500" />
        </div>
        <h3 className="text-lg sm:text-xl font-bold mb-2">{planName} Feature</h3>
        <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 max-w-md">
          {targetPlan === "gold" 
            ? "Unlock advanced AI features including contract chat and modification by upgrading to our Gold plan."
            : "Unlock detailed contract analysis including key clauses, recommendations, and negotiation points by upgrading to our Premium plan."
          }
        </p>
        <Button 
          onClick={() => handleUpgrade(targetPlan)} 
          className={`${targetPlan === "gold" ? "bg-yellow-600 hover:bg-yellow-700" : "bg-blue-600 hover:bg-blue-700"} text-white px-4 sm:px-6 py-2 text-sm sm:text-base`}
        >
          Upgrade to {planName}
        </Button>
      </div>
    );
  };

  const ContractDetailsContent = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
        <div className="border rounded-lg p-3 sm:p-4">
          <h3 className="text-base sm:text-lg font-medium mb-1 sm:mb-2">Contract Type</h3>
          <p className="text-sm sm:text-base text-gray-700">{analysisResults.contractType || "Not specified"}</p>
        </div>
        <div className="border rounded-lg p-3 sm:p-4">
          <h3 className="text-base sm:text-lg font-medium mb-1 sm:mb-2">Duration</h3>
          <p className="text-sm sm:text-base text-gray-700">{analysisResults.contractDuration || "Not specified"}</p>
        </div>
        <div className="border rounded-lg p-3 sm:p-4">
          <h3 className="text-base sm:text-lg font-medium mb-1 sm:mb-2">Financial Terms</h3>
          <p className="text-sm sm:text-base text-gray-700">{analysisResults.financialTerms?.description || "Not specified"}</p>
        </div>
        <div className="border rounded-lg p-3 sm:p-4">
          <h3 className="text-base sm:text-lg font-medium mb-1 sm:mb-2">Termination Conditions</h3>
          <p className="text-sm sm:text-base text-gray-700">{analysisResults.terminationConditions || "Not specified"}</p>
        </div>
      </div>

      <div>
        <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4">Key Clauses</h3>
        <div className="space-y-3">
          {analysisResults.keyClauses && Array.isArray(analysisResults.keyClauses) ? (
            analysisResults.keyClauses.map((clause, index) => (
              <div key={index} className="border rounded-lg p-3 sm:p-4">
                <h4 className="font-medium mb-1 text-sm sm:text-base">{clause}</h4>
                <p className="text-xs sm:text-sm text-gray-600">
                  {analysisResults.specificClauses && typeof analysisResults.specificClauses === 'string'
                    ? analysisResults.specificClauses
                    : "No details provided"}
                </p>
              </div>
            ))
          ) : (
            <div className="border rounded-lg p-3 sm:p-4">
              <h4 className="font-medium mb-1 text-sm sm:text-base">No key clauses available</h4>
              <p className="text-xs sm:text-sm text-gray-600">
                No key clauses have been identified for this contract.
              </p>
            </div>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4">Legal Compliance</h3>
        <div className="border rounded-lg p-3 sm:p-4">
          <p className="text-sm sm:text-base text-gray-700">
            {analysisResults.legalCompliance || "No legal compliance information available."}
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4">Recommendations</h3>
        {analysisResults.recommendations && analysisResults.recommendations.length > 0 ? (
          <ul className="list-disc pl-5 space-y-1 sm:space-y-2">
            {analysisResults.recommendations.map((recommendation, index) => (
              <li key={index} className="text-sm sm:text-base text-gray-700">{recommendation}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm sm:text-base text-gray-700">No recommendations available.</p>
        )}
      </div>

      <div>
        <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4">Negotiation Points</h3>
        {analysisResults.negotiationPoints && analysisResults.negotiationPoints.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
            {analysisResults.negotiationPoints.map((point, index) => (
              <div key={index} className="border rounded-lg p-2 sm:p-3 bg-gray-50">
                <p className="text-xs sm:text-sm font-medium">{point}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm sm:text-base text-gray-700">No negotiation points available.</p>
        )}
      </div>
    </div>
  );

  // Ask AI button rendering based on plan status
  const renderAskAIButton = () => {
    if (isGold) {
      // Gold users get full AI chat functionality
      return (
        <Button
          className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs sm:text-sm whitespace-nowrap"
          onClick={handleOpenChatModal}
        >
          Ask AI (Gold)
        </Button>
      );
    } else if (isPremium) {
      // Premium users get basic AI chat
      return (
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm whitespace-nowrap"
          onClick={handleOpenChatModal}
        >
          Ask AI
        </Button>
      );
    } else {
      // Basic users see upgrade prompt
      return (
        <Dialog open={isPremiumDialogOpen} onOpenChange={setIsPremiumDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white opacity-90 text-xs sm:text-sm whitespace-nowrap"
              onClick={() => setIsPremiumDialogOpen(true)}
            >
              Ask AI
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md max-w-[90vw] p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Lock className="h-4 w-4 sm:h-5 sm:w-5" /> Premium Feature
              </DialogTitle>
              <DialogDescription className="text-sm">
                Upgrade to premium to use this feature.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2 mt-4">
              <DialogClose asChild>
                <Button variant="outline" className="text-xs sm:text-sm">Cancel</Button>
              </DialogClose>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm"
                onClick={() => handleUpgrade("premium")}
              >
                Upgrade to Premium
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      );
    }
  };

  // Gold-specific features section
  const GoldFeaturesSection = () => {
    if (!isGold) return null;

    return (
      <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200 shadow-sm mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-yellow-800 text-lg flex items-center gap-2">
            👑 Gold Features Available
          </CardTitle>
          <CardDescription className="text-yellow-700 text-sm">
            You have access to our most advanced AI features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button 
              onClick={handleOpenChatModal}
              className="bg-yellow-600 hover:bg-yellow-700 text-white text-sm"
            >
              🤖 AI Contract Chat
            </Button>
            <Button 
              variant="outline"
              className="border-yellow-300 text-yellow-700 hover:bg-yellow-50 text-sm"
              onClick={() => {
                // Handle contract modification feature
                console.log("Contract modification feature");
              }}
            >
              ✏️ Modify Contract
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Free Plan Limit Upgrade Dialog
  const UpgradeDialog = () => (
    <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Free Plan Limit Reached</DialogTitle>
          <DialogDescription className="text-sm text-gray-500 mt-2">
            You've used all {userStats?.contractLimit || 2} contracts allowed on the free plan. 
            Choose your upgrade path:
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-blue-50">
              <h4 className="font-semibold text-blue-800 mb-2">Premium Plan</h4>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Unlimited contract analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Full contract details</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Basic AI assistant</span>
                </div>
              </div>
              <Button 
                onClick={() => handleUpgrade("premium")} 
                className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Upgrade to Premium
              </Button>
            </div>

            <div className="border rounded-lg p-4 bg-yellow-50">
              <h4 className="font-semibold text-yellow-800 mb-2">Gold Plan (Recommended)</h4>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Everything in Premium</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Advanced AI chat</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Contract modification</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">24/7 priority support</span>
                </div>
              </div>
              <Button 
                onClick={() => handleUpgrade("gold")} 
                className="w-full mt-3 bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                Upgrade to Gold
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowUpgradeDialog(false)}>
            Maybe Later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // Show loading state while subscription status or stats are being loaded
  if ((isSubscriptionLoading && externalIsPremium === undefined) || (isStatsLoading && !isPremium)) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 bg-gray-50">
      {/* Free Plan Limit Warning */}
      {showLimitWarning && !isPremium && (
        <Alert className="mb-4 bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <AlertTitle className="text-amber-800">Free Plan Limit Warning</AlertTitle>
          <AlertDescription className="text-amber-700">
            You have used {userStats?.contractCount || 1} of your {userStats?.contractLimit || 2} free contract analyses. 
            <Button 
              variant="link" 
              onClick={() => handleUpgrade("premium")} 
              className="p-0 h-auto text-blue-600 font-medium hover:text-blue-800"
            >
              Upgrade to Premium
            </Button> for unlimited analyses.
          </AlertDescription>
        </Alert>
      )}

      {/* Render the upgrade dialog */}
      <UpgradeDialog />
      
      {/* Gold Features Section - only show for Gold users */}
      <GoldFeaturesSection />

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 sm:mb-5">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Contract Analysis</h1>
        <div className="flex space-x-2 sm:space-x-3">
          <Button
            onClick={handleRefreshChart}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
            size="sm"
          >
            Refresh
          </Button>
          {renderAskAIButton()}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
        {/* Overall Score Card */}
        <Card className="bg-white shadow-sm border-0">
          <CardHeader className="pb-1 sm:pb-2 p-3 sm:p-4">
            <CardTitle className="text-lg sm:text-xl text-gray-800">Overall Contract Score</CardTitle>
            <CardDescription className="text-xs sm:text-sm text-gray-600">
              Based on risks and opportunities analysis (Plan: {userPlan.charAt(0).toUpperCase() + userPlan.slice(1)})
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0 sm:pt-0">
            <div className="flex flex-col items-start justify-between">
              <div className="w-full mb-3 sm:mb-6">
                <div className="flex items-center mb-2 sm:mb-4">
                  <div className="text-3xl sm:text-5xl font-bold mr-3 sm:mr-4">
                    {analysisResults.overallScore}%
                  </div>
                  <div className={`${scoreTrend.color} font-medium flex items-center text-sm sm:text-base`}>
                    <Icon size={16} className="mr-1" />
                    {scoreTrend.displayText}
                  </div>
                </div>
                <div className="space-y-1 sm:space-y-2 mb-2 sm:mb-4 mt-4 sm:mt-10">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-blue-600 text-sm sm:text-lg">Risk</span>
                    <span className="font-bold text-sm sm:text-lg">{100 - Number(analysisResults.overallScore)}%</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-blue-600 text-sm sm:text-lg">Opportunities</span>
                    <span className="font-bold text-sm sm:text-lg">{analysisResults.overallScore}%</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Score Visualization Card */}
        <Card className="bg-white shadow-sm border-0 flex flex-col">
          <CardHeader className="pb-1 sm:pb-2 p-3 sm:p-4">
            <CardTitle className="text-lg sm:text-xl text-gray-800">Score Visualization</CardTitle>
            <CardDescription className="text-xs sm:text-sm text-gray-600">
              Visual representation of contract score
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex overflow-hidden p-0">
            {refreshChart ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 sm:h-32 sm:w-32 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="w-full h-full min-h-[250px] sm:min-h-[270px] md:min-h-[300px]">
                <OverallScoreChart overallScore={Number(analysisResults.overallScore)} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4 sm:mb-6">
        <TabsList className="bg-gray-100 p-0.5 sm:p-1 rounded-lg flex space-x-0.5 sm:space-x-1 w-full overflow-x-auto">
          <TabsTrigger
            value="summary"
            className={`rounded flex-1 py-1 sm:py-2 text-xs sm:text-sm ${activeTab === 'summary' ? 'bg-blue-500 shadow-sm text-white' : 'text-gray-900'}`}
          >
            <span className="font-medium">Summary</span>
          </TabsTrigger>
          <TabsTrigger
            value="risks"
            className={`rounded flex-1 py-1 sm:py-2 text-xs sm:text-sm ${activeTab === 'risks' ? 'bg-blue-500 text-white' : 'text-gray-900'}`}
          >
            <span className="font-medium">Risks</span>
          </TabsTrigger>
          <TabsTrigger
            value="opportunities"
            className={`rounded flex-1 py-1 sm:py-2 text-xs sm:text-sm ${activeTab === 'opportunities' ? 'bg-blue-500 shadow-sm text-white' : 'text-gray-900'}`}
          >
            <span className="font-medium">Opportunities</span>
          </TabsTrigger>
          <TabsTrigger
            value="details"
            className={`rounded flex-1 py-1 sm:py-2 text-xs sm:text-sm ${activeTab === 'details' ? 'bg-blue-500 shadow-sm text-white' : 'text-gray-900'}`}
            disabled={!isPremium}
          >
            <span className="font-medium whitespace-nowrap">
              Details {!isPremium && <Lock className="inline-block h-2 w-2 sm:h-3 sm:w-3 ml-0.5 sm:ml-1" />}
            </span>
          </TabsTrigger>
          {isGold && (
            <TabsTrigger
              value="advanced"
              className={`rounded flex-1 py-1 sm:py-2 text-xs sm:text-sm ${activeTab === 'advanced' ? 'bg-yellow-500 shadow-sm text-white' : 'text-gray-900'}`}
            >
              <span className="font-medium whitespace-nowrap">👑 Advanced</span>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="summary">
          <Card className="bg-white shadow-sm border-0">
            <CardHeader className="border-b p-3 sm:p-4">
              <CardTitle className="text-blue-600 text-base sm:text-lg">Contract Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                {analysisResults.summary}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risks">
          <Card className="bg-white shadow-sm border-0">
            <CardHeader className="border-b p-3 sm:p-4">
              <CardTitle className="text-blue-600 text-base sm:text-lg">
                Risks ({userPlan === "basic" ? "Limited View" : `${analysisResults.risks?.length || 0} Identified`})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4">
              {renderRisksAndOpportunities(analysisResults.risks, "risk")}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="opportunities">
          <Card className="bg-white shadow-sm border-0">
            <CardHeader className="border-b p-3 sm:p-4">
              <CardTitle className="text-blue-600 text-base sm:text-lg">
                Opportunities ({userPlan === "basic" ? "Limited View" : `${analysisResults.opportunities?.length || 0} Identified`})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4">
              {renderRisksAndOpportunities(
                analysisResults.opportunities || [],
                "opportunity"
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details">
          <Card className="bg-white shadow-sm border-0">
            <CardHeader className="border-b p-3 sm:p-4">
              <CardTitle className="text-blue-600 text-base sm:text-lg">Contract Details</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4">
              {isPremium ? (
                <ContractDetailsContent />
              ) : (
                <PremiumUpgradePrompt requiredPlan="premium" />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {isGold && (
          <TabsContent value="advanced">
            <Card className="bg-white shadow-sm border-0">
              <CardHeader className="border-b p-3 sm:p-4 bg-gradient-to-r from-yellow-50 to-amber-50">
                <CardTitle className="text-yellow-800 text-base sm:text-lg flex items-center gap-2">
                  👑 Gold Advanced Features
                </CardTitle>
                <CardDescription className="text-yellow-700">
                  Exclusive AI-powered tools for Gold subscribers
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-4">
                <div className="space-y-6">
                  {/* AI Chat Section */}
                  <div className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
                    <h3 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                      🤖 AI Contract Assistant
                    </h3>
                    <p className="text-sm text-yellow-700 mb-3">
                      Chat with our advanced AI about your contract. Ask questions, get clarifications, and receive expert insights.
                    </p>
                    <Button 
                      onClick={handleOpenChatModal}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white"
                    >
                      Start AI Conversation
                    </Button>
                  </div>

                  {/* Contract Modification Section */}
                  <div className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
                    <h3 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                      ✏️ Smart Contract Editor
                    </h3>
                    <p className="text-sm text-yellow-700 mb-3">
                      Request AI-powered modifications to your contract with intelligent suggestions and track changes.
                    </p>
                    <Button 
                      variant="outline"
                      className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                      onClick={() => {
                        // Handle contract modification feature
                        console.log("Contract modification feature");
                      }}
                    >
                      Modify Contract
                    </Button>
                  </div>

                  {/* Advanced Analytics Section */}
                  <div className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
                    <h3 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                      📊 Advanced Analytics
                    </h3>
                    <p className="text-sm text-yellow-700 mb-3">
                      Get detailed insights with 15+ risk identifications, impact analysis, and custom recommendations.
                    </p>
                    <div className="text-sm text-yellow-700">
                      <p>• Enhanced risk detection: {analysisResults.risks?.length || 0} risks identified</p>
                      <p>• Impact analysis: {analysisResults.opportunities?.length || 0} opportunities found</p>
                      <p>• Custom recommendations: {analysisResults.recommendations?.length || 0} suggestions</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Only render the ChatbotModal if user has premium or gold access */}
      {isPremium && (
        <ChatbotModal 
          open={isChatModalOpen} 
          onClose={handleCloseChatModal} 
          geminiApiKey={geminiApiKey} 
          context={analysisResults.contractText}
          userPlan={userPlan} // Pass user plan to enable/disable features
        />
      )}
    </div>
  );
}