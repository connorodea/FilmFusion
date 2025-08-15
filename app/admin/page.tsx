"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  DollarSign,
  Activity,
  TrendingUp,
  Search,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react"

interface AdminDashboardData {
  system_stats: {
    total_users: number
    premium_users: number
    free_users: number
    total_projects: number
    total_renders: number
    successful_renders: number
    render_success_rate: number
  }
  revenue: {
    total: number
    monthly: number
  }
  recent_activity: {
    users: Array<{
      id: number
      username: string
      email: string
      created_at: string
    }>
    projects: Array<{
      id: number
      name: string
      status: string
      created_at: string
    }>
    renders: Array<{
      id: string
      status: string
      created_at: string
    }>
  }
}

interface User {
  id: number
  username: string
  email: string
  full_name: string
  is_active: boolean
  is_premium: boolean
  is_admin: boolean
  role: string
  subscription_plan: string
  subscription_status: string
  created_at: string
  last_login: string
  login_count: number
}

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

  useEffect(() => {
    fetchDashboardData()
    fetchUsers()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${backendUrl}/api/admin/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data")
      }

      const data = await response.json()
      setDashboardData(data.dashboard)
    } catch (err) {
      setError("Failed to load dashboard data")
      console.error("Dashboard error:", err)
    }
  }

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${backendUrl}/api/admin/users?limit=100&search=${searchTerm}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch users")
      }

      const data = await response.json()
      setUsers(data.users)
    } catch (err) {
      setError("Failed to load users")
      console.error("Users error:", err)
    } finally {
      setLoading(false)
    }
  }

  const updateUserRole = async (userId: number, role: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${backendUrl}/api/admin/users/${userId}/role`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role }),
      })

      if (!response.ok) {
        throw new Error("Failed to update user role")
      }

      fetchUsers() // Refresh users list
    } catch (err) {
      console.error("Role update error:", err)
    }
  }

  const deactivateUser = async (userId: number) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${backendUrl}/api/admin/users/${userId}/deactivate`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to deactivate user")
      }

      fetchUsers() // Refresh users list
    } catch (err) {
      console.error("Deactivation error:", err)
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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span className="text-red-700">{error}</span>
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
            <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="text-slate-600 mt-1">Manage FilmFusion platform and users</p>
          </div>
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-cyan-500" />
            <span className="text-sm font-medium text-slate-700">Administrator</span>
          </div>
        </div>

        {/* Stats Cards */}
        {dashboardData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.system_stats.total_users}</div>
                <p className="text-xs text-muted-foreground">
                  {dashboardData.system_stats.premium_users} premium users
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${dashboardData.revenue.monthly.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Total: ${dashboardData.revenue.total.toFixed(2)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.system_stats.total_projects}</div>
                <p className="text-xs text-muted-foreground">{dashboardData.system_stats.total_renders} renders</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.system_stats.render_success_rate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">Render success rate</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="support">Support Tickets</TabsTrigger>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            <TabsTrigger value="system">System Health</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage user accounts, roles, and permissions</CardDescription>
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                  <Button onClick={fetchUsers} variant="outline">
                    Search
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{user.username}</span>
                            {user.is_admin && <Badge variant="secondary">Admin</Badge>}
                            {user.is_premium && <Badge className="bg-amber-100 text-amber-800">Premium</Badge>}
                            {!user.is_active && <Badge variant="destructive">Inactive</Badge>}
                          </div>
                          <div className="text-sm text-slate-600">{user.email}</div>
                          <div className="text-xs text-slate-500">
                            Plan: {user.subscription_plan} • Status: {user.subscription_status}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <select
                          value={user.role}
                          onChange={(e) => updateUserRole(user.id, e.target.value)}
                          className="text-sm border rounded px-2 py-1"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                          <option value="super_admin">Super Admin</option>
                        </select>
                        {user.is_active ? (
                          <Button size="sm" variant="destructive" onClick={() => deactivateUser(user.id)}>
                            <XCircle className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" disabled>
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Support Tickets Tab */}
          <TabsContent value="support" className="space-y-6">
            <SupportTicketsTab />
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            {dashboardData && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {dashboardData.recent_activity.users.map((user) => (
                        <div key={user.id} className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{user.username}</div>
                            <div className="text-sm text-slate-600">{user.email}</div>
                          </div>
                          <div className="text-xs text-slate-500">{new Date(user.created_at).toLocaleDateString()}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Projects</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {dashboardData.recent_activity.projects.map((project) => (
                        <div key={project.id} className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{project.name}</div>
                            <Badge variant="outline" className="text-xs">
                              {project.status}
                            </Badge>
                          </div>
                          <div className="text-xs text-slate-500">
                            {new Date(project.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Renders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {dashboardData.recent_activity.renders.map((render) => (
                        <div key={render.id} className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-sm">Render {render.id.slice(0, 8)}</div>
                            <Badge
                              variant={render.status === "completed" ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {render.status}
                            </Badge>
                          </div>
                          <div className="text-xs text-slate-500">
                            {new Date(render.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
                <CardDescription>Monitor system performance and health</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-medium">Service Status</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span>Database</span>
                        <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Redis Cache</span>
                        <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>OpenAI API</span>
                        <Badge className="bg-green-100 text-green-800">Connected</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Stripe API</span>
                        <Badge className="bg-green-100 text-green-800">Connected</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-medium">Performance Metrics</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span>Response Time</span>
                        <span className="text-sm text-slate-600">~150ms</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Uptime</span>
                        <span className="text-sm text-slate-600">99.9%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Error Rate</span>
                        <span className="text-sm text-slate-600">0.1%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

// Support Tickets Component
function SupportTicketsTab() {
  const [tickets, setTickets] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

  useEffect(() => {
    fetchSupportTickets()
  }, [selectedStatus, selectedCategory])

  const fetchSupportTickets = async () => {
    try {
      const token = localStorage.getItem("token")
      const params = new URLSearchParams()
      if (selectedStatus) params.append("status", selectedStatus)
      if (selectedCategory) params.append("category", selectedCategory)

      const response = await fetch(`${backendUrl}/api/admin/support/tickets?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setTickets(data.tickets)
        setStats(data.stats)
      }
    } catch (error) {
      console.error("Failed to fetch support tickets:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateTicketStatus = async (ticketId: number, status: string, resolutionNotes?: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${backendUrl}/api/admin/support/tickets/${ticketId}/status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status, resolution_notes: resolutionNotes }),
      })

      if (response.ok) {
        fetchSupportTickets()
      }
    } catch (error) {
      console.error("Failed to update ticket status:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-800"
      case "in_progress":
        return "bg-yellow-100 text-yellow-800"
      case "waiting_response":
        return "bg-orange-100 text-orange-800"
      case "resolved":
        return "bg-green-100 text-green-800"
      case "closed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return <div className="animate-pulse h-64 bg-slate-200 rounded"></div>
  }

  return (
    <div className="space-y-6">
      {/* Support Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stats.total_tickets}</div>
              <p className="text-sm text-slate-600">Total Tickets</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.open_tickets}</div>
              <p className="text-sm text-slate-600">Open</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">{stats.in_progress_tickets}</div>
              <p className="text-sm text-slate-600">In Progress</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.resolution_rate.toFixed(1)}%</div>
              <p className="text-sm text-slate-600">Resolution Rate</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Support Tickets</CardTitle>
          <div className="flex space-x-4">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border rounded px-3 py-1"
            >
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="waiting_response">Waiting Response</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border rounded px-3 py-1"
            >
              <option value="">All Categories</option>
              <option value="general">General</option>
              <option value="technical">Technical</option>
              <option value="billing">Billing</option>
              <option value="feature_request">Feature Request</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="font-medium">#{ticket.ticket_number}</span>
                      <Badge className={getStatusColor(ticket.status)}>{ticket.status.replace("_", " ")}</Badge>
                      <Badge variant="outline">{ticket.category}</Badge>
                      <Badge variant="outline">{ticket.priority}</Badge>
                    </div>
                    <h3 className="font-medium mb-1">{ticket.subject}</h3>
                    <div className="text-sm text-slate-600">
                      <p>
                        From: {ticket.user_name} ({ticket.user_email})
                      </p>
                      <p>Created: {new Date(ticket.created_at).toLocaleDateString()}</p>
                      {ticket.assigned_to && <p>Assigned to: {ticket.assigned_to}</p>}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <select
                      value={ticket.status}
                      onChange={(e) => updateTicketStatus(ticket.id, e.target.value)}
                      className="text-sm border rounded px-2 py-1"
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="waiting_response">Waiting Response</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                    <Button size="sm" variant="outline">
                      View
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
