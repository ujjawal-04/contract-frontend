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
        <div className="flex items-center justify-center p-4 mt-10">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-red-600 text-xl font-semibold">{title}</CardTitle>
                    <CardDescription className="text-gray-600">{description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <p className="text-sm text-gray-700">To receive a full detailed analysis, please upload your contract below</p>
                        <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
                            <div className="flex items-center">
                                <p className="text-sm text-gray-700">
                                    You can upload your contract in pdf or DOCX format, you can also upload a scanned copy of your contract.
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <div className="flex flex-col w-full space-y-2">
                        <Button
                            onClick={() => setIsUploadModalOpen(true)}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                            <Sparkles className="w-5 h-5 mr-2" />
                            Upload for Full Analysis
                        </Button>
                        <Button
                            className="w-full text-blue-600 hover:bg-blue-50" 
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