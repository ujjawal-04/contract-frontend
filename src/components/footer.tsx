"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion } from "framer-motion"
import { Mail, Phone, Globe, Twitter, Linkedin } from "lucide-react"
import React, { FormEvent, ChangeEvent, useState } from "react"

// Define types for our form status
type SubscriptionStatus = {
  success: boolean;
  message: string;
} | null;

export function Footer() {
  // State to handle form values and status
  const [email, setEmail] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>(null);

  // Handle email input change
  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  // Handle form submission with Web3Forms
  const handleSubscribe = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Form validation
    if (!email || !email.includes("@")) {
      setSubscriptionStatus({
        success: false,
        message: "Please enter a valid email address."
      });
      return;
    }

    setIsSubmitting(true);
    setSubscriptionStatus(null);

    try {
      // Web3Forms submission
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          access_key: '31900149-978b-4d5f-852e-d83924db33a1', // Replace with your Web3Forms access key
          email: email,
          subject: 'New Newsletter Subscription',
          from_name: 'Lexalyze Newsletter',
          message: `New subscription request from: ${email}`,
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSubscriptionStatus({
          success: true,
          message: "Thank you for subscribing! We'll be in touch soon."
        });
        setEmail("");
      } else {
        throw new Error(result.message || "Something went wrong");
      }
    } catch (error) {
      // Error handling
      setSubscriptionStatus({
        success: false,
        message: "Something went wrong. Please try again."
      });
      console.error("Subscription error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="w-full py-8 sm:py-12 lg:py-16 bg-slate-50 border-t border-gray-200 relative overflow-hidden">
      {/* Background grid pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: "linear-gradient(to right, #4f46e5 1px, transparent 1px), linear-gradient(to bottom, #4f46e5 1px, transparent 1px)",
          backgroundSize: "40px 40px"
        }}></div>
      </div>
      
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl relative z-10">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pb-8 sm:pb-10 lg:pb-12 border-b border-slate-200">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Link href="/" className="inline-block">
                <h3 className="font-bold text-xl text-blue-600">Lexalyze</h3>
              </Link>
              <p className="text-sm text-slate-600 mt-3 max-w-xs">
                Revolutionizing contract analysis with AI. We help legal professionals save time and minimize risk through advanced document analysis.
              </p>
              <div className="mt-4 sm:mt-6 flex space-x-4">
                <motion.a 
                  href="https://twitter.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-slate-500 hover:text-blue-500 transition-colors"
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  aria-label="Twitter"
                >
                  <Twitter size={18} />
                </motion.a>
                <motion.a 
                  href="https://linkedin.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-slate-500 hover:text-blue-700 transition-colors"
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  aria-label="LinkedIn"
                >
                  <Linkedin size={18} />
                </motion.a>
              </div>
            </motion.div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h3 className="font-bold text-md text-slate-800 mb-3 sm:mb-4">Quick Links</h3>
              <ul className="space-y-2 sm:space-y-3">
                <motion.li
                  className="text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
                  whileHover={{ x: 5, transition: { duration: 0.2 } }}
                >
                  <Link href="/">Home</Link>
                </motion.li>
                <motion.li
                  className="text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
                  whileHover={{ x: 5, transition: { duration: 0.2 } }}
                >
                  <Link href="/about-us">About</Link>
                </motion.li>
                <motion.li
                  className="text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
                  whileHover={{ x: 5, transition: { duration: 0.2 } }}
                >
                  <Link href="/dashboard">Dashboard</Link>
                </motion.li>
                <motion.li
                  className="text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
                  whileHover={{ x: 5, transition: { duration: 0.2 } }}
                >
                  <Link href="/features">Features</Link>
                </motion.li>
                <motion.li
                  className="text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
                  whileHover={{ x: 5, transition: { duration: 0.2 } }}
                >
                  <Link href="/pricing">Pricing</Link>
                </motion.li>
                <motion.li
                  className="text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
                  whileHover={{ x: 5, transition: { duration: 0.2 } }}
                >
                  <Link href="/terms-and-conditions">Terms and Conditions</Link>
                </motion.li>
              </ul>
            </motion.div>
          </div>

          {/* Newsletter */}
          <div className="sm:col-span-2 lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h3 className="font-bold text-md text-slate-800 mb-3 sm:mb-4">Stay Updated</h3>
              <p className="text-sm text-slate-600 mb-3 max-w-xs">Subscribe to our newsletter for the latest features, tips, and legal tech insights.</p>
              <form onSubmit={handleSubscribe} className="flex flex-col space-y-3">
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="Your email address"
                  className="px-3 sm:px-4 py-2 sm:py-2.5 border border-slate-200 focus:border-blue-400 rounded-md focus:outline-none transition-colors duration-300 text-sm w-full"
                  aria-label="Email for newsletter"
                  disabled={isSubmitting}
                  required
                />
                {/* Hidden fields for Web3Forms */}
                <input type="hidden" name="access_key" value="YOUR_WEB3FORMS_ACCESS_KEY" />
                <input type="hidden" name="subject" value="New Lexalyze Newsletter Subscription" />
                <input type="hidden" name="from_name" value="Lexalyze Newsletter" />
                <input type="checkbox" name="botcheck" className="hidden" style={{ display: 'none' }} />
                
                <motion.div whileHover={{ scale: isSubmitting ? 1 : 1.02 }} whileTap={{ scale: isSubmitting ? 1 : 0.98 }}>
                  <Button 
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white relative overflow-hidden group text-sm py-2"
                    disabled={isSubmitting}
                  >
                    <motion.span className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="relative z-10 flex items-center justify-center">
                      {isSubmitting ? (
                        <div className="h-4 w-4 border-2 border-white border-opacity-50 border-t-blue-100 rounded-full animate-spin mr-2"></div>
                      ) : null}
                      {isSubmitting ? 'Subscribing...' : 'Subscribe'}
                    </span>
                  </Button>
                </motion.div>
                
                {subscriptionStatus && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`text-sm px-3 py-2 rounded-md ${
                      subscriptionStatus.success 
                        ? 'bg-green-50 text-green-700 border border-green-200' 
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                  >
                    {subscriptionStatus.message}
                  </motion.div>
                )}
                
                <p className="text-xs text-slate-500 mt-1 sm:mt-2">
                  We respect your privacy. Unsubscribe at any time.
                </p>
              </form>
            </motion.div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row flex-wrap justify-between items-start sm:items-center gap-4 py-6 sm:py-8 border-b border-slate-200">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="flex flex-col sm:flex-row sm:flex-wrap gap-4 md:gap-6 lg:gap-8"
          >
            <div className="flex items-center text-slate-600">
              <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
              <a href="mailto:support@lexalyze.com" className="text-sm hover:text-blue-600 transition-colors">
                support@lexalyze.com
              </a>
            </div>
            <div className="flex items-center text-slate-600">
              <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
              <a href="tel:+15555555555" className="text-sm hover:text-blue-600 transition-colors">
                +1 (555) 555-5555
              </a>
            </div>
            <div className="flex items-center text-slate-600">
              <Globe className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="text-sm">San Francisco, CA</span>
            </div>
          </motion.div>
        </div>

        {/* Copyright */}
        <motion.div
          className="text-center py-6 sm:py-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.9 }}
        >
          <p className="text-sm text-slate-500 mb-2">© {new Date().getFullYear()} Lexalyze. All rights reserved.</p>
          <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-lg mx-auto">
            &quot;Transforming the legal industry with AI-powered contract analysis that delivers accuracy, efficiency and insights.&quot;
          </p>
        </motion.div>
      </div>
    </footer>
  )
}