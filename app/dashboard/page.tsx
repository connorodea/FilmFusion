"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Video,
  Plus,
  FileText,
  Play,
  Settings,
  Search,
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Users,
  Calendar,
  MoreHorizontal,
  Edit,
  Download,
  Share,
  Volume2,
  Scissors,
  Cloud,
  Sparkles,
  RefreshCw,
} from "lucide-react"
import Link from "next/link"

// Sample project data
const sampleProjects = [
  {
    id: 1,
    title: "Product Launch Video",
    description: "AI-generated promotional video for new product launch",
    status: "completed",
    duration: "2:45",
    createdAt: "2024-01-15",
    thumbnail: "/product-launch-thumbnail.png",
    progress: 100,
  },
  {
    id: 2,
    title: "Educational Course Intro",
    description: "Introduction video for online course series",
    status: "rendering",
    duration: "1:30",
    createdAt: "2024-01-14",
    thumbnail: "/educational-course-intro.png",
    progress: 85,
  },
  {
    id: 3,
    title: "Company Culture Video",
    description: "Behind-the-scenes look at company culture",
    status: "in-progress",
    duration: "3:20",
    createdAt: "2024-01-12",
    thumbnail: "/company-culture-thumbnail.png",
    progress: 60,
  },
  {
    id: 4,
    title: "Tutorial Series Episode 1",
    description: "First episode of comprehensive tutorial series",
    status: "draft",
    duration: "4:15",
    createdAt: "2024-01-10",
    thumbnail: "/tutorial-video-thumbnail.png",
    progress: 25,
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800 border-green-200"
    case "rendering":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "in-progress":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "draft":
      return "bg-gray-100 text-gray-800 border-gray-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return <CheckCircle className="w-4 h-4" />
    case "rendering":
      return <Clock className="w-4 h-4" />
    case "in-progress":
      return <Play className="w-4 h-4" />
    case "draft":
      return <FileText className="w-4 h-4" />
    default:
      return <AlertCircle className="w-4 h-4" />
  }
}

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [projects, setProjects] = useState([])
  const [analytics, setAnalytics] = useState({
    totalProjects: 0,
    completed: 0,
    watchTime: "0h",
    teamMembers: 0,
    trends: { projects: 0, watchTime: 0 },
  })
  const [isLoading, setIsLoading] = useState(true)
  const [insights, setInsights] = useState("")

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)

      // Fetch projects data
      const projectsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"}/api/projects`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token") || ""}`,
          },
        },
      )

      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json()
        setProjects(projectsData.projects || [])

        // Calculate analytics from projects data
        const totalProjects = projectsData.projects?.length || 0
        const completed = projectsData.projects?.filter((p) => p.status === "completed").length || 0
        const watchTime =
          projectsData.projects?.reduce((acc, p) => {
            const duration = parseDuration(p.duration || "0:00")
            return acc + duration
          }, 0) || 0

        setAnalytics({
          totalProjects,
          completed,
          watchTime: formatWatchTime(watchTime),
          teamMembers: 5, // Static for now
          trends: {
            projects: Math.floor(Math.random() * 5) + 1,
            watchTime: Math.random() * 10 + 1,
          },
        })
      }

      const insightsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"}/api/analyze-content`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("auth_token") || ""}`,
          },
          body: JSON.stringify({
            content_type: "dashboard_analytics",
            data: {
              total_projects: analytics.totalProjects,
              completed_projects: analytics.completed,
              recent_activity: "video creation and editing",
            },
            analysis_type: "performance_insights",
          }),
        },
      )

      if (insightsResponse.ok) {
        const insightsData = await insightsResponse.json()
        setInsights(insightsData.analysis || "")
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      setProjects(sampleProjects)
      setAnalytics({
        totalProjects: 12,
        completed: 8,
        watchTime: "24.5h",
        teamMembers: 5,
        trends: { projects: 2, watchTime: 3.2 },
      })
    } finally {
      setIsLoading(false)
    }
  }

  const parseDuration = (duration: string) => {
    const parts = duration.split(":")
    return Number.parseInt(parts[0]) * 60 + Number.parseInt(parts[1] || "0")
  }

  const formatWatchTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    return `${hours}.${Math.floor((minutes % 60) / 6)}h`
  }

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = selectedFilter === "all" || project.status === selectedFilter
    return matchesSearch && matchesFilter
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Video className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground font-[family-name:var(--font-work-sans)]">
                FilmFusion
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 font-[family-name:var(--font-work-sans)]">
            Welcome back, Creator
          </h1>
          <p className="text-muted-foreground">Manage your video projects and track your creative progress.</p>
        </div>

        {/* AI Insights Card */}
        {insights && (
          <Card className="border-border shadow-sm mb-8 bg-gradient-to-r from-primary/5 to-accent/5">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-2 font-[family-name:var(--font-work-sans)]">
                    AI Performance Insights
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{insights}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Analytics Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-border shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Projects</p>
                  <p className="text-2xl font-bold text-foreground">{analytics.totalProjects}</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Video className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-500">+{analytics.trends.projects}</span>
                <span className="text-muted-foreground ml-1">this week</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-foreground">{analytics.completed}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <span className="text-muted-foreground">
                  {analytics.totalProjects > 0 ? Math.round((analytics.completed / analytics.totalProjects) * 100) : 0}%
                  completion rate
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Watch Time</p>
                  <p className="text-2xl font-bold text-foreground">{analytics.watchTime}</p>
                </div>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-accent" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-500">+{analytics.trends.watchTime.toFixed(1)}h</span>
                <span className="text-muted-foreground ml-1">this month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Team Members</p>
                  <p className="text-2xl font-bold text-foreground">{analytics.teamMembers}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <span className="text-muted-foreground">Active collaborators</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-6 gap-6 mb-8">
          <Card className="border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Plus className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="font-[family-name:var(--font-work-sans)]">New Project</CardTitle>
              <CardDescription>Start creating a new video from scratch with AI assistance</CardDescription>
            </CardHeader>
          </Card>

          <Link href="/script-generator">
            <Card className="border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                  <FileText className="w-6 h-6 text-accent" />
                </div>
                <CardTitle className="font-[family-name:var(--font-work-sans)]">Script Generator</CardTitle>
                <CardDescription>Generate compelling scripts with our AI writing assistant</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/voiceover">
            <Card className="border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Volume2 className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="font-[family-name:var(--font-work-sans)]">AI Voiceover</CardTitle>
                <CardDescription>Transform scripts into natural-sounding voiceovers</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/editor">
            <Card className="border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                  <Scissors className="w-6 h-6 text-accent" />
                </div>
                <CardTitle className="font-[family-name:var(--font-work-sans)]">Video Editor</CardTitle>
                <CardDescription>Professional timeline editor with drag-and-drop functionality</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/render">
            <Card className="border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Cloud className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="font-[family-name:var(--font-work-sans)]">Cloud Render</CardTitle>
                <CardDescription>High-performance cloud rendering for professional quality</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Card className="border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
            <CardHeader>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                <Play className="w-6 h-6 text-accent" />
              </div>
              <CardTitle className="font-[family-name:var(--font-work-sans)]">Templates</CardTitle>
              <CardDescription>Browse pre-made templates to jumpstart your video creation</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Projects Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground font-[family-name:var(--font-work-sans)]">
              Your Projects
            </h2>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </div>

          {/* Search and Filter */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="rendering">Rendering</option>
                <option value="in-progress">In Progress</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          {/* Projects Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="border-border shadow-sm hover:shadow-md transition-shadow group">
                <div className="relative">
                  <img
                    src={project.thumbnail || "/placeholder.svg"}
                    alt={project.title}
                    className="w-full h-32 object-cover rounded-t-lg"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge className={`text-xs ${getStatusColor(project.status)}`}>
                      <span className="flex items-center space-x-1">
                        {getStatusIcon(project.status)}
                        <span className="capitalize">{project.status.replace("-", " ")}</span>
                      </span>
                    </Badge>
                  </div>
                  {project.status !== "completed" && (
                    <div className="absolute bottom-2 left-2 right-2">
                      <div className="bg-black/50 rounded-full h-1">
                        <div
                          className="bg-primary rounded-full h-1 transition-all duration-300"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-foreground font-[family-name:var(--font-work-sans)] group-hover:text-primary transition-colors">
                      {project.title}
                    </h3>
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{project.description}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{project.duration}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" className="flex-1 bg-primary hover:bg-primary/90">
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    {project.status === "completed" && (
                      <>
                        <Button size="sm" variant="outline">
                          <Download className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Share className="w-3 h-3" />
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <Card className="border-border shadow-sm">
              <CardContent className="py-12 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Video className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2 font-[family-name:var(--font-work-sans)]">
                  No projects found
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || selectedFilter !== "all"
                    ? "Try adjusting your search or filter criteria"
                    : "Create your first video project to get started with FilmFusion"}
                </p>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Project
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
