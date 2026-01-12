"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Activity, Rss, Trophy, BookOpen, Zap, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Radar", href: "/radar", icon: Activity },
  { name: "Feed", href: "/feed", icon: Rss },
  { name: "Wins", href: "/wins", icon: Trophy },
  { name: "Learn", href: "/learn", icon: BookOpen },
  { name: "Upgrade", href: "/upgrade", icon: Zap },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="border-b border-border bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/radar" className="flex items-center gap-2">
              <Image 
                src="/logo.png" 
                alt="EngageAlpha Logo" 
                width={32} 
                height={32} 
                className="rounded-lg"
              />
              <span className="text-xl font-bold text-foreground">EngageAlpha</span>
            </Link>
            <div className="flex space-x-1">
              {navigation.map((item) => {
                const isActive = pathname?.startsWith(item.href)
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-background-card text-foreground"
                        : "text-foreground-muted hover:bg-background-card hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="h-8 w-8 rounded-full bg-accent" />
          </div>
        </div>
      </div>
    </nav>
  )
}
