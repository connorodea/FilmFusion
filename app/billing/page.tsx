"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CreditCard,
  Video,
  Volume2,
  FileText,
  Settings,
  ExternalLink,
  Crown,
  Zap,
  Calendar,
  Download,
  Eye,
  TrendingUp,
  BarChart3,
  DollarSign,
  Clock,
} from "lucide-react"

interface SubscriptionData {
  plan: string
  status: string
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
  trial_end?: string
  customer_id: string
}

interface UsageData {
  videos_created: number
  videos_limit: number
  api_calls: number
  api_calls_limit: number
  render_minutes: number
  render_minutes_limit: number
  storage_gb: number
  storage_gb_limit: number
}

interface BillingHistory {
  id: string
  amount: number
  currency: string
  status: string
  description: string
  created_at: string
  invoice_url?: string
  receipt_url?: string
}

interface PlanFeatures {
  [key: string]: {
    name: string
    price: number
    features: string[]
    limits: {
      videos: number | string
      api_calls: number | string
      render_minutes: number | string
      storage_gb: number
    }
  }
}

const PLAN_FEATURES: PlanFeatures = {
  free: {
    name: "Free",
    price: 0,
    features: ["Basic AI script generation", "Standard voiceovers", "720p rendering", "Community support"],
    limits: {
      videos: 5,
      api_calls: 50,
      render_minutes: 10,
      storage_gb: 1,
    },
  },
  pro: {
    name: "Pro",
    price: 29,
    features: [
      "Advanced AI with reasoning",
      "Premium voices",
      "4K rendering",
      "Priority support",
      "Advanced templates",
    ],
    limits: {
      videos: 50,
      api_calls: 1000,
      render_minutes: 120,
      storage_gb: 10,
    },
  },
  enterprise: {
    name: "Enterprise",
    price: 99,
    features: ["Unlimited AI usage", "Custom voices", "8K rendering", "API access", "White-label", "Dedicated support"],
    limits: {
      videos: "Unlimited",
      api_calls: "Unlimited",
      render_minutes: "Unlimited",
      storage_gb: 100,
    },
  },
}

export default function BillingPage() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [usage, setUsage] = useState<UsageData | null>(null)
  const [billingHistory, setBillingHistory] = useState<BillingHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchBillingData()
  }, [])

  const fetchBillingData = async () => {
    try {
      const token = localStorage.getItem("token")

      // Fetch subscription data
      const subResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"}/api/billing/subscription`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      if (subResponse.ok) {
        const subData = await subResponse.json()
        setSubscription(subData.subscription)
        setUsage(subData.usage)
      }

      // Fetch billing history
      const historyResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"}/api/billing/history`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      if (historyResponse.ok) {
        const historyData = await historyResponse.json()
        setBillingHistory(historyData.payments || [])
      }
    } catch (error) {
      console.error("Failed to fetch billing data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleManageBilling = async () => {
    setActionLoading("portal")
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"}/api/billing/portal`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      if (response.ok) {
        const { url } = await response.json()
        window.open(url, "_blank")
      }
    } catch (error) {
      console.error("Failed to open billing portal:", error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleCancelSubscription = async () => {
    if (
      !confirm(
        "Are you sure you want to cancel your subscription? You'll still have access until the end of your billing period.",
      )
    ) {
      return
    }

    setActionLoading("cancel")
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"}/api/cancel-subscription`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      if (response.ok) {
        await fetchBillingData() // Refresh data
        alert("Subscription canceled successfully. You'll retain access until the end of your billing period.")
      }
    } catch (error) {
      console.error("Failed to cancel subscription:", error)
      alert("Failed to cancel subscription. Please try again.")
    } finally {
      setActionLoading(null)
    }
  }

  const getUsagePercentage = (current: number, limit: number | string) => {
    if (limit === "Unlimited" || limit === -1) return 0
    return Math.min((current / (limit as number)) * 100, 100)
  }

  const getStatusBadge = (status: string, cancelAtPeriodEnd: boolean) => {
    if (cancelAtPeriodEnd) {
      return <Badge variant="destructive">Canceling</Badge>
    }

    switch (status) {
      case "active":
        return <Badge className="bg-green-500 text-white">Active</Badge>
      case "trialing":
        return <Badge className="bg-blue-500 text-white">Trial</Badge>
      case "past_due":
        return <Badge variant="destructive">Past Due</Badge>
      case "canceled":
        return <Badge variant="secondary">Canceled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case "pro":
        return (
          <Badge className="bg-primary text-primary-foreground">
            <Crown className="w-3 h-3 mr-1" />
            Pro Plan
          </Badge>
        )
      case "enterprise":
        return (
          <Badge className="bg-accent text-accent-foreground">
            <Zap className="w-3 h-3 mr-1" />
            Enterprise
          </Badge>
        )
      default:
        return <Badge variant="secondary">Free Plan</Badge>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading billing information...</p>
        </div>
      </div>
    )
  }

  const currentPlan = subscription?.plan || "free"
  const planFeatures = PLAN_FEATURES[currentPlan]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button variant="ghost" asChild>
              <a href="/dashboard" className="flex items-center">
                <Video className="w-4 h-4 mr-2" />
                Back to Dashboard
              </a>
            </Button>
            <div className="flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-primary" />
              <span className="text-xl font-bold text-foreground font-[family-name:var(--font-work-sans)]">
                Subscription Management
              </span>
            </div>
            <div className="w-32"></div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="usage">Usage & Limits</TabsTrigger>
              <TabsTrigger value="billing">Billing History</TabsTrigger>
              <TabsTrigger value="plans">Plans & Pricing</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Current Subscription */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center font-[family-name:var(--font-work-sans)]">
                    <Settings className="w-5 h-5 mr-2" />
                    Current Subscription
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-6">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        {getPlanBadge(currentPlan)}
                        {subscription && getStatusBadge(subscription.status, subscription.cancel_at_period_end)}
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        {subscription?.current_period_end && (
                          <p className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            {subscription.cancel_at_period_end ? "Access ends" : "Renews"} on{" "}
                            {new Date(subscription.current_period_end).toLocaleDateString()}
                          </p>
                        )}
                        {subscription?.trial_end && (
                          <p className="flex items-center text-blue-600">
                            <Clock className="w-4 h-4 mr-2" />
                            Trial ends {new Date(subscription.trial_end).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      {currentPlan === "free" ? (
                        <Button asChild>
                          <a href="/pricing">Upgrade Plan</a>
                        </Button>
                      ) : (
                        <>
                          <Button variant="outline" asChild>
                            <a href="/pricing">Change Plan</a>
                          </Button>
                          {subscription && !subscription.cancel_at_period_end && (
                            <Button
                              variant="destructive"
                              onClick={handleCancelSubscription}
                              disabled={actionLoading === "cancel"}
                            >
                              {actionLoading === "cancel" ? "Canceling..." : "Cancel Subscription"}
                            </Button>
                          )}
                        </>
                      )}
                      {subscription && (
                        <Button onClick={handleManageBilling} disabled={actionLoading === "portal"}>
                          <ExternalLink className="w-4 h-4 mr-2" />
                          {actionLoading === "portal" ? "Loading..." : "Manage Billing"}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Plan Features */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-3">Plan Features</h3>
                      <ul className="space-y-2">
                        {planFeatures.features.map((feature, index) => (
                          <li key={index} className="flex items-center text-sm">
                            <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-3">Usage Limits</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Videos per month:</span>
                          <span className="font-medium">{planFeatures.limits.videos}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>AI API calls:</span>
                          <span className="font-medium">{planFeatures.limits.api_calls}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Render minutes:</span>
                          <span className="font-medium">{planFeatures.limits.render_minutes}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Storage:</span>
                          <span className="font-medium">{planFeatures.limits.storage_gb} GB</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Usage Overview */}
              <div className="grid md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center">
                      <Video className="w-4 h-4 mr-2 text-primary" />
                      Videos Created
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold mb-2">
                      {usage?.videos_created || 0} / {planFeatures.limits.videos}
                    </div>
                    <Progress
                      value={getUsagePercentage(usage?.videos_created || 0, planFeatures.limits.videos)}
                      className="h-2"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      {planFeatures.limits.videos === "Unlimited" ? "No limits" : "Resets monthly"}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-accent" />
                      AI API Calls
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold mb-2">
                      {usage?.api_calls || 0} / {planFeatures.limits.api_calls}
                    </div>
                    <Progress
                      value={getUsagePercentage(usage?.api_calls || 0, planFeatures.limits.api_calls)}
                      className="h-2"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      {planFeatures.limits.api_calls === "Unlimited" ? "No limits" : "Resets monthly"}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center">
                      <Volume2 className="w-4 h-4 mr-2 text-primary" />
                      Render Minutes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold mb-2">
                      {usage?.render_minutes || 0} / {planFeatures.limits.render_minutes}
                    </div>
                    <Progress
                      value={getUsagePercentage(usage?.render_minutes || 0, planFeatures.limits.render_minutes)}
                      className="h-2"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      {planFeatures.limits.render_minutes === "Unlimited" ? "No limits" : "Resets monthly"}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="usage" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-[family-name:var(--font-work-sans)] flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Detailed Usage Analytics
                  </CardTitle>
                  <CardDescription>Track your usage across all FilmFusion features</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Video Creation</span>
                        <span className="text-sm text-muted-foreground">
                          {usage?.videos_created || 0} of {planFeatures.limits.videos} used
                        </span>
                      </div>
                      <Progress
                        value={getUsagePercentage(usage?.videos_created || 0, planFeatures.limits.videos)}
                        className="h-3"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>0</span>
                        <span>{planFeatures.limits.videos}</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">AI API Calls</span>
                        <span className="text-sm text-muted-foreground">
                          {usage?.api_calls || 0} of {planFeatures.limits.api_calls} used
                        </span>
                      </div>
                      <Progress
                        value={getUsagePercentage(usage?.api_calls || 0, planFeatures.limits.api_calls)}
                        className="h-3"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>0</span>
                        <span>{planFeatures.limits.api_calls}</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Render Minutes</span>
                        <span className="text-sm text-muted-foreground">
                          {usage?.render_minutes || 0} of {planFeatures.limits.render_minutes} used
                        </span>
                      </div>
                      <Progress
                        value={getUsagePercentage(usage?.render_minutes || 0, planFeatures.limits.render_minutes)}
                        className="h-3"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>0</span>
                        <span>{planFeatures.limits.render_minutes}</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Storage Usage</span>
                        <span className="text-sm text-muted-foreground">
                          {usage?.storage_gb?.toFixed(1) || 0} GB of {planFeatures.limits.storage_gb} GB used
                        </span>
                      </div>
                      <Progress
                        value={getUsagePercentage(usage?.storage_gb || 0, planFeatures.limits.storage_gb)}
                        className="h-3"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>0 GB</span>
                        <span>{planFeatures.limits.storage_gb} GB</span>
                      </div>
                    </div>
                  </div>

                  {/* Usage Tips */}
                  <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-2 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Usage Tips
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Usage resets on the first day of each billing cycle</li>
                      <li>• Upgrade your plan for higher limits and additional features</li>
                      <li>• Overage charges may apply for usage beyond plan limits</li>
                      <li>• Contact support if you need custom limits for your use case</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="billing" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-[family-name:var(--font-work-sans)] flex items-center">
                    <DollarSign className="w-5 h-5 mr-2" />
                    Billing History
                  </CardTitle>
                  <CardDescription>View your payment history and download invoices</CardDescription>
                </CardHeader>
                <CardContent>
                  {billingHistory.length > 0 ? (
                    <div className="space-y-4">
                      {billingHistory.map((payment) => (
                        <div
                          key={payment.id}
                          className="flex items-center justify-between p-4 border border-border rounded-lg"
                        >
                          <div className="flex items-center space-x-4">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                payment.status === "succeeded"
                                  ? "bg-green-500"
                                  : payment.status === "failed"
                                    ? "bg-red-500"
                                    : "bg-yellow-500"
                              }`}
                            ></div>
                            <div>
                              <p className="font-medium">{payment.description}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(payment.created_at).toLocaleDateString()} • $
                                {(payment.amount / 100).toFixed(2)} {payment.currency.toUpperCase()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={payment.status === "succeeded" ? "default" : "destructive"}>
                              {payment.status}
                            </Badge>
                            {payment.invoice_url && (
                              <Button size="sm" variant="outline" asChild>
                                <a href={payment.invoice_url} target="_blank" rel="noopener noreferrer">
                                  <Eye className="w-4 h-4 mr-1" />
                                  View
                                </a>
                              </Button>
                            )}
                            {payment.receipt_url && (
                              <Button size="sm" variant="outline" asChild>
                                <a href={payment.receipt_url} target="_blank" rel="noopener noreferrer">
                                  <Download className="w-4 h-4 mr-1" />
                                  Receipt
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No billing history available</p>
                      <p className="text-sm text-muted-foreground">Your payment history will appear here</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="plans" className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold font-[family-name:var(--font-work-sans)] mb-2">Choose Your Plan</h2>
                <p className="text-muted-foreground">Upgrade or downgrade your subscription at any time</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {Object.entries(PLAN_FEATURES).map(([planKey, plan]) => (
                  <Card
                    key={planKey}
                    className={`relative ${
                      planKey === currentPlan ? "border-primary shadow-lg" : ""
                    } ${planKey === "pro" ? "scale-105" : ""}`}
                  >
                    {planKey === currentPlan && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-primary text-primary-foreground">Current Plan</Badge>
                      </div>
                    )}
                    {planKey === "pro" && planKey !== currentPlan && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-accent text-accent-foreground">Most Popular</Badge>
                      </div>
                    )}

                    <CardHeader className="text-center">
                      <CardTitle className="font-[family-name:var(--font-work-sans)]">{plan.name}</CardTitle>
                      <div className="mt-4">
                        <span className="text-4xl font-bold">${plan.price}</span>
                        <span className="text-muted-foreground">/month</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3 mb-6">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center text-sm">
                            <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                            {feature}
                          </li>
                        ))}
                      </ul>

                      <div className="space-y-2 text-sm text-muted-foreground mb-6">
                        <div className="flex justify-between">
                          <span>Videos:</span>
                          <span>{plan.limits.videos}/month</span>
                        </div>
                        <div className="flex justify-between">
                          <span>API calls:</span>
                          <span>{plan.limits.api_calls}/month</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Render time:</span>
                          <span>{plan.limits.render_minutes} min/month</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Storage:</span>
                          <span>{plan.limits.storage_gb} GB</span>
                        </div>
                      </div>

                      {planKey === currentPlan ? (
                        <Button className="w-full" disabled>
                          Current Plan
                        </Button>
                      ) : planKey === "free" ? (
                        <Button
                          className="w-full bg-transparent"
                          variant="outline"
                          onClick={handleCancelSubscription}
                          disabled={!subscription || actionLoading === "cancel"}
                        >
                          {actionLoading === "cancel" ? "Processing..." : "Downgrade to Free"}
                        </Button>
                      ) : (
                        <Button className="w-full" asChild>
                          <a href={`/pricing/checkout?plan=${planKey}`}>
                            {currentPlan === "free" ? "Upgrade" : "Change Plan"}
                          </a>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
