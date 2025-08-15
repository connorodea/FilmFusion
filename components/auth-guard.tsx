"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: number
  email: string
  username: string
  full_name: string
  is_premium: boolean
  subscription_plan: string
  subscription_status: string
}

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  requirePremium?: boolean
  redirectTo?: string
}

export default function AuthGuard({
  children,
  requireAuth = true,
  requirePremium = false,
  redirectTo = "/auth/signin",
}: AuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("token")
      const userData = localStorage.getItem("user")

      if (!token || !userData) {
        if (requireAuth) {
          router.push(redirectTo)
          return
        }
        setIsLoading(false)
        return
      }

      // Verify token with backend
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"}/api/auth/verify`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (!response.ok) {
        // Token is invalid, clear storage and redirect
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        localStorage.removeItem("subscription_status")
        localStorage.removeItem("subscription_plan")

        if (requireAuth) {
          router.push(redirectTo)
          return
        }
      } else {
        const user = JSON.parse(userData)
        setUser(user)

        // Check premium requirement
        if (requirePremium && user.subscription_plan === "free") {
          router.push("/pricing?upgrade=required")
          return
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      if (requireAuth) {
        router.push(redirectTo)
        return
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (requireAuth && !user) {
    return null // Will redirect
  }

  return <>{children}</>
}
