"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Plus, Clock, CheckCircle, AlertCircle, Mail } from "lucide-react"

interface Ticket {
  id: number
  ticket_number: string
  subject: string
  category: string
  priority: string
  status: string
  created_at: string
  updated_at: string
  last_response_at: string
}

export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    category: "general",
    priority: "medium",
    email: "",
    name: "",
  })

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

  useEffect(() => {
    fetchTickets()
    loadUserInfo()
  }, [])

  const loadUserInfo = () => {
    const userData = localStorage.getItem("user")
    if (userData) {
      const user = JSON.parse(userData)
      setFormData((prev) => ({
        ...prev,
        email: user.email || "",
        name: user.full_name || user.username || "",
      }))
    }
  }

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setLoading(false)
        return
      }

      const response = await fetch(`${backendUrl}/api/support/tickets`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setTickets(data.tickets)
      }
    } catch (error) {
      console.error("Failed to fetch tickets:", error)
    } finally {
      setLoading(false)
    }
  }

  const createTicket = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${backendUrl}/api/support/tickets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          token: token,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setShowCreateForm(false)
        setFormData({
          subject: "",
          description: "",
          category: "general",
          priority: "medium",
          email: formData.email,
          name: formData.name,
        })
        fetchTickets()
      } else {
        throw new Error("Failed to create ticket")
      }
    } catch (error) {
      console.error("Failed to create ticket:", error)
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-64"></div>
            <div className="h-32 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Support Center</h1>
            <p className="text-slate-600 mt-1">Get help with FilmFusion</p>
          </div>
          <Button onClick={() => setShowCreateForm(true)} className="bg-cyan-600 hover:bg-cyan-700">
            <Plus className="h-4 w-4 mr-2" />
            New Ticket
          </Button>
        </div>

        {/* Create Ticket Form */}
        {showCreateForm && (
          <Card>
            <CardHeader>
              <CardTitle>Create Support Ticket</CardTitle>
              <CardDescription>Describe your issue and we'll help you resolve it</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={createTicket} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Name</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Subject</label>
                  <Input
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Brief description of your issue"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="general">General</option>
                      <option value="technical">Technical Issue</option>
                      <option value="billing">Billing</option>
                      <option value="feature_request">Feature Request</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Please provide detailed information about your issue..."
                    rows={6}
                    required
                  />
                </div>

                <div className="flex space-x-4">
                  <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700">
                    Create Ticket
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Tickets List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Support Tickets</CardTitle>
            <CardDescription>Track the status of your support requests</CardDescription>
          </CardHeader>
          <CardContent>
            {tickets.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">No support tickets yet</p>
                <p className="text-sm text-slate-500 mt-1">Create your first ticket to get help</p>
              </div>
            ) : (
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <div key={ticket.id} className="border rounded-lg p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="font-medium text-slate-900">#{ticket.ticket_number}</span>
                          <Badge className={getStatusColor(ticket.status)}>{ticket.status.replace("_", " ")}</Badge>
                          <Badge className={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge>
                        </div>
                        <h3 className="font-medium text-slate-900 mb-1">{ticket.subject}</h3>
                        <div className="flex items-center space-x-4 text-sm text-slate-600">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>Created {new Date(ticket.created_at).toLocaleDateString()}</span>
                          </div>
                          {ticket.last_response_at && (
                            <div className="flex items-center space-x-1">
                              <Mail className="h-4 w-4" />
                              <span>Last response {new Date(ticket.last_response_at).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Help Resources */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-cyan-500" />
                <span>Live Chat</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">Get instant help from our support team</p>
              <Button variant="outline" className="w-full bg-transparent">
                Start Chat
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                <span>FAQ</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">Find answers to common questions</p>
              <Button variant="outline" className="w-full bg-transparent">
                Browse FAQ
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Documentation</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">Learn how to use FilmFusion features</p>
              <Button variant="outline" className="w-full bg-transparent">
                View Docs
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
