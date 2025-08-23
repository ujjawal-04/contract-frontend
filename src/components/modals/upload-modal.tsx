"use client"

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog"
import { api } from "@/lib/api"
import { useContractStore } from "@/store/zustand"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useCallback, useState, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import { AnimatePresence, motion } from "framer-motion"
import { FileText, Sparkles, Trash, AlertCircle, CheckCircle, Brain, Lock, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "../ui/button"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription, AlertTitle } from "../ui/alert"
import stripePromise from "@/lib/stripe"
import { useSubscription } from "@/hooks/use-subscription"

interface ContractStats {
  contractCount: number
  contractLimit: number
  isPremium: boolean
}

interface IUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onUploadComplete: () => void
}

export function UploadModal({ isOpen, onClose }: IUploadModalProps) {
  const router = useRouter()
  const { setAnalysisResults } = useContractStore()

  const { getUserPlan, isPremium: isUserPremium, hasGoldAccess } = useSubscription()

  const userPlan = getUserPlan()
  const isPremium = isUserPremium()
  const isGold = hasGoldAccess()

  const [detectedType, setDetectedType] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [files, setFiles] = useState<File[]>([])
  const [analysisId, setAnalysisId] = useState<string | null>(null)
  const [step, setStep] = useState<"upload" | "detecting" | "confirm" | "processing" | "done" | "limit-reached">(
    "upload",
  )
  const [tempKey, setTempKey] = useState<string | null>(null)

  const { data: contractStats, refetch: refetchStats } = useQuery<ContractStats>({
    queryKey: ["user-contract-stats"],
    queryFn: async () => {
      const response = await api.get("/contracts/user-stats")
      return response.data
    },
    enabled: userPlan === "basic",
  })

  const isApproachingLimit =
    contractStats && userPlan === "basic" ? contractStats.contractCount === contractStats.contractLimit - 1 : false

  const hasReachedLimit =
    contractStats && userPlan === "basic" ? contractStats.contractCount >= contractStats.contractLimit : false

  const { mutate: detectContractType, isError: isDetectError } = useMutation({
    mutationFn: async ({ file }: { file: File }) => {
      const formData = new FormData()
      formData.append("contract", file)

      try {
        const response = await api.post<{ detectedType: string; tempKey: string }>("/contracts/detect-type", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        return response.data
      } catch (error: any) {
        if (error.response?.data?.limitReached) {
          setStep("limit-reached")
          throw new Error("Free plan limit reached")
        }
        console.error("API Error:", error.response?.data || error.message)
        throw new Error(error.response?.data?.message || "Failed to detect contract type")
      }
    },
    onSuccess: (data) => {
      setDetectedType(data.detectedType)
      setTempKey(data.tempKey)
      setStep("confirm")
    },
    onError: (error: Error) => {
      if (step !== "limit-reached") {
        console.error("Failed to detect contract type:", error)
        setError(error.message || "Failed to detect contract type. Please try again.")
        setStep("upload")
      }
    },
  })

  const {
    mutate: uploadFile,
    isPending: isProcessing,
    isError: isUploadError,
  } = useMutation({
    mutationFn: async ({ file, contractType }: { file: File; contractType: string }) => {
      let data

      if (tempKey) {
        data = {
          contractType,
          tempKey,
        }

        try {
          const response = await api.post("/contracts/analyze", data)
          return response.data
        } catch (error: any) {
          if (error.response?.data?.limitReached) {
            setStep("limit-reached")
            throw new Error("Free plan limit reached")
          }
          console.error("API Error:", error.response?.data || error.message)
          throw new Error(error.response?.data?.message || "Failed to analyze contract")
        }
      } else {
        const formData = new FormData()
        formData.append("contract", file)
        formData.append("contractType", contractType)

        try {
          const response = await api.post("/contracts/analyze", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          })

          console.log(response.data)
          return response.data
        } catch (error: any) {
          if (error.response?.data?.limitReached) {
            setStep("limit-reached")
            throw new Error("Free plan limit reached")
          }
          console.error("API Error:", error.response?.data || error.message)
          throw new Error(error.response?.data?.message || "Failed to analyze contract")
        }
      }
    },
    onSuccess: (data) => {
      setAnalysisResults(data)
      setAnalysisId(data._id)
      refetchStats()
      setStep("done")
    },
    onError: (error: Error) => {
      if (step !== "limit-reached") {
        console.error("Upload error:", error)
        setError(error.message || "Failed to upload and analyze contract")
        setStep("upload")
      }
    },
  })

  useEffect(() => {
    if (isOpen && hasReachedLimit && userPlan === "basic") {
      setStep("limit-reached")
    }
  }, [isOpen, hasReachedLimit, userPlan])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFiles(acceptedFiles)
      setError(null)
      setStep("upload")
    } else {
      setError("No file selected")
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
    multiple: false,
  })

  const handleFileUpload = () => {
    if (files.length > 0) {
      if (hasReachedLimit && userPlan === "basic") {
        setStep("limit-reached")
        return
      }

      setError(null)
      setStep("detecting")
      detectContractType({ file: files[0] })
    }
  }

  const handleAnalyzeContract = () => {
    if (files.length > 0 && detectedType) {
      if (hasReachedLimit && userPlan === "basic") {
        setStep("limit-reached")
        return
      }

      setError(null)
      setStep("processing")
      uploadFile({ file: files[0], contractType: detectedType })
    }
  }

  const handleRemoveFile = () => {
    setFiles([])
    setError(null)
  }

  const handleClose = () => {
    onClose()
    setFiles([])
    setDetectedType(null)
    setError(null)
    setTempKey(null)
    setStep("upload")
  }

  const handleViewResults = () => {
    router.push(`/dashboard/results/`)
    handleClose()
  }

  const handleUpgrade = async (targetPlan: "premium" | "gold" = "premium") => {
    try {
      const response = await api.get(`/payments/create-checkout-session?plan=${targetPlan}`)
      console.log("response", response)
      const stripe = await stripePromise
      await stripe?.redirectToCheckout({
        sessionId: response.data.sessionId,
      })
    } catch (error) {
      console.error(error)
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

  const getRemainingContracts = () => {
    if (!contractStats || userPlan !== "basic") return 0
    return Math.max(0, contractStats.contractLimit - contractStats.contractCount)
  }

  const renderContent = () => {
    switch (step) {
      case "upload":
        return (
          <AnimatePresence>
            <motion.div>
              <DialogHeader>
                <DialogTitle>Upload Contract</DialogTitle>
                <DialogDescription>Upload a PDF contract to analyze with AI</DialogDescription>
              </DialogHeader>

              {isApproachingLimit && userPlan === "basic" && (
                <Alert className="mt-4 bg-amber-50 border-amber-200">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertTitle className="text-amber-800 text-sm font-medium">Free Plan Limit Warning</AlertTitle>
                  <AlertDescription className="text-amber-700 text-xs">
                    You have {getRemainingContracts()} analysis remaining in your free plan. Upgrade for unlimited
                    analyses.
                  </AlertDescription>
                </Alert>
              )}

              {error && (
                <div className="mt-4 bg-red-500/30 border border-red-500 text-red-700 p-3 rounded flex items-center">
                  <AlertCircle className="size-5 mr-2" />
                  <span>{error}</span>
                </div>
              )}

              <div
                {...getRootProps()}
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 mt-8 mb-4 text-center transition-colors",
                  isDragActive ? "border-primary bg-primary/10" : "border-blue-600 hover:border-blue-700",
                )}
              >
                <input {...getInputProps()} />
                <motion.div>
                  <FileText className="mx-auto size-16 text-blue-600" />
                </motion.div>
                <p className="mt-4 text-sm text-gray-600">
                  Drag &apos;n&apos; drop some files here, or click to select files.
                </p>
                <p className="bg-yellow-500/50 border border-yellow-100 text-black p-2 rounded mt-2">
                  Note: Only PDF files are accepted.
                </p>
              </div>
              {files.length > 0 && (
                <div className="mt-4 bg-blue-200 border border-gray-500 text-gray-900 p-2 rounded flex items-center justify-between">
                  <span>
                    {files[0].name}{" "}
                    <span className="text-sm text-gray-600">({Math.round(files[0].size / 1024)} KB)</span>
                  </span>
                  <Button variant="ghost" size="sm" onClick={handleRemoveFile}>
                    <Trash className="size-5 text-red-500 hover:text-red-600" />
                  </Button>
                </div>
              )}
              {files.length > 0 && (
                <Button
                  className="mt-4 w-full mb-4 bg-blue-600 hover:bg-blue-700"
                  onClick={handleFileUpload}
                  disabled={isProcessing}
                >
                  <Sparkles className="mr-2 size-4" />
                  Analyze Contract With AI
                </Button>
              )}
            </motion.div>
          </AnimatePresence>
        )
      case "detecting":
        return (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="py-8 text-center">
                <motion.div
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  }}
                  className="mb-4"
                >
                  <Brain className="mx-auto size-16 text-blue-700" />
                </motion.div>

                <h3 className="text-lg font-medium">Detecting Contract Type...</h3>
                <p className="text-sm text-gray-500 mt-2">
                  Our AI is analyzing your document to determine the contract type.
                </p>

                <div className="relative w-48 h-2 mt-6 mx-auto bg-blue-100 rounded-full overflow-hidden">
                  <motion.div
                    className="absolute left-0 top-0 h-full bg-blue-600 rounded-full"
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{
                      duration: 1.5,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                    style={{ width: "50%" }}
                  />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        )
      case "confirm":
        return (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="py-4">
                <DialogHeader>
                  <DialogTitle>Contract Type Detected</DialogTitle>
                  <DialogDescription>We&apos;ve detected the following contract type:</DialogDescription>
                </DialogHeader>

                <div className="my-6 p-4 bg-blue-500/10 border border-blue-500 rounded-lg">
                  <h3 className="font-bold text-lg">{detectedType}</h3>
                </div>
                <p className="text-sm text-gray-600 mt-2 mb-4">Would you like to proceed with the analysis?</p>

                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setStep("upload")}>
                    Back
                  </Button>
                  <Button onClick={handleAnalyzeContract} className="bg-blue-600 hover:bg-blue-700">
                    <Sparkles className="mr-2 size-4" />
                    Analyze Now
                  </Button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        )
      case "processing":
        return (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center justify-center py-8"
            >
              <div className="py-8 text-center">
                <motion.div
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  }}
                  className="mb-4"
                >
                  <Brain className="mx-auto size-16 text-blue-700" />
                </motion.div>

                <h3 className="text-lg font-medium">Analyzing your contract...</h3>
                <p className="text-sm text-gray-500 mt-2">
                  Our AI is analyzing the details of your <span className="font-semibold">{detectedType}</span>{" "}
                  contract.
                </p>

                <div className="relative w-48 h-2 mt-6 mx-auto bg-blue-100 rounded-full overflow-hidden">
                  <motion.div
                    className="absolute left-0 top-0 h-full bg-blue-600 rounded-full"
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{
                      duration: 1.5,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                    style={{ width: "50%" }}
                  />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        )
      case "done":
        return (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center justify-center"
            >
              <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 text-center relative">
                <div className="border-2 border-dashed border-blue-500 rounded-lg p-6 mb-6">
                  <CheckCircle className="mx-auto size-14 text-blue-600 mb-3" />
                  <h3 className="text-xl font-semibold text-blue-700">Success!</h3>
                  <p className="text-sm text-gray-600 mt-2">
                    Your contract has been analyzed successfully by our AI. You can now view the results.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <Button
                    onClick={handleViewResults}
                    className="bg-blue-600 hover:bg-blue-700 text-white w-full text-sm"
                  >
                    <Sparkles className="mr-2 size-4" />
                    View AI Analysis Results
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    className="w-full text-sm border-blue-300 bg-transparent"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        )
      case "limit-reached":
        return (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center justify-center"
            >
              <div className="py-4">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-xl">
                    <Lock className="h-5 w-5 text-blue-600" /> Free Plan Limit Reached
                  </DialogTitle>
                  <DialogDescription className="text-sm text-gray-500 mt-2">
                    You&apos;ve used all {contractStats ? contractStats.contractLimit : 2} contracts allowed on the free
                    plan. Choose your upgrade:
                  </DialogDescription>
                </DialogHeader>

                <div className="my-6 space-y-4">
                  <div className="border rounded-lg p-4 bg-blue-50">
                    <h4 className="font-semibold text-blue-800 mb-2">Premium Plan</h4>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Unlimited contract analyses</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Full contract details and recommendations</span>
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

                <DialogFooter className="mt-6 gap-3">
                  <Button variant="outline" onClick={handleClose}>
                    Maybe Later
                  </Button>
                </DialogFooter>
              </div>
            </motion.div>
          </AnimatePresence>
        )
      default:
        return null
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>{renderContent()}</DialogContent>
    </Dialog>
  )
}
