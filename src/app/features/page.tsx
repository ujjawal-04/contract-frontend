"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { 
  ArrowLeft, 
  Brain, 
  AlertTriangle, 
  UsersRound, 
  CircleDollarSign, 
  ShieldCheck, 
  Clock,
  CheckCircle2,
  BarChart2,
  FileText,
  Zap,
  Scale,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSubscription } from "@/hooks/use-subscription"
import { api } from "@/lib/api"
import stripePromise from "@/lib/stripe"

export default function Features() {
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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  }

  // Main features array with title, description and icon name
  const mainFeatures = [
    {
      title: "AI-powered Analysis",
      description: "Leverage intelligence & AI to analyze contracts quickly and accurately, identifying key terms, risks, and opportunities.",
      icon: Brain,
      iconColor: "text-indigo-600",
      bgColor: "bg-indigo-100",
    },
    {
      title: "Risk Identification",
      description: "Automatically detect potential legal and business risks in your contracts with detailed severity assessment.",
      icon: AlertTriangle,
      iconColor: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Streamlined Negotiations",
      description: "Accelerate negotiation process with AI-driven insights and recommendations for stronger positions.",
      icon: UsersRound,
      iconColor: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Cost Reduction",
      description: "Significantly reduce legal costs through automation of time-consuming contract review processes.",
      icon: CircleDollarSign,
      iconColor: "text-pink-600",
      bgColor: "bg-pink-100",
    },
    {
      title: "Improved Compliance",
      description: "Ensure your contracts meet regulatory requirements across different jurisdictions and industries.",
      icon: ShieldCheck,
      iconColor: "text-amber-600",
      bgColor: "bg-amber-100",
    },
    {
      title: "Faster Turnaround",
      description: "Complete contract reviews in minutes instead of hours, allowing your team to focus on high-value work.",
      icon: Clock,
      iconColor: "text-emerald-600",
      bgColor: "bg-emerald-100",
    },
  ]

  // Detailed features
  const detailedFeatures = [
    {
      title: "Contract Analysis Dashboard",
      description: "Get a comprehensive overview of your contract portfolio with key metrics and insights at a glance.",
      icon: BarChart2,
      image: "/1.png",
    },
    {
      title: "Risk Assessment Engine",
      description: "Proprietary AI algorithms identify and categorize risks by severity, with specific recommendations for mitigation.",
      icon: AlertTriangle,
      image: "/3.png",
    },
    {
      title: "Legal Compliance Checker",
      description: "Verify compliance with relevant laws and regulations across multiple jurisdictions and industry standards.",
      icon: Scale,
      image: "/4.png",
    },
    {
      title: "Key Clause Extraction",
      description: "Automatically identify and extract critical clauses and terms for quick review and comparison.",
      icon: FileText,
      image: "/5.png",
    },
    {
      title: "Negotiation Recommendations",
      description: "Receive AI-powered suggestions for improving contract terms and strengthening your negotiating position.",
      icon: Zap,
      image: "/6.png",
    },
  ]

  const basicFeatures = [
    "Basic contract analysis",
    "2 projects",
    "3 potential risks identified",
    "3 potential opportunities identified",
    "Brief contract summary",
    "Standard support",
    "Email support"
  ];

  const premiumFeatures = [
    "Advanced contract analysis",
    "Unlimited projects",
    "Chat with your contract",
    "10+ opportunities with impact levels",
    "Comprehensive contract summary",
    "Improvement recommendations",
    "Key clauses identification",
    "Legal compliance assessment",
    "Negotiation points",
    "Priority support"
  ];

  // Handle upgrade - redirect to checkout
  const handleUpgrade = async() => {
    try {
      const response = await api.get("/payments/create-checkout-session");
      const stripe = await stripePromise;
      await stripe?.redirectToCheckout({
        sessionId: response.data.sessionId,
      });
    } catch (error) {
      console.error("Error creating checkout session:", error);
      alert("Failed to initiate checkout. Please try again.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header Section with Animated Grid Background */}
      <section className="w-full py-12 md:py-16 relative overflow-hidden">
        {/* Grid background */}
        <motion.div
          className="absolute inset-0 z-0 opacity-10"
          animate={{
            backgroundPosition: ["0px 0px", "100px 100px"],
          }}
          transition={{
            duration: 20,
            ease: "linear",
            repeat: Infinity,
          }}
          style={{
            backgroundImage:
              "linear-gradient(to right, #4f46e5 1px, transparent 1px), linear-gradient(to bottom, #4f46e5 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />

        {/* Floating elements for visual interest */}
        <motion.div 
          className="absolute hidden md:block h-16 w-16 rounded-full bg-blue-500 opacity-10 top-1/4 left-1/4"
          animate={{ 
            y: [0, 20, 0],
            scale: [1, 1.1, 1],
            rotate: [0, 10, 0]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        
        <motion.div 
          className="absolute hidden md:block h-24 w-24 rounded-full bg-indigo-500 opacity-10 bottom-1/4 right-1/4"
          animate={{ 
            y: [0, -30, 0],
            scale: [1, 1.2, 1],
            rotate: [0, -15, 0]
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />

        <div className="container px-4 md:px-6 max-w-6xl mx-auto relative z-10">
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "mb-6 flex items-center text-blue-600 hover:text-blue-700"
            )}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>

          <motion.div
            className="text-center mb-12"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h1
              className="text-4xl font-bold tracking-tight sm:text-5xl text-slate-800"
              variants={itemVariants}
            >
              <motion.span
                className="inline-block"
                animate={{
                  backgroundImage: [
                    "linear-gradient(45deg, #4f46e5, #4f46e5)",
                    "linear-gradient(45deg, #4f46e5, #06b6d4)",
                    "linear-gradient(45deg, #06b6d4, #4f46e5)",
                  ],
                }}
                transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
                style={{
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  backgroundSize: "200% 200%",
                }}
              >
                Features
              </motion.span>
            </motion.h1>
            <motion.p className="mt-4 text-lg text-slate-600 max-w-3xl mx-auto" variants={itemVariants}>
              Discover how our AI-powered contract analysis platform can transform your legal workflow
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Main Features Section */}
      <section className="w-full py-12 bg-gradient-to-b from-white to-blue-50">
        <div className="container px-4 md:px-6 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {mainFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 50,
                }}
                whileHover={{
                  y: -10,
                  transition: { duration: 0.2 },
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                }}
                className="h-full"
              >
                <Card className="h-full border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden relative">
                  {/* Animated gradient border on hover */}
                  <motion.div
                    className="absolute inset-0 opacity-0 pointer-events-none"
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div
                      className="absolute inset-0 border-2 border-transparent"
                      animate={{
                        background: [
                          "linear-gradient(90deg, #4f46e5, #06b6d4, #4f46e5) border-box",
                          "linear-gradient(180deg, #4f46e5, #06b6d4, #4f46e5) border-box",
                          "linear-gradient(270deg, #4f46e5, #06b6d4, #4f46e5) border-box",
                          "linear-gradient(360deg, #4f46e5, #06b6d4, #4f46e5) border-box",
                        ],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        repeatType: "loop",
                      }}
                      style={{
                        borderRadius: "inherit",
                        WebkitMask: "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
                        WebkitMaskComposite: "destination-out",
                        maskComposite: "exclude",
                      }}
                    />
                  </motion.div>

                  <CardHeader className="text-center pb-2">
                    <motion.div
                      className={`mx-auto flex items-center justify-center h-14 w-14 rounded-full ${feature.bgColor} mb-4 relative`}
                      whileHover={{
                        scale: 1.1,
                        rotate: [0, 5, -5, 0],
                        transition: { duration: 0.5 },
                      }}
                    >
                      <motion.div
                        animate={{
                          scale: [1, 1.1, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatType: "reverse",
                        }}
                      >
                        <feature.icon className={`h-7 w-7 ${feature.iconColor}`} />
                      </motion.div>
                    </motion.div>
                    <CardTitle className="text-lg font-semibold">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-500 text-center text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Features Section */}
      <section className="w-full py-16 bg-white">
        <div className="container px-4 md:px-6 max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Detailed Features</h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              Explore the powerful capabilities that make Lexalyze the leading solution for contract analysis
            </p>
          </motion.div>

          <div className="space-y-24">
            {detailedFeatures.map((feature, index) => (
              <motion.div
                key={index}
                className="grid grid-cols-1 md:grid-cols-2 gap-y-8 md:gap-12 items-center"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
              >
                {/* Text section */}
                <motion.div
                  className={index % 2 === 0 ? "md:order-1" : "md:order-2"}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <div className="flex items-center mb-4">
                    <div className={`mr-4 p-3 rounded-full bg-blue-100`}>
                      <feature.icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800">{feature.title}</h3>
                  </div>
                  <p className="text-slate-600 mb-6">{feature.description}</p>
                  <ul className="space-y-3">
                    {[1, 2, 3].map((item) => (
                      <li key={item} className="flex items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-600">
                          {index === 0 && item === 1 && "Visual dashboard with risk scores and key metrics"}
                          {index === 0 && item === 2 && "Customizable views for different contract types"}
                          {index === 0 && item === 3 && "Real-time updates as contracts are analyzed"}
                          
                          {index === 1 && item === 1 && "Identifies potential legal and business risks"}
                          {index === 1 && item === 2 && "Assigns risk severity scores with explanations"}
                          {index === 1 && item === 3 && "Provides actionable recommendations for mitigation"}
                          
                          {index === 2 && item === 1 && "Checks against relevant laws and regulations"}
                          {index === 2 && item === 2 && "Supports multiple jurisdictions and industries"}
                          {index === 2 && item === 3 && "Highlights compliance issues with suggested fixes"}
                          
                          {index === 3 && item === 1 && "Automatically identifies key contractual clauses"}
                          {index === 3 && item === 2 && "Extracts important terms and obligations"}
                          {index === 3 && item === 3 && "Organizes clauses by category for easy reference"}
                          
                          {index === 4 && item === 1 && "AI-generated suggestions for contract improvements"}
                          {index === 4 && item === 2 && "Comparison with industry benchmarks"}
                          {index === 4 && item === 3 && "Strategic advice for stronger contractual positions"}
                          
                          {index === 5 && item === 1 && "Side-by-side contract version comparison"}
                          {index === 5 && item === 2 && "Automatic highlight of material changes"}
                          {index === 5 && item === 3 && "Evaluation of changes' impact on risk profile"}
                        </span>
                      </li>
                    ))}
                  </ul>
                </motion.div>

                {/* Image section */}
                <motion.div
                  className={`rounded-xl overflow-hidden shadow-xl ${index % 2 === 0 ? "md:order-2" : "md:order-1"}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  whileHover={{
                    scale: 1.03,
                    transition: { duration: 0.3 },
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                  }}
                >
                  <motion.div className="relative">
                    <motion.div
                      className="absolute inset-0 shadow-2xl border border-gray-500 opacity-0 z-10"
                      animate={{ opacity: [0, 0.5, 0] }}
                      transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
                    />
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="w-full h-auto rounded-xl"
                      onError={(e) => {
                        e.currentTarget.src = `https://placehold.co/600x400?text=${feature.title.replace(" ", "+")}`;
                      }}
                    />
                  </motion.div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Plan Comparison Section (Styled like Pricing) */}
      <section className="w-full py-16 bg-gradient-to-b from-white to-blue-50">
        <div className="container px-4 md:px-6 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Choose your plan</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Select the perfect plan for your needs, upgrade anytime to unlock premium features</p>
            
            {/* Subscription status indicator */}
            {isUserError || isSubscriptionError ? (
              <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                <AlertTriangle className="h-4 w-4 mr-2" />
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
                    <ShieldCheck className="h-4 w-4 text-blue-500 mr-2" />
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
                  <p className="text-sm text-slate-600">Perfect for getting started</p>
                </CardHeader>
                
                <CardContent className="pb-8">
                  <div className="flex items-baseline mb-6">
                    <span className="text-3xl font-bold">$0</span>
                    <span className="text-slate-500 ml-1">/Free</span>
                  </div>
                  
                  <ul className="space-y-4 mb-8">
                    {basicFeatures.map((feature, index) => (
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
                  <p className="text-sm text-slate-600">For comprehensive contract analysis</p>
                </CardHeader>
                
                <CardContent className="pb-8">
                  <div className="flex items-baseline mb-6">
                    <span className="text-3xl font-bold">$20</span>
                    <span className="text-slate-500 ml-1">/lifetime</span>
                  </div>
                  
                  <ul className="space-y-4 mb-8">
                    {premiumFeatures.map((feature, index) => (
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
                      className={`w-full ${isPremium 
                        ? "bg-green-600 hover:bg-green-700 text-white" 
                        : "bg-blue-600 hover:bg-blue-700 text-white"}`} 
                      onClick={isPremium ? () => window.location.href = "/dashboard" : handleUpgrade}
                      variant="default"
                      disabled={isPremium}
                    >
                      {isPremium ? "Current Plan" : "Upgrade Now"}
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
                  <p className="text-sm text-slate-600">For comprehensive contract analysis</p>
                </CardHeader>
                
                <CardContent className="pb-8">
                  <div className="flex items-baseline mb-6">
                    <span className="text-3xl font-bold">$20</span>
                    <span className="text-slate-500 ml-1">/lifetime</span>
                  </div>
                  
                  <ul className="space-y-4 mb-8">
                    {premiumFeatures.map((feature, index) => (
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
                      className={`w-full ${isPremium 
                        ? "bg-green-600 hover:bg-green-700 text-white" 
                        : "bg-blue-600 hover:bg-blue-700 text-white"}`} 
                      onClick={isPremium ? () => window.location.href = "/dashboard" : handleUpgrade}
                      variant="default"
                      disabled={isPremium}
                    >
                      {isPremium ? "Current Plan" : "Upgrade Now"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}