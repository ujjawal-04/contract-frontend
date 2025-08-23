"use client"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useCurrentUser } from "@/hooks/use-current-user"
import { useSubscription } from "@/hooks/use-subscription"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { UploadModal } from "@/components/modals/upload-modal"

export default function PaymentSuccess() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const searchParams = useSearchParams()
  const plan = searchParams.get("plan")
  const { refetch: refetchUser } = useCurrentUser()
  const { refreshStatus, getUserPlan, hasGoldAccess } = useSubscription()

  const userPlan = getUserPlan()
  const isGold = hasGoldAccess()

  useEffect(() => {
    // Refresh user data after successful payment
    const refreshData = async () => {
      console.log("Payment success detected, refreshing user data...")
      await refetchUser()
      await refreshStatus()
    }

    // Wait a bit for webhook processing
    const timer = setTimeout(refreshData, 2000)
    return () => clearTimeout(timer)
  }, [refetchUser, refreshStatus])

  return (
    <>
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-green-600">Payment Successful</CardTitle>
            <CardDescription>
              Thank you for your payment.{" "}
              {plan && `Your ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan is now active!`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>To receive your analysis, you need to upload a PDF.</p>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                <div className="flex items-center">
                  <p className="text-sm text-blue-700 text-left">
                    <strong>Note:</strong>
                    <br />
                    You can upload your contract in PDF format.
                    {isGold && (
                      <>
                        <br />
                        <strong>🎉 Gold features now available:</strong> AI chat, contract modification, advanced
                        analytics, and priority support!
                      </>
                    )}
                    {userPlan === "premium" && !isGold && (
                      <>
                        <br />
                        <strong>✨ Premium features now available:</strong> Unlimited analyses, detailed insights, and
                        AI assistance!
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <div className="flex flex-col w-full space-y-2">
              <Button
                onClick={() => setIsUploadModalOpen(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Upload for Full Analysis
              </Button>
              <Button className="w-full" asChild variant={"outline"}>
                <Link href="/dashboard">Go to Dashboard</Link>
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
  )
}
