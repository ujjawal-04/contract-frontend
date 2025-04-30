"use client"
import { FileText, Home, LayoutDashboard, Settings } from "lucide-react"
import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { type ElementType, useState } from "react"
import { cn } from "@/lib/utils"

export const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <aside
      className={cn(
        "group border-r border-gray-200 bg-white text-black transition-all duration-300 ease-in-out",
        isExpanded ? "w-64" : "w-16",
      )}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <SidebarContent isExpanded={isExpanded} />
    </aside>
  )
}

const SidebarContent = ({ isExpanded }: { isExpanded: boolean }) => {
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

  return (
    <div className="h-full bg-white text-black z-50">
      <nav className={cn("flex-grow p-6", !isExpanded && "p-3")}>
        <ul role="list" className="flex flex-col flex-grow">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {sidebarItems.map((item) => (
                <Navlink key={item.label} path={pathname} link={item} isExpanded={isExpanded} />
              ))}
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  )
}

const Navlink = ({
  path,
  link,
  isExpanded,
}: {
  path: string
  link: {
    icon: ElementType
    label: string
    href: string
    target?: string
  }
  isExpanded: boolean
}) => {
  const isActive = path === link.href

  return (
    <li>
      <Link
        href={link.href}
        target={link.target}
        className={cn(
          "group flex h-9 items-center gap-x-3 rounded-md px-3 text-sm font-semibold leading-5 transition-all duration-300 z-50",
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
      </Link>
    </li>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-100 z-50">
      <Sidebar/>
      <div className="flex-1 flex flex-col overflow-hidden">{children}</div>
    </div>
  )
}
