import { api } from "@/lib/api";
import stripePromise from "@/lib/stripe";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useSubscription } from "@/hooks/use-subscription";

export function PricingSection() {
  // Use the subscription hook to get the current status
  const {
    subscriptionStatus,
    isUserLoading,
    isSubscriptionLoading,
    isUserError,
    isSubscriptionError,
  } = useSubscription();

  // Determine if the user has premium status
  const isPremium = subscriptionStatus?.status === "active";
  
  // Combined loading state
  const isLoading = isUserLoading || isSubscriptionLoading;

  // Handle upgrade - this will create a checkout session and redirect to Stripe
  const handleUpgrade = async() => {
    try {
      const response = await api.get("/payments/create-checkout-session");
      const stripe = await stripePromise;
      await stripe?.redirectToCheckout({
        sessionId: response.data.sessionId,
      });
    } catch (error) {
      console.error("Error creating checkout session:", error);
    }
  };

  return (
    <section className="w-full py-20 bg-white">
      <div className="container px-4 md:px-6 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-4">Choose your plan</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Select the perfect plan for your needs, upgrade anytime to unlock premium features
          </p>
          
          {/* Subscription status indicator */}
          {isUserError || isSubscriptionError ? (
            <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
              <AlertCircle className="h-4 w-4 mr-2" />
              Failed to load subscription status
            </div>
          ) : (
            <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin h-4 w-4 mr-2 border-b-2 border-gray-500 rounded-full"></div>
                  Loading...
                </div>
              ) : (
                <>
                  <span className="mr-2">Status:</span>
                  <span className={isPremium ? "text-green-600 font-semibold" : "text-blue-600"}>
                    {isPremium ? "Premium" : "Basic"}
                  </span>
                </>
              )}
            </div>
          )}
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Basic Plan */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <Card className={`h-full border ${!isPremium ? "border-green-200 bg-green-50 shadow-md" : "border-gray-200 bg-white shadow-sm"} rounded-xl p-0 overflow-hidden transition-all duration-300 hover:shadow-md relative`}>
              {!isPremium && !isLoading && (
                <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold py-1 px-3 rounded-bl flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>CURRENT PLAN</span>
                </div>
              )}
              
              <CardHeader className="pt-8 pb-2">
                <CardTitle className="text-xl font-bold mb-1">Basic</CardTitle>
                <CardDescription className="text-sm text-slate-600">Perfect for getting started</CardDescription>
              </CardHeader>
              
              <CardContent className="pb-8">
                <div className="flex items-baseline mb-6">
                  <span className="text-3xl font-bold">$0</span>
                  <span className="text-slate-500 ml-1">/Free</span>
                </div>
                
                <ul className="space-y-4 mb-8">
                  {[
                    "Basic contract analysis",
                    "2 contract analysis",
                    "5 potential risks identified",
                    "5 potential opportunities identified",
                    "Brief contract summary",
                    "Standard support",
                    "Email support"
                  ].map((feature, index) => (
                    <li className="flex items-center" key={index}>
                      <CheckCircle2 className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0" />
                      <span className="text-sm text-slate-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {isLoading ? (
                  <div className="w-full py-2 flex justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <Button 
                    className={`w-full ${!isPremium 
                      ? "bg-green-600 hover:bg-green-700 text-white" 
                      : "border-blue-200 text-blue-600 hover:bg-blue-50"}`} 
                    onClick={() => window.location.href = "/dashboard"}
                    variant={!isPremium ? "default" : "outline"}
                    disabled={!isPremium}
                  >
                    {!isPremium ? "Current Plan" : "Downgrade"}
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Premium Plan */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <Card className={`h-full border ${isPremium ? "border-green-200 bg-green-50 shadow-md" : "border-blue-200 bg-blue-50 shadow-sm"} rounded-xl p-0 overflow-hidden transition-all duration-300 hover:shadow-md relative`}>
              {!isLoading && (isPremium ? (
                <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold py-1 px-3 rounded-bl flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>CURRENT PLAN</span>
                </div>
              ) : (
                <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold py-1 px-3 rounded-bl">
                  RECOMMENDED
                </div>
              ))}
              
              <CardHeader className="pt-8 pb-2">
                <CardTitle className="text-xl font-bold mb-1 flex items-center">
                  Premium
                  <span className="ml-2 text-yellow-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block">
                      <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7z" />
                    </svg>
                  </span>
                </CardTitle>
                <CardDescription className="text-sm text-slate-600">For comprehensive contract analysis</CardDescription>
              </CardHeader>
              
              <CardContent className="pb-8">
                <div className="flex items-baseline mb-6">
                  <span className="text-3xl font-bold">$20</span>
                  <span className="text-slate-500 ml-1">/lifetime</span>
                </div>
                
                <ul className="space-y-4 mb-8">
                  {[
                    "Unlimited contract analysis",
                    "Chat with AI chatbot about your contract",
                    "10 potential risks identified",
                    "10 opportunities with impact levels",
                    "Comprehensive contract summary",
                    "Improvement recommendations",
                    "Key clauses identification",
                    "Legal compliance assessment",
                    "Negotiation points",
                    "Priority support"
                  ].map((feature, index) => (
                    <li className="flex items-center" key={index}>
                      <CheckCircle2 className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0" />
                      <span className="text-sm text-slate-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {isLoading ? (
                  <div className="w-full py-2 flex justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <>
                    <Button 
                      className={`w-full ${isPremium 
                        ? "bg-green-600 hover:bg-green-700 text-white" 
                        : "bg-blue-600 hover:bg-blue-700 text-white"}`} 
                      onClick={isPremium ? () => window.location.href = "/dashboard" : handleUpgrade}
                      variant="default"
                      disabled={isPremium}
                    >
                      {isPremium ? "Current Plan" : "Upgrade Now"}
                    </Button>
                    
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}