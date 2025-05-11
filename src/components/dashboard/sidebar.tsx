"use client"

import { FileText, Home, LayoutDashboard, Settings, Menu, X } from "lucide-react"
import type React from "react"
import { usePathname, useRouter } from "next/navigation"
import { type ElementType, useState, useEffect } from "react"
import { cn } from "@/lib/utils"

export const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const pathname = usePathname()

  // Handle screen size detection
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
      // Auto-collapse sidebar on mobile
      if (window.innerWidth < 768) {
        setIsExpanded(false)
      } else {
        // Default expanded on desktop
        setIsExpanded(true)
      }
    }

    // Initial checks
    checkIsMobile()

    // Listen for window resize
    window.addEventListener('resize', checkIsMobile)
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkIsMobile)
    }
  }, [])

  // Effect to close sidebar on route change
  useEffect(() => {
    // Close sidebar when pathname changes
    setIsSidebarOpen(false)
  }, [pathname])

  // Handle mobile sidebar toggle
  const toggleMobileSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  // Close the sidebar
  const closeSidebar = () => {
    setIsSidebarOpen(false)
  }

  return (
    <>
      {/* Mobile menu button - only visible on mobile and when sidebar is closed */}
      {isMobile && !isSidebarOpen && (
        <button
          className="fixed top-20 left-2 z-50 p-2 rounded-md bg-white shadow-md"
          onClick={toggleMobileSidebar}
          aria-label="Toggle menu"
        >
          <Menu className="size-5" />
        </button>
      )}

      <aside
        className={cn(
          "group border-r border-gray-200 bg-white text-black transition-all duration-300 ease-in-out z-40",
          // Desktop behavior
          !isMobile && (isExpanded ? "w-64" : "w-16"),
          // Mobile behavior
          isMobile && (isSidebarOpen ? "w-64 fixed h-full" : "w-0 fixed h-full"),
        )}
        onMouseEnter={() => !isMobile && setIsExpanded(true)}
        onMouseLeave={() => !isMobile && setIsExpanded(false)}
      >
        <SidebarContent 
          isExpanded={isMobile ? isSidebarOpen : isExpanded} 
          isMobile={isMobile}
          closeSidebar={closeSidebar}
        />
      </aside>
    </>
  )
}

const SidebarContent = ({ isExpanded, isMobile, closeSidebar }: { 
  isExpanded: boolean, 
  isMobile: boolean,
  closeSidebar: () => void 
}) => {
  const pathname = usePathname()

  const sidebarItems = [
    {
      icon: Home,
      label: "Home",
      href: "/",
    },
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      icon: FileText,
      label: "Results",
      href: "/dashboard/results",
    },
    {
      icon: Settings,
      label: "Settings",
      href: "/dashboard/settings",
    },
  ]

  // Don't render content when completely collapsed on mobile
  if (!isExpanded && typeof window !== 'undefined' && window.innerWidth < 768) {
    return null
  }

  return (
    <div className="h-full flex flex-col bg-white text-black">
      {/* Main Navigation */}
      <nav className={cn("flex-grow p-6", !isExpanded && "p-3")}>
        <ul role="list" className="flex flex-col flex-grow">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {sidebarItems.map((item) => (
                <Navlink 
                  key={item.label} 
                  path={pathname} 
                  link={item} 
                  isExpanded={isExpanded} 
                  closeSidebar={closeSidebar}
                />
              ))}
            </ul>
          </li>
        </ul>
      </nav>
      
      {/* Close button at bottom - only for mobile */}
      {isMobile && (
        <div className="border-t border-gray-200 p-4 flex justify-center">
          <button 
            onClick={closeSidebar}
            className="flex items-center justify-center p-2 rounded-full bg-gray-100 hover:bg-gray-200"
            aria-label="Close sidebar"
          >
            <X className="size-5" />
          </button>
        </div>
      )}
    </div>
  )
}

const Navlink = ({
  path,
  link,
  isExpanded,
  closeSidebar,
}: {
  path: string
  link: {
    icon: ElementType
    label: string
    href: string
    target?: string
  }
  isExpanded: boolean
  closeSidebar: () => void
}) => {
  const isActive = path === link.href
  const router = useRouter()
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    
    // Close the sidebar immediately
    closeSidebar()
    
    // Navigate after a brief delay to allow the closing animation
    setTimeout(() => {
      router.push(link.href)
    }, 100)
  }
  
  return (
    <li>
      <a
        href={link.href}
        onClick={handleClick}
        className={cn(
          "group flex h-9 items-center gap-x-3 rounded-md px-3 text-sm font-semibold leading-5 transition-all duration-300 cursor-pointer",
          isActive ? "bg-gray-100 text-black" : "text-gray-600 hover:bg-gray-50",
          !isExpanded && "justify-center px-2",
        )}
      >
        <link.icon className={cn("size-4 transition-transform duration-300", !isExpanded && "size-5")} />
        <span
          className={cn("ml-4 transition-opacity duration-300", !isExpanded && "opacity-0 w-0 ml-0 overflow-hidden")}
        >
          {link.label}
        </span>
      </a>
    </li>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden pt-16 md:pt-0">
        {children}
      </div>
    </div>
  )
}