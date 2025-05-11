"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { 
  ArrowLeft,  
  Brain,  
  Code, 
  Upload, 
  BarChart, 
  CheckCircle2,
  Target,
  Zap,
  Shield,
  TrendingUp,
  ArrowRight
} from "lucide-react"

export default function AboutUs() {
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

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header Section with Animated Grid Background */}
      <section className="w-full py-12 md:py-16 lg:py-20 relative overflow-hidden">
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
              "mb-6 flex items-center text-blue-600 hover:text-blue-700 transition-colors"
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
            <div className="flex justify-center mb-6">
              <motion.div
                className="p-3 bg-blue-50 rounded-full"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Target className="h-10 w-10 text-blue-600" />
              </motion.div>
            </div>
            
            <motion.h1
              className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl text-slate-800"
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
                About Us
              </motion.span>
            </motion.h1>
            <motion.p className="mt-4 text-lg md:text-xl text-slate-600 max-w-3xl mx-auto" variants={itemVariants}>
              Revolutionizing contract analysis with artificial intelligence
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Our Mission Section */}
      <section className="w-full py-12 md:py-16 bg-gradient-to-b from-white to-blue-50">
        <div className="container px-4 md:px-6 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-2 md:order-1"
            >
              <div className="flex items-center mb-4">
                <div className="p-2 rounded-full bg-blue-50 mr-3">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-800">Our Mission</h2>
              </div>
              
              <div className="space-y-4 text-slate-600">
                <p className="text-base md:text-lg">
                  At Lexalyze, our mission is to revolutionize contract management by harnessing the power of artificial intelligence to make contract analysis accessible, accurate, and efficient for businesses of all sizes.
                </p>
                <p className="text-base md:text-lg">
                  We believe that everyone should have access to intelligent contract analysis tools that can identify risks, opportunities, and key terms without requiring a team of legal experts or extensive time investments.
                </p>
                <p className="text-base md:text-lg">
                  Through our cutting-edge AI technology, we aim to transform the way businesses approach contract management, saving time, reducing costs, and improving outcomes for organizations around the world.
                </p>
              </div>
              
              <div className="mt-6 flex flex-wrap gap-3">
                <div className="flex items-center bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm text-slate-700">Accessible</span>
                </div>
                <div className="flex items-center bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm text-slate-700">Accurate</span>
                </div>
                <div className="flex items-center bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm text-slate-700">Efficient</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="relative rounded-xl overflow-hidden shadow-xl order-1 md:order-2"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{
                scale: 1.03,
                transition: { duration: 0.3 },
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-blue-500/20 opacity-0 z-10"
                animate={{ opacity: [0, 0.5, 0] }}
                transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
              />
              <img
                src="/mission.jpg" 
                alt="Our mission" 
                className="w-full h-auto rounded-xl"
                onError={(e) => {
                  e.currentTarget.src = "https://placehold.co/600x400/eef6ff/4f46e5?text=Our+Mission";
                }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Technology Section */}
      <section className="w-full py-12 md:py-16 bg-white">
        <div className="container px-4 md:px-6 max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex justify-center mb-4">
              <div className="p-2 rounded-full bg-blue-50">
                <Brain className="h-7 w-7 text-blue-600" />
              </div>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4">Our Technology</h2>
            <p className="text-base md:text-lg text-slate-600 max-w-3xl mx-auto">
              Powered by advanced AI and natural language processing to transform how you analyze contracts
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            <motion.div
              className="bg-blue-50 p-6 md:p-8 rounded-xl relative overflow-hidden group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="absolute -right-10 -top-10 w-24 h-24 bg-blue-100 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-300"></div>
              <div className="relative z-10">
                <Brain className="h-8 w-8 text-blue-600 mb-4" />
                <h3 className="text-lg md:text-xl font-bold text-blue-700 mb-3">Natural Language Processing</h3>
                <p className="text-slate-600 text-sm md:text-base">
                  Our AI uses advanced NLP to understand complex legal language, identify key clauses, and extract critical information from contracts.
                </p>
                <div className="h-1 w-12 bg-blue-600 rounded-full mt-4"></div>
              </div>
            </motion.div>

            <motion.div
              className="bg-indigo-50 p-6 md:p-8 rounded-xl relative overflow-hidden group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="absolute -right-10 -top-10 w-24 h-24 bg-indigo-100 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-300"></div>
              <div className="relative z-10">
                <Code className="h-8 w-8 text-indigo-600 mb-4" />
                <h3 className="text-lg md:text-xl font-bold text-indigo-700 mb-3">Machine Learning Models</h3>
                <p className="text-slate-600 text-sm md:text-base">
                  Our technology is trained on millions of diverse contracts, enabling it to recognize patterns and provide insights across different industries.
                </p>
                <div className="h-1 w-12 bg-indigo-600 rounded-full mt-4"></div>
              </div>
            </motion.div>

            <motion.div
              className="bg-purple-50 p-6 md:p-8 rounded-xl relative overflow-hidden group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="absolute -right-10 -top-10 w-24 h-24 bg-purple-100 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-300"></div>
              <div className="relative z-10">
                <Shield className="h-8 w-8 text-purple-600 mb-4" />
                <h3 className="text-lg md:text-xl font-bold text-purple-700 mb-3">Risk Assessment Engine</h3>
                <p className="text-slate-600 text-sm md:text-base">
                  Our proprietary risk assessment engine evaluates contracts for legal, financial, and operational risks with mitigation strategies.
                </p>
                <div className="h-1 w-12 bg-purple-600 rounded-full mt-4"></div>
              </div>
            </motion.div>

            <motion.div
              className="bg-pink-50 p-6 md:p-8 rounded-xl relative overflow-hidden group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="absolute -right-10 -top-10 w-24 h-24 bg-pink-100 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-300"></div>
              <div className="relative z-10">
                <TrendingUp className="h-8 w-8 text-pink-600 mb-4" />
                <h3 className="text-lg md:text-xl font-bold text-pink-700 mb-3">Continuous Learning</h3>
                <p className="text-slate-600 text-sm md:text-base">
                  Our AI system continuously improves through feedback loops and additional training data, ensuring it stays current with legal trends.
                </p>
                <div className="h-1 w-12 bg-pink-600 rounded-full mt-4"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full py-12 md:py-16 bg-gradient-to-b from-white to-blue-50">
        <div className="container px-4 md:px-6 max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex justify-center mb-4">
              <div className="p-2 rounded-full bg-blue-50">
                <Zap className="h-7 w-7 text-blue-600" />
              </div>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4">How It Works</h2>
            <p className="text-base md:text-lg text-slate-600 max-w-3xl mx-auto">
              Simple, efficient, and powerful contract analysis in just a few steps
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-12 md:gap-y-4 gap-x-8">
            <motion.div
              className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100 relative"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)", transition: { duration: 0.2 } }}
            >
              <div className="absolute -top-5 -left-5 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-md">1</div>
              
              <div className="flex justify-center mb-6">
                <div className="p-3 bg-blue-50 rounded-full">
                  <Upload className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              
              <h3 className="text-lg md:text-xl font-bold text-slate-800 text-center mb-3">Upload Your Contract</h3>
              <p className="text-slate-600 text-center">
                Simply upload your contract document in PDF format through our user-friendly interface. Our system accepts contracts of any complexity.
              </p>
              
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Accepted formats:</span>
                  <span className="text-slate-700 font-medium">PDF</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100 relative"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)", transition: { duration: 0.2 } }}
            >
              <div className="absolute -top-5 -left-5 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-md">2</div>
              
              <div className="flex justify-center mb-6">
                <div className="p-3 bg-blue-50 rounded-full">
                  <Brain className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              
              <h3 className="text-lg md:text-xl font-bold text-slate-800 text-center mb-3">AI-Powered Analysis</h3>
              <p className="text-slate-600 text-center">
                Our AI technology analyzes the contract, identifying key clauses, potential risks,and opportunities. This process typically takes just minutes.
              </p>
              
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Processing time:</span>
                  <span className="text-slate-700 font-medium">2-5 minutes</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100 relative"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)", transition: { duration: 0.2 } }}
            >
              <div className="absolute -top-5 -left-5 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-md">3</div>
              
              <div className="flex justify-center mb-6">
                <div className="p-3 bg-blue-50 rounded-full">
                  <BarChart className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              
              <h3 className="text-lg md:text-xl font-bold text-slate-800 text-center mb-3">Review Insights</h3>
              <p className="text-slate-600 text-center">
                Receive a comprehensive analysis with risks, suggested improvements, and key metrics. Use these insights to make informed decisions and strengthen your contractual position.
              </p>
              
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Report features:</span>
                  <span className="text-slate-700 font-medium">Risks, opportunities, metrics</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>


      {/* CTA Section */}
      <section className="w-full py-12 sm:py-16 md:py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white overflow-hidden relative">
        <motion.div
          className="absolute inset-0 z-0"
          initial={{opacity: 0}}
          whileInView={{opacity: 0.2}}
          viewport={{once: true}}
          transition={{duration: 0.8}}
        >
          <div className="absolute inset-0" style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }} />
        </motion.div>
        
        <div className="container px-4 md:px-6 max-w-6xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Ready to transform your contract workflow?</h2>
            <p className="text-base sm:text-lg text-blue-100 mb-8 max-w-3xl mx-auto">
              Experience the power of AI-driven contract analysis and transform how your business manages legal documents.
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="inline-block"
            >
              <Link href="/dashboard">
                <Button
                  className="bg-white text-blue-700 hover:bg-blue-50 font-medium px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg rounded-md shadow-lg"
                  size="lg"
                >
                  <span>Get Started Today</span>
                  <motion.span 
                    className="ml-2 inline-block"
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                  >
                    <ArrowRight className="h-5 w-5" />
                  </motion.span>
                </Button>
              </Link>
            </motion.div>
            
            <p className="mt-6 text-sm text-blue-200 opacity-80">
              No payment required • Free plan available
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  )
}