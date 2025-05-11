import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import Link from "next/link";
import { UploadModal } from "../modals/upload-modal";
import { Sparkles } from "lucide-react";

interface iEmptyStateProps {
    title: string;
    description: string;
}

export default function EmptyState({ title, description } : iEmptyStateProps) {
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    
    return (
    <>
        <div className="flex items-center justify-center p-2 sm:p-4 mt-4 sm:mt-10 w-full">
            <Card className="w-full max-w-[90%] sm:max-w-md">
                <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="text-red-600 text-lg sm:text-xl font-semibold break-words">{title}</CardTitle>
                    <CardDescription className="text-gray-600 text-xs sm:text-sm mt-1">{description}</CardDescription>
                </CardHeader>
                <CardContent className="px-4 sm:px-6 pb-2">
                    <div className="space-y-3 sm:space-y-4">
                        <p className="text-xs sm:text-sm text-gray-700">To receive a full detailed analysis, please upload your contract below</p>
                        <div className="bg-blue-50 border-l-4 border-blue-600 p-3 sm:p-4 rounded">
                            <div className="flex items-center">
                                <p className="text-xs sm:text-sm text-gray-700">
                                    You can upload your contract in pdf or DOCX format, you can also upload a scanned copy of your contract.
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="p-4 sm:p-6 pt-3">
                    <div className="flex flex-col w-full space-y-2">
                        <Button
                            onClick={() => setIsUploadModalOpen(true)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm py-2 h-auto"
                        >
                            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                            Upload for Full Analysis
                        </Button>
                        <Button
                            className="w-full text-blue-600 hover:bg-blue-50 text-xs sm:text-sm py-2 h-auto"
                            variant={"outline"}
                            asChild
                        >
                            <Link href="/dashboard">
                                Go to Dashboard
                            </Link>
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </div>
        <UploadModal
            isOpen={isUploadModalOpen}
            onClose={() => setIsUploadModalOpen(false)}
            onUploadComplete={() => setIsUploadModalOpen(false)}
        />
    </>
    );
}