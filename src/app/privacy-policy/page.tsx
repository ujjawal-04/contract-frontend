"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ArrowLeft } from "lucide-react"

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

        <div className="container px-4 md:px-6 max-w-4xl mx-auto relative z-10">
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
            className="text-center mb-8"
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
                Privacy Policy
              </motion.span>
            </motion.h1>
            <motion.p className="mt-4 text-lg text-slate-600" variants={itemVariants}>
              Last updated: April 20, 2025
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Content Section */}
      <section className="w-full py-8 relative">
        <div className="container px-4 md:px-6 max-w-4xl mx-auto">
          <motion.div
            className="prose prose-blue max-w-none"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-slate-800 mb-4">1. Introduction</h2>
            <p className="mb-6 text-slate-600">
              Welcome to ContractAI. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our website and use our AI-powered contract analysis services, regardless of where you visit it from. It will also tell you about your privacy rights and how the law protects you.
            </p>

            <h2 className="text-2xl font-bold text-slate-800 mb-4">2. The Data We Collect</h2>
            <p className="mb-4 text-slate-600">
              We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
            </p>
            <ul className="list-disc pl-6 mb-6 text-slate-600">
              <li className="mb-2"><strong className="text-slate-800">Identity Data:</strong> Includes first name, last name, username or similar identifier, title.</li>
              <li className="mb-2"><strong className="text-slate-800">Contact Data:</strong> Includes billing address, email address, and telephone numbers.</li>
              <li className="mb-2"><strong className="text-slate-800">Financial Data:</strong> Includes payment card details (processed securely through our payment processors).</li>
              <li className="mb-2"><strong className="text-slate-800">Transaction Data:</strong> Includes details about payments to and from you and details of services you have purchased from us.</li>
              <li className="mb-2"><strong className="text-slate-800">Technical Data:</strong> Includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform, and other technology on the devices you use to access this website.</li>
              <li className="mb-2"><strong className="text-slate-800">Profile Data:</strong> Includes your username and password, purchases or orders made by you, your preferences, feedback and survey responses.</li>
              <li className="mb-2"><strong className="text-slate-800">Usage Data:</strong> Includes information about how you use our website and services.</li>
              <li className="mb-2"><strong className="text-slate-800">Contract Data:</strong> Includes the content of contracts you upload for analysis.</li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-800 mb-4">3. How We Use Your Data</h2>
            <p className="mb-4 text-slate-600">
              We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
            </p>
            <ul className="list-disc pl-6 mb-6 text-slate-600">
              <li className="mb-2">To register you as a new customer.</li>
              <li className="mb-2">To process and deliver our services, including contract analysis.</li>
              <li className="mb-2">To manage our relationship with you.</li>
              <li className="mb-2">To improve our website, products/services, marketing or customer relationships.</li>
              <li className="mb-2">To recommend products or services which may be of interest to you.</li>
              <li className="mb-2">To comply with a legal or regulatory obligation.</li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-800 mb-4">4. Contract Data Processing</h2>
            <p className="mb-4 text-slate-600">
              When you upload contracts for analysis, our AI processing system will:
            </p>
            <ul className="list-disc pl-6 mb-6 text-slate-600">
              <li className="mb-2">Extract and analyze text content from your documents.</li>
              <li className="mb-2">Identify key information, risks, and opportunities within your contracts.</li>
              <li className="mb-2">Generate reports based on this analysis.</li>
              <li className="mb-2">Store processed results in your account for your future reference.</li>
            </ul>
            <p className="mb-6 text-slate-600">
              We implement strong security measures to protect your contract data, including encryption in transit and at rest.
            </p>

            <h2 className="text-2xl font-bold text-slate-800 mb-4">5. Data Security</h2>
            <p className="mb-6 text-slate-600">
              We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
            </p>

            <h2 className="text-2xl font-bold text-slate-800 mb-4">6. Data Retention</h2>
            <p className="mb-4 text-slate-600">
              We will only retain your personal data for as long as necessary to fulfill the purposes we collected it for, including for the purposes of satisfying any legal, accounting, or reporting requirements.
            </p>
            <p className="mb-4 text-slate-600">
              For contract data specifically:
            </p>
            <ul className="list-disc pl-6 mb-6 text-slate-600">
              <li className="mb-2"><strong className="text-slate-800">Active account:</strong> We retain contract data and analysis results while your account is active.</li>
              <li className="mb-2"><strong className="text-slate-800">Account closure:</strong> Upon account closure, contract data will be deleted within 30 days, unless you request immediate deletion.</li>
              <li className="mb-2"><strong className="text-slate-800">Legal requirements:</strong> We may retain certain data if required by law.</li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-800 mb-4">7. Your Legal Rights</h2>
            <p className="mb-4 text-slate-600">
              Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to:
            </p>
            <ul className="list-disc pl-6 mb-6 text-slate-600">
              <li className="mb-2">Request access to your personal data.</li>
              <li className="mb-2">Request correction of your personal data.</li>
              <li className="mb-2">Request erasure of your personal data.</li>
              <li className="mb-2">Object to processing of your personal data.</li>
              <li className="mb-2">Request restriction of processing your personal data.</li>
              <li className="mb-2">Request transfer of your personal data.</li>
              <li className="mb-2">Right to withdraw consent.</li>
            </ul>
            <p className="mb-6 text-slate-600">
              You can exercise any of these rights by contacting us at privacy@contractai.com.
            </p>

            <h2 className="text-2xl font-bold text-slate-800 mb-4">8. Contact Us</h2>
            <p className="mb-6 text-slate-600">
              If you have any questions about this privacy policy or our privacy practices, please contact us at:
            </p>
            <div className="bg-blue-50 p-6 rounded-lg mb-8">
              <p className="mb-2 text-slate-700"><strong>Email:</strong> privacy@contractai.com</p>
              <p className="mb-2 text-slate-700"><strong>Phone:</strong> (123) 456-7890</p>
              <p className="text-slate-700"><strong>Address:</strong> 123 AI Innovation Center, Tech City, CA 94043, USA</p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}