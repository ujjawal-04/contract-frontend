// src/components/analysis/ContractModificationPage.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api"
import {
  Crown,
  FileEdit,
  Download,
  History,
  Check,
  X,
  Plus,
  Loader2,
  CheckCircle,
  FileText,
  ArrowLeft,
} from "lucide-react"
import { toast } from "react-hot-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface ContractModificationPageProps {
  contractId: string
  contractType: string
  contractTitle: string
  recommendations?: string[]
  onModificationComplete?: () => void
  onBack?: () => void
}

interface ModificationHistory {
  modifiedAt: string
  modifiedBy: string
  changes: string
  version: number
  modifiedContent?: string
}

interface ModificationResponse {
  modifiedContract: string
  originalContractId: string
  modifications: string[]
  version: number
  canDownload: boolean
}

interface CustomRecommendation {
  generatedAt: string
  focusAreas: string[]
  recommendations: string[]
}

export function ContractModificationPage({
  contractId,
  contractType,
  contractTitle,
  recommendations = [],
  onModificationComplete,
  onBack,
}: ContractModificationPageProps) {
  const [activeTab, setActiveTab] = useState("modify")
  const [isModifying, setIsModifying] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isGeneratingRecommendations, setIsGeneratingRecommendations] = useState(false)

  // Modification state
  const [selectedRecommendations, setSelectedRecommendations] = useState<string[]>([])
  const [customModifications, setCustomModifications] = useState<string[]>([""])
  const [modificationResult, setModificationResult] = useState<ModificationResponse | null>(null)

  // History state
  const [modificationHistory, setModificationHistory] = useState<ModificationHistory[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)

  // Custom recommendations state
  const [focusAreas, setFocusAreas] = useState<string[]>(["risk mitigation", "compliance", "negotiation improvement"])
  const [customRecommendations, setCustomRecommendations] = useState<string[]>([])
  const [customFocusArea, setCustomFocusArea] = useState("")

  // Predefined focus areas
  const predefinedFocusAreas = [
    "risk mitigation",
    "legal compliance",
    "cost optimization",
    "negotiation improvement",
    "performance standards",
    "termination clauses",
    "intellectual property",
    "payment terms",
    "liability limitations",
    "dispute resolution",
  ]

  // Reset state when component mounts
  useEffect(() => {
    setSelectedRecommendations([])
    setCustomModifications([""])
    setModificationResult(null)
    setCustomRecommendations([])
    setActiveTab("modify")
    fetchModificationHistory()
  }, [contractId])

  // Fetch modification history
  const fetchModificationHistory = async () => {
    setIsLoadingHistory(true)
    try {
      const response = await api.get(`/contracts/contract/${contractId}`)
      if (response.data.modificationHistory) {
        setModificationHistory(response.data.modificationHistory)
      }
    } catch (error) {
      console.error("Error fetching modification history:", error)
      toast.error("Failed to load modification history")
    } finally {
      setIsLoadingHistory(false)
    }
  }

  // Handle recommendation selection
  const toggleRecommendation = (recommendation: string) => {
    setSelectedRecommendations((prev) =>
      prev.includes(recommendation) ? prev.filter((r) => r !== recommendation) : [...prev, recommendation],
    )
  }

  // Handle custom modifications
  const addCustomModification = () => {
    setCustomModifications((prev) => [...prev, ""])
  }

  const removeCustomModification = (index: number) => {
    if (customModifications.length > 1) {
      setCustomModifications((prev) => prev.filter((_, i) => i !== index))
    }
  }

  const updateCustomModification = (index: number, value: string) => {
    setCustomModifications((prev) => prev.map((mod, i) => (i === index ? value : mod)))
  }

  // Handle focus areas
  const toggleFocusArea = (area: string) => {
    setFocusAreas((prev) => (prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]))
  }

  const addCustomFocusArea = () => {
    if (customFocusArea.trim() && !focusAreas.includes(customFocusArea.trim())) {
      setFocusAreas((prev) => [...prev, customFocusArea.trim()])
      setCustomFocusArea("")
    }
  }

  // Generate custom recommendations
  const generateCustomRecommendations = async () => {
    if (focusAreas.length === 0) {
      toast.error("Please select at least one focus area")
      return
    }

    setIsGeneratingRecommendations(true)
    try {
      const response = await api.post("/contracts/recommendations", {
        contractId,
        focusAreas,
      })

      setCustomRecommendations(response.data.recommendations)
      toast.success("Custom recommendations generated successfully!")
      setActiveTab("modify") // Switch back to modify tab
    } catch (error: any) {
      console.error("Error generating recommendations:", error)
      toast.error(error.response?.data?.message || "Failed to generate recommendations")
    } finally {
      setIsGeneratingRecommendations(false)
    }
  }

  // Handle contract modification
  const handleModifyContract = async () => {
    const allModifications = [
      ...selectedRecommendations,
      ...customModifications.filter((mod) => mod.trim()),
    ]

    if (allModifications.length === 0) {
      toast.error("Please select recommendations or add custom modifications")
      return
    }

    setIsModifying(true)
    try {
      const response = await api.post("/contracts/modify", {
        contractId,
        modifications: allModifications,
        useRecommendations: selectedRecommendations.length > 0,
        customModifications: customModifications.filter((mod) => mod.trim()),
      })

      setModificationResult(response.data)
      toast.success("Contract modified successfully!")

      // Refresh modification history
      await fetchModificationHistory()

      if (onModificationComplete) {
        onModificationComplete()
      }
    } catch (error: any) {
      console.error("Error modifying contract:", error)
      toast.error(error.response?.data?.message || "Failed to modify contract")
    } finally {
      setIsModifying(false)
    }
  }

  // Handle download
  const handleDownload = async (version: string | number = "original") => {
    setIsDownloading(true)
    try {
      const response = await api.get(`/contracts/download/${contractId}/version/${version}`, { responseType: "blob" })

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `contract-${contractType}-v${version}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      toast.success("Contract downloaded successfully!")
    } catch (error: any) {
      console.error("Error downloading contract:", error)
      toast.error(error.response?.data?.message || "Failed to download contract")
    } finally {
      setIsDownloading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-50 via-amber-50 to-orange-50 border-b border-yellow-200/60 top-0 z-30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-3 sm:py-4 lg:py-6">
          {onBack && (
            <div className="mb-3 sm:mb-4">
              <Button
                variant="ghost"
                onClick={onBack}
                className="group flex items-center gap-2 hover:bg-yellow-100/70 px-2 sm:px-3 py-1.5 sm:py-2 transition-all duration-200 rounded-lg"
                size="sm"
              >
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-200" />
                <span className="text-sm font-medium">Back to Analysis</span>
              </Button>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
            <div className="flex-shrink-0">
              <div className="p-2 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl shadow-lg">
                <Crown className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold bg-gradient-to-r from-yellow-700 via-amber-600 to-orange-600 bg-clip-text text-transparent leading-tight">
                Contract Modification Suite
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-yellow-700/80 mt-1 font-medium">
                Modify "{contractTitle}"
              </p>
              <p className="text-xs sm:text-sm text-yellow-600/70 mt-0.5">
                Contract Type: {contractType}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Improved sticky tabs */}
          <div className=" top-[120px] sm:top-[140px] lg:top-[160px] bg-gradient-to-br from-gray-50 to-gray-100 pb-4 sm:pb-6 z-20 -mx-3 sm:-mx-4 lg:-mx-6 xl:-mx-8 px-3 sm:px-4 lg:px-6 xl:px-8 border-b border-gray-200/50">
            <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm p-1.5 rounded-xl shadow-md border border-gray-200/50 h-auto">
              <TabsTrigger
                value="modify"
                className="flex items-center justify-center gap-2 py-2.5 sm:py-3 text-sm sm:text-base font-medium px-2 sm:px-4 transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-800 data-[state=active]:shadow-sm rounded-lg"
              >
                <FileEdit className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Modify Contract</span>
                <span className="sm:hidden">Modify</span>
              </TabsTrigger>
              <TabsTrigger
                value="recommendations"
                className="flex items-center justify-center gap-2 py-2.5 sm:py-3 text-sm sm:text-base font-medium px-2 sm:px-4 transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-100 data-[state=active]:to-indigo-100 data-[state=active]:text-blue-800 data-[state=active]:shadow-sm rounded-lg"
              >
                <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Custom Recommendations</span>
                <span className="sm:hidden">Custom</span>
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="flex items-center justify-center gap-2 py-2.5 sm:py-3 text-sm sm:text-base font-medium px-2 sm:px-4 transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-100 data-[state=active]:to-violet-100 data-[state=active]:text-purple-800 data-[state=active]:shadow-sm rounded-lg"
              >
                <History className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">History</span>
                <span className="sm:hidden">History</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="modify" className="mt-0 space-y-6">
            {/* AI Recommendations Section */}
            {(recommendations.length > 0 || customRecommendations.length > 0) && (
              <Card className="shadow-md border-0 bg-white/70 backdrop-blur-sm">
                <CardHeader className="pb-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg">
                  <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <span>AI Recommendations</span>
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base text-green-700/80">
                    Select AI-generated recommendations to apply to your contract
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 max-h-96 overflow-y-auto p-4 sm:p-6">
                  {/* Original recommendations */}
                  {recommendations.map((recommendation, index) => (
                    <div
                      key={`orig-${index}`}
                      className="group flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50/30 transition-all duration-200"
                    >
                      <Checkbox
                        id={`recommendation-${index}`}
                        checked={selectedRecommendations.includes(recommendation)}
                        onCheckedChange={() => toggleRecommendation(recommendation)}
                        className="mt-1 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <label
                          htmlFor={`recommendation-${index}`}
                          className="text-sm sm:text-base font-medium cursor-pointer block leading-relaxed text-gray-800"
                        >
                          {recommendation}
                        </label>
                        <Badge variant="secondary" className="mt-2 text-xs bg-blue-100 text-blue-700">
                          AI Generated
                        </Badge>
                      </div>
                    </div>
                  ))}

                  {/* Custom recommendations */}
                  {customRecommendations.map((recommendation, index) => (
                    <div
                      key={`custom-${index}`}
                      className="group flex items-start gap-3 p-4 border-2 border-dashed border-yellow-300 rounded-lg bg-gradient-to-r from-yellow-50 to-amber-50 hover:from-yellow-100 hover:to-amber-100 transition-all duration-200"
                    >
                      <Checkbox
                        id={`custom-recommendation-${index}`}
                        checked={selectedRecommendations.includes(recommendation)}
                        onCheckedChange={() => toggleRecommendation(recommendation)}
                        className="mt-1 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <label
                          htmlFor={`custom-recommendation-${index}`}
                          className="text-sm sm:text-base font-medium cursor-pointer block leading-relaxed text-gray-800"
                        >
                          {recommendation}
                        </label>
                        <Badge className="mt-2 text-xs bg-gradient-to-r from-yellow-500 to-amber-500 text-white">
                          Custom Generated
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Custom Modifications Section */}
            <Card className="shadow-md border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
                <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileEdit className="h-5 w-5 text-blue-600" />
                  </div>
                  <span>Custom Modifications</span>
                </CardTitle>
                <CardDescription className="text-sm sm:text-base text-blue-700/80">
                  Add your own specific modifications to the contract
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 max-h-96 overflow-y-auto p-4 sm:p-6">
                {customModifications.map((modification, index) => (
                  <div key={index} className="space-y-3 p-4 border border-gray-200 rounded-lg bg-gray-50/30">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`modification-${index}`} className="text-sm font-semibold text-gray-700">
                        Modification {index + 1}
                      </Label>
                      {customModifications.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCustomModification(index)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0 rounded-full"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <Textarea
                      id={`modification-${index}`}
                      placeholder="Describe the specific modification you want to make..."
                      value={modification}
                      onChange={(e) => updateCustomModification(index, e.target.value)}
                      className="text-sm resize-none focus:ring-2 focus:ring-blue-500 border-gray-300"
                      rows={3}
                    />
                  </div>
                ))}

                <Button
                  variant="outline"
                  onClick={addCustomModification}
                  className="w-full border-2 border-dashed border-gray-300 py-4 text-sm bg-transparent hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Modification
                </Button>
              </CardContent>
            </Card>

            {/* Modification Result */}
            {modificationResult && (
              <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-lg sm:text-xl text-green-800">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <span>Modification Complete</span>
                  </CardTitle>
                  <CardDescription className="text-green-700 text-sm sm:text-base">
                    Your contract has been successfully modified 
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-semibold text-green-800 block mb-3">
                        Applied Modifications:
                      </Label>
                      <div className="max-h-32 overflow-y-auto bg-white/50 rounded-lg p-3 border border-green-200">
                        <ul className="space-y-2">
                          {modificationResult.modifications.map((mod, index) => (
                            <li
                              key={index}
                              className="text-sm text-green-700 flex items-start gap-2 leading-relaxed"
                            >
                              <Check className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-600" />
                              <span>{mod}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-green-200">
                      <Button
                        onClick={() => handleDownload(modificationResult.version)}
                        disabled={isDownloading}
                        className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md"
                      >
                        {isDownloading ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4 mr-2" />
                        )}
                        Download Modified Contract
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={onBack}
                className="bg-transparent hover:bg-gray-100"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Analysis
              </Button>

              <Button
                onClick={handleModifyContract}
                disabled={isModifying}
                className="bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 text-white shadow-md"
              >
                {isModifying ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Crown className="h-4 w-4 mr-2" />
                )}
                Apply Modifications
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="recommendations" className="mt-0 space-y-6">
            <Card className="shadow-md border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
                <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Plus className="h-5 w-5 text-blue-600" />
                  </div>
                  <span>Generate Custom Recommendations</span>
                </CardTitle>
                <CardDescription className="text-sm sm:text-base text-blue-700/80">
                  Select focus areas to generate tailored recommendations for your contract
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-4 sm:p-6">
                <div>
                  <Label className="text-sm font-semibold mb-4 block text-gray-700">Focus Areas</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto p-3 bg-gray-50/50 rounded-lg border border-gray-200">
                    {predefinedFocusAreas.map((area) => (
                      <div
                        key={area}
                        className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                      >
                        <Checkbox
                          id={`focus-${area}`}
                          checked={focusAreas.includes(area)}
                          onCheckedChange={() => toggleFocusArea(area)}
                          className="flex-shrink-0"
                        />
                        <Label
                          htmlFor={`focus-${area}`}
                          className="text-sm capitalize cursor-pointer leading-relaxed"
                        >
                          {area}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    placeholder="Add custom focus area..."
                    value={customFocusArea}
                    onChange={(e) => setCustomFocusArea(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addCustomFocusArea()}
                    className="flex-1 text-sm focus:ring-2 focus:ring-blue-500"
                  />
                  <Button
                    onClick={addCustomFocusArea}
                    variant="outline"
                    className="flex-shrink-0 bg-transparent hover:bg-blue-50"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {focusAreas.length > 0 && (
                  <div>
                    <Label className="text-sm font-semibold block mb-3 text-gray-700">Selected Focus Areas:</Label>
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-3 bg-blue-50/50 rounded-lg border border-blue-200">
                      {focusAreas.map((area) => (
                        <Badge
                          key={area}
                          variant="secondary"
                          className="capitalize text-xs px-3 py-1.5 flex items-center gap-2 bg-blue-100 text-blue-700 border border-blue-200"
                        >
                          <span className="max-w-[120px] truncate">{area}</span>
                          <X 
                            className="h-3 w-3 cursor-pointer hover:text-red-500 transition-colors" 
                            onClick={() => toggleFocusArea(area)} 
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  onClick={generateCustomRecommendations}
                  disabled={isGeneratingRecommendations || focusAreas.length === 0}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md py-3"
                >
                  {isGeneratingRecommendations ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Generate Custom Recommendations
                </Button>
              </CardContent>
            </Card>

            {customRecommendations.length > 0 && (
              <Alert className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-md">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 text-sm sm:text-base leading-relaxed">
                  Generated {customRecommendations.length} custom recommendations! Switch to "Modify" tab to apply them.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-0">
            <Card className="shadow-md border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader className="pb-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-t-lg">
                <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <History className="h-5 w-5 text-purple-600" />
                  </div>
                  <span>Modification History</span>
                </CardTitle>
                <CardDescription className="text-sm sm:text-base text-purple-700/80">
                  View all versions and modifications made to this contract
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                {isLoadingHistory ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin mr-3 text-purple-600" />
                    <span className="text-sm text-purple-700">Loading history...</span>
                  </div>
                ) : modificationHistory.length > 0 ? (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {/* Original version */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-2 border-blue-200 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-blue-800 text-base sm:text-lg mb-1">
                          Version 1 (Original)
                        </div>
                        <div className="text-blue-600 text-sm">Initial contract upload</div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => handleDownload("original")}
                        disabled={isDownloading}
                        className="flex-shrink-0 border-blue-300 text-blue-700 hover:bg-blue-100"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>

                    {/* Modified versions */}
                    {modificationHistory.map((history, index) => (
                      <div
                        key={index}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 gap-3"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-800 text-base sm:text-lg mb-1">
                            Version {history.version}
                          </div>
                          <div className="text-gray-600 text-sm mb-2">
                            Modified by {history.modifiedBy} on {formatDate(history.modifiedAt)}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => handleDownload(history.version)}
                          disabled={isDownloading}
                          className="flex-shrink-0 hover:bg-gray-100"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <div className="mb-4">
                      <History className="h-16 w-16 mx-auto opacity-30" />
                    </div>
                    <p className="text-lg font-medium mb-2">No modifications made yet</p>
                    <p className="text-sm leading-relaxed max-w-sm mx-auto">
                      Switch to "Modify" tab to create your first modification and start building your contract history
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}