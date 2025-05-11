"use client"

import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserButton } from "./shared/user-button"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"

const navItems: { name: string; href: string }[] = [
  { name: "About", href: "/about-us" },
  { name: "Dashboard", href: "/dashboard" },
  { name: "Pricing", href: "/pricing" },
]

export default function Header() {
  const pathname = usePathname()
  const isHomePage = pathname === "/"
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  
  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isMenuOpen) {
        setIsMenuOpen(false)
      }
    }
    
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [isMenuOpen])
  
  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  // Menu animation variants
  const menuVariants = {
    closed: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3,
        when: "afterChildren",
      },
    },
    open: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.3,
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  }
  
  const itemVariants = {
    closed: {
      opacity: 0,
      y: -10,
      transition: {
        duration: 0.2,
      },
    },
    open: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
      },
    },
  }

  return (
    <header className="sticky top-0 w-full border-b border-slate-200 bg-white shadow-sm z-50">
      <div className="flex h-16 items-center justify-between w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex-shrink-0">
          <Link href="/" className="flex items-center">
            <span className="text-3xl font-extrabold tracking-tight text-blue-600">
              Lexalyze
            </span>
          </Link>
        </div>
  
        {isHomePage && (
          <nav className="hidden md:flex items-center justify-center flex-1 ml-16 mr-16">
            <div className="flex space-x-8 text-sm font-medium">
              {navItems.map((item) => (
                <motion.div key={item.href} whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
                  <Link
                    href={item.href}
                    className={cn(
                      "transition-colors hover:text-blue-600",
                      pathname === item.href
                        ? "text-blue-600 font-semibold"
                        : "text-slate-700"
                    )}
                  >
                    {item.name}
                  </Link>
                </motion.div>
              ))}
            </div>
          </nav>
        )}
        
        <div className="flex items-center">
          {/* Hamburger menu button for mobile */}
          {isHomePage && (
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-slate-700 hover:text-blue-600 transition-colors focus:outline-none mr-4"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          )}
          
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
            <UserButton />
          </motion.div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isHomePage && (
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={menuVariants}
              className="md:hidden overflow-hidden"
            >
              <div className="py-2 px-4 flex flex-col space-y-3 border-t border-slate-100">
                {navItems.map((item) => (
                  <motion.div key={item.href} variants={itemVariants}>
                    <Link
                      href={item.href}
                      className={cn(
                        "block py-2 text-base transition-colors hover:text-blue-600",
                        pathname === item.href
                          ? "text-blue-600 font-semibold"
                          : "text-slate-700"
                      )}
                    >
                      {item.name}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </header>
  )
}