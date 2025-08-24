"use client"

import { useQuery } from "@tanstack/react-query"
import { useState, useEffect } from "react"
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import {
  MoreHorizontal,
  Users,
  BarChart3,
  AlertTriangle,
  Filter,
  ChevronUp,
  ChevronDown,
  FileText,
  FileCheck,
  FileCog,
  ChevronLeft,
  ChevronRight,
  X,
  Sliders,
  Lock,
  Crown,
  Zap,
  AlertCircle,
  Check,
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { UploadModal } from "../modals/upload-modal"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import Link from "next/link"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog"
import { Input } from "../ui/input"
import { toast } from "react-hot-toast"
import { api, deleteContract } from "@/lib/api"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Checkbox } from "../ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "../ui/alert"
import { useSubscription } from "@/hooks/use-subscription"
import { useCurrentUser } from "@/hooks/use-current-user"

import stripePromise from "@/lib/stripe"

// Updated interfaces
interface Risk {
  risk: string
  explanation: string
  severity: "low" | "medium" | "high"
}

interface ContractAnalysis {
  _id: string
  userId: string
  contractType: string
  summary: string
  overallScore: number | string
  risks: Risk[]
  createdAt: string
  documentType?: "pdf" | "docx" | "txt" | "other" // New field to track document type
}

// Define filter options interface
interface FilterOptions {
  contractTypes: string[]
  documentTypes: string[]
  riskLevels: {
    low: boolean
    medium: boolean
    high: boolean
  }
  dateRange: {
    from?: Date
    to?: Date
  }
}

export default function UserContracts() {
  const { user, refetch: refetchUser } = useCurrentUser()
  const {
    subscriptionStatus,
    isSubscriptionLoading,
    getUserPlan,
    isPremium: isUserPremium,
    hasGoldAccess,
  } = useSubscription()

  // Determine user's plan and access levels
  const userPlan = getUserPlan()
  const isPremium = isUserPremium()
  const isGold = hasGoldAccess()

  const {
    data: contracts,
    refetch,
    isLoading,
    error,
  } = useQuery<ContractAnalysis[]>({
    queryKey: ["user-contracts"],
    queryFn: async () => {
      try {
        const response = await api.get("/contracts/user-contracts")
        console.log("Contracts API response:", response.data)
        console.log("Response data type:", typeof response.data)
        console.log("Is response.data an array?:", Array.isArray(response.data))

        // Check if response.data exists and is an array
        if (!response.data) {
          console.warn("No data received from API")
          return []
        }

        if (!Array.isArray(response.data)) {
          console.log("API response is not an array:", response.data)
          // If it's an object with a contracts property, use that
          if (response.data.contracts && Array.isArray(response.data.contracts)) {
            console.log("Found contracts array in response.data.contracts")
            const contractsArray = response.data.contracts
            const enhancedData = contractsArray.map((contract: ContractAnalysis) => ({
              ...contract,
              documentType: contract.documentType || "pdf",
            }))
            console.log("Processed contracts:", enhancedData)
            return enhancedData
          }
          // If it's an object with a data property, use that
          if (response.data.data && Array.isArray(response.data.data)) {
            console.log("Found contracts array in response.data.data")
            const contractsArray = response.data.data
            const enhancedData = contractsArray.map((contract: ContractAnalysis) => ({
              ...contract,
              documentType: contract.documentType || "pdf",
            }))
            console.log("Processed contracts:", enhancedData)
            return enhancedData
          }
          // Return empty array if we can't find a valid contracts array
          console.log("No valid contracts array found, returning empty array")
          return []
        }

        // Add documentType if it doesn't exist (for backward compatibility)
        const enhancedData = response.data.map((contract: ContractAnalysis) => ({
          ...contract,
          documentType: contract.documentType || "pdf", // Default to pdf if not specified
        }))
        return enhancedData
      } catch (err) {
        console.error("Error fetching contracts:", err)
        throw err
      }
    },
  })

  const {
    data: userStats,
    isLoading: isStatsLoading,
    refetch: refetchStats,
  } = useQuery({
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

  const [sorting, setSorting] = useState<SortingState>([])
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(5)
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false)

  const [showLimitWarning, setShowLimitWarning] = useState(false)
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(true)
  const [isPremiumDialogOpen, setIsPremiumDialogOpen] = useState(false)

  // State for active filters
  const [activeFilters, setActiveFilters] = useState<FilterOptions>({
    contractTypes: [],
    documentTypes: [],
    riskLevels: {
      low: false,
      medium: false,
      high: false,
    },
    dateRange: {},
  })

  // Track if filters are active
  const [filtersActive, setFiltersActive] = useState(false)

  // Add payment success handling effect
  useEffect(() => {
    // Listen for focus events (user returning from Stripe)
    const handleFocus = () => {
      console.log("Window focused, refreshing data...")
      refetchUser()
      refetch()
      refetchStats()
    }

    // Listen for URL changes (for payment success/cancel)
    const urlParams = new URLSearchParams(window.location.search)
    const plan = urlParams.get("plan")

    if (plan && (plan === "premium" || plan === "gold")) {
      console.log(`Payment successful for ${plan} plan, refreshing data...`)
      // Wait a bit for webhook processing
      setTimeout(() => {
        refetchUser()
        refetch()
        refetchStats()
      }, 2000)
    }

    window.addEventListener("focus", handleFocus)
    return () => window.removeEventListener("focus", handleFocus)
  }, [refetchUser, refetch, refetchStats])

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
  }, [userStats, isPremium])

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

  const handleNewContractClick = () => {
    // Gold and Premium users should always be able to add contracts
    if (isPremium || isGold) {
      setIsUploadModalOpen(true)
      return
    }

    // Only check limits for basic users
    if (!isPremium && userStats && userStats.contractCount >= userStats.contractLimit) {
      setShowUpgradeDialog(true)
      return
    }
    setIsUploadModalOpen(true)
  }

  const getPlanBadge = () => {
    switch (userPlan) {
      case "gold":
        return (
          <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white border-0">
            <Crown className="h-3 w-3 mr-1" />
            Gold
          </Badge>
        )
      case "premium":
        return (
          <Badge className="bg-blue-600 text-white">
            <Zap className="h-3 w-3 mr-1" />
            Premium
          </Badge>
        )
      default:
        return <Badge className="bg-gray-100 text-gray-700">Basic</Badge>
    }
  }

  // Helper function to get remaining contracts
  const getRemainingContracts = () => {
    if (!userStats || userPlan !== "basic") return 0
    return Math.max(0, userStats.contractLimit - userStats.contractCount)
  }

  // Check if user is approaching limit (1 contract remaining)
  const isApproachingLimit =
    userStats && userPlan === "basic" ? userStats.contractCount === userStats.contractLimit - 1 : false

  // Contract type colors mapping
  const contractTypeColors: { [key: string]: { bg: string; text: string; hoverBg: string; chartColor: string } } = {
    Employment: {
      bg: "bg-blue-100",
      text: "text-blue-800",
      hoverBg: "hover:bg-blue-200",
      chartColor: "#3b82f6",
    },
    "Non-Disclosure Agreement": {
      bg: "bg-green-100",
      text: "text-green-800",
      hoverBg: "hover:bg-green-200",
      chartColor: "#22c55e",
    },
    Sales: {
      bg: "bg-yellow-100",
      text: "text-yellow-800",
      hoverBg: "hover:bg-yellow-200",
      chartColor: "#eab308",
    },
    Lease: {
      bg: "bg-emerald-100",
      text: "text-emerald-800",
      hoverBg: "hover:bg-emerald-200",
      chartColor: "#10b981",
    },
    Service: {
      bg: "bg-pink-100",
      text: "text-pink-800",
      hoverBg: "hover:bg-pink-200",
      chartColor: "#ec4899",
    },
    Other: {
      bg: "bg-gray-100",
      text: "text-gray-800",
      hoverBg: "hover:bg-gray-200",
      chartColor: "#6b7280",
    },
  }

  // Document type icon mapping
  const documentTypeIcons: { [key: string]: any } = {
    pdf: <FileText className="text-red-500" />,
    docx: <FileCheck className="text-blue-500" />,
    txt: <FileText className="text-gray-500" />,
    other: <FileCog className="text-purple-500" />,
  }

  // Get unique contract types and document types
  const uniqueContractTypes = contracts ? [...new Set(contracts.map((contract) => contract.contractType))] : []

  const uniqueDocumentTypes = contracts
    ? [...new Set(contracts.map((contract) => contract.documentType || "other"))]
    : []

  // Check if any filter is active
  useEffect(() => {
    const hasActiveFilters =
      activeFilters.contractTypes.length > 0 ||
      activeFilters.documentTypes.length > 0 ||
      activeFilters.riskLevels.low ||
      activeFilters.riskLevels.medium ||
      activeFilters.riskLevels.high

    setFiltersActive(hasActiveFilters)
  }, [activeFilters])

  // Function to get filtered contracts based on search term and filters
  const getFilteredContracts = () => {
    if (!contracts) return []

    return contracts.filter((contract) => {
      // Search term filtering (case insensitive)
      const matchesSearch =
        searchTerm === "" ||
        contract._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.contractType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.summary.toLowerCase().includes(searchTerm.toLowerCase())

      if (!matchesSearch) return false

      // Contract type filtering
      const matchesContractType =
        activeFilters.contractTypes.length === 0 || activeFilters.contractTypes.includes(contract.contractType)

      if (!matchesContractType) return false

      // Document type filtering
      const matchesDocumentType =
        activeFilters.documentTypes.length === 0 ||
        activeFilters.documentTypes.includes(contract.documentType || "other")

      if (!matchesDocumentType) return false

      // Risk level filtering
      const hasSelectedRiskLevels =
        activeFilters.riskLevels.low || activeFilters.riskLevels.medium || activeFilters.riskLevels.high

      if (hasSelectedRiskLevels) {
        const score =
          typeof contract.overallScore === "string" ? Number.parseFloat(contract.overallScore) : contract.overallScore

        const isLowRisk = score < 60 && activeFilters.riskLevels.low
        const isMediumRisk = score >= 60 && score < 80 && activeFilters.riskLevels.medium
        const isHighRisk = score >= 80 && activeFilters.riskLevels.high

        if (!(isLowRisk || isMediumRisk || isHighRisk)) {
          return false
        }
      }

      return true
    })
  }

  const filteredContracts = getFilteredContracts()

  // Reset currentPage when filters change
  useEffect(() => {
    setCurrentPage(0)
  }, [searchTerm, activeFilters])

  // Handle filter toggles
  const toggleContractTypeFilter = (type: string) => {
    setActiveFilters((prev) => {
      const isSelected = prev.contractTypes.includes(type)
      return {
        ...prev,
        contractTypes: isSelected ? prev.contractTypes.filter((t) => t !== type) : [...prev.contractTypes, type],
      }
    })
  }

  const toggleDocumentTypeFilter = (type: string) => {
    setActiveFilters((prev) => {
      const isSelected = prev.documentTypes.includes(type)
      return {
        ...prev,
        documentTypes: isSelected ? prev.documentTypes.filter((t) => t !== type) : [...prev.documentTypes, type],
      }
    })
  }

  const toggleRiskLevelFilter = (level: "low" | "medium" | "high") => {
    setActiveFilters((prev) => ({
      ...prev,
      riskLevels: {
        ...prev.riskLevels,
        [level]: !prev.riskLevels[level],
      },
    }))
  }

  // Clear all filters
  const clearAllFilters = () => {
    setActiveFilters({
      contractTypes: [],
      documentTypes: [],
      riskLevels: {
        low: false,
        medium: false,
        high: false,
      },
      dateRange: {},
    })
    setSearchTerm("")
  }

  // Prepare data for contract type distribution chart
  const getContractTypeData = () => {
    if (!contracts || contracts.length === 0) return []

    const typeCount: { [key: string]: number } = {}

    // Count contracts by type
    contracts.forEach((contract) => {
      const type = contract.contractType
      typeCount[type] = (typeCount[type] || 0) + 1
    })

    // Convert to array format for chart
    return Object.entries(typeCount).map(([type, count]) => ({
      type,
      count,
      color: contractTypeColors[type]?.chartColor || contractTypeColors["Other"].chartColor,
    }))
  }

  const columns: ColumnDef<ContractAnalysis>[] = [
    {
      accessorKey: "_id",
      header: ({ column }) => {
        return (
          <div className="flex items-center">
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="p-0 hover:bg-transparent"
            >
              <span className="font-medium">Contract ID</span>
              {column.getIsSorted() === "asc" ? (
                <ChevronUp className="ml-1 h-4 w-4" />
              ) : column.getIsSorted() === "desc" ? (
                <ChevronDown className="ml-1 h-4 w-4" />
              ) : null}
            </Button>
          </div>
        )
      },
      cell: ({ row }) => {
        const documentType = row.original.documentType || "other"
        return (
          <div className="font-medium flex items-center space-x-2">
            <div className="flex-shrink-0">{documentTypeIcons[documentType]}</div>
            <span className="truncate max-w-[150px] md:max-w-xs">{row.getValue("_id")}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "overallScore",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 hover:bg-transparent"
        >
          <span className="font-medium">Overall Score</span>
          {column.getIsSorted() === "asc" ? (
            <ChevronUp className="ml-1 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ChevronDown className="ml-1 h-4 w-4" />
          ) : null}
        </Button>
      ),
      cell: ({ row }) => {
        // Handle both string and number types for overallScore
        let scoreValue: number
        const rawScore = row.getValue("overallScore")

        if (typeof rawScore === "number") {
          scoreValue = rawScore
        } else if (typeof rawScore === "string") {
          scoreValue = Number.parseFloat(rawScore)
        } else {
          scoreValue = 0 // Default if undefined or invalid
        }

        let badgeClass = ""

        if (scoreValue >= 80) {
          badgeClass = "bg-green-100 text-green-800 border-green-200"
        } else if (scoreValue >= 70) {
          badgeClass = "bg-blue-100 text-blue-800 border-blue-200"
        } else if (scoreValue >= 60) {
          badgeClass = "bg-yellow-100 text-yellow-800 border-yellow-200"
        } else if (scoreValue >= 50) {
          badgeClass = "bg-orange-100 text-orange-800 border-orange-200"
        } else {
          badgeClass = "bg-red-100 text-red-800 border-red-200"
        }

        return <Badge className={cn("rounded-md font-medium", badgeClass)}>{scoreValue.toFixed(2)}</Badge>
      },
    },
    {
      accessorKey: "contractType",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 hover:bg-transparent"
        >
          <span className="font-medium">Contract Type</span>
          {column.getIsSorted() === "asc" ? (
            <ChevronUp className="ml-1 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ChevronDown className="ml-1 h-4 w-4" />
          ) : null}
        </Button>
      ),
      cell: ({ row }) => {
        const contractType = row.getValue("contractType") as string
        const colorClasses = contractTypeColors[contractType] || contractTypeColors["Other"]
        return (
          <Badge className={cn("rounded-md", colorClasses.bg, colorClasses.text, colorClasses.hoverBg)}>
            {contractType}
          </Badge>
        )
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 hover:bg-transparent"
        >
          <span className="font-medium">Date</span>
          {column.getIsSorted() === "asc" ? (
            <ChevronUp className="ml-1 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ChevronDown className="ml-1 h-4 w-4" />
          ) : null}
        </Button>
      ),
      cell: ({ row }) => {
        const dateString = row.getValue("createdAt") as string
        const date = new Date(dateString)
        const formattedDate = date.toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        })

        return <span>{formattedDate}</span>
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const contract = row.original

        const handleDeleteClick = async () => {
          try {
            setIsDeleting(true)
            await deleteContract(contract._id)
            await refetch()
            toast.success("Contract deleted successfully")
          } catch (error) {
            console.error("Error deleting contract:", error)
            toast.error(error instanceof Error ? error.message : "Failed to delete contract")
          } finally {
            setIsDeleting(false)
          }
        }

        return (
          <AlertDialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="size-8 p-0">
                  <span className="sr-only">Open Menu</span>
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <Link href={`/dashboard/contract/${contract._id}`} className="w-full">
                  <DropdownMenuItem className="cursor-pointer">View Details</DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    className="cursor-pointer hover:text-destructive/20 text-destructive"
                    onSelect={(e) => e.preventDefault()}
                  >
                    Delete Contract
                  </DropdownMenuItem>
                </AlertDialogTrigger>
              </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialogContent className="border border-gray-200 p-0 overflow-hidden">
              <AlertDialogHeader className="bg-gray-50 p-6 border-b border-gray-200">
                <AlertDialogTitle className="text-xl font-bold text-slate-800">
                  Are you absolutely sure?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-slate-600 mt-2">
                  This action cannot be undone. This will permanently delete your contract and remove your data from our
                  servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="p-4 bg-gray-50 border-gray-200">
                <AlertDialogCancel className="border-gray-200 text-gray-700 hover:bg-gray-50">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteClick}
                  disabled={isDeleting}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isDeleting ? "Deleting..." : "Continue"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )
      },
    },
  ]

  // Update page size based on screen width
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setPageSize(3)
      } else if (window.innerWidth < 1024) {
        setPageSize(5)
      } else {
        setPageSize(10)
      }
    }

    // Initial call
    handleResize()

    // Add event listener
    window.addEventListener("resize", handleResize)

    // Clean up
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Initialize table with filtered data
  const table = useReactTable({
    data: filteredContracts,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
      pagination: {
        pageIndex: currentPage,
        pageSize: pageSize,
      },
    },
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const newPagination = updater({
          pageIndex: currentPage,
          pageSize: pageSize,
        })
        setCurrentPage(newPagination.pageIndex)
      } else {
        // If updater is a PaginationState object directly
        setCurrentPage(updater.pageIndex)
      }
    },
  })

  const totalContracts = contracts?.length || 0

  // Calculate average score handling both string and number types
  const averageScore =
    totalContracts > 0
      ? (contracts?.reduce((sum, contract) => {
          let scoreValue: number

          if (typeof contract.overallScore === "number") {
            scoreValue = contract.overallScore
          } else if (typeof contract.overallScore === "string") {
            scoreValue = Number.parseFloat(contract.overallScore || "0")
          } else {
            scoreValue = 0
          }

          return sum + scoreValue
        }, 0) || 0) / totalContracts
      : 0

  const highRiskContracts =
    contracts?.filter((contract) => contract.risks?.some((risk) => risk.severity === "high")).length ?? 0

  // Generate contract type chart data
  const contractTypeData = getContractTypeData()

  // Display error message if there's an error fetching data
  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-500 mb-4">Error loading contracts</div>
        <Button onClick={() => refetch()} className="bg-blue-600 text-white">
          Try again
        </Button>
      </div>
    )
  }

  // Function for contract chart visualization
  const ContractTypeChart = () => {
    if (!contractTypeData || contractTypeData.length === 0) {
      return (
        <div className="flex justify-center items-center h-full">
          <p className="text-gray-500">No data available</p>
        </div>
      )
    }

    const max = Math.max(...contractTypeData.map((item) => item.count))

    return (
      <div className="p-4">
        <h3 className="text-lg font-medium mb-4">Contract Type Distribution</h3>
        <div className="space-y-3">
          {contractTypeData.map((item, index) => (
            <div key={index} className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{item.type}</span>
                <span className="text-sm text-gray-500">{item.count}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div
                  className="h-2.5 rounded-full"
                  style={{
                    width: `${(item.count / max) * 100}%`,
                    backgroundColor: item.color,
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Render active filters badges
  const renderActiveFilterBadges = () => {
    const badges = []

    // Contract type badges
    activeFilters.contractTypes.forEach((type) => {
      badges.push(
        <Badge key={`contract-${type}`} className="bg-blue-100 text-blue-800 flex items-center gap-1 px-2 py-1">
          {type}
          <X className="h-3 w-3 cursor-pointer" onClick={() => toggleContractTypeFilter(type)} />
        </Badge>,
      )
    })

    // Document type badges
    activeFilters.documentTypes.forEach((type) => {
      badges.push(
        <Badge key={`doc-${type}`} className="bg-green-100 text-green-800 flex items-center gap-1 px-2 py-1">
          {type.toUpperCase()}
          <X className="h-3 w-3 cursor-pointer" onClick={() => toggleDocumentTypeFilter(type)} />
        </Badge>,
      )
    })

    // Risk level badges
    if (activeFilters.riskLevels.low) {
      badges.push(
        <Badge key="risk-low" className="bg-red-100 text-red-800 flex items-center gap-1 px-2 py-1">
          Low Risk
          <X className="h-3 w-3 cursor-pointer" onClick={() => toggleRiskLevelFilter("low")} />
        </Badge>,
      )
    }

    if (activeFilters.riskLevels.medium) {
      badges.push(
        <Badge key="risk-medium" className="bg-yellow-100 text-yellow-800 flex items-center gap-1 px-2 py-1">
          Medium Risk
          <X className="h-3 w-3 cursor-pointer" onClick={() => toggleRiskLevelFilter("medium")} />
        </Badge>,
      )
    }

    if (activeFilters.riskLevels.high) {
      badges.push(
        <Badge key="risk-high" className="bg-green-100 text-green-800 flex items-center gap-1 px-2 py-1">
          High Risk
          <X className="h-3 w-3 cursor-pointer" onClick={() => toggleRiskLevelFilter("high")} />
        </Badge>,
      )
    }

    return badges
  }

  const UpgradeDialog = () => (
    <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Free Plan Limit Reached</DialogTitle>
          <DialogDescription className="text-sm text-gray-500 mt-2">
            You've used all {userStats?.contractLimit || 2} contracts allowed on the free plan. Choose your upgrade
            path:
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
  )

  if ((isSubscriptionLoading && !isPremium && !isGold) || (isStatsLoading && !isPremium && !isGold)) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="bg-white w-full">
      <div className="max-w-[1400px] mx-auto p-3 md:p-6">
        {showLimitWarning && !isPremium && !isGold && (
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

        {!isPremium && !isGold && <UpgradeDialog />}

        {/* Add the limit warning alert before the contracts dashboard heading */}
        {isApproachingLimit && userPlan === "basic" && (
          <Alert className="mb-4 bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800 text-sm font-medium">Free Plan Limit Warning</AlertTitle>
            <AlertDescription className="text-amber-700 text-xs">
              You have {getRemainingContracts()} analysis remaining in your free plan. Upgrade for unlimited
              analyses.
            </AlertDescription>
          </Alert>
        )}

        <div className="mb-6 md:mb-8 flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <h1 className="text-xl md:text-2xl font-bold">Contracts Dashboard</h1>
            {getPlanBadge()}
          </div>
          <div className="flex items-center gap-2">
            {!isPremium && !isGold && userStats && (
              <span className="text-sm text-gray-500 mr-2">
                {userStats.contractCount}/{userStats.contractLimit} contracts used
              </span>
            )}
            <Button
              onClick={handleNewContractClick}
              className={cn(
                "text-white",
                isGold
                  ? "bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700"
                  : isPremium
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-blue-600 hover:bg-blue-700",
              )}
              disabled={!isPremium && !isGold && userStats && userStats.contractCount >= userStats.contractLimit}
            >
              {!isPremium && !isGold && userStats && userStats.contractCount >= userStats.contractLimit ? (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Upgrade to Add More
                </>
              ) : isGold ? (
                <>
                  <Crown className="h-4 w-4 mr-2" />
                  New Contract
                </>
              ) : (
                "New Contract"
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 mb-6 md:mb-8">
          {/* Total Contracts Card */}
          <Card
            className={cn(
              "shadow-sm border rounded-lg",
              isGold ? "border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50" : "border-gray-100",
            )}
          >
            <CardContent className="p-4 md:p-6 flex items-center">
              <div
                className={cn(
                  "h-12 w-12 md:h-16 md:w-16 rounded-full flex items-center justify-center mr-4",
                  isGold ? "bg-yellow-100" : "bg-indigo-50",
                )}
              >
                <Users className={cn("h-6 w-6 md:h-8 md:w-8", isGold ? "text-yellow-600" : "text-indigo-500")} />
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                  {totalContracts}
                  {!isPremium && userStats && (
                    <span className="text-sm text-gray-500 font-normal">
                      / {userStats.contractLimit === Number.POSITIVE_INFINITY ? "∞" : userStats.contractLimit}
                    </span>
                  )}
                </div>
                <div className="text-gray-500">Total Contracts {isPremium ? "(Unlimited)" : ""}</div>
              </div>
            </CardContent>
          </Card>

          {/* Average Score Card */}
          <Card
            className={cn(
              "shadow-sm border rounded-lg",
              isPremium ? "border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50" : "border-gray-100",
            )}
          >
            <CardContent className="p-4 md:p-6 flex items-center">
              <div
                className={cn(
                  "h-12 w-12 md:h-16 md:w-16 rounded-full flex items-center justify-center mr-4",
                  isPremium ? "bg-blue-100" : "bg-orange-50",
                )}
              >
                <BarChart3 className={cn("h-6 w-6 md:h-8 md:w-8", isPremium ? "text-blue-600" : "text-orange-500")} />
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold flex items-center gap-2">{averageScore.toFixed(2)}</div>
                <div className="text-gray-500">Average Score</div>
              </div>
            </CardContent>
          </Card>

          {/* High Risk Contracts Card */}
          <Card className="shadow-sm border border-gray-100 rounded-lg">
            <CardContent className="p-4 md:p-6 flex items-center">
              <div className="h-12 w-12 md:h-16 md:w-16 bg-blue-50 rounded-full flex items-center justify-center mr-4">
                <AlertTriangle className="h-6 w-6 md:h-8 md:w-8 text-blue-500" />
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold flex items-center gap-2">{highRiskContracts}</div>
                <div className="text-gray-500">High Risk Contracts</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Contract Type Chart Card */}
          <Card className="shadow-sm border border-gray-100 rounded-lg lg:col-span-1">
            <CardHeader className="pb-0">
              <CardTitle className="text-lg font-bold">Contract Types</CardTitle>
            </CardHeader>
            <CardContent>
              <ContractTypeChart />
            </CardContent>
          </Card>

          {/* Score Distribution Chart Card */}
          <Card className="shadow-sm border border-gray-100 rounded-lg lg:col-span-2">
            <CardHeader className="pb-0">
              <CardTitle className="text-lg font-bold">Score Distribution</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {/* Simple horizontal bar chart for risk distribution */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">High (80+)</span>
                    <span className="text-sm text-gray-500">
                      {contracts?.filter((c) => Number.parseFloat(c.overallScore as string) >= 80).length || 0}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div
                      className="bg-green-500 h-2.5 rounded-full"
                      style={{
                        width: `${totalContracts ? ((contracts?.filter((c) => Number.parseFloat(c.overallScore as string) >= 80).length || 0) / totalContracts) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Medium (60-79)</span>
                    <span className="text-sm text-gray-500">
                      {contracts?.filter(
                        (c) =>
                          Number.parseFloat(c.overallScore as string) >= 60 &&
                          Number.parseFloat(c.overallScore as string) < 80,
                      ).length || 0}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div
                      className="bg-yellow-500 h-2.5 rounded-full"
                      style={{
                        width: `${totalContracts ? ((contracts?.filter((c) => Number.parseFloat(c.overallScore as string) >= 60 && Number.parseFloat(c.overallScore as string) < 80).length || 0) / totalContracts) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Low (0-59)</span>
                    <span className="text-sm text-gray-500">
                      {contracts?.filter((c) => Number.parseFloat(c.overallScore as string) < 60).length || 0}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div
                      className="bg-red-500 h-2.5 rounded-full"
                      style={{
                        width: `${totalContracts ? ((contracts?.filter((c) => Number.parseFloat(c.overallScore as string) < 60).length || 0) / totalContracts) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-4 flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Input
              placeholder="Search Contracts"
              className="pl-10 border border-gray-200 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            {searchTerm && (
              <button className="absolute inset-y-0 right-0 flex items-center pr-3" onClick={() => setSearchTerm("")}>
                <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Popover open={isFilterMenuOpen} onOpenChange={setIsFilterMenuOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`border-gray-200 ${filtersActive ? "bg-blue-50 text-blue-700 border-blue-200" : "text-gray-700"} flex items-center gap-2`}
                >
                  <Filter className="h-4 w-4" />
                  <span className="hidden sm:inline">Filter Contracts</span>
                  <span className="sm:hidden">Filter</span>
                  {filtersActive && (
                    <Badge className="bg-blue-100 text-blue-800 h-5 w-5 p-0 flex items-center justify-center rounded-full">
                      {activeFilters.contractTypes.length +
                        activeFilters.documentTypes.length +
                        (activeFilters.riskLevels.low ? 1 : 0) +
                        (activeFilters.riskLevels.medium ? 1 : 0) +
                        (activeFilters.riskLevels.high ? 1 : 0)}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0 border border-gray-200">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                  <div className="font-medium flex items-center gap-2">
                    <Sliders className="h-4 w-4" />
                    Filters
                  </div>
                  {filtersActive && (
                    <Button
                      variant="ghost"
                      className="text-xs h-7 text-gray-500 hover:text-gray-700"
                      onClick={clearAllFilters}
                    >
                      Clear all
                    </Button>
                  )}
                </div>
                <div className="p-4 border-b border-gray-100">
                  <h3 className="font-medium mb-2 text-sm">Contract Type</h3>
                  <div className="space-y-2">
                    {uniqueContractTypes.map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={`contract-type-${type}`}
                          checked={activeFilters.contractTypes.includes(type)}
                          onCheckedChange={() => toggleContractTypeFilter(type)}
                        />
                        <label htmlFor={`contract-type-${type}`} className="text-sm text-gray-700 cursor-pointer">
                          {type}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-4 border-b border-gray-100">
                  <h3 className="font-medium mb-2 text-sm">Document Type</h3>
                  <div className="space-y-2">
                    {uniqueDocumentTypes.map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={`doc-type-${type}`}
                          checked={activeFilters.documentTypes.includes(type)}
                          onCheckedChange={() => toggleDocumentTypeFilter(type)}
                        />
                        <label
                          htmlFor={`doc-type-${type}`}
                          className="text-sm text-gray-700 flex items-center gap-2 cursor-pointer"
                        >
                          {documentTypeIcons[type]}
                          {type.toUpperCase()}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-medium mb-2 text-sm">Risk Level</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="risk-high"
                        checked={activeFilters.riskLevels.high}
                        onCheckedChange={() => toggleRiskLevelFilter("high")}
                      />
                      <label htmlFor="risk-high" className="text-sm text-gray-700 cursor-pointer">
                        High (80+)
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="risk-medium"
                        checked={activeFilters.riskLevels.medium}
                        onCheckedChange={() => toggleRiskLevelFilter("medium")}
                      />
                      <label htmlFor="risk-medium" className="text-sm text-gray-700 cursor-pointer">
                        Medium (60-79)
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="risk-low"
                        checked={activeFilters.riskLevels.low}
                        onCheckedChange={() => toggleRiskLevelFilter("low")}
                      />
                      <label htmlFor="risk-low" className="text-sm text-gray-700 cursor-pointer">
                        Low (0-59)
                      </label>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Display active filters */}
        {filtersActive && (
          <div className="mb-4 flex flex-wrap gap-2">
            {renderActiveFilterBadges()}
            {renderActiveFilterBadges().length > 0 && (
              <Button
                variant="ghost"
                className="h-7 text-xs text-gray-700 hover:text-blue-700"
                onClick={clearAllFilters}
              >
                Clear all
              </Button>
            )}
          </div>
        )}

        <div className="bg-white rounded-md border border-gray-200 overflow-hidden mb-4">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="border-b border-gray-200">
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} className="py-3 px-4 text-gray-600 font-medium text-left">
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                        <span className="ml-2">Loading...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredContracts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center text-gray-500">
                      {searchTerm || filtersActive ? (
                        <div>
                          <p>No contracts match your search filters</p>
                          <Button variant="link" onClick={clearAllFilters} className="text-blue-500 mt-2">
                            Clear all filters
                          </Button>
                        </div>
                      ) : (
                        "No contracts found."
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className="hover:bg-gray-50 border-b border-gray-100"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="py-3 px-4 truncate max-w-[150px] md:max-w-none">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
          <div className="text-sm text-gray-500">
            Showing{" "}
            {filteredContracts.length
              ? table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1
              : 0}{" "}
            to{" "}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              filteredContracts.length,
            )}{" "}
            of {filteredContracts.length} contracts
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="border-gray-200 text-gray-700"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Previous</span>
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: table.getPageCount() }).map((_, index) => (
                <Button
                  key={index}
                  variant={currentPage === index ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(index)}
                  className={cn(
                    "h-8 w-8 p-0 hidden md:flex",
                    currentPage === index ? "bg-blue-600 text-white" : "border-gray-200 text-gray-700",
                  )}
                >
                  {index + 1}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="border-gray-200 text-gray-700"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>

        <UploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onUploadComplete={() => {
            refetch()
            setIsUploadModalOpen(false)
          }}
        />
      </div>
    </div>
  )
}