"use client"

import type { ContractAnalysis } from "@/interfaces/contract.interface"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { ArrowDown, ArrowUp, Minus, Lock, AlertCircle, Check, Crown, FileEdit, MessageCircle } from "lucide-react"
import OverallScoreChart from "./chart"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs"
import { Button } from "../ui/button"
import { api } from "@/lib/api"
import stripePromise from "@/lib/stripe"
import ChatbotModal from "./ChatbotModal"
import { GoldChatModal } from "./GoldChatModal"
import { ContractModificationPage } from "./ContractModificationPage"
import { useSubscription } from "@/hooks/use-subscription"
import { useCurrentUser } from "@/hooks/use-current-user"
import { useQuery } from "@tanstack/react-query"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter,
} from "../ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "../ui/alert"

interface IContractAnalysisResultsProps {
  analysisResults: ContractAnalysis
  contractId: string
  isActive?: boolean
  isPremium?: boolean // Keep for backward compatibility
}

export default function ContractAnalysisResults({
  analysisResults,
  contractId,
  isPremium: externalIsPremium, // Legacy prop for backward compatibility
}: IContractAnalysisResultsProps) {
  const [activeTab, setActiveTab] = useState("summary")
  const [refreshChart, setRefreshChart] = useState(false)
  const [isChatModalOpen, setIsChatModalOpen] = useState(false)
  const [isGoldChatModalOpen, setIsGoldChatModalOpen] = useState(false)
  const [showModificationPage, setShowModificationPage] = useState(false)
  const [isPremiumDialogOpen, setIsPremiumDialogOpen] = useState(false)
  const [showLimitWarning, setShowLimitWarning] = useState(false)
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
  const [contractContent, setContractContent] = useState("")

  // Get user info and subscription status
  const { user } = useCurrentUser()
  const {
    subscriptionStatus,
    isSubscriptionLoading,
    getUserPlan,
    isPremium: isUserPremium,
    hasGoldAccess,
  } = useSubscription()

  // Determine user's plan and access levels
  const userPlan = getUserPlan()
  const isPremium = externalIsPremium ?? isUserPremium()
  const isGold = hasGoldAccess()

  // Fetch user's contract count for the free plan limit
  const { data: userStats, isLoading: isStatsLoading } = useQuery({
    queryKey: ["user-contract-stats"],
    queryFn: async () => {
      // Only fetch stats if user is not premium
      if (isPremium) return { contractCount: 0, contractLimit: Number.POSITIVE_INFINITY, plan: userPlan }

      try {
        const response = await api.get("/contracts/user-stats")
        return response.data
      } catch (err) {
        console.error("Error fetching user contract stats:", err)
        // Default fallback values
        return { contractCount: 0, contractLimit: 2, plan: "basic" }
      }
    },
    enabled: !!user,
  })

  // Fetch contract content for AI analysis
  useEffect(() => {
    const fetchContractContent = async () => {
      if (contractId) {
        try {
          const response = await api.get(`/contracts/contract/${contractId}`)
          // Try different possible property names for the contract content
          const content = response.data.originalContent || 
                         response.data.content || 
                         response.data.contractText || 
                         response.data.text || 
                         response.data.rawContent ||
                         ""
          setContractContent(content)
          console.log("Contract content fetched for AI:", content.length, "characters")
        } catch (error) {
          console.error("Error fetching contract content:", error)
          setContractContent("Contract content could not be retrieved for AI analysis")
        }
      }
    }

    fetchContractContent()
  }, [contractId])

  useEffect(() => {
    if (userStats && !isPremium) {
      const { contractCount, contractLimit } = userStats

      // Only show upgrade dialog when user has actually reached their limit
      if (contractCount >= contractLimit) {
        setShowUpgradeDialog(true)
      } else {
        // Ensure dialog is hidden if user hasn't reached limit
        setShowUpgradeDialog(false)
      }
    } else if (isPremium) {
      // Hide dialog for premium users
      setShowUpgradeDialog(false)
    }
    handleRefreshChart()
  }, [userStats, isPremium])

  // Function to get context for AI analysis
  const getContextForAI = () => {
    // First try to get the original contract content
    if (analysisResults?.originalContent) {
      return analysisResults.originalContent
    }
    
    // Then try the fetched contract content
    if (contractContent && contractContent.length > 50) {
      return contractContent
    }
    
    // Build context from analysis results if no raw content available
    const analysisContext = `
Contract Analysis Summary:
Contract Type: ${analysisResults.contractType || 'Unknown'}
Overall Score: ${analysisResults.overallScore}%
Assessment: ${Number(analysisResults.overallScore) > 70 ? 'Favorable' : Number(analysisResults.overallScore) > 50 ? 'Average' : 'Unfavorable'}

Executive Summary: ${analysisResults.summary || 'No summary available'}

Key Risks Identified:
${analysisResults.risks?.map(r => `- ${r.risk}: ${r.explanation || 'No details'} (Severity: ${r.severity || 'Unknown'})`).join('\n') || 'None identified'}

Key Opportunities:
${analysisResults.opportunities?.map(o => `- ${o.opportunity}: ${o.explanation || 'No details'} (Impact: ${o.impact || 'Unknown'})`).join('\n') || 'None identified'}

Key Clauses:
${analysisResults.keyClauses?.join(', ') || 'None specified'}

Financial Terms: ${analysisResults.financialTerms?.description || 'Not specified'}

Contract Duration: ${analysisResults.contractDuration || 'Not specified'}

Termination Conditions: ${analysisResults.terminationConditions || 'Not specified'}

Legal Compliance: ${analysisResults.legalCompliance || 'No compliance information available'}

Recommendations:
${analysisResults.recommendations?.map((rec, i) => `${i + 1}. ${rec}`).join('\n') || 'None provided'}

Negotiation Points:
${analysisResults.negotiationPoints?.join(', ') || 'None provided'}
    `.trim()
    
    return analysisContext
  }

  // Check if the user has reached their free plan limit
  const handleRefreshChart = () => {
    setRefreshChart(true)
    setTimeout(() => setRefreshChart(false), 100)
  }

  const handleOpenChatModal = () => {
    // Debug the context being passed
    const context = getContextForAI()
    console.log("Debug ChatbotModal Context:", {
      originalContent: analysisResults?.originalContent?.length || 0,
      fetchedContent: contractContent?.length || 0,
      summary: analysisResults?.summary?.length || 0,
      finalContext: context?.length || 0,
      userPlan,
      contractId
    })

    if (isGold) {
      setIsGoldChatModalOpen(true)
    } else {
      setIsChatModalOpen(true)
    }
  }

  const handleCloseChatModal = () => {
    setIsChatModalOpen(false)
    setIsGoldChatModalOpen(false)
  }

  const handleOpenModificationPage = () => {
    setShowModificationPage(true)
  }

  const handleCloseModificationPage = () => {
    setShowModificationPage(false)
  }

  const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY

  const handleUpgrade = async (targetPlan: "premium" | "gold" = "premium") => {
    try {
      // You might want to modify this endpoint to support different plan types
      const response = await api.get(`/payments/create-checkout-session?plan=${targetPlan}`)
      console.log("response", response)
      const stripe = await stripePromise
      await stripe?.redirectToCheckout({
        sessionId: response.data.sessionId,
      })
    } catch (error) {
      console.error(error)
      // Fallback to generic upgrade if plan-specific fails
      try {
        const response = await api.get("/payments/create-checkout-session")
        const stripe = await stripePromise
        await stripe?.redirectToCheckout({
          sessionId: response.data.sessionId,
        })
      } catch (fallbackError) {
        console.error("Upgrade failed:", fallbackError)
      }
    }
  }

  const getScore = () => {
    const score = Number(analysisResults.overallScore) || 75
    if (score > 70) return { icon: ArrowUp, color: "text-green-500", text: "Favorable", displayText: "Favorable" }
    if (score > 50) return { icon: Minus, color: "text-yellow-500", text: "Average", displayText: "Average" }
    return { icon: ArrowDown, color: "text-red-500", text: "Bad", displayText: "Unfavorable" }
  }

  const scoreTrend = getScore()
  const Icon = scoreTrend.icon

  const getSeverityBadge = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case "high":
        return <span className="px-2 py-1 text-xs sm:px-3 rounded-full font-medium bg-red-100 text-red-600">High</span>
      case "medium":
        return (
          <span className="px-2 py-1 text-xs sm:px-3 rounded-full font-medium bg-yellow-100 text-yellow-600">
            Medium
          </span>
        )
      case "low":
        return (
          <span className="px-2 py-1 text-xs sm:px-3 rounded-full font-medium bg-green-100 text-green-600">Low</span>
        )
      default:
        return (
          <span className="px-2 py-1 text-xs sm:px-3 rounded-full font-medium bg-gray-100 text-gray-600">Unknown</span>
        )
    }
  }

  const renderRisksAndOpportunities = (
    items: Array<{
      risk?: string
      opportunity?: string
      explanation?: string
      severity?: string
      impact?: string
    }>,
    type: "risk" | "opportunity",
  ) => {
    return (
      <div className="space-y-4">
        {items.map((item, index) => {
          const severityOrImpact = type === "risk" ? item.severity : item.impact

          return (
            <div key={index} className="border rounded-lg p-3 sm:p-4 bg-white shadow-sm">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-2">
                <h3 className="font-medium text-gray-800 text-sm sm:text-base">
                  {type === "risk" ? item.risk : item.opportunity}
                </h3>
                <div className="sm:ml-2 self-start">{getSeverityBadge(severityOrImpact || "")}</div>
              </div>
              <p className="text-xs sm:text-sm text-gray-600">{item.explanation}</p>
            </div>
          )
        })}
      </div>
    )
  }

  const PremiumUpgradePrompt = ({ requiredPlan }: { requiredPlan?: "premium" | "gold" }) => {
    const targetPlan = requiredPlan || "premium"
    const planName = targetPlan === "gold" ? "Gold" : "Premium"

    return (
      <div className="flex flex-col items-center justify-center p-4 sm:p-8 text-center">
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-gray-500" />
        </div>
        <h3 className="text-lg sm:text-xl font-bold mb-2">{planName} Feature</h3>
        <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 max-w-md">
          {targetPlan === "gold"
            ? "Unlock advanced AI features including contract chat and modification by upgrading to our Gold plan."
            : "Unlock detailed contract analysis including key clauses, recommendations, and negotiation points by upgrading to our Premium plan."}
        </p>
        <Button
          onClick={() => handleUpgrade(targetPlan)}
          className={`${targetPlan === "gold" ? "bg-yellow-600 hover:bg-yellow-700" : "bg-blue-600 hover:bg-blue-700"} text-white px-4 sm:px-6 py-2 text-sm sm:text-base`}
        >
          Upgrade to {planName}
        </Button>
      </div>
    )
  }

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
          <p className="text-sm sm:text-base text-gray-700">
            {analysisResults.financialTerms?.description || "Not specified"}
          </p>
        </div>
        <div className="border rounded-lg p-3 sm:p-4">
          <h3 className="text-base sm:text-lg font-medium mb-1 sm:mb-2">Termination Conditions</h3>
          <p className="text-sm sm:text-base text-gray-700">
            {analysisResults.terminationConditions || "Not specified"}
          </p>
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
                  {analysisResults.specificClauses && typeof analysisResults.specificClauses === "string"
                    ? analysisResults.specificClauses
                    : "No details provided"}
                </p>
              </div>
            ))
          ) : (
            <div className="border rounded-lg p-3 sm:p-4">
              <h4 className="font-medium mb-1 text-sm sm:text-base">No key clauses available</h4>
              <p className="text-xs sm:text-sm text-gray-600">No key clauses have been identified for this contract.</p>
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
              <li key={index} className="text-sm sm:text-base text-gray-700">
                {recommendation}
              </li>
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
  )

  // Ask AI button rendering based on plan status
  const renderAskAIButton = () => {
    if (isGold) {
      // Gold users get full AI chat functionality
      return (
        <Button
          className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs sm:text-sm whitespace-nowrap flex items-center gap-1"
          onClick={handleOpenChatModal}
        >
          <MessageCircle className="h-3 w-3" />
          Ask AI (Gold)
        </Button>
      )
    } else if (isPremium) {
      // Premium users get basic AI chat
      return (
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm whitespace-nowrap flex items-center gap-1"
          onClick={handleOpenChatModal}
        >
          <MessageCircle className="h-3 w-3" />
          Ask AI
        </Button>
      )
    } else {
      // Basic users see upgrade prompt (Premium or Gold)
      return (
        <Dialog open={isPremiumDialogOpen} onOpenChange={setIsPremiumDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white opacity-90 text-xs sm:text-sm whitespace-nowrap flex items-center gap-1"
              onClick={() => setIsPremiumDialogOpen(true)}
            >
              <MessageCircle className="h-3 w-3" />
              Ask AI
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md max-w-[90vw] p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Lock className="h-4 w-4 sm:h-5 sm:w-5" /> AI Feature Locked
              </DialogTitle>
              <DialogDescription className="text-sm">
                Upgrade to <span className="font-semibold text-blue-600">Premium</span> or{" "}
                <span className="font-semibold text-yellow-600">Gold</span> to use Ask AI.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
              <DialogClose asChild>
                <Button variant="outline" className="text-xs sm:text-sm w-full sm:w-auto bg-transparent">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm w-full sm:w-auto"
                onClick={() => handleUpgrade("premium")}
              >
                Upgrade to Premium
              </Button>
              <Button
                className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs sm:text-sm w-full sm:w-auto"
                onClick={() => handleUpgrade("gold")}
              >
                Upgrade to Gold
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )
    }
  }

  // Gold-specific features section
  const GoldFeaturesSection = () => {
    if (!isGold) return null

    return (
      <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200 shadow-sm mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-yellow-800 text-lg flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Gold Features Available
          </CardTitle>
          <CardDescription className="text-yellow-700 text-sm">
            You have access to our most advanced AI features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              onClick={handleOpenChatModal}
              className="bg-yellow-600 hover:bg-yellow-700 text-white text-sm flex items-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              AI Contract Chat
            </Button>
            <Button
              variant="outline"
              className="border-yellow-300 text-yellow-700 hover:bg-yellow-50 text-sm flex items-center gap-2 bg-transparent"
              onClick={handleOpenModificationPage}
            >
              <FileEdit className="h-4 w-4" />
              Modify Contract
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  console.log("User Plan:", userPlan, "Premium:", isPremium, "Gold:", isGold)

  if (!analysisResults) {
    return <div>No Results</div>
  }

  // Show loading state while subscription status or stats are being loaded
  if ((isSubscriptionLoading && externalIsPremium === undefined) || (isStatsLoading && !isPremium)) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  // Show Contract Modification Page when requested
  if (showModificationPage) {
    return (
      <ContractModificationPage
        contractId={contractId}
        contractType={analysisResults.contractType}
        contractTitle={`Contract ${contractId.slice(-6)}`}
        recommendations={analysisResults.recommendations || []}
        onBack={handleCloseModificationPage}
        onModificationComplete={() => {
          // Optionally refresh the analysis results
          console.log("Contract modified successfully")
        }}
      />
    )
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 bg-gray-50">
      {/* Free Plan Limit Warning */}
      {showLimitWarning && !isPremium && (
        <Alert className="mb-4 bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <AlertTitle className="text-amber-800">Free Plan Limit Warning</AlertTitle>
          <AlertDescription className="text-amber-700">
            You have used {userStats?.contractCount || 1} of your {userStats?.contractLimit || 2} free contract
            analyses.
            <Button
              variant="link"
              onClick={() => handleUpgrade("premium")}
              className="p-0 h-auto text-blue-600 font-medium hover:text-blue-800"
            >
              Upgrade to Premium
            </Button>{" "}
            for unlimited analyses.
          </AlertDescription>
        </Alert>
      )}

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
                  <div className="text-3xl sm:text-5xl font-bold mr-3 sm:mr-4">{analysisResults.overallScore}%</div>
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
            className={`rounded flex-1 py-1 sm:py-2 text-xs sm:text-sm ${activeTab === "summary" ? "bg-blue-500 shadow-sm text-gray-900" : "text-gray-900"}`}
          >
            <span className="font-medium">Summary</span>
          </TabsTrigger>
          <TabsTrigger
            value="risks"
            className={`rounded flex-1 py-1 sm:py-2 text-xs sm:text-sm ${activeTab === "risks" ? "bg-blue-500 text-gray-900" : "text-gray-900"}`}
          >
            <span className="font-medium">Risks</span>
          </TabsTrigger>
          <TabsTrigger
            value="opportunities"
            className={`rounded flex-1 py-1 sm:py-2 text-xs sm:text-sm ${activeTab === "opportunities" ? "bg-blue-500 shadow-sm text-gray-900" : "text-gray-900"}`}
          >
            <span className="font-medium">Opportunities</span>
          </TabsTrigger>
          <TabsTrigger
            value="details"
            className={`rounded flex-1 py-1 sm:py-2 text-xs sm:text-sm ${activeTab === "details" ? "bg-blue-500 shadow-sm text-gray-900" : "text-gray-900"}`}
            disabled={!isPremium}
          >
            <span className="font-medium whitespace-nowrap">
              Details {!isPremium && <Lock className="inline-block h-2 w-2 sm:h-3 sm:w-3 ml-0.5 sm:ml-1" />}
            </span>
          </TabsTrigger>
          {isGold && (
            <TabsTrigger
              value="advanced"
              className={`rounded flex-1 py-1 sm:py-2 text-xs sm:text-sm ${activeTab === "advanced" ? "bg-yellow-500 shadow-sm text-gray-900" : "text-gray-900"}`}
            >
              <span className="font-medium whitespace-nowrap flex items-center gap-1">
                <Crown className="h-3 w-3" />
                Advanced
              </span>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="summary">
          <Card className="bg-white shadow-sm border-0">
            <CardHeader className="p-3 sm:p-4">
              <CardTitle className="text-lg sm:text-xl text-gray-800">Contract Summary</CardTitle>
              <CardDescription className="text-xs sm:text-sm text-gray-600">
                Key insights and overview of your contract analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-1">Contract Type</h4>
                    <p className="text-sm text-blue-700">{analysisResults.contractType || "Not specified"}</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-1">Overall Assessment</h4>
                    <p className="text-sm text-green-700">
                      {scoreTrend.displayText} ({analysisResults.overallScore}%)
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-800 mb-2">Key Highlights</h4>
                  <div className="space-y-2">
                    {analysisResults.risks && analysisResults.risks.length > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <span>{analysisResults.risks.length} risk(s) identified</span>
                      </div>
                    )}
                    {analysisResults.opportunities && analysisResults.opportunities.length > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>{analysisResults.opportunities.length} opportunity(ies) found</span>
                      </div>
                    )}
                    {analysisResults.recommendations && analysisResults.recommendations.length > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <FileEdit className="h-4 w-4 text-blue-500" />
                        <span>{analysisResults.recommendations.length} recommendation(s) available</span>
                      </div>
                    )}
                  </div>
                </div>

                {analysisResults.summary && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-800 mb-2">Executive Summary</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{analysisResults.summary}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risks">
          <Card className="bg-white shadow-sm border-0">
            <CardHeader className="p-3 sm:p-4">
              <CardTitle className="text-lg sm:text-xl text-gray-800 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                Identified Risks
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-gray-600">
                Potential issues and concerns found in your contract
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              {analysisResults.risks && analysisResults.risks.length > 0 ? (
                renderRisksAndOpportunities(analysisResults.risks, "risk")
              ) : (
                <div className="text-center py-8">
                  <Check className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-800 mb-1">No Major Risks Identified</h3>
                  <p className="text-sm text-gray-600">Your contract appears to have minimal risk factors.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="opportunities">
          <Card className="bg-white shadow-sm border-0">
            <CardHeader className="p-3 sm:p-4">
              <CardTitle className="text-lg sm:text-xl text-gray-800 flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                Opportunities
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-gray-600">
                Positive aspects and potential benefits in your contract
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              {analysisResults.opportunities && analysisResults.opportunities.length > 0 ? (
                renderRisksAndOpportunities(analysisResults.opportunities, "opportunity")
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-800 mb-1">Limited Opportunities</h3>
                  <p className="text-sm text-gray-600">Consider reviewing the contract for potential improvements.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details">
          <Card className="bg-white shadow-sm border-0">
            <CardHeader className="p-3 sm:p-4">
              <CardTitle className="text-lg sm:text-xl text-gray-800">Detailed Analysis</CardTitle>
              <CardDescription className="text-xs sm:text-sm text-gray-600">
                In-depth contract breakdown and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              {isPremium ? <ContractDetailsContent /> : <PremiumUpgradePrompt />}
            </CardContent>
          </Card>
        </TabsContent>

        {isGold && (
          <TabsContent value="advanced">
            <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200 shadow-sm">
              <CardHeader className="p-3 sm:p-4">
                <CardTitle className="text-lg sm:text-xl text-yellow-800 flex items-center gap-2">
                  <Crown className="h-5 w-5" />
                  Advanced Gold Features
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm text-yellow-700">
                  Premium AI-powered contract analysis and modification tools
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 pt-0">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Button
                      onClick={handleOpenChatModal}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white flex items-center gap-2 justify-center"
                    >
                      <MessageCircle className="h-4 w-4" />
                      AI Contract Chat
                    </Button>
                    <Button
                      onClick={handleOpenModificationPage}
                      variant="outline"
                      className="border-yellow-300 text-yellow-700 hover:bg-yellow-50 flex items-center gap-2 justify-center bg-transparent"
                    >
                      <FileEdit className="h-4 w-4" />
                      Modify Contract
                    </Button>
                  </div>

                  <div className="border-t border-yellow-200 pt-4">
                    <h4 className="font-medium text-yellow-800 mb-2">Advanced Insights</h4>
                    <div className="space-y-3">
                      <div className="bg-white/50 p-3 rounded-lg">
                        <h5 className="font-medium text-yellow-800 text-sm mb-1">AI Risk Assessment</h5>
                        <p className="text-xs text-yellow-700">
                          Advanced machine learning algorithms have analyzed your contract for subtle patterns and
                          potential issues.
                        </p>
                      </div>
                      <div className="bg-white/50 p-3 rounded-lg">
                        <h5 className="font-medium text-yellow-800 text-sm mb-1">Market Comparison</h5>
                        <p className="text-xs text-yellow-700">
                          Your contract terms have been compared against industry standards and market benchmarks.
                        </p>
                      </div>
                      <div className="bg-white/50 p-3 rounded-lg">
                        <h5 className="font-medium text-yellow-800 text-sm mb-1">Predictive Analysis</h5>
                        <p className="text-xs text-yellow-700">
                          AI-powered forecasting shows potential future implications of current contract terms.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>


      {/* Chat Modals */}
      {isChatModalOpen && !isGold && (
        <ChatbotModal
          open={isChatModalOpen}
          onClose={handleCloseChatModal}
          geminiApiKey={geminiApiKey}
          context={getContextForAI()}
          userPlan={userPlan as "basic" | "premium" | "gold"}
          contractTitle={`Contract ${contractId.slice(-6)}`}
          contractType={analysisResults.contractType || "Contract"}
        />
      )}

      {isGoldChatModalOpen && isGold && (
        <GoldChatModal
          open={isGoldChatModalOpen}
          onClose={handleCloseChatModal}
          contractId={contractId}
        />
      )}
    </div>
  )
}