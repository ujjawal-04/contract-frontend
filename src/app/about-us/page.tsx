"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ArrowLeft, Sparkles, Brain, Award, Globe, Code } from "lucide-react"

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
                About Us
              </motion.span>
            </motion.h1>
            <motion.p className="mt-4 text-lg text-slate-600 max-w-3xl mx-auto" variants={itemVariants}>
              Revolutionizing contract analysis with artificial intelligence
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Our Mission Section */}
      <section className="w-full py-12 bg-gradient-to-b from-white to-blue-50">
        <div className="container px-4 md:px-6 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold text-slate-800 mb-6">Our Mission</h2>
              <div className="space-y-4 text-slate-600">
                <p>
                  At ContractAI, our mission is to revolutionize contract management by harnessing the power of artificial intelligence to make contract analysis accessible, accurate, and efficient for businesses of all sizes.
                </p>
                <p>
                  We believe that everyone should have access to intelligent contract analysis tools that can identify risks, opportunities, and key terms without requiring a team of legal experts or extensive time investments.
                </p>
                <p>
                  Through our cutting-edge AI technology, we aim to transform the way businesses approach contract management, saving time, reducing costs, and improving outcomes for organizations around the world.
                </p>
              </div>
            </motion.div>

            <motion.div
              className="relative rounded-xl overflow-hidden shadow-xl"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
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
                  e.currentTarget.src = "https://via.placeholder.com/600x400?text=Our+Mission";
                }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Technology Section */}
      <section className="w-full py-12 bg-white">
        <div className="container px-4 md:px-6 max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Our Technology</h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              Powered by advanced AI and natural language processing to transform how you analyze contracts
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              className="bg-blue-50 p-8 rounded-xl"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-xl font-bold text-blue-700 mb-4">Natural Language Processing</h3>
              <p className="text-slate-600 mb-4">
                Our AI uses advanced natural language processing to understand complex legal language, identify key clauses, and extract critical information from contracts of all types and formats.
              </p>
              <div className="h-1 w-12 bg-blue-600 rounded-full"></div>
            </motion.div>

            <motion.div
              className="bg-indigo-50 p-8 rounded-xl"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h3 className="text-xl font-bold text-indigo-700 mb-4">Machine Learning Models</h3>
              <p className="text-slate-600 mb-4">
                Our technology is trained on millions of diverse contracts, enabling it to recognize patterns, identify standard and non-standard clauses, and provide insights across different industries and document types.
              </p>
              <div className="h-1 w-12 bg-indigo-600 rounded-full"></div>
            </motion.div>

            <motion.div
              className="bg-purple-50 p-8 rounded-xl"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h3 className="text-xl font-bold text-purple-700 mb-4">Risk Assessment Engine</h3>
              <p className="text-slate-600 mb-4">
                Our proprietary risk assessment engine evaluates contracts for legal, financial, and operational risks, providing detailed explanations and suggestions for mitigation strategies.
              </p>
              <div className="h-1 w-12 bg-purple-600 rounded-full"></div>
            </motion.div>

            <motion.div
              className="bg-pink-50 p-8 rounded-xl"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h3 className="text-xl font-bold text-pink-700 mb-4">Continuous Learning</h3>
              <p className="text-slate-600 mb-4">
                Our AI system continuously improves through feedback loops and additional training data, ensuring that it stays current with legal trends, regulatory changes, and evolving contract practices.
              </p>
              <div className="h-1 w-12 bg-pink-600 rounded-full"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full py-12 bg-gradient-to-b from-white to-blue-50">
        <div className="container px-4 md:px-6 max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-slate-800 mb-4">How It Works</h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              Simple, efficient, and powerful contract analysis in just a few steps
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -10, transition: { duration: 0.2 } }}
            >
              <div className="absolute -top-5 -left-5 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">1</div>
              <h3 className="text-xl font-bold text-slate-800 mt-4 mb-3">Upload Your Contract</h3>
              <p className="text-slate-600">
                Simply upload your contract document in PDF, Word, or text format through our user-friendly interface. Our system accepts contracts of any length or complexity.
              </p>
            </motion.div>

            <motion.div
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -10, transition: { duration: 0.2 } }}
            >
              <div className="absolute -top-5 -left-5 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">2</div>
              <h3 className="text-xl font-bold text-slate-800 mt-4 mb-3">AI-Powered Analysis</h3>
              <p className="text-slate-600">
                Our AI technology analyzes the contract, identifying key clauses, potential risks, obligations, and opportunities. This process typically takes just minutes, even for complex documents.
              </p>
            </motion.div>

            <motion.div
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ y: -10, transition: { duration: 0.2 } }}
            >
              <div className="absolute -top-5 -left-5 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">3</div>
              <h3 className="text-xl font-bold text-slate-800 mt-4 mb-3">Review Insights</h3>
              <p className="text-slate-600">
                Receive a comprehensive analysis report with highlighted risks, suggested improvements, and key metrics. Use these insights to make informed decisions and strengthen your contractual position.
              </p>
            </motion.div>
          </div>
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
              Experience the power of AI-driven contract analysis and transform how your business manages legal documents.
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
                  Get Started Today
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}