"use client"

import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"

declare global {
  interface Window {
    gtag: (command: string, targetId: string, config?: any) => void
    dataLayer: any[]
  }
}

// Google Analytics 4
export function GoogleAnalytics({ measurementId }: { measurementId: string }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!measurementId) return

    // Initialize gtag
    window.dataLayer = window.dataLayer || []
    window.gtag = function gtag() {
      window.dataLayer.push(arguments)
    }
    window.gtag("js", new Date())
    window.gtag("config", measurementId, {
      page_path: pathname,
      custom_map: { custom_parameter: "value" },
    })
  }, [measurementId])

  useEffect(() => {
    if (!measurementId) return

    const url = pathname + searchParams.toString()
    window.gtag("config", measurementId, {
      page_path: url,
    })
  }, [pathname, searchParams, measurementId])

  if (!measurementId) return null

  return (
    <>
      <script async src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${measurementId}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
    </>
  )
}

// Event tracking utilities
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, {
      event_category: "engagement",
      event_label: parameters?.label,
      value: parameters?.value,
      ...parameters,
    })
  }
}

// Conversion tracking
export const trackConversion = (conversionType: string, value?: number, currency = "USD") => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "conversion", {
      send_to: process.env.NEXT_PUBLIC_GA_CONVERSION_ID,
      event_category: "conversion",
      event_label: conversionType,
      value: value,
      currency: currency,
    })
  }
}

// User behavior tracking
export const trackUserBehavior = (action: string, category: string, label?: string) => {
  trackEvent("user_behavior", {
    event_category: category,
    event_label: label,
    custom_parameter: action,
  })
}

// AI feature usage tracking
export const trackAIFeature = (feature: string, usage_type: string, success: boolean) => {
  trackEvent("ai_feature_usage", {
    event_category: "ai_features",
    event_label: feature,
    custom_parameter: usage_type,
    success: success,
  })
}

// Video creation tracking
export const trackVideoCreation = (stage: string, duration?: number) => {
  trackEvent("video_creation", {
    event_category: "video_workflow",
    event_label: stage,
    value: duration,
  })
}

// Subscription tracking
export const trackSubscription = (action: string, plan: string, value?: number) => {
  trackEvent("subscription", {
    event_category: "subscription",
    event_label: `${action}_${plan}`,
    value: value,
  })

  if (action === "purchase") {
    trackConversion("subscription_purchase", value)
  }
}
