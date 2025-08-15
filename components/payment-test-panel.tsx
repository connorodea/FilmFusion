"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TestTube, CheckCircle, XCircle, Clock, CreditCard, User, Database, AlertTriangle } from "lucide-react"

interface TestResult {
  id: string
  name: string
  status: "pending" | "success" | "error"
  message: string
  timestamp: Date
}

export default function PaymentTestPanel() {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [testEmail, setTestEmail] = useState("test@example.com")
  const [testPassword, setTestPassword] = useState("TestPass123!")

  const addTestResult = (name: string, status: "success" | "error", message: string) => {
    const result: TestResult = {
      id: Date.now().toString(),
      name,
      status,
      message,
      timestamp: new Date(),
    }
    setTestResults((prev) => [...prev, result])
  }

  const runTest = async (testName: string, testFn: () => Promise<void>) => {
    addTestResult(testName, "success", "Starting test...")
    try {
      await testFn()
      addTestResult(testName, "success", "Test completed successfully")
    } catch (error) {
      addTestResult(testName, "error", error instanceof Error ? error.message : "Test failed")
    }
  }

  const testUserRegistration = async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"}/api/auth/register`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: "Test User",
          username: `testuser${Date.now()}`,
          email: `test${Date.now()}@example.com`,
          password: testPassword,
        }),
      },
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Registration failed: ${error.detail}`)
    }

    const data = await response.json()
    if (!data.success) {
      throw new Error("Registration response indicates failure")
    }

    // Store token for subsequent tests
    localStorage.setItem("test_token", data.access_token)
  }

  const testUserLogin = async () => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Login failed: ${error.detail}`)
    }

    const data = await response.json()
    if (!data.success) {
      throw new Error("Login response indicates failure")
    }
  }

  const testCheckoutSession = async () => {
    const token = localStorage.getItem("test_token") || localStorage.getItem("token")
    if (!token) {
      throw new Error("No auth token available")
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"}/api/create-checkout-session`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          plan: "pro",
          success_url: `${window.location.origin}/dashboard?payment=success`,
          cancel_url: `${window.location.origin}/pricing?payment=canceled`,
        }),
      },
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Checkout session creation failed: ${error.detail}`)
    }

    const data = await response.json()
    if (!data.success || !data.checkout_url) {
      throw new Error("Checkout session response missing URL")
    }
  }

  const testUsageEndpoint = async () => {
    const token = localStorage.getItem("test_token") || localStorage.getItem("token")
    if (!token) {
      throw new Error("No auth token available")
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"}/api/usage`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Usage endpoint failed: ${error.detail}`)
    }

    const data = await response.json()
    if (!data.success || !data.usage) {
      throw new Error("Usage response missing data")
    }
  }

  const testWebhookEndpoint = async () => {
    // Test webhook endpoint accessibility (without signature for basic connectivity)
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"}/api/stripe-webhook`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ test: "connectivity" }),
      },
    )

    // We expect a 400 (invalid signature) which means the endpoint is accessible
    if (response.status !== 400) {
      throw new Error(`Webhook endpoint returned unexpected status: ${response.status}`)
    }
  }

  const runAllTests = async () => {
    setIsRunning(true)
    setTestResults([])

    const tests = [
      { name: "User Registration", fn: testUserRegistration },
      { name: "User Login", fn: testUserLogin },
      { name: "Checkout Session Creation", fn: testCheckoutSession },
      { name: "Usage Endpoint", fn: testUsageEndpoint },
      { name: "Webhook Endpoint Connectivity", fn: testWebhookEndpoint },
    ]

    for (const test of tests) {
      await runTest(test.name, test.fn)
      // Small delay between tests
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    setIsRunning(false)
  }

  const clearResults = () => {
    setTestResults([])
  }

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "error":
        return <XCircle className="w-4 h-4 text-red-500" />
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center font-[family-name:var(--font-work-sans)]">
            <TestTube className="w-5 h-5 mr-2" />
            Payment System Test Panel
          </CardTitle>
          <CardDescription>
            Test the complete FilmFusion payment flow including authentication, subscriptions, and webhooks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="quick-test" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="quick-test">Quick Test</TabsTrigger>
              <TabsTrigger value="manual-test">Manual Tests</TabsTrigger>
              <TabsTrigger value="results">Test Results</TabsTrigger>
            </TabsList>

            <TabsContent value="quick-test" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="test-email">Test Email</Label>
                  <Input
                    id="test-email"
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="test@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="test-password">Test Password</Label>
                  <Input
                    id="test-password"
                    type="password"
                    value={testPassword}
                    onChange={(e) => setTestPassword(e.target.value)}
                    placeholder="TestPass123!"
                  />
                </div>
              </div>

              <div className="flex space-x-4">
                <Button onClick={runAllTests} disabled={isRunning} className="flex-1">
                  {isRunning ? "Running Tests..." : "Run All Tests"}
                </Button>
                <Button variant="outline" onClick={clearResults}>
                  Clear Results
                </Button>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="p-4">
                  <div className="flex items-center space-x-2">
                    <User className="w-5 h-5 text-blue-500" />
                    <span className="font-medium">Authentication</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Registration & login flow</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="w-5 h-5 text-green-500" />
                    <span className="font-medium">Payment Processing</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Stripe integration</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center space-x-2">
                    <Database className="w-5 h-5 text-purple-500" />
                    <span className="font-medium">Data Management</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Usage tracking & limits</p>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="manual-test" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  onClick={() => runTest("User Registration", testUserRegistration)}
                  disabled={isRunning}
                >
                  Test Registration
                </Button>
                <Button variant="outline" onClick={() => runTest("User Login", testUserLogin)} disabled={isRunning}>
                  Test Login
                </Button>
                <Button
                  variant="outline"
                  onClick={() => runTest("Checkout Session", testCheckoutSession)}
                  disabled={isRunning}
                >
                  Test Checkout
                </Button>
                <Button
                  variant="outline"
                  onClick={() => runTest("Usage Endpoint", testUsageEndpoint)}
                  disabled={isRunning}
                >
                  Test Usage API
                </Button>
                <Button
                  variant="outline"
                  onClick={() => runTest("Webhook Connectivity", testWebhookEndpoint)}
                  disabled={isRunning}
                >
                  Test Webhooks
                </Button>
              </div>

              <Card className="p-4 bg-yellow-50 border-yellow-200">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Manual Testing Notes</h4>
                    <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                      <li>• Use Stripe test cards: 4242 4242 4242 4242 (success)</li>
                      <li>• Use 4000 0000 0000 0002 for declined payments</li>
                      <li>• Check Railway logs for webhook processing</li>
                      <li>• Verify email notifications in your inbox</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="results" className="space-y-4">
              {testResults.length === 0 ? (
                <div className="text-center py-8">
                  <TestTube className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No test results yet</p>
                  <p className="text-sm text-muted-foreground">Run some tests to see results here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {testResults.map((result) => (
                    <Card key={result.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          {getStatusIcon(result.status)}
                          <div>
                            <h4 className="font-medium">{result.name}</h4>
                            <p className="text-sm text-muted-foreground">{result.message}</p>
                          </div>
                        </div>
                        <Badge variant={result.status === "success" ? "default" : "destructive"}>{result.status}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">{result.timestamp.toLocaleTimeString()}</p>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
