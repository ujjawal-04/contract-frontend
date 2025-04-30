import { ContractAnalysis } from "@/interfaces/contract.interface";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { ArrowDown, ArrowUp, Minus, Lock } from "lucide-react";
import OverallScoreChart from "./chart";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { Button } from "../ui/button";
import { api } from "@/lib/api";
import stripePromise from "@/lib/stripe";
import ChatbotModal from "./ChatbotModal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "../ui/dialog";

interface IContractAnalysisResultsProps {
  analysisResults: ContractAnalysis;
  contractId: string;
  isActive?: boolean;
  isPremium?: boolean;
}

export default function ContractAnalysisResults({
  analysisResults,
  contractId,
  isActive = false,
  isPremium = false
}: IContractAnalysisResultsProps) {
  const [activeTab, setActiveTab] = useState("summary");
  const [refreshChart, setRefreshChart] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);

  console.log("Premium status:", isPremium);

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

  const handleUpgrade = async () => {
    try {
      const response = await api.get("/payments/create-checkout-session");
      console.log("response",response)
      const stripe = await stripePromise;
      await stripe?.redirectToCheckout({
        sessionId: response.data.sessionId,
      });
    } catch (error) {
      console.error(error);
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
  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-600 border-red-300";
      case "medium":
        return "bg-yellow-100 text-yellow-600 border-yellow-300";
      case "low":
        return "bg-green-100 text-green-600 border-green-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case "high":
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600">High</span>;
      case "medium":
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-600">Medium</span>;
      case "low":
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-600">Low</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">Unknown</span>;
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
    console.log("items", items);
    return (
      <div className="space-y-4">
        {items.map((item, index) => {
          const severityOrImpact = type === "risk" ? item.severity : item.impact;

          return (
            <div key={index} className="bordefr rounded-lg p-4 bg-white shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-gray-800">
                  {type === "risk" ? item.risk : item.opportunity}
                </h3>
                <div className="ml-2">
                  {getSeverityBadge(severityOrImpact || "")}
                </div>
              </div>
              <p className="text-sm text-gray-600">{item.explanation}</p>
            </div>
          );
        })}
      </div>
    );
  };

  const PremiumUpgradePrompt = () => {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-gray-500" />
        </div>
        <h3 className="text-xl font-bold mb-2">Premium Feature</h3>
        <p className="text-gray-600 mb-6 max-w-md">
          Unlock detailed contract analysis including key clauses, recommendations,
          and negotiation points by upgrading to our Premium plan.
        </p>
        <Button onClick={handleUpgrade} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2">
          Upgrade to Premium
        </Button>
      </div>
    );
  };

  const ContractDetailsContent = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-2">Contract Type</h3>
          <p className="text-gray-700">{analysisResults.contractType || "Not specified"}</p>
        </div>
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-2">Duration</h3>
          <p className="text-gray-700">{analysisResults.contractDuration || "Not specified"}</p>
        </div>
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-2">Financial Terms</h3>
          <p className="text-gray-700">{analysisResults.financialTerms?.description || "Not specified"}</p>
        </div>
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-2">Termination Conditions</h3>
          <p className="text-gray-700">{analysisResults.terminationConditions || "Not specified"}</p>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold mb-4">Key Clauses</h3>
        <div className="space-y-3">
          {analysisResults.keyClauses && Array.isArray(analysisResults.keyClauses) ? (
            analysisResults.keyClauses.map((clause, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h4 className="font-medium mb-1">{clause}</h4>
                <p className="text-sm text-gray-600">
                  {analysisResults.specificClauses && typeof analysisResults.specificClauses === 'string'
                    ? analysisResults.specificClauses
                    : "No details provided"}
                </p>
              </div>
            ))
          ) : (
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-1">No key clauses available</h4>
              <p className="text-sm text-gray-600">
                No key clauses have been identified for this contract.
              </p>
            </div>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold mb-4">Legal Compliance</h3>
        <div className="border rounded-lg p-4">
          <p className="text-gray-700">
            {analysisResults.legalCompliance || "No legal compliance information available."}
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold mb-4">Recommendations</h3>
        {analysisResults.recommendations && analysisResults.recommendations.length > 0 ? (
          <ul className="list-disc pl-5 space-y-2">
            {analysisResults.recommendations.map((recommendation, index) => (
              <li key={index} className="text-gray-700">{recommendation}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-700">No recommendations available.</p>
        )}
      </div>

      <div>
        <h3 className="text-xl font-bold mb-4">Negotiation Points</h3>
        {analysisResults.negotiationPoints && analysisResults.negotiationPoints.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {analysisResults.negotiationPoints.map((point, index) => (
              <div key={index} className="border rounded-lg p-3 bg-gray-50">
                <p className="text-sm font-medium">{point}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-700">No negotiation points available.</p>
        )}
      </div>
    </div>
  );

  // Ask AI button rendering based on premium status
  const [isPremiumDialogOpen, setIsPremiumDialogOpen] = useState(false);
  
  const renderAskAIButton = () => {
    if (isPremium) {
      return (
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={handleOpenChatModal}
        >
          Ask AI
        </Button>
      );
    } else {
      return (
        <Dialog open={isPremiumDialogOpen} onOpenChange={setIsPremiumDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white opacity-90"
              onClick={() => setIsPremiumDialogOpen(true)}
            >
              Ask AI
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" /> Premium Feature
              </DialogTitle>
              <DialogDescription>
                Upgrade to premium to use this feature.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2 mt-4">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleUpgrade}
              >
                Upgrade to Premium
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      );
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 bg-gray-50">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-bold text-gray-800">Contract Analysis result</h1>
        <div className="flex space-x-3">
          <Button
            onClick={handleRefreshChart}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800"
          >
            Refresh
          </Button>
          {renderAskAIButton()}
        </div>
      </div>

      <Card className="bg-white shadow-sm border-0 mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl text-gray-800">Overall Contract Score</CardTitle>
          <CardDescription className="text-gray-600 text-sm">
            Based on risks and opportunities analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="w-full md:w-1/3 mb-6 md:mb-0">
              <div className="flex items-center mb-4">
                <div className="text-5xl font-bold mr-4">
                  {analysisResults.overallScore}%
                </div>
                <div className="text-green-500 font-medium flex items-center">
                  <Icon size={18} className="mr-1" />
                  {scoreTrend.displayText}
                </div>
              </div>
              <div className="space-y-2 mb-4 mt-10">
                <div className="flex justify-between text-sm">
                  <span className="text-blue-600 text-lg">Risk</span>
                  <span className="font-bold text-lg">{100 - Number(analysisResults.overallScore)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-blue-600 text-lg">Opportunities</span>
                  <span className="font-bold text-lg ">{analysisResults.overallScore}%</span>
                </div>
              </div>
            </div>
            <div className="w-full md:w-2/3 flex justify-center h-64">
              {refreshChart ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <OverallScoreChart overallScore={Number(analysisResults.overallScore)} />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="bg-gray-100 p-1 rounded-lg flex space-x-1 w-full">
          <TabsTrigger
            value="summary"
            className={`rounded flex-1 py-2 ${activeTab === 'summary' ? 'bg-blue-500 shadow-sm text-black' : 'text-gray-900'}`}
          >
            <span className="font-medium">Summary</span>
          </TabsTrigger>
          <TabsTrigger
            value="risks"
            className={`rounded flex-1 py-2 ${activeTab === 'risks' ? 'bg-blue-500 text-black' : 'text-gray-900'}`}
          >
            <span className="font-medium">Risks</span>
          </TabsTrigger>
          <TabsTrigger
            value="opportunities"
            className={`rounded flex-1 py-2 ${activeTab === 'opportunities' ? 'bg-blue-500 shadow-sm text-black' : 'text-gray-900'}`}
          >
            <span className="font-medium">Opportunities</span>
          </TabsTrigger>
          <TabsTrigger
            value="details"
            className={`rounded flex-1 py-2 ${activeTab === 'details' ? 'bg-blue-500 shadow-sm text-black' : 'text-gray-900'}`}
          >
            <span className="font-medium">Details</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          <Card className="bg-white shadow-sm border-0">
            <CardHeader className="border-b">
              <CardTitle className="text-blue-600">Contract Summary</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-gray-700 leading-relaxed">
                {analysisResults.summary}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risks">
          <Card className="bg-white shadow-sm border-0">
            <CardHeader className="border-b">
              <CardTitle className="text-blue-600">Risks</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {renderRisksAndOpportunities(analysisResults.risks, "risk")}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="opportunities">
          <Card className="bg-white shadow-sm border-0">
            <CardHeader className="border-b">
              <CardTitle className="text-blue-600">Opportunities</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {renderRisksAndOpportunities(
                analysisResults.opportunities || [],
                "opportunity"
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details">
          <Card className="bg-white shadow-sm border-0">
            <CardHeader className="border-b">
              <CardTitle className="text-blue-600">Contract Details</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {isPremium ? (
                <ContractDetailsContent />
              ) : (
                <PremiumUpgradePrompt />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Only render the ChatbotModal if isPremium is true */}
      {isPremium && (
        <ChatbotModal 
          open={isChatModalOpen} 
          onClose={handleCloseChatModal} 
          geminiApiKey={geminiApiKey} 
          context={analysisResults.contractText}
        />
      )}
    </div>
  );
}