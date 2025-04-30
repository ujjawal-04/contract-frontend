"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { 
  ArrowLeft, 
  ArrowRight, 
  Brain, 
  AlertTriangle, 
  UsersRound, 
  CircleDollarSign, 
  ShieldCheck, 
  Clock,
  Settings,
  CheckCircle2,
  BarChart2,
  FileText,
  Zap,
  Scale,
  Glasses
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Features() {
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

  // Grid background animation
  const gridVariants = {
    animate: {
      backgroundPosition: ["0px 0px", "100px 100px"],
      transition: {
        duration: 20,
        ease: "linear",
        repeat: Number.POSITIVE_INFINITY,
      },
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
      image: "/feature-dashboard.jpg",
    },
    {
      title: "Risk Assessment Engine",
      description: "Proprietary AI algorithms identify and categorize risks by severity, with specific recommendations for mitigation.",
      icon: AlertTriangle,
      image: "/feature-risk.jpg",
    },
    {
      title: "Legal Compliance Checker",
      description: "Verify compliance with relevant laws and regulations across multiple jurisdictions and industry standards.",
      icon: Scale,
      image: "/feature-compliance.jpg",
    },
    {
      title: "Key Clause Extraction",
      description: "Automatically identify and extract critical clauses and terms for quick review and comparison.",
      icon: FileText,
      image: "/feature-clauses.jpg",
    },
    {
      title: "Negotiation Recommendations",
      description: "Receive AI-powered suggestions for improving contract terms and strengthening your negotiating position.",
      icon: Zap,
      image: "/feature-negotiation.jpg",
    },
    {
      title: "Contract Comparison",
      description: "Compare multiple versions of a contract to track changes and evaluate proposed modifications.",
      icon: Glasses,
      image: "/feature-comparison.jpg",
    },
  ]

  // Feature comparisons for different plans
  const planFeatures = {
    categories: ["Contract Analysis", "Risk Assessment", "Compliance", "Collaboration", "Support"],
    plans: [
      {
        name: "Free",
        features: ["Basic analysis", "Limited risk detection", "Standard compliance", "Single user", "Email support"],
      },
      {
        name: "Pro",
        features: ["Advanced analysis", "Full risk assessment", "Enhanced compliance", "Up to 5 users", "Priority support"],
      },
      {
        name: "Enterprise",
        features: ["Custom analysis", "Custom risk modeling", "Custom compliance rules", "Unlimited users", "Dedicated support"],
      },
    ],
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header Section with Animated Grid Background */}
      <section className="w-full py-12 md:py-16 relative">
        {/* Grid background */}
        <motion.div
          className="absolute inset-0 z-0 opacity-10"
          variants={gridVariants}
          animate="animate"
          style={{
            backgroundImage:
              "linear-gradient(to right, #4f46e5 1px, transparent 1px), linear-gradient(to bottom, #4f46e5 1px, transparent 1px)",
            backgroundSize: "30px 30px",
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
                transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                        repeat: Number.POSITIVE_INFINITY,
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
                          repeat: Number.POSITIVE_INFINITY,
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
              Explore the powerful capabilities that make ContractAI the leading solution for contract analysis
            </p>
          </motion.div>

          <div className="space-y-24">
            {detailedFeatures.map((feature, index) => (
              <motion.div
                key={index}
                className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
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
                      className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-blue-500/20 opacity-0 z-10"
                      animate={{ opacity: [0, 0.5, 0] }}
                      transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
                    />
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="w-full h-auto rounded-xl"
                      onError={(e) => {
                        e.currentTarget.src = `https://via.placeholder.com/600x400?text=${feature.title.replace(" ", "+")}`;
                      }}
                    />
                  </motion.div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison Section */}
      <section className="w-full py-16 bg-gradient-to-b from-white to-blue-50">
        <div className="container px-4 md:px-6 max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Features by Plan</h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              Compare our plans to find the perfect fit for your business
            </p>
          </motion.div>

          <motion.div
            className="bg-white rounded-xl shadow-lg overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-blue-50">
                    <th className="py-4 px-6 text-left text-slate-700 font-medium">Features</th>
                    {planFeatures.plans.map((plan, index) => (
                      <th key={index} className="py-4 px-6 text-center">
                        <span className="text-blue-700 font-bold text-lg block mb-1">{plan.name}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {planFeatures.categories.map((category, catIndex) => (
                    <tr key={catIndex} className={catIndex % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                      <td className="py-4 px-6 font-medium text-slate-700">{category}</td>
                      {planFeatures.plans.map((plan, planIndex) => (
                        <td key={planIndex} className="py-4 px-6 text-center text-slate-600">
                          {plan.features[catIndex]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          <motion.div
            className="text-center mt-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Link href="/pricing" className="inline-block">
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white relative overflow-hidden group px-6 py-3"
                size="lg"
              >
                <motion.span className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative z-10">View Pricing Plans</span>
                <motion.span
                  className="relative z-10 ml-2"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, repeatDelay: 2 }}
                >
                  <ArrowRight className="h-4 w-4" />
                </motion.span>
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container px-4 md:px-6 max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold mb-4">Ready to transform your contract workflow?</h2>
            <p className="text-lg text-blue-100 mb-8 max-w-3xl mx-auto">
              Join thousands of businesses using ContractAI to analyze contracts faster and more accurately than ever before.
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link href="/dashboard">
                <Button
                  className="bg-white text-blue-700 hover:bg-blue-50 font-medium px-8 py-6 text-lg rounded-md"
                  size="lg"
                >
                  Start Free Trial
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}