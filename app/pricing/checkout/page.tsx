"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, ArrowLeft, Check, CreditCard } from "lucide-react"
import { loadStripe } from "@stripe/stripe-js"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

const plans = {
  pro: {
    name: "Pro",
    price: 29,
    description: "Perfect for serious content creators",
    features: [
      "50 videos per month",
      "4K video quality",
      "Premium AI voices",
      "Advanced templates",
      "Priority rendering",
      "Email support",
    ],
  },
  enterprise: {
    name: "Enterprise",
    price: 99,
    description: "For teams and agencies",
    features: [
      "Unlimited videos",
      "4K video quality",
      "Custom AI voice cloning",
      "Custom templates",
      "Team collaboration",
      "Priority support",
      "API access",
    ],
  },
}

export default function CheckoutPage() {
  const searchParams = useSearchParams()
  const planType = searchParams.get("plan") as keyof typeof plans
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const plan = plans[planType]

  useEffect(() => {
    if (!plan) {
      window.location.href = "/pricing"
    }
  }, [plan])

  const handleCheckout = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"}/api/create-checkout-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            plan: planType,
            success_url: `${window.location.origin}/dashboard?checkout=success`,
            cancel_url: `${window.location.origin}/pricing/checkout?plan=${planType}`,
          }),
        },
      )

      if (!response.ok) {
        throw new Error("Failed to create checkout session")
      }

      const { checkout_url } = await response.json()
      window.location.href = checkout_url
    } catch (err) {
      setError("Failed to start checkout. Please try again.")
      console.error("Checkout error:", err)
    } finally {
      setLoading(false)
    }
  }

  if (!plan) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button variant="ghost" asChild>
              <a href="/pricing" className="flex items-center">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Pricing
              </a>
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground font-[family-name:var(--font-work-sans)]">
                FilmFusion Checkout
              </span>
            </div>
            <div className="w-24"></div>
          </div>
        </div>
      </header>

      {/* Checkout Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-4 font-[family-name:var(--font-work-sans)]">
              Complete Your Subscription
            </h1>
            <p className="text-muted-foreground">
              You're about to subscribe to the {plan.name} plan. Review your selection below.
            </p>
          </div>

          <Card className="border-border shadow-lg">
            <CardHeader className="text-center pb-6">
              <div className="flex items-center justify-center mb-4">
                <Badge className="bg-primary text-primary-foreground px-4 py-1">{plan.name} Plan</Badge>
              </div>
              <CardTitle className="text-2xl font-bold font-[family-name:var(--font-work-sans)]">
                ${plan.price}/month
              </CardTitle>
              <CardDescription className="text-lg">{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold text-foreground mb-4 font-[family-name:var(--font-work-sans)]">
                  What's included:
                </h3>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {error && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-destructive text-sm">{error}</p>
                </div>
              )}

              <div className="border-t border-border pt-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold">${plan.price}.00</span>
                </div>
                <div className="flex items-center justify-between mb-6">
                  <span className="font-semibold text-foreground">Total (monthly)</span>
                  <span className="text-2xl font-bold text-foreground">${plan.price}.00</span>
                </div>

                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-lg py-6"
                  onClick={handleCheckout}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5 mr-2" />
                      Subscribe to {plan.name}
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  Secure payment powered by Stripe. Cancel anytime.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
