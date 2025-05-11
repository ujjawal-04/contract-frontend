"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ArrowLeft, ShieldCheck, Lock, FileText, Bell, User, Mail } from "lucide-react"

export default function PrivacyPolicy() {
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

  // Section animation
  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: "easeOut" }
    }
  }

  // Privacy sections for interactive navigation
  const privacySections = [
    { id: "introduction", title: "Introduction", icon: <FileText className="h-5 w-5" /> },
    { id: "data-collection", title: "Data Collection", icon: <User className="h-5 w-5" /> },
    { id: "data-usage", title: "Data Usage", icon: <Bell className="h-5 w-5" /> },
    { id: "contract-processing", title: "Contract Processing", icon: <FileText className="h-5 w-5" /> },
    { id: "security", title: "Security", icon: <Lock className="h-5 w-5" /> },
    { id: "retention", title: "Data Retention", icon: <Bell className="h-5 w-5" /> },
    { id: "rights", title: "Your Rights", icon: <User className="h-5 w-5" /> },
    { id: "contact", title: "Contact Us", icon: <Mail className="h-5 w-5" /> },
  ]

  // Scroll to section
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 100,
        behavior: "smooth"
      })
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header Section with Animated Grid Background */}
      <section className="w-full py-16 md:py-20 relative overflow-hidden">
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

        <div className="container px-4 md:px-6 max-w-4xl mx-auto relative z-10">
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
            className="text-center mb-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="flex justify-center mb-4">
              <motion.div
                className="p-3 bg-blue-50 rounded-full"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <ShieldCheck className="h-10 w-10 text-blue-600" />
              </motion.div>
            </div>
            
            <motion.h1
              className="text-3xl font-bold tracking-tight sm:text-5xl text-slate-800"
              variants={itemVariants}
            >
              <motion.span
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
                Privacy Policy
              </motion.span>
            </motion.h1>
            <motion.p className="mt-4 text-lg text-slate-600" variants={itemVariants}>
              Last updated: April 20, 2025
            </motion.p>
          </motion.div>
          
          {/* Quick navigation */}
          <motion.div 
            className="mt-12 flex flex-wrap justify-center gap-2"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {privacySections.map((section, index) => (
              <motion.button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className="flex items-center px-3 py-2 text-sm rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-colors"
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                custom={index}
              >
                <span className="mr-1.5">{section.icon}</span>
                {section.title}
              </motion.button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Content Section */}
      <section className="w-full py-8 relative">
        <div className="container px-4 md:px-6 max-w-4xl mx-auto">
          <motion.div
            className="prose prose-blue max-w-none"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.div 
              id="introduction"
              className="mb-12 pb-4 border-b border-slate-100"
              variants={sectionVariants}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-full bg-blue-50">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 m-0">1. Introduction</h2>
              </div>
              <p className="mb-6 text-slate-600">
                Welcome to Lexalyze. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our website and use our AI-powered contract analysis services, regardless of where you visit it from. It will also tell you about your privacy rights and how the law protects you.
              </p>
            </motion.div>

            <motion.div 
              id="data-collection"
              className="mb-12 pb-4 border-b border-slate-100"
              variants={sectionVariants}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-full bg-blue-50">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 m-0">2. The Data We Collect</h2>
              </div>
              <p className="mb-4 text-slate-600">
                We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="font-semibold text-slate-800 mb-2">Identity Data</div>
                  <p className="text-slate-600 text-sm">Includes first name, last name, username or similar identifier, title.</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="font-semibold text-slate-800 mb-2">Contact Data</div>
                  <p className="text-slate-600 text-sm">Includes billing address, email address, and telephone numbers.</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="font-semibold text-slate-800 mb-2">Financial Data</div>
                  <p className="text-slate-600 text-sm">Includes payment card details (processed securely through our payment processors).</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="font-semibold text-slate-800 mb-2">Transaction Data</div>
                  <p className="text-slate-600 text-sm">Includes details about payments to and from you and details of services you have purchased from us.</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="font-semibold text-slate-800 mb-2">Technical Data</div>
                  <p className="text-slate-600 text-sm">Includes IP address, login data, browser type, time zone setting, location, browser plug-ins, operating system, and platform.</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="font-semibold text-slate-800 mb-2">Contract Data</div>
                  <p className="text-slate-600 text-sm">Includes the content of contracts you upload for analysis.</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              id="data-usage"
              className="mb-12 pb-4 border-b border-slate-100"
              variants={sectionVariants}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-full bg-blue-50">
                  <Bell className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 m-0">3. How We Use Your Data</h2>
              </div>
              <p className="mb-4 text-slate-600">
                We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
              </p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6 list-none pl-0">
                {[
                  "To register you as a new customer",
                  "To process and deliver our services",
                  "To manage our relationship with you",
                  "To improve our products and services",
                  "To recommend relevant services",
                  "To comply with legal obligations"
                ].map((item, i) => (
                  <motion.li 
                    key={i}
                    className="flex items-center py-2 px-3 bg-white border border-slate-200 rounded-lg text-slate-700"
                    whileHover={{ x: 5, backgroundColor: "rgba(239, 246, 255, 0.7)" }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                      <span className="text-blue-600 text-xs font-medium">{i+1}</span>
                    </div>
                    {item}
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div 
              id="contract-processing"
              className="mb-12 pb-4 border-b border-slate-100"
              variants={sectionVariants}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-full bg-blue-50">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 m-0">4. Contract Data Processing</h2>
              </div>
              <p className="mb-4 text-slate-600">
                When you upload contracts for analysis, our AI processing system will:
              </p>
              
              <div className="mb-6 bg-blue-50 p-5 rounded-lg border border-blue-100">
                <div className="grid gap-4">
                  {[
                    "Extract and analyze text content from your documents",
                    "Identify key information, risks, and opportunities within your contracts",
                    "Generate reports based on this analysis",
                    "Store processed results in your account for your future reference"
                  ].map((step, i) => (
                    <div key={i} className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center mr-3 flex-shrink-0">
                        {i+1}
                      </div>
                      <div className="text-slate-700">{step}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              <p className="mb-6 text-slate-600">
                We implement strong security measures to protect your contract data, including encryption in transit and at rest.
              </p>
            </motion.div>

            <motion.div 
              id="security"
              className="mb-12 pb-4 border-b border-slate-100"
              variants={sectionVariants}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-full bg-blue-50">
                  <Lock className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 m-0">5. Data Security</h2>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg mb-6 border border-blue-100">
                <div className="flex items-start mb-4">
                  <ShieldCheck className="h-6 w-6 text-blue-600 mr-3 mt-1 flex-shrink-0" />
                  <p className="text-slate-700">
                    We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white bg-opacity-60 p-3 rounded-md">
                    <h4 className="font-medium text-blue-700 mb-1">Data Encryption</h4>
                    <p className="text-sm text-slate-600">All data is encrypted both in transit and at rest using industry standard protocols</p>
                  </div>
                  <div className="bg-white bg-opacity-60 p-3 rounded-md">
                    <h4 className="font-medium text-blue-700 mb-1">Access Controls</h4>
                    <p className="text-sm text-slate-600">Strict permission-based access controls and authentication</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              id="retention"
              className="mb-12 pb-4 border-b border-slate-100"
              variants={sectionVariants}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-full bg-blue-50">
                  <Bell className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 m-0">6. Data Retention</h2>
              </div>
              <p className="mb-4 text-slate-600">
                We will only retain your personal data for as long as necessary to fulfill the purposes we collected it for, including for the purposes of satisfying any legal, accounting, or reporting requirements.
              </p>
              <p className="mb-4 text-slate-600">
                For contract data specifically:
              </p>
              <div className="overflow-hidden rounded-xl mb-6 border border-slate-200">
                <div className="bg-slate-50 px-5 py-3 border-b border-slate-200">
                  <h4 className="font-medium text-slate-800 m-0">Retention Periods</h4>
                </div>
                <div className="divide-y divide-slate-100">
                  <div className="px-5 py-4 flex items-start">
                    <div className="w-32 flex-shrink-0 font-medium text-slate-700">Active account</div>
                    <div className="text-slate-600">We retain contract data and analysis results while your account is active.</div>
                  </div>
                  <div className="px-5 py-4 flex items-start">
                    <div className="w-32 flex-shrink-0 font-medium text-slate-700">Account closure</div>
                    <div className="text-slate-600">Upon account closure, contract data will be deleted within 30 days, unless you request immediate deletion.</div>
                  </div>
                  <div className="px-5 py-4 flex items-start">
                    <div className="w-32 flex-shrink-0 font-medium text-slate-700">Legal requirements</div>
                    <div className="text-slate-600">We may retain certain data if required by law.</div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              id="rights"
              className="mb-12 pb-4 border-b border-slate-100"
              variants={sectionVariants}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-full bg-blue-50">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 m-0">7. Your Legal Rights</h2>
              </div>
              <p className="mb-4 text-slate-600">
                Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to:
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                {[
                  "Request access to your data", 
                  "Request correction of your data", 
                  "Request erasure of your data",
                  "Object to processing of your data", 
                  "Request restriction of processing", 
                  "Request transfer of your data",
                  "Right to withdraw consent"
                ].map((right, i) => (
                  <motion.div 
                    key={i} 
                    className="bg-slate-50 p-3 rounded-lg text-slate-700 text-sm"
                    whileHover={{ y: -5, backgroundColor: "#EFF6FF" }}
                    transition={{ duration: 0.2 }}
                  >
                    {right}
                  </motion.div>
                ))}
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500 mb-6">
                <p className="text-slate-700 mb-0">
                  You can exercise any of these rights by contacting us at <strong className="text-blue-700">privacy@lexalyze.com</strong>.
                </p>
              </div>
            </motion.div>

            <motion.div 
              id="contact"
              className="mb-12"
              variants={sectionVariants}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-full bg-blue-50">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 m-0">8. Contact Us</h2>
              </div>
              <p className="mb-6 text-slate-600">
                If you have any questions about this privacy policy or our privacy practices, please contact us at:
              </p>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-lg mb-8 border border-blue-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200 opacity-20 rounded-full translate-x-16 -translate-y-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-200 opacity-20 rounded-full -translate-x-12 translate-y-12"></div>
                
                <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="bg-white bg-opacity-70 p-4 rounded-lg shadow-sm">
                    <Mail className="h-6 w-6 text-blue-600 mb-2" />
                    <h4 className="font-medium text-slate-800 mb-1">Email</h4>
                    <a href="mailto:privacy@lexalyze.com" className="text-blue-600 hover:text-blue-700 hover:underline transition-colors">
                      privacy@lexalyze.com
                    </a>
                  </div>
                  
                  <div className="bg-white bg-opacity-70 p-4 rounded-lg shadow-sm">
                    <Bell className="h-6 w-6 text-blue-600 mb-2" />
                    <h4 className="font-medium text-slate-800 mb-1">Phone</h4>
                    <a href="tel:+11234567890" className="text-blue-600 hover:text-blue-700 hover:underline transition-colors">
                      (123) 456-7890
                    </a>
                  </div>
                  
                  <div className="bg-white bg-opacity-70 p-4 rounded-lg shadow-sm">
                    <FileText className="h-6 w-6 text-blue-600 mb-2" />
                    <h4 className="font-medium text-slate-800 mb-1">Address</h4>
                    <address className="text-slate-700 not-italic">
                      123 AI Innovation Center<br />
                      Tech City, CA 94043<br />
                      USA
                    </address>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
          
          {/* Back to top button */}
          <motion.div 
            className="sticky bottom-8 flex justify-end mt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            <motion.button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full shadow-md transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>Back to top</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m18 15-6-6-6 6"/>
              </svg>
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  )
}