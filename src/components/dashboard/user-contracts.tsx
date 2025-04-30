import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ColumnDef, flexRender, getCoreRowModel, getPaginationRowModel, getSortedRowModel, SortingState, useReactTable } from "@tanstack/react-table";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import { MoreHorizontal, Users, BarChart3, AlertTriangle, Filter } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { UploadModal } from "../modals/upload-modal";
import { cn } from "@/lib/utils";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "../ui/dropdown-menu";
import Link from "next/link";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "../ui/alert-dialog";
import { Input } from "../ui/input";
import { toast } from "react-hot-toast";
import { api, deleteContract } from "@/lib/api";

// Import your contract interface or define it here
interface Risk {
  risk: string;
  explanation: string;
  severity: "low" | "medium" | "high";
}

interface ContractAnalysis {
  _id: string;
  userId: string;
  contractType: string;
  summary: string;
  overallScore: number | string;
  risks: Risk[];
  createdAt: string;
}

export default function UserContracts() {
    // IMPORTANT: Updated API path - removed '/api' prefix since it might be included in your baseURL already
    const { data: contracts, refetch, isLoading, error } = useQuery<ContractAnalysis[]>({
        queryKey: ["user-contracts"],
        queryFn: async () => {
            try {
                // Using direct URL path without '/api' prefix - adjust based on your setup
                const response = await api.get("/contracts/user-contracts");
                console.log("Contracts API response:", response.data);
                return response.data;
            } catch (err) {
                console.error("Error fetching contracts:", err);
                throw err;
            }
        },
    });

    const [sorting, setSorting] = useState<SortingState>([]);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const contractTypeColors: { [key: string]: string } = {
        "Employment": "bg-blue-100 text-blue-800 hover:bg-blue-200",
        "Non-Disclosure Agreement": "bg-green-100 text-green-800 hover:bg-green-200",
        "Sales": "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
        "Lease": "bg-emerald-100 text-emerald-800 hover:bg-emerald-200",
        "Service": "bg-pink-100 text-pink-800 hover:bg-pink-200",
        "Other": "bg-gray-100 text-gray-800 hover:bg-gray-200",
    };
      
    const columns: ColumnDef<ContractAnalysis>[] = [
        {
            accessorKey: "_id",
            header: ({ column }) => {
                return <div className="flex items-center">
                  <span className="font-medium">Contract ID</span>
                </div>;
            },
            cell: ({ row }) => {
                return (
                    <div className="font-medium">
                        {row.getValue("_id")}
                    </div>
                );
            }
        },
        {
            accessorKey: "overallScore",
            header: () => <div className="font-medium">Overall Score</div>,
            cell: ({ row }) => {
                // Handle both string and number types for overallScore
                let scoreValue: number;
                const rawScore = row.getValue("overallScore");
                
                if (typeof rawScore === "number") {
                    scoreValue = rawScore;
                } else if (typeof rawScore === "string") {
                    scoreValue = parseFloat(rawScore);
                } else {
                    scoreValue = 0; // Default if undefined or invalid
                }
                
                let badgeClass = "";
                
                if (scoreValue >= 80) {
                    badgeClass = "bg-green-100 text-green-800 border-green-200";
                } else if (scoreValue >= 70) {
                    badgeClass = "bg-blue-100 text-blue-800 border-blue-200";
                } else if (scoreValue >= 60) {
                    badgeClass = "bg-yellow-100 text-yellow-800 border-yellow-200";
                } else if (scoreValue >= 50) {
                    badgeClass = "bg-orange-100 text-orange-800 border-orange-200";
                } else {
                    badgeClass = "bg-red-100 text-red-800 border-red-200";
                }
                
                return (
                    <Badge className={cn("rounded-md font-medium", badgeClass)}>
                        {scoreValue.toFixed(2)}
                    </Badge>
                );
            }
        },
        {
            accessorKey: "contractType",
            header: "Contract Type",
            cell: ({ row }) => {
               const contractType = row.getValue("contractType") as string;
               const colorClass =
               contractTypeColors[contractType] || contractTypeColors["Other"];
                return <Badge className={cn("rounded-md", colorClass)}>{contractType}</Badge>;
            }
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const contract = row.original;

                const handleDeleteClick = async () => {
                    try {
                        setIsDeleting(true);
                        // Updated to use the correct path without /api prefix
                        await deleteContract(contract._id);
                        await refetch(); // Refresh the data after deletion
                        toast.success("Contract deleted successfully");
                    } catch (error) {
                        console.error("Error deleting contract:", error);
                        toast.error(error instanceof Error ? error.message : "Failed to delete contract");
                    } finally {
                        setIsDeleting(false);
                    }
                };

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
                                    <DropdownMenuItem className="cursor-pointer">
                                        View Details
                                    </DropdownMenuItem>
                                </Link>
                                <DropdownMenuSeparator />
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem 
                                        className="cursor-pointer hover:text-destructive/20 text-destructive"
                                        onSelect={(e) => e.preventDefault()}>
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
                                    This action cannot be undone. This will permanently delete your contract
                                    and remove your data from our servers.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="p-4 bg-gray-50 border-gray-200">
                                <AlertDialogCancel className="border-gray-200 text-gray-700 hover:bg-gray-50">
                                    Cancel
                                </AlertDialogCancel>
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
                );
            },
        },
    ];

    const table = useReactTable({
        data: contracts ?? [],
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        state: {
            sorting,
        },
    });

    const totalContracts = contracts?.length || 0;

    // Calculate average score handling both string and number types
    const averageScore = totalContracts > 0
    ? (contracts?.reduce((sum, contract) => {
        let scoreValue: number;
        
        if (typeof contract.overallScore === "number") {
            scoreValue = contract.overallScore;
        } else if (typeof contract.overallScore === "string") {
            scoreValue = parseFloat(contract.overallScore || "0");
        } else {
            scoreValue = 0;
        }
        
        return sum + scoreValue;
    }, 0) || 0) / totalContracts
    : 0;

    const highRiskContracts = 
    contracts?.filter((contract) => 
        contract.risks?.some((risk) => risk.severity === "high")
    ).length ?? 0;

    // Display error message if there's an error fetching data
    if (error) {
        return (
            <div className="p-8 text-center">
                <div className="text-red-500 mb-4">Error loading contracts</div>
                <Button onClick={() => refetch()} className="bg-blue-600 text-white">
                    Try again
                </Button>
            </div>
        );
    }

    return ( 
      <div className="bg-white w-full">
        <div className="max-w-[1400px] mx-auto p-6">
          <div className="mb-8 flex justify-between">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <Button onClick={() => setIsUploadModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                New Contract
              </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Total Contracts Card */}
            <Card className="shadow-sm border border-gray-100 rounded-lg">
              <CardContent className="p-6 flex items-center">
                <div className="h-16 w-16 bg-indigo-50 rounded-full flex items-center justify-center mr-4">
                  <Users className="h-8 w-8 text-indigo-500" />
                </div>
                <div>
                  <div className="text-3xl font-bold flex items-center gap-2">
                    {totalContracts} 
                  </div>
                  <div className="text-gray-500">Total Contracts</div>
                </div>
              </CardContent>
            </Card>

            {/* Average Score Card */}
            <Card className="shadow-sm border border-gray-100 rounded-lg">
              <CardContent className="p-6 flex items-center">
                <div className="h-16 w-16 bg-orange-50 rounded-full flex items-center justify-center mr-4">
                  <BarChart3 className="h-8 w-8 text-orange-500" />
                </div>
                <div>
                  <div className="text-3xl font-bold flex items-center gap-2">
                    {averageScore.toFixed(2)}
                  </div>
                  <div className="text-gray-500">Average Score</div>
                </div>
              </CardContent>
            </Card>

            {/* High Risk Contracts Card */}
            <Card className="shadow-sm border border-gray-100 rounded-lg">
              <CardContent className="p-6 flex items-center">
                <div className="h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center mr-4">
                  <AlertTriangle className="h-8 w-8 text-blue-500" />
                </div>
                <div>
                  <div className="text-3xl font-bold flex items-center gap-2">
                    {highRiskContracts}
                  </div>
                  <div className="text-gray-500">High Risk Contracts</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mb-4 flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative w-full sm:w-96">
              <Input 
                placeholder="Search Contracts" 
                className="pl-10 border border-gray-200 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" className="border-gray-200 text-gray-700 flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filter Contracts
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="border-b border-gray-200">
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} className="py-3 px-4 text-gray-600 font-medium text-left">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
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
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className="hover:bg-gray-50 border-b border-gray-100"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="py-3 px-4">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>                      
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center text-gray-500"
                    >
                      No contracts found. {error ? "Error: " + String(error) : ""}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-end space-x-2 py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="border-gray-200 text-gray-700"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="border-gray-200 text-gray-700"
            >
              Next
            </Button>
          </div>
          
          <UploadModal
            isOpen={isUploadModalOpen}
            onClose={() => setIsUploadModalOpen(false)}
            onUploadComplete={() => {
              refetch();
              setIsUploadModalOpen(false);
            }}
          />
        </div>
      </div>
    );
}