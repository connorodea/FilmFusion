"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs"
import { Badge } from "../../../components/ui/badge"
import { Progress } from "../../../components/ui/progress"
import { Users, Video, Clock, Target, Eye, MousePointer, Zap } from "lucide-react"

export default function AnalyticsDashboard() {
  const t = useTranslations("analytics")
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate fetching analytics data
    const fetchAnalytics = async () => {
      try {
        // In a real app, this would fetch from your analytics API
        const mockData = {
          overview: {
            totalUsers: 12543,
            activeUsers: 3421,
            videosCreated: 8765,
            conversionRate: 3.2,
            avgSessionDuration: 245,
            bounceRate: 42.1,
          },
          traffic: {
            organic: 45.2,
            direct: 23.8,
            social: 18.5,
            paid: 12.5,
          },
          features: {
            scriptGenerator: { usage: 89.3, satisfaction: 4.6 },
            voiceover: { usage: 76.8, satisfaction: 4.4 },
            videoEditor: { usage: 92.1, satisfaction: 4.7 },
            aiAssistant: { usage: 67.2, satisfaction: 4.3 },
          },
          conversions: {
            signups: 234,
            trials: 156,
            subscriptions: 89,
            upgrades: 23,
          },
        }

        setAnalyticsData(mockData)
      } catch (error) {
        console.error("Failed to fetch analytics:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData?.overview.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12.5% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Videos Created</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData?.overview.videosCreated.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+8.2% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData?.overview.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">+0.3% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Session</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.floor(analyticsData?.overview.avgSessionDuration / 60)}m{" "}
              {analyticsData?.overview.avgSessionDuration % 60}s
            </div>
            <p className="text-xs text-muted-foreground">+15s from last month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="traffic">Traffic Sources</TabsTrigger>
          <TabsTrigger value="features">Feature Usage</TabsTrigger>
          <TabsTrigger value="conversions">Conversions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>User Engagement</CardTitle>
                <CardDescription>Key engagement metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Bounce Rate</span>
                  <span className="text-sm font-medium">{analyticsData?.overview.bounceRate}%</span>
                </div>
                <Progress value={analyticsData?.overview.bounceRate} className="h-2" />

                <div className="flex items-center justify-between">
                  <span className="text-sm">Active Users</span>
                  <span className="text-sm font-medium">{analyticsData?.overview.activeUsers.toLocaleString()}</span>
                </div>
                <Progress
                  value={(analyticsData?.overview.activeUsers / analyticsData?.overview.totalUsers) * 100}
                  className="h-2"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Core Web Vitals and performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Page Load Speed
                  </span>
                  <Badge variant="secondary">Good</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    LCP Score
                  </span>
                  <Badge variant="secondary">2.1s</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm flex items-center gap-2">
                    <MousePointer className="h-4 w-4" />
                    FID Score
                  </span>
                  <Badge variant="secondary">45ms</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="traffic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Traffic Sources</CardTitle>
              <CardDescription>Where your users are coming from</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(analyticsData?.traffic || {}).map(([source, percentage]) => (
                <div key={source} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm capitalize">{source}</span>
                    <span className="text-sm font-medium">{percentage}%</span>
                  </div>
                  <Progress value={percentage as number} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(analyticsData?.features || {}).map(([feature, data]: [string, any]) => (
              <Card key={feature}>
                <CardHeader>
                  <CardTitle className="capitalize">{feature.replace(/([A-Z])/g, " $1").trim()}</CardTitle>
                  <CardDescription>Usage and satisfaction metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Usage Rate</span>
                      <span className="text-sm font-medium">{data.usage}%</span>
                    </div>
                    <Progress value={data.usage} className="h-2" />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Satisfaction</span>
                    <Badge variant="secondary">{data.satisfaction}/5.0</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="conversions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conversion Funnel</CardTitle>
              <CardDescription>User journey and conversion metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(analyticsData?.conversions || {}).map(([stage, count]) => (
                <div key={stage} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium capitalize">{stage}</h4>
                    <p className="text-sm text-muted-foreground">This month</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{count as number}</div>
                    <div className="text-sm text-green-600">+12%</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
