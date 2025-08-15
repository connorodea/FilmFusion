"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Video,
  ArrowLeft,
  Cloud,
  Download,
  Share,
  Clock,
  CheckCircle,
  AlertCircle,
  Settings,
  Zap,
  HardDrive,
  Wifi,
  Instagram,
  Youtube,
  Twitter,
  RefreshCw,
  X,
  Eye,
} from "lucide-react"
import Link from "next/link"

// Sample render jobs data
const sampleRenderJobs = [
  {
    id: "render-1",
    projectName: "Product Launch Video",
    status: "completed",
    progress: 100,
    startTime: "2024-01-15T10:30:00Z",
    completedTime: "2024-01-15T10:45:00Z",
    duration: "2:45",
    format: "MP4",
    resolution: "1920x1080",
    quality: "High",
    fileSize: "245 MB",
    downloadUrl: "/downloads/product-launch-final.mp4",
  },
  {
    id: "render-2",
    projectName: "Educational Course Intro",
    status: "rendering",
    progress: 65,
    startTime: "2024-01-15T11:00:00Z",
    duration: "1:30",
    format: "MP4",
    resolution: "1920x1080",
    quality: "High",
    estimatedTime: "5 minutes remaining",
  },
  {
    id: "render-3",
    projectName: "Company Culture Video",
    status: "queued",
    progress: 0,
    duration: "3:20",
    format: "MP4",
    resolution: "1920x1080",
    quality: "High",
    queuePosition: 2,
  },
  {
    id: "render-4",
    projectName: "Tutorial Series Episode 1",
    status: "failed",
    progress: 0,
    startTime: "2024-01-15T09:15:00Z",
    duration: "4:15",
    format: "MP4",
    resolution: "1920x1080",
    quality: "High",
    error: "Insufficient storage space",
  },
]

const exportPresets = [
  {
    id: "youtube-hd",
    name: "YouTube HD",
    icon: <Youtube className="w-5 h-5" />,
    resolution: "1920x1080",
    format: "MP4",
    quality: "High",
    description: "Optimized for YouTube uploads",
  },
  {
    id: "instagram-story",
    name: "Instagram Story",
    icon: <Instagram className="w-5 h-5" />,
    resolution: "1080x1920",
    format: "MP4",
    quality: "Medium",
    description: "Vertical format for Instagram Stories",
  },
  {
    id: "instagram-feed",
    name: "Instagram Feed",
    icon: <Instagram className="w-5 h-5" />,
    resolution: "1080x1080",
    format: "MP4",
    quality: "Medium",
    description: "Square format for Instagram posts",
  },
  {
    id: "twitter-video",
    name: "Twitter Video",
    icon: <Twitter className="w-5 h-5" />,
    resolution: "1280x720",
    format: "MP4",
    quality: "Medium",
    description: "Optimized for Twitter video posts",
  },
  {
    id: "custom",
    name: "Custom Settings",
    icon: <Settings className="w-5 h-5" />,
    resolution: "Custom",
    format: "Various",
    quality: "Custom",
    description: "Configure your own export settings",
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800 border-green-200"
    case "rendering":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "queued":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "failed":
      return "bg-red-100 text-red-800 border-red-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return <CheckCircle className="w-4 h-4" />
    case "rendering":
      return <RefreshCw className="w-4 h-4 animate-spin" />
    case "queued":
      return <Clock className="w-4 h-4" />
    case "failed":
      return <AlertCircle className="w-4 h-4" />
    default:
      return <Clock className="w-4 h-4" />
  }
}

export default function RenderPage() {
  const [selectedPreset, setSelectedPreset] = useState("youtube-hd")
  const [renderJobs, setRenderJobs] = useState(sampleRenderJobs)
  const [isStartingRender, setIsStartingRender] = useState(false)

  const currentPreset = exportPresets.find((preset) => preset.id === selectedPreset)

  const handleStartRender = async () => {
    setIsStartingRender(true)

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"}/api/start-render`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            project_name: "New Video Project",
            preset: selectedPreset,
            settings: currentPreset
              ? {
                  resolution: currentPreset.resolution,
                  format: currentPreset.format,
                  quality: currentPreset.quality,
                }
              : {},
          }),
        },
      )

      if (!response.ok) {
        throw new Error("Failed to start render")
      }

      const data = await response.json()

      // Add the new render job to the list
      const newJob = {
        id: data.job_id,
        projectName: data.project_name,
        status: "queued" as const,
        progress: 0,
        duration: "2:30",
        format: "MP4",
        resolution: "1920x1080",
        quality: "High",
        queuePosition: 1,
      }
      setRenderJobs((prev) => [newJob, ...prev])
    } catch (error) {
      console.error("Error starting render:", error)
      // Fallback to mock behavior if API fails
      const newJob = {
        id: `render-${Date.now()}`,
        projectName: "New Video Project",
        status: "queued" as const,
        progress: 0,
        duration: "2:30",
        format: "MP4",
        resolution: "1920x1080",
        quality: "High",
        queuePosition: 1,
      }
      setRenderJobs((prev) => [newJob, ...prev])
    } finally {
      setIsStartingRender(false)
    }
  }

  const handleRetryRender = (jobId: string) => {
    setRenderJobs((prev) =>
      prev.map((job) =>
        job.id === jobId ? { ...job, status: "queued" as const, progress: 0, queuePosition: 1 } : job,
      ),
    )
  }

  const handleCancelRender = (jobId: string) => {
    setRenderJobs((prev) => prev.filter((job) => job.id !== jobId))
  }

  // Simulate render progress updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRenderJobs((prev) =>
        prev.map((job) => {
          if (job.status === "rendering" && job.progress < 100) {
            return { ...job, progress: Math.min(100, job.progress + Math.random() * 5) }
          }
          if (job.status === "queued" && Math.random() > 0.8) {
            return { ...job, status: "rendering" as const, progress: 5 }
          }
          return job
        }),
      )
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </Link>
              <div className="w-px h-6 bg-border" />
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Video className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-foreground font-[family-name:var(--font-work-sans)]">
                  FilmFusion Render
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="flex items-center space-x-1">
                <Cloud className="w-3 h-3" />
                <span>Cloud Rendering</span>
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <Cloud className="w-6 h-6 text-primary" />
              <h1 className="text-3xl font-bold text-foreground font-[family-name:var(--font-work-sans)]">
                Cloud Rendering Pipeline
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Export your videos with professional quality using our high-performance cloud infrastructure.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Export Settings */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 font-[family-name:var(--font-work-sans)]">
                    <Settings className="w-5 h-5 text-primary" />
                    <span>Export Settings</span>
                  </CardTitle>
                  <CardDescription>Choose your export format and quality settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Preset Selection */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Export Presets</Label>
                    <div className="space-y-2">
                      {exportPresets.map((preset) => (
                        <Card
                          key={preset.id}
                          className={`cursor-pointer transition-all hover:shadow-sm ${
                            selectedPreset === preset.id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                          onClick={() => setSelectedPreset(preset.id)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center space-x-3">
                              <div
                                className={`p-2 rounded-lg ${
                                  selectedPreset === preset.id ? "bg-primary/10" : "bg-muted"
                                }`}
                              >
                                {preset.icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-sm">{preset.name}</h3>
                                <p className="text-xs text-muted-foreground mt-1">{preset.description}</p>
                                <div className="flex items-center space-x-2 mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    {preset.resolution}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {preset.quality}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Custom Settings */}
                  {selectedPreset === "custom" && (
                    <div className="space-y-4 pt-4 border-t border-border">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label className="text-xs">Resolution</Label>
                          <Select defaultValue="1920x1080">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="3840x2160">4K (3840x2160)</SelectItem>
                              <SelectItem value="1920x1080">HD (1920x1080)</SelectItem>
                              <SelectItem value="1280x720">720p (1280x720)</SelectItem>
                              <SelectItem value="854x480">480p (854x480)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs">Format</Label>
                          <Select defaultValue="mp4">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="mp4">MP4</SelectItem>
                              <SelectItem value="mov">MOV</SelectItem>
                              <SelectItem value="avi">AVI</SelectItem>
                              <SelectItem value="webm">WebM</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Quality</Label>
                        <Select defaultValue="high">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ultra">Ultra (Highest quality)</SelectItem>
                            <SelectItem value="high">High (Recommended)</SelectItem>
                            <SelectItem value="medium">Medium (Balanced)</SelectItem>
                            <SelectItem value="low">Low (Fastest)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {/* Render Estimates */}
                  <div className="space-y-3 pt-4 border-t border-border">
                    <Label className="text-sm font-medium">Render Estimates</Label>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Time</p>
                          <p className="text-muted-foreground text-xs">~8 minutes</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <HardDrive className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Size</p>
                          <p className="text-muted-foreground text-xs">~180 MB</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Start Render Button */}
                  <Button
                    onClick={handleStartRender}
                    disabled={isStartingRender}
                    className="w-full bg-primary hover:bg-primary/90"
                    size="lg"
                  >
                    {isStartingRender ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Starting Render...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Start Cloud Render
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Render Queue & History */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-border shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2 font-[family-name:var(--font-work-sans)]">
                      <Wifi className="w-5 h-5 text-primary" />
                      <span>Render Queue & History</span>
                    </CardTitle>
                    <Badge variant="secondary" className="flex items-center space-x-1">
                      <span>
                        {renderJobs.filter((job) => job.status === "rendering" || job.status === "queued").length}{" "}
                        active
                      </span>
                    </Badge>
                  </div>
                  <CardDescription>Monitor your render jobs and download completed videos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {renderJobs.map((job) => (
                      <Card key={job.id} className="border-border shadow-sm">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="font-semibold text-foreground font-[family-name:var(--font-work-sans)]">
                                {job.projectName}
                              </h3>
                              <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
                                <span>{job.duration}</span>
                                <span>{job.resolution}</span>
                                <span>{job.format}</span>
                                <span>{job.quality} Quality</span>
                              </div>
                            </div>
                            <Badge className={`text-xs ${getStatusColor(job.status)}`}>
                              <span className="flex items-center space-x-1">
                                {getStatusIcon(job.status)}
                                <span className="capitalize">{job.status}</span>
                              </span>
                            </Badge>
                          </div>

                          {/* Progress Bar */}
                          {(job.status === "rendering" || job.status === "completed") && (
                            <div className="mb-3">
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-muted-foreground">
                                  {job.status === "rendering" ? "Rendering..." : "Completed"}
                                </span>
                                <span className="font-medium">{job.progress}%</span>
                              </div>
                              <Progress value={job.progress} className="h-2" />
                              {job.status === "rendering" && job.estimatedTime && (
                                <p className="text-xs text-muted-foreground mt-1">{job.estimatedTime}</p>
                              )}
                            </div>
                          )}

                          {/* Queue Position */}
                          {job.status === "queued" && job.queuePosition && (
                            <div className="mb-3">
                              <p className="text-sm text-muted-foreground">Position {job.queuePosition} in queue</p>
                            </div>
                          )}

                          {/* Error Message */}
                          {job.status === "failed" && job.error && (
                            <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                              <p className="text-sm text-red-800">{job.error}</p>
                            </div>
                          )}

                          {/* Timestamps */}
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                            <div className="flex items-center space-x-4">
                              {job.startTime && <span>Started: {new Date(job.startTime).toLocaleTimeString()}</span>}
                              {job.completedTime && (
                                <span>Completed: {new Date(job.completedTime).toLocaleTimeString()}</span>
                              )}
                            </div>
                            {job.fileSize && <span>{job.fileSize}</span>}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center space-x-2">
                            {job.status === "completed" && (
                              <>
                                <Button size="sm" className="bg-primary hover:bg-primary/90">
                                  <Download className="w-3 h-3 mr-1" />
                                  Download
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Share className="w-3 h-3 mr-1" />
                                  Share
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Eye className="w-3 h-3 mr-1" />
                                  Preview
                                </Button>
                              </>
                            )}
                            {job.status === "failed" && (
                              <Button size="sm" variant="outline" onClick={() => handleRetryRender(job.id)}>
                                <RefreshCw className="w-3 h-3 mr-1" />
                                Retry
                              </Button>
                            )}
                            {(job.status === "queued" || job.status === "rendering") && (
                              <Button size="sm" variant="outline" onClick={() => handleCancelRender(job.id)}>
                                <X className="w-3 h-3 mr-1" />
                                Cancel
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {renderJobs.length === 0 && (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                          <Cloud className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2 font-[family-name:var(--font-work-sans)]">
                          No render jobs yet
                        </h3>
                        <p className="text-muted-foreground">Start your first cloud render to see it appear here</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
