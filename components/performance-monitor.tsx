"use client"

import { useEffect } from "react"

export function PerformanceMonitor() {
  useEffect(() => {
    // Core Web Vitals monitoring
    const observeWebVitals = () => {
      // Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === "largest-contentful-paint") {
            trackEvent("web_vitals", {
              event_category: "performance",
              event_label: "LCP",
              value: Math.round(entry.startTime),
            })
          }
        }
      })
      lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] })

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === "first-input") {
            trackEvent("web_vitals", {
              event_category: "performance",
              event_label: "FID",
              value: Math.round((entry as any).processingStart - entry.startTime),
            })
          }
        }
      })
      fidObserver.observe({ entryTypes: ["first-input"] })

      // Cumulative Layout Shift (CLS)
      let clsValue = 0
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value
          }
        }
      })
      clsObserver.observe({ entryTypes: ["layout-shift"] })

      // Report CLS on page unload
      window.addEventListener("beforeunload", () => {
        trackEvent("web_vitals", {
          event_category: "performance",
          event_label: "CLS",
          value: Math.round(clsValue * 1000),
        })
      })
    }

    // Error tracking
    const trackErrors = () => {
      window.addEventListener("error", (event) => {
        trackEvent("javascript_error", {
          event_category: "error",
          event_label: event.error?.message || "Unknown error",
          custom_parameter: event.filename,
        })
      })

      window.addEventListener("unhandledrejection", (event) => {
        trackEvent("promise_rejection", {
          event_category: "error",
          event_label: event.reason?.message || "Unhandled promise rejection",
        })
      })
    }

    if (typeof window !== "undefined") {
      observeWebVitals()
      trackErrors()
    }
  }, [])

  return null
}

// Helper function for tracking (defined here to avoid circular imports)
const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, {
      event_category: "engagement",
      event_label: parameters?.label,
      value: parameters?.value,
      ...parameters,
    })
  }
}
