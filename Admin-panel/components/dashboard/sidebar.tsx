"use client"

import type React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { LayoutDashboard, UserCircle, FileText, Shield, LogOut, Users, Star } from "lucide-react"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const { userRole, logout } = useAuth()

  const isAdmin = userRole === "admin"

  const routes = [
    {
      href: "/dashboard",
      icon: LayoutDashboard,
      title: "Dashboard",
      active: pathname === "/dashboard",
    },
    {
      href: "/dashboard/documents",
      icon: FileText,
      title: "Documents",
      active: pathname === "/dashboard/documents",
    },
    ...(isAdmin
      ? [
          {
            href: "/dashboard/vets",
            icon: Users,
            title: "Manage Vets",
            active: pathname === "/dashboard/vets",
          },
          {
            href: "/dashboard/vets-reviews",
            icon: Star,
            title: "Vet Reviews",
            active: pathname === "/dashboard/vets-reviews",
          },
        ]
      : []),
  ]

  return (
    <div className={cn("pb-12 min-h-screen", className)}>
      <div className="space-y-4 py-4">
        <div className="px-4 py-2">
          <h2 className="mb-2 px-2 text-xl font-semibold tracking-tight">Vet Admin Panel</h2>
          <div className="space-y-1">
            {routes.map((route) => (
              <Button
                key={route.href}
                variant={route.active ? "secondary" : "ghost"}
                className="w-full justify-start"
                asChild
              >
                <Link href={route.href}>
                  <route.icon className="mr-2 h-4 w-4" />
                  {route.title}
                </Link>
              </Button>
            ))}
            <Button
              variant="ghost"
              className="w-full justify-start text-red-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
              onClick={() => logout()}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
