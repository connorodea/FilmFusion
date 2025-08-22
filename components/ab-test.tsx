"use client"

import { useEffect, useState, type ReactNode } from "react"

interface ABTestProps {
  testName: string
  variants: {
    name: string
    component: ReactNode
    weight?: number
  }[]
  children?: ReactNode
}

export function ABTest({ testName, variants, children }: ABTestProps) {
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null)

  useEffect(() => {
    // Check if user already has a variant assigned
    const storageKey = `ab_test_${testName}`
    const existingVariant = localStorage.getItem(storageKey)

    if (existingVariant && variants.find((v) => v.name === existingVariant)) {
      setSelectedVariant(existingVariant)
      return
    }

    // Assign new variant based on weights
    const totalWeight = variants.reduce((sum, variant) => sum + (variant.weight || 1), 0)
    const random = Math.random() * totalWeight

    let currentWeight = 0
    for (const variant of variants) {
      currentWeight += variant.weight || 1
      if (random <= currentWeight) {
        setSelectedVariant(variant.name)
        localStorage.setItem(storageKey, variant.name)

        // Track variant assignment
        if (typeof window !== "undefined" && window.gtag) {
          window.gtag("event", "ab_test_assignment", {
            event_category: "ab_testing",
            event_label: testName,
            custom_parameter: variant.name,
          })
        }
        break
      }
    }
  }, [testName, variants])

  if (!selectedVariant) {
    return <>{children}</>
  }

  const variant = variants.find((v) => v.name === selectedVariant)
  return <>{variant?.component || children}</>
}

// Hook for tracking A/B test conversions
export function useABTestConversion(testName: string) {
  return (conversionEvent: string, value?: number) => {
    const storageKey = `ab_test_${testName}`
    const variant = localStorage.getItem(storageKey)

    if (variant && typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "ab_test_conversion", {
        event_category: "ab_testing",
        event_label: testName,
        custom_parameter: variant,
        conversion_event: conversionEvent,
        value: value,
      })
    }
  }
}
