"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion } from "framer-motion"

export function Footer() {
  return (
    <footer className="w-full py-16 bg-slate-50 border-t border-gray-200 relative overflow-hidden">
      <div className="container px-4 md:px-6 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        {/* Logo and Info */}
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <motion.h3
              className="font-bold text-lg text-blue-600"
              whileHover={{
                scale: 1.05,
                color: "#4f46e5",
                transition: { duration: 0.2 },
              }}
            >
              Logo
            </motion.h3>
            <p className="text-sm text-slate-600 mt-4">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
              dolore magna aliqua.
            </p>
            <motion.div className="flex items-center mt-4" whileHover={{ x: 5, transition: { duration: 0.2 } }}>
              <input type="checkbox" className="mr-2 accent-blue-500" checked readOnly />
              <span className="text-sm">example@gmail.com</span>
            </motion.div>
            <motion.div className="text-sm mt-2" whileHover={{ x: 5, transition: { duration: 0.2 } }}>
              1234567412
            </motion.div>
          </motion.div>
        </div>

        {/* Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3 className="font-bold text-lg text-blue-600 mb-4">Links</h3>
          <ul className="space-y-3">
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
              <Link href="/about-us">About Us</Link>
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
          </ul>
        </motion.div>

        {/* Newsletter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h3 className="font-bold text-lg text-blue-600 mb-4">Newsletter</h3>
          <p className="text-sm text-slate-600 mb-4">Stay Up To Date</p>
          <div className="flex">
            <motion.input
              type="email"
              placeholder="Your email"
              className="flex-1 px-4 py-3 border border-blue-200 focus:border-blue-400 rounded-l-md focus:outline-none transition-colors duration-300"
              whileFocus={{
                boxShadow: "0 0 0 2px rgba(79, 70, 229, 0.2)",
                borderColor: "#4f46e5",
              }}
            />
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Button className="rounded-l-none bg-blue-600 hover:bg-blue-700 text-white px-6 relative overflow-hidden group">
                <motion.span className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative z-10">Subscribe</span>
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Copyright */}
      <motion.div
        className="text-center text-sm text-slate-500 mt-12"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <p>© {new Date().getFullYear()} Your Company. All rights reserved.</p>
      </motion.div>
    </footer>
  )
}