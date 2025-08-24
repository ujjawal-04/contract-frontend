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
import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { AnimatePresence, motion } from "framer-motion"
import { FileText, Sparkles, Trash, AlertCircle, CheckCircle, Brain } from "lucide-react"
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
  const [step, setStep] = useState<"upload" | "detecting" | "confirm" | "processing" | "done">("upload")
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

  // 🟢 detect contract type
  const { mutate: detectContractType } = useMutation({
    mutationFn: async ({ file }: { file: File }) => {
      const formData = new FormData()
      formData.append("contract", file)
      const response = await api.post<{ detectedType: string; tempKey: string }>("/contracts/detect-type", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      return response.data
    },
    onSuccess: (data) => {
      setDetectedType(data.detectedType)
      setTempKey(data.tempKey)
      setStep("confirm")
    },
    onError: (error: any) => {
      console.error("Failed to detect contract type:", error)
      setError(error.message || "Failed to detect contract type. Please try again.")
      setStep("upload")
    },
  })

  // 🟢 analyze contract
  const { mutate: uploadFile, isPending: isProcessing } = useMutation({
    mutationFn: async ({ file, contractType }: { file: File; contractType: string }) => {
      if (tempKey) {
        const data = { contractType, tempKey }
        const response = await api.post("/contracts/analyze", data)
        return response.data
      } else {
        const formData = new FormData()
        formData.append("contract", file)
        formData.append("contractType", contractType)
        const response = await api.post("/contracts/analyze", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        return response.data
      }
    },
    onSuccess: (data) => {
      setAnalysisResults(data)
      setAnalysisId(data._id)
      refetchStats()
      setStep("done")
    },
    onError: (error: any) => {
      console.error("Upload error:", error)
      setError(error.message || "Failed to upload and analyze contract")
      setStep("upload")
    },
  })

  // 🟢 dropzone
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
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    multiple: false,
  })

  const handleFileUpload = () => {
    if (files.length > 0) {
      setError(null)
      setStep("detecting")
      detectContractType({ file: files[0] })
    }
  }

  const handleAnalyzeContract = () => {
    if (files.length > 0 && detectedType) {
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

  const getRemainingContracts = () => {
    if (!contractStats || userPlan !== "basic") return 0
    return Math.max(0, contractStats.contractLimit - contractStats.contractCount)
  }

  // 🟢 UI
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
                <p className="mt-4 text-sm text-gray-600">Drag &apos;n&apos; drop some files here, or click to select.</p>
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
                <Button className="mt-4 w-full mb-4 bg-blue-600 hover:bg-blue-700" onClick={handleFileUpload}>
                  <Sparkles className="mr-2 size-4" />
                  Analyze Contract With AI
                </Button>
              )}
            </motion.div>
          </AnimatePresence>
        )
      case "detecting":
        return (
          <div className="py-8 text-center">
            <Brain className="mx-auto size-16 text-blue-700 mb-4 animate-spin" />
            <h3 className="text-lg font-medium">Detecting Contract Type...</h3>
            <p className="text-sm text-gray-500 mt-2">Analyzing your document to determine the contract type.</p>
          </div>
        )
      case "confirm":
        return (
          <div className="py-4">
            <DialogHeader>
              <DialogTitle>Contract Type Detected</DialogTitle>
              <DialogDescription>We&apos;ve detected the following contract type:</DialogDescription>
            </DialogHeader>

            <div className="my-6 p-4 bg-blue-500/10 border border-blue-500 rounded-lg">
              <h3 className="font-bold text-lg">{detectedType}</h3>
            </div>

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
        )
      case "processing":
        return (
          <div className="py-8 text-center">
            <Brain className="mx-auto size-16 text-blue-700 mb-4 animate-spin" />
            <h3 className="text-lg font-medium">Analyzing your contract...</h3>
            <p className="text-sm text-gray-500 mt-2">Our AI is analyzing the details of your {detectedType} contract.</p>
          </div>
        )
      case "done":
        return (
          <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 text-center relative">
            <CheckCircle className="mx-auto size-14 text-blue-600 mb-3" />
            <h3 className="text-xl font-semibold text-blue-700">Success!</h3>
            <p className="text-sm text-gray-600 mt-2">Your contract has been analyzed successfully.</p>

            <div className="flex flex-col gap-3 mt-6">
              <Button onClick={handleViewResults} className="bg-blue-600 hover:bg-blue-700 text-white w-full text-sm">
                <Sparkles className="mr-2 size-4" />
                View AI Analysis Results
              </Button>
              <Button variant="outline" onClick={handleClose} className="w-full text-sm border-blue-300 bg-transparent">
                Close
              </Button>
            </div>
          </div>
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
