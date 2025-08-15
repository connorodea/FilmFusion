"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { AlertTriangle, Shield, Eye, Ban, CheckCircle, Flag, Scan } from "lucide-react"

interface ModerationStats {
  total_reports: number
  pending_reports: number
  resolved_reports: number
  resolution_rate: number
  total_flags: number
  active_flags: number
  total_actions: number
  active_actions: number
}

interface ContentReport {
  id: number
  report_type: string
  content_id: number
  content_type: string
  reason: string
  description: string
  severity: string
  status: string
  reporter: string
  reviewed_by: string
  resolution: string
  resolution_notes: string
  created_at: string
  reviewed_at: string
  content_details?: {
    title?: string
    description?: string
    owner?: string
    username?: string
    email?: string
  }
}

interface ContentFlag {
  id: number
  content_type: string
  content_id: number
  flag_type: string
  flag_reason: string
  confidence_score: number
  status: string
  flagged_by_system: string
  flagged_by_user: string
  created_at: string
  content_preview?: {
    title: string
    description: string
  }
}

interface ModerationAction {
  id: number
  action_type: string
  target_type: string
  target_id: number
  reason: string
  description: string
  severity: string
  status: string
  moderator: string
  expires_at: string
  created_at: string
}

export default function ModerationDashboard() {
  const [stats, setStats] = useState<ModerationStats | null>(null)
  const [reports, setReports] = useState<ContentReport[]>([])
  const [flags, setFlags] = useState<ContentFlag[]>([])
  const [actions, setActions] = useState<ModerationAction[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState<ContentReport | null>(null)
  const [resolutionForm, setResolutionForm] = useState({
    status: "",
    resolution: "",
    resolution_notes: "",
    suspension_duration: 24,
  })

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

  useEffect(() => {
    fetchModerationData()
  }, [])

  const fetchModerationData = async () => {
    try {
      const token = localStorage.getItem("token")

      // Fetch reports
      const reportsResponse = await fetch(`${backendUrl}/api/admin/moderation/reports`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (reportsResponse.ok) {
        const reportsData = await reportsResponse.json()
        setReports(reportsData.reports)
        setStats(reportsData.stats)
      }

      // Fetch flags
      const flagsResponse = await fetch(`${backendUrl}/api/admin/moderation/flags`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (flagsResponse.ok) {
        const flagsData = await flagsResponse.json()
        setFlags(flagsData.flags)
      }

      // Fetch actions
      const actionsResponse = await fetch(`${backendUrl}/api/admin/moderation/actions`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (actionsResponse.ok) {
        const actionsData = await actionsResponse.json()
        setActions(actionsData.actions)
      }
    } catch (error) {
      console.error("Failed to fetch moderation data:", error)
    } finally {
      setLoading(false)
    }
  }

  const resolveReport = async (reportId: number) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${backendUrl}/api/admin/moderation/reports/${reportId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(resolutionForm),
      })

      if (response.ok) {
        setSelectedReport(null)
        setResolutionForm({
          status: "",
          resolution: "",
          resolution_notes: "",
          suspension_duration: 24,
        })
        fetchModerationData()
      }
    } catch (error) {
      console.error("Failed to resolve report:", error)
    }
  }

  const scanContent = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${backendUrl}/api/admin/moderation/scan-content`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content_type: "all", limit: 100 }),
      })

      if (response.ok) {
        const data = await response.json()
        alert(`Scan complete: ${data.scanned_count} items scanned, ${data.flagged_count} flagged`)
        fetchModerationData()
      }
    } catch (error) {
      console.error("Failed to scan content:", error)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-blue-100 text-blue-800"
      case "under_review":
        return "bg-yellow-100 text-yellow-800"
      case "resolved":
        return "bg-green-100 text-green-800"
      case "dismissed":
        return "bg-gray-100 text-gray-800"
      case "active":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-slate-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Content Moderation</h1>
            <p className="text-slate-600 mt-1">Monitor and moderate platform content</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button onClick={scanContent} variant="outline" className="flex items-center space-x-2 bg-transparent">
              <Scan className="h-4 w-4" />
              <span>Scan Content</span>
            </Button>
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-red-500" />
              <span className="text-sm font-medium text-slate-700">Content Moderator</span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pending_reports}</div>
                <p className="text-xs text-muted-foreground">{stats.total_reports} total reports</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Flags</CardTitle>
                <Flag className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.active_flags}</div>
                <p className="text-xs text-muted-foreground">{stats.total_flags} total flags</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Actions</CardTitle>
                <Ban className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.active_actions}</div>
                <p className="text-xs text-muted-foreground">{stats.total_actions} total actions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.resolution_rate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">{stats.resolved_reports} resolved</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Tabs defaultValue="reports" className="space-y-6">
          <TabsList>
            <TabsTrigger value="reports">Content Reports</TabsTrigger>
            <TabsTrigger value="flags">AI Flags</TabsTrigger>
            <TabsTrigger value="actions">Moderation Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Reports</CardTitle>
                <CardDescription>Review and resolve user-reported content</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div key={report.id} className="border rounded-lg p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="font-medium">Report #{report.id}</span>
                            <Badge className={getStatusColor(report.status)}>{report.status.replace("_", " ")}</Badge>
                            <Badge className={getSeverityColor(report.severity)}>{report.severity}</Badge>
                            <Badge variant="outline">{report.content_type}</Badge>
                          </div>
                          <h3 className="font-medium mb-1">Reason: {report.reason}</h3>
                          {report.description && <p className="text-sm text-slate-600 mb-2">{report.description}</p>}
                          {report.content_details && (
                            <div className="text-sm text-slate-600 bg-slate-50 p-2 rounded mb-2">
                              <strong>Content:</strong>{" "}
                              {report.content_details.title || report.content_details.username}
                              {report.content_details.description && (
                                <p className="mt-1">{report.content_details.description}</p>
                              )}
                            </div>
                          )}
                          <div className="text-xs text-slate-500">
                            Reported by: {report.reporter} • {new Date(report.created_at).toLocaleDateString()}
                            {report.reviewed_by && <span> • Reviewed by: {report.reviewed_by}</span>}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {report.status === "pending" && (
                            <Button
                              size="sm"
                              onClick={() => setSelectedReport(report)}
                              className="bg-cyan-600 hover:bg-cyan-700"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Review
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="flags" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Content Flags</CardTitle>
                <CardDescription>Review automatically flagged content</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {flags.map((flag) => (
                    <div key={flag.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="font-medium">Flag #{flag.id}</span>
                            <Badge className={getStatusColor(flag.status)}>{flag.status}</Badge>
                            <Badge variant="outline">{flag.flag_type}</Badge>
                            <Badge variant="outline">{(flag.confidence_score * 100).toFixed(1)}% confidence</Badge>
                          </div>
                          <h3 className="font-medium mb-1">Reason: {flag.flag_reason}</h3>
                          {flag.content_preview && (
                            <div className="text-sm text-slate-600 bg-slate-50 p-2 rounded mb-2">
                              <strong>{flag.content_preview.title}</strong>
                              <p className="mt-1">{flag.content_preview.description}</p>
                            </div>
                          )}
                          <div className="text-xs text-slate-500">
                            Flagged by: {flag.flagged_by_system || flag.flagged_by_user} •
                            {new Date(flag.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Moderation Actions</CardTitle>
                <CardDescription>Track all moderation actions taken</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {actions.map((action) => (
                    <div key={action.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="font-medium">Action #{action.id}</span>
                            <Badge className={getStatusColor(action.status)}>{action.status}</Badge>
                            <Badge variant="outline">{action.action_type}</Badge>
                            <Badge className={getSeverityColor(action.severity)}>{action.severity}</Badge>
                          </div>
                          <h3 className="font-medium mb-1">{action.reason}</h3>
                          {action.description && <p className="text-sm text-slate-600 mb-2">{action.description}</p>}
                          <div className="text-xs text-slate-500">
                            Target: {action.target_type} #{action.target_id} • By: {action.moderator} •
                            {new Date(action.created_at).toLocaleDateString()}
                            {action.expires_at && (
                              <span> • Expires: {new Date(action.expires_at).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Resolution Modal */}
        {selectedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4">Resolve Report #{selectedReport.id}</h2>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Status</label>
                    <select
                      value={resolutionForm.status}
                      onChange={(e) => setResolutionForm({ ...resolutionForm, status: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="">Select status</option>
                      <option value="under_review">Under Review</option>
                      <option value="resolved">Resolved</option>
                      <option value="dismissed">Dismissed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Resolution Action</label>
                    <select
                      value={resolutionForm.resolution}
                      onChange={(e) => setResolutionForm({ ...resolutionForm, resolution: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="">Select action</option>
                      <option value="no_action">No Action Required</option>
                      <option value="content_removed">Remove Content</option>
                      <option value="user_warned">Warn User</option>
                      <option value="user_suspended">Suspend User</option>
                    </select>
                  </div>

                  {resolutionForm.resolution === "user_suspended" && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Suspension Duration (hours)</label>
                      <Input
                        type="number"
                        value={resolutionForm.suspension_duration}
                        onChange={(e) =>
                          setResolutionForm({ ...resolutionForm, suspension_duration: Number.parseInt(e.target.value) })
                        }
                        min="1"
                        max="8760"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-2">Resolution Notes</label>
                    <Textarea
                      value={resolutionForm.resolution_notes}
                      onChange={(e) => setResolutionForm({ ...resolutionForm, resolution_notes: e.target.value })}
                      placeholder="Explain the resolution decision..."
                      rows={4}
                    />
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Button
                    onClick={() => resolveReport(selectedReport.id)}
                    className="bg-cyan-600 hover:bg-cyan-700"
                    disabled={!resolutionForm.status}
                  >
                    Resolve Report
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedReport(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
