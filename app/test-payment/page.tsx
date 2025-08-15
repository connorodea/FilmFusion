"use client"

import PaymentTestPanel from "@/components/payment-test-panel"

export default function TestPaymentPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold text-foreground font-[family-name:var(--font-work-sans)]">
                FilmFusion Payment Testing
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/PAYMENT_TESTING_GUIDE.md"
                target="_blank"
                className="text-sm text-muted-foreground hover:text-foreground"
                rel="noreferrer"
              >
                Testing Guide
              </a>
              <a href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
                Dashboard
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="py-8">
        <PaymentTestPanel />
      </main>
    </div>
  )
}
