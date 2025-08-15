"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Crown, Zap, AlertTriangle } from "lucide-react"

interface SubscriptionStatusProps {
  showUsage?: boolean
  showUpgrade?: boolean
}

interface UsageData {
  current_usage: {
    ai_calls: number
    render_minutes: number
    storage_gb: number
  }
  plan_limits: {
    ai_calls_limit: number
    render_minutes_limit: number
    storage_gb_limit: number
  }
  plan: string
  subscription_status: string
}

export default function SubscriptionStatus({ showUsage = false, showUpgrade = true }: SubscriptionStatusProps) {
  const [usage, setUsage] = useState<UsageData | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (showUsage) {
      fetchUsage()
    }
  }, [showUsage])

  const fetchUsage = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"}/api/usage`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUsage(data.usage)
      }
    } catch (error) {
      console.error("Failed to fetch usage:", error)
    } finally {
      setLoading(false)
    }
  }

  const getSubscriptionBadge = (plan: string, status: string) => {
    if (plan === "free") {
      return <Badge variant="secondary">Free Plan</Badge>
    }
    if (plan === "pro") {
      return (
        <Badge className="bg-primary text-primary-foreground">
          <Crown className="w-3 h-3 mr-1" />
          Pro Plan
        </Badge>
      )
    }
    if (plan === "enterprise") {
      return (
        <Badge className="bg-accent text-accent-foreground">
          <Zap className="w-3 h-3 mr-1" />
          Enterprise
        </Badge>
      )
    }
    return <Badge variant="outline">{plan}</Badge>
  }

  const getUsagePercentage = (current: number, limit: number) => {
    if (limit === -1) return 0 // Unlimited
    return Math.min((current / limit) * 100, 100)
  }

  const isNearLimit = (current: number, limit: number) => {
    if (limit === -1) return false
    return current / limit >= 0.8
  }

  if (!usage && showUsage) {
    return (
      <div className="p-4 border border-border rounded-lg">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
          <div className="h-2 bg-muted rounded w-full"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {usage && getSubscriptionBadge(usage.plan, usage.subscription_status)}
          {usage?.subscription_status === "canceled" && (
            <Badge variant="destructive">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Canceled
            </Badge>
          )}
        </div>
        {showUpgrade && usage?.plan === "free" && (
          <Button size="sm" asChild>
            <a href="/pricing">Upgrade</a>
          </Button>
        )}
      </div>

      {showUsage && usage && (
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span>AI API Calls</span>
              <span className="text-muted-foreground">
                {usage.current_usage.ai_calls} /{" "}
                {usage.plan_limits.ai_calls_limit === -1 ? "∞" : usage.plan_limits.ai_calls_limit}
              </span>
            </div>
            <Progress
              value={getUsagePercentage(usage.current_usage.ai_calls, usage.plan_limits.ai_calls_limit)}
              className={`h-2 ${isNearLimit(usage.current_usage.ai_calls, usage.plan_limits.ai_calls_limit) ? "bg-destructive/20" : ""}`}
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span>Render Minutes</span>
              <span className="text-muted-foreground">
                {usage.current_usage.render_minutes} /{" "}
                {usage.plan_limits.render_minutes_limit === -1 ? "∞" : usage.plan_limits.render_minutes_limit}
              </span>
            </div>
            <Progress
              value={getUsagePercentage(usage.current_usage.render_minutes, usage.plan_limits.render_minutes_limit)}
              className={`h-2 ${isNearLimit(usage.current_usage.render_minutes, usage.plan_limits.render_minutes_limit) ? "bg-destructive/20" : ""}`}
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span>Storage</span>
              <span className="text-muted-foreground">
                {usage.current_usage.storage_gb.toFixed(1)} GB / {usage.plan_limits.storage_gb_limit} GB
              </span>
            </div>
            <Progress
              value={getUsagePercentage(usage.current_usage.storage_gb, usage.plan_limits.storage_gb_limit)}
              className={`h-2 ${isNearLimit(usage.current_usage.storage_gb, usage.plan_limits.storage_gb_limit) ? "bg-destructive/20" : ""}`}
            />
          </div>
        </div>
      )}
    </div>
  )
}
