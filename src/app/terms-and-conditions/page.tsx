"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ArrowLeft, Scale, FileText, AlertCircle, CheckCircle, HelpCircle, CreditCard, Mail, } from "lucide-react"

export default function TermsAndConditions() {
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

  // Terms sections for interactive navigation
  const termsSections = [
    { id: "introduction", title: "Introduction", icon: <FileText className="h-5 w-5" /> },
    { id: "acceptance", title: "Acceptance", icon: <CheckCircle className="h-5 w-5" /> },
    { id: "user-accounts", title: "User Accounts", icon: <HelpCircle className="h-5 w-5" /> },
    { id: "service-usage", title: "Service Usage", icon: <FileText className="h-5 w-5" /> },
    { id: "intellectual-property", title: "Intellectual Property", icon: <Scale className="h-5 w-5" /> },
    { id: "payment-terms", title: "Payment Terms", icon: <CreditCard className="h-5 w-5" /> },
    { id: "limitations", title: "Limitations", icon: <AlertCircle className="h-5 w-5" /> },
    { id: "termination", title: "Termination", icon: <FileText className="h-5 w-5" /> },
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
          className="absolute hidden md:block h-16 w-16 rounded-full bg-indigo-500 opacity-10 top-1/4 left-1/4"
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
          className="absolute hidden md:block h-24 w-24 rounded-full bg-blue-500 opacity-10 bottom-1/4 right-1/4"
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
              "mb-6 flex items-center text-indigo-600 hover:text-indigo-700 transition-colors"
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
                className="p-3 bg-indigo-50 rounded-full"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Scale className="h-10 w-10 text-indigo-600" />
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
                Terms and Conditions
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
            {termsSections.map((section, index) => (
              <motion.button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className="flex items-center px-3 py-2 text-sm rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-colors"
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
            className="prose prose-indigo max-w-none"
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
                <div className="p-2 rounded-full bg-indigo-50">
                  <FileText className="h-5 w-5 text-indigo-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 m-0">1. Introduction</h2>
              </div>
              <p className="mb-6 text-slate-600">
                Welcome to Lexalyze. These Terms and Conditions govern your use of our website and AI-powered contract analysis services (&quot;Service&quot;). By accessing or using our Service, you agree to be bound by these Terms. Please read them carefully.
              </p>
              <p className="mb-6 text-slate-600">
                Our Service provides AI-powered contract analysis that helps legal professionals and businesses review, analyze, and optimize their legal documents. These Terms establish the rules for using our platform and the legal relationship between you and Lexalyze.
              </p>
            </motion.div>

            <motion.div 
              id="acceptance"
              className="mb-12 pb-4 border-b border-slate-100"
              variants={sectionVariants}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-full bg-indigo-50">
                  <CheckCircle className="h-5 w-5 text-indigo-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 m-0">2. Acceptance of Terms</h2>
              </div>
              <p className="mb-4 text-slate-600">
                By creating an account, accessing, or using our Service, you acknowledge that you have read, understood, and agree to be bound by these Terms. If you do not agree to these Terms, you must not access or use our Service.
              </p>
              
              <div className="bg-indigo-50 p-5 rounded-lg border border-indigo-100 mb-6">
                <div className="flex items-start mb-4">
                  <AlertCircle className="h-6 w-6 text-indigo-600 mr-3 mt-1 flex-shrink-0" />
                  <p className="text-slate-700 mb-0">
                    We reserve the right to modify these Terms at any time. We will provide notice of any material changes by posting the new Terms on our website and updating the &quot;Last Updated&quot; date. Your continued use of the Service after such modifications will constitute your acknowledgment and agreement to the modified Terms.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              id="user-accounts"
              className="mb-12 pb-4 border-b border-slate-100"
              variants={sectionVariants}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-full bg-indigo-50">
                  <HelpCircle className="h-5 w-5 text-indigo-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 m-0">3. User Accounts</h2>
              </div>
              <p className="mb-4 text-slate-600">
                To use our Service, you may need to create an account. When you create an account, you must provide accurate and complete information.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="font-semibold text-slate-800 mb-2">Account Security</div>
                  <p className="text-slate-600 text-sm">You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. Notify us immediately of any unauthorized use of your account.</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="font-semibold text-slate-800 mb-2">Account Eligibility</div>
                  <p className="text-slate-600 text-sm">You must be at least 18 years old and have the legal authority to enter into these Terms. If you are using the Service on behalf of an organization, you represent that you have authority to bind that organization.</p>
                </div>
              </div>
              
              <p className="mb-6 text-slate-600">
                We reserve the right to terminate or suspend your account at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users of the Service, us, or third parties, or for any other reason.
              </p>
            </motion.div>

            <motion.div 
              id="service-usage"
              className="mb-12 pb-4 border-b border-slate-100"
              variants={sectionVariants}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-full bg-indigo-50">
                  <FileText className="h-5 w-5 text-indigo-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 m-0">4. Service Usage</h2>
              </div>
              <p className="mb-4 text-slate-600">
                Our Service allows you to upload legal documents for AI-powered analysis. You agree to use the Service only for lawful purposes and in accordance with these Terms.
              </p>
              
              <div className="mb-6 bg-indigo-50 p-5 rounded-lg border border-indigo-100">
                <div className="grid gap-4">
                  <div className="font-semibold text-slate-800 mb-2">Prohibited Uses</div>
                  {[
                    "Upload, transmit, or distribute content that violates any third-party rights",
                    "Use the Service to engage in any illegal activity",
                    "Attempt to gain unauthorized access to any portion of the Service",
                    "Use any automated means to access the Service",
                    "Interfere with or disrupt the integrity or performance of the Service",
                    "Sell, license, or exploit the Service or access to it for commercial purposes"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-indigo-500 text-white flex items-center justify-center mr-3 flex-shrink-0">
                        {i+1}
                      </div>
                      <div className="text-slate-700">{item}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div 
              id="intellectual-property"
              className="mb-12 pb-4 border-b border-slate-100"
              variants={sectionVariants}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-full bg-indigo-50">
                  <Scale className="h-5 w-5 text-indigo-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 m-0">5. Intellectual Property</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="font-semibold text-slate-800 mb-2">Your Content</div>
                  <p className="text-slate-600 text-sm">You retain all rights to any content you upload to our Service. By uploading content, you grant us a non-exclusive, worldwide, royalty-free license to use, store, and process that content solely for the purpose of providing the Service to you.</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="font-semibold text-slate-800 mb-2">Our Content</div>
                  <p className="text-slate-600 text-sm">The Service, including its features, functionality, and content (excluding Your Content), is owned by Lexalyze and is protected by copyright, trademark, and other intellectual property laws.</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-lg mb-6 border border-indigo-100">
                <div className="flex items-start mb-4">
                  <CheckCircle className="h-6 w-6 text-indigo-600 mr-3 mt-1 flex-shrink-0" />
                  <p className="text-slate-700">
                    You may not copy, modify, distribute, sell, or lease any part of our Service or included software, nor may you reverse engineer or attempt to extract the source code of that software, unless laws prohibit these restrictions or you have our written permission.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              id="limitations"
              className="mb-12 pb-4 border-b border-slate-100"
              variants={sectionVariants}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-full bg-indigo-50">
                  <AlertCircle className="h-5 w-5 text-indigo-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 m-0">6. Limitations of Liability</h2>
              </div>
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-8 rounded-lg mb-6 border border-indigo-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-200 opacity-20 rounded-full translate-x-16 -translate-y-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-200 opacity-20 rounded-full -translate-x-12 translate-y-12"></div>
                
                <div className="relative">
                  <p className="text-slate-700 mb-4">
                    <strong>AI Analysis Disclaimer:</strong> Our Service uses AI technology to analyze legal documents. While we strive for accuracy, we cannot guarantee that all analyses will be complete or error-free. Our AI-powered analysis should be used as a tool to assist legal professionals, not as a replacement for qualified legal advice.
                  </p>
                  
                  <p className="text-slate-700 mb-4">
                    <strong>To the maximum extent permitted by law:</strong>
                  </p>
                  
                  <ul className="grid gap-3 mb-4 list-none pl-0">
                    {[
                      "We provide the Service on an 'as is' and 'as available' basis, without any warranties of any kind",
                      "We expressly disclaim all warranties, including any warranties of merchantability, fitness for a particular purpose, and non-infringement",
                      "We are not liable for any indirect, incidental, special, consequential, or punitive damages",
                      "Our total liability for any claims arising from or related to these Terms is limited to the amount you paid us in the 12 months preceding the claim"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start bg-white bg-opacity-70 p-3 rounded-md shadow-sm">
                        <CheckCircle className="h-5 w-5 text-indigo-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <p className="text-slate-700 mb-0">
                    Some jurisdictions do not allow the exclusion of certain warranties or the limitation of liability for certain types of damages, so some of the above limitations may not apply to you.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              id="termination"
              className="mb-12 pb-4 border-b border-slate-100"
              variants={sectionVariants}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-full bg-indigo-50">
                  <FileText className="h-5 w-5 text-indigo-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 m-0">7. Termination</h2>
              </div>
              <p className="mb-4 text-slate-600">
                We may terminate or suspend your access to the Service immediately, without prior notice or liability, for any reason, including if you breach these Terms.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {[
                  "Upon termination, your right to use the Service will immediately cease", 
                  "All provisions of the Terms that should survive termination shall survive",
                  "We may delete your data after account termination",
                  "You may cancel your subscription at any time through your account settings"
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
              
              <div className="p-4 bg-indigo-50 rounded-lg border-l-4 border-indigo-500 mb-6">
                <p className="text-slate-700 mb-0">
                  If you wish to terminate your account, you may simply discontinue using the Service or contact us at <strong className="text-indigo-700">support@lexalyze.com</strong>.
                </p>
              </div>
            </motion.div>

            <motion.div 
              id="contact"
              className="mb-12"
              variants={sectionVariants}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-full bg-indigo-50">
                  <Mail className="h-5 w-5 text-indigo-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 m-0">8. Contact Us</h2>
              </div>
              <p className="mb-6 text-slate-600">
                If you have any questions about these Terms and Conditions, please contact us at:
              </p>
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-8 rounded-lg mb-8 border border-indigo-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-200 opacity-20 rounded-full translate-x-16 -translate-y-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-200 opacity-20 rounded-full -translate-x-12 translate-y-12"></div>
                
                <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="bg-white bg-opacity-70 p-4 rounded-lg shadow-sm">
                    <Mail className="h-6 w-6 text-indigo-600 mb-2" />
                    <h4 className="font-medium text-slate-800 mb-1">Email</h4>
                    <a href="mailto:legal@lexalyze.com" className="text-indigo-600 hover:text-indigo-700 hover:underline transition-colors">
                      legal@lexalyze.com
                    </a>
                  </div>
                  
                  <div className="bg-white bg-opacity-70 p-4 rounded-lg shadow-sm">
                    <HelpCircle className="h-6 w-6 text-indigo-600 mb-2" />
                    <h4 className="font-medium text-slate-800 mb-1">Phone</h4>
                    <a href="tel:+11234567890" className="text-indigo-600 hover:text-indigo-700 hover:underline transition-colors">
                      +1 (555) 555-5555
                    </a>
                  </div>
                  
                  <div className="bg-white bg-opacity-70 p-4 rounded-lg shadow-sm">
                    <FileText className="h-6 w-6 text-indigo-600 mb-2" />
                    <h4 className="font-medium text-slate-800 mb-1">Address</h4>
                    <address className="not-italic text-indigo-600 hover:text-indigo-700 hover:underline transition-colors">
                      San Francisco, CA
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
              className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full shadow-md transition-colors"
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