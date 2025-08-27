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
    setCustomModifications((prev) => prev.filter((_, i) => i !== index))
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
      ...customRecommendations.filter((rec) => selectedRecommendations.includes(rec)),
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-b border-yellow-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-3 sm:mb-4 lg:mb-6">
            {onBack && (
              <Button
                variant="ghost"
                onClick={onBack}
                className="flex items-center gap-2 hover:bg-yellow-100 self-start text-sm sm:text-base lg:text-2xl xl:text-3xl"
                size="sm"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back to Analysis</span>
                <span className="sm:hidden">Back</span>
              </Button>
            )}
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <Crown className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-yellow-600 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent leading-tight">
                Contract Modification Suite
              </h1>
              <p className="text-xs sm:text-sm lg:text-base text-yellow-700 mt-1 text-pretty">
                Modify "{contractTitle}" ({contractType}) with AI-powered suggestions
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="sticky mt-4 top-[120px] sm:top-[140px] lg:top-[160px] bg-gray-50 pb-3 sm:pb-4 lg:pb-6 z-10 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
            <TabsList className="grid w-full grid-cols-3 bg-white p-1 rounded-lg shadow-sm border h-auto">
              <TabsTrigger
                value="modify"
                className="flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-3 text-xs sm:text-sm lg:text-base px-1 sm:px-2 lg:px-3 max-w-full min-w-0 data-[state=active]:shadow-none data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-800 data-[state=active]:border-amber-200 transition-all duration-200"
              >
                <FileEdit className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 flex-shrink-0" />
                <span className="font-medium truncate min-w-0">Modify</span>
              </TabsTrigger>
              <TabsTrigger
                value="recommendations"
                className="flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-3 text-xs sm:text-sm lg:text-base px-1 sm:px-2 lg:px-3 max-w-full min-w-0 data-[state=active]:shadow-none data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-800 data-[state=active]:border-amber-200 transition-all duration-200"
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 flex-shrink-0" />
                <span className="font-medium truncate min-w-0">Custom</span>
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-3 text-xs sm:text-sm lg:text-base px-1 sm:px-2 lg:px-3 max-w-full min-w-0 data-[state=active]:shadow-none data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-800 data-[state=active]:border-amber-200 transition-all duration-200"
              >
                <History className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-purple-600 flex-shrink-0" />
                <span className="font-medium truncate min-w-0">History</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="modify" className="mt-0 space-y-4 sm:space-y-6 lg:space-y-8">
            {/* AI Recommendations Section */}
            {(recommendations.length > 0 || customRecommendations.length > 0) && (
              <Card className="shadow-sm">
                <CardHeader className="pb-3 sm:pb-4 lg:pb-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl xl:text-2xl">
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-green-600 flex-shrink-0" />
                    <span className="text-balance">AI Recommendations</span>
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm lg:text-base text-pretty">
                    Select AI-generated recommendations to apply to your contract
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 sm:space-y-3 lg:space-y-4 max-h-80 sm:max-h-96 overflow-y-auto">
                  {/* Original recommendations */}
                  {recommendations.map((recommendation, index) => (
                    <div
                      key={`orig-${index}`}
                      className="flex items-start space-x-2 sm:space-x-3 lg:space-x-4 p-2 sm:p-3 lg:p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Checkbox
                        id={`recommendation-${index}`}
                        checked={selectedRecommendations.includes(recommendation)}
                        onCheckedChange={() => toggleRecommendation(recommendation)}
                        className="mt-0.5 sm:mt-1 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <label
                          htmlFor={`recommendation-${index}`}
                          className="text-xs sm:text-sm lg:text-base font-medium cursor-pointer block text-pretty leading-relaxed"
                        >
                          {recommendation}
                        </label>
                        <Badge variant="secondary" className="mt-1 sm:mt-2 text-xs">
                          AI Generated
                        </Badge>
                      </div>
                    </div>
                  ))}

                  {/* Custom recommendations */}
                  {customRecommendations.map((recommendation, index) => (
                    <div
                      key={`custom-${index}`}
                      className="flex items-start space-x-2 sm:space-x-3 lg:space-x-4 p-2 sm:p-3 lg:p-4 border rounded-lg hover:bg-gray-50 bg-yellow-50 border-yellow-200 transition-colors"
                    >
                      <Checkbox
                        id={`custom-recommendation-${index}`}
                        checked={selectedRecommendations.includes(recommendation)}
                        onCheckedChange={() => toggleRecommendation(recommendation)}
                        className="mt-0.5 sm:mt-1 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <label
                          htmlFor={`custom-recommendation-${index}`}
                          className="text-xs sm:text-sm lg:text-base font-medium cursor-pointer block text-pretty leading-relaxed"
                        >
                          {recommendation}
                        </label>
                        <Badge className="mt-1 sm:mt-2 bg-yellow-600 text-white text-xs">Custom Generated</Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Custom Modifications Section */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3 sm:pb-4 lg:pb-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl xl:text-2xl">
                  <FileEdit className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-blue-600 flex-shrink-0" />
                  <span className="text-balance">Custom Modifications</span>
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm lg:text-base text-pretty">
                  Add your own specific modifications to the contract
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 lg:space-y-6 max-h-80 sm:max-h-96 overflow-y-auto">
                {customModifications.map((modification, index) => (
                  <div key={index} className="flex flex-col space-y-2 sm:space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`modification-${index}`} className="text-xs sm:text-sm lg:text-base font-medium">
                        Modification {index + 1}
                      </Label>
                      {customModifications.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCustomModification(index)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      )}
                    </div>
                    <Textarea
                      id={`modification-${index}`}
                      placeholder="Describe the specific modification you want to make..."
                      value={modification}
                      onChange={(e) => updateCustomModification(index, e.target.value)}
                      className="text-xs sm:text-sm lg:text-base"
                      rows={3}
                    />
                  </div>
                ))}

                <Button
                  variant="outline"
                  onClick={addCustomModification}
                  className="w-full border-dashed border-2 py-2 sm:py-3 lg:py-4 text-xs sm:text-sm lg:text-base bg-transparent"
                >
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 mr-1 sm:mr-2" />
                  Add Another Modification
                </Button>
              </CardContent>
            </Card>

            {/* Modification Result */}
            {modificationResult && (
              <Card className="bg-green-50 border-green-200 shadow-sm">
                <CardHeader className="pb-3 sm:pb-4 lg:pb-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl xl:text-2xl text-green-800">
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 flex-shrink-0" />
                    <span className="text-balance">Modification Complete</span>
                  </CardTitle>
                  <CardDescription className="text-green-700 text-xs sm:text-sm lg:text-base">
                    Your contract has been successfully modified (Version {modificationResult.version})
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 sm:space-y-4 lg:space-y-6">
                    <div>
                      <Label className="text-xs sm:text-sm lg:text-base font-medium text-green-800">
                        Applied Modifications:
                      </Label>
                      <ul className="mt-2 sm:mt-3 space-y-1 sm:space-y-2 max-h-24 sm:max-h-32 overflow-y-auto">
                        {modificationResult.modifications.map((mod, index) => (
                          <li
                            key={index}
                            className="text-xs sm:text-sm lg:text-base text-green-700 flex items-start gap-1 sm:gap-2"
                          >
                            <Check className="h-3 w-3 sm:h-4 sm:w-4 mt-0.5 flex-shrink-0" />
                            <span className="text-pretty leading-relaxed">{mod}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4">
                      <Button
                        onClick={() => handleDownload(modificationResult.version)}
                        disabled={isDownloading}
                        className="bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm lg:text-base"
                        size="sm"
                      >
                        {isDownloading ? (
                          <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 mr-1 sm:mr-2 animate-spin" />
                        ) : (
                          <Download className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 mr-1 sm:mr-2" />
                        )}
                        <span className="hidden sm:inline">Download Modified Contract</span>
                        <span className="sm:hidden">Download Modified</span>
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => handleDownload("original")}
                        disabled={isDownloading}
                        size="sm"
                        className="text-xs sm:text-sm lg:text-base"
                      >
                        <FileText className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">Download Original</span>
                        <span className="sm:hidden">Original</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 pt-4 sm:pt-6">
              <Button
                variant="outline"
                onClick={onBack}
                size="sm"
                className="text-xs sm:text-sm lg:text-base bg-transparent"
              >
                <span className="hidden sm:inline">Back to Analysis</span>
                <span className="sm:hidden">Back</span>
              </Button>

              <Button
                onClick={handleModifyContract}
                disabled={isModifying}
                className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs sm:text-sm lg:text-base"
                size="sm"
              >
                {isModifying ? (
                  <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 mr-1 sm:mr-2 animate-spin" />
                ) : (
                  <Crown className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 mr-1 sm:mr-2" />
                )}
                Apply Modifications
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="recommendations" className="mt-0 space-y-4 sm:space-y-6 lg:space-y-8">
            <Card className="shadow-sm">
              <CardHeader className="pb-3 sm:pb-4 lg:pb-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl xl:text-2xl">
                  <Plus className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-blue-600 flex-shrink-0" />
                  <span className="text-balance">Generate Custom Recommendations</span>
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm lg:text-base text-pretty">
                  Select focus areas to generate tailored recommendations for your contract
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 lg:space-y-6">
                <div>
                  <Label className="text-xs sm:text-sm lg:text-base font-medium mb-3 sm:mb-4 block">Focus Areas</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 max-h-48 sm:max-h-64 overflow-y-auto">
                    {predefinedFocusAreas.map((area) => (
                      <div
                        key={area}
                        className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 border rounded-lg hover:bg-gray-50"
                      >
                        <Checkbox
                          id={`focus-${area}`}
                          checked={focusAreas.includes(area)}
                          onCheckedChange={() => toggleFocusArea(area)}
                          className="flex-shrink-0"
                        />
                        <Label
                          htmlFor={`focus-${area}`}
                          className="text-xs sm:text-sm lg:text-base capitalize cursor-pointer text-pretty leading-relaxed"
                        >
                          {area}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <Input
                    placeholder="Add custom focus area..."
                    value={customFocusArea}
                    onChange={(e) => setCustomFocusArea(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addCustomFocusArea()}
                    className="flex-1 text-xs sm:text-sm lg:text-base"
                  />
                  <Button
                    onClick={addCustomFocusArea}
                    variant="outline"
                    size="sm"
                    className="flex-shrink-0 bg-transparent"
                  >
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                  </Button>
                </div>

                {focusAreas.length > 0 && (
                  <div>
                    <Label className="text-xs sm:text-sm lg:text-base font-medium">Selected Focus Areas:</Label>
                    <div className="flex flex-wrap gap-1 sm:gap-2 mt-2 sm:mt-3 max-h-24 sm:max-h-32 overflow-y-auto">
                      {focusAreas.map((area) => (
                        <Badge
                          key={area}
                          variant="secondary"
                          className="capitalize text-xs px-2 py-1 flex items-center gap-1"
                        >
                          <span className="truncate max-w-[120px] sm:max-w-none">{area}</span>
                          <X className="h-3 w-3 cursor-pointer flex-shrink-0" onClick={() => toggleFocusArea(area)} />
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  onClick={generateCustomRecommendations}
                  disabled={isGeneratingRecommendations || focusAreas.length === 0}
                  className="w-full text-xs sm:text-sm lg:text-base"
                  size="sm"
                >
                  {isGeneratingRecommendations ? (
                    <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 mr-1 sm:mr-2 animate-spin" />
                  ) : (
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 mr-1 sm:mr-2" />
                  )}
                  Generate Custom Recommendations
                </Button>
              </CardContent>
            </Card>

            {customRecommendations.length > 0 && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-green-600" />
                <AlertDescription className="text-green-800 text-xs sm:text-sm lg:text-base text-pretty leading-relaxed">
                  Generated {customRecommendations.length} custom recommendations! Switch to "Modify" tab to apply them.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-0">
            <Card className="shadow-sm">
              <CardHeader className="pb-3 sm:pb-4 lg:pb-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl xl:text-2xl">
                  <History className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-purple-600 flex-shrink-0" />
                  <span className="text-balance">Modification History</span>
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm lg:text-base text-pretty">
                  View all versions and modifications made to this contract
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingHistory ? (
                  <div className="flex items-center justify-center py-8 sm:py-12">
                    <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 animate-spin mr-2 sm:mr-3" />
                    <span className="text-xs sm:text-sm lg:text-base">Loading history...</span>
                  </div>
                ) : modificationHistory.length > 0 ? (
                  <div className="space-y-3 sm:space-y-4 max-h-80 sm:max-h-96 overflow-y-auto">
                    {/* Original version */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 lg:p-6 border rounded-lg bg-blue-50 border-blue-200 gap-3 sm:gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-blue-800 text-sm sm:text-base lg:text-lg">
                          Version 1 (Original)
                        </div>
                        <div className="text-blue-600 text-xs sm:text-sm lg:text-base">Initial contract upload</div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => handleDownload("original")}
                        disabled={isDownloading}
                        size="sm"
                        className="border-blue-300 text-blue-700 hover:bg-blue-100 text-xs sm:text-sm lg:text-base flex-shrink-0"
                      >
                        <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        Download
                      </Button>
                    </div>

                    {/* Modified versions */}
                    {modificationHistory.map((history, index) => (
                      <div
                        key={index}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 lg:p-6 border rounded-lg hover:bg-gray-50 transition-colors gap-3 sm:gap-4"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm sm:text-base lg:text-lg">Version {history.version}</div>
                          <div className="text-gray-600 mt-1 text-xs sm:text-sm lg:text-base text-pretty leading-relaxed">
                            Modified by {history.modifiedBy} on {formatDate(history.modifiedAt)}
                          </div>
                          <div className="text-gray-500 mt-1 sm:mt-2 text-xs sm:text-sm lg:text-base text-pretty leading-relaxed">
                            Changes: {history.changes}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => handleDownload(history.version)}
                          disabled={isDownloading}
                          size="sm"
                          className="text-xs sm:text-sm lg:text-base flex-shrink-0"
                        >
                          <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 sm:py-12 text-gray-500">
                    <History className="h-8 w-8 sm:h-12 sm:w-12 lg:h-16 lg:w-16 mx-auto mb-3 sm:mb-4 opacity-50" />
                    <p className="text-sm sm:text-base lg:text-lg mb-1 sm:mb-2">No modifications made yet</p>
                    <p className="text-xs sm:text-sm lg:text-base text-pretty leading-relaxed">
                      Switch to "Modify" tab to create your first modification
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
