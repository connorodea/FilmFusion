"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, X } from "lucide-react"

interface ReportContentModalProps {
  isOpen: boolean
  onClose: () => void
  contentType: string
  contentId: number
  contentTitle?: string
}

export default function ReportContentModal({
  isOpen,
  onClose,
  contentType,
  contentId,
  contentTitle,
}: ReportContentModalProps) {
  const [formData, setFormData] = useState({
    reason: "",
    description: "",
    severity: "medium",
    reporter_email: "",
  })
  const [loading, setLoading] = useState(false)

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

  const submitReport = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem("token")
      const userData = localStorage.getItem("user")
      let reporterEmail = formData.reporter_email

      if (userData && !reporterEmail) {
        const user = JSON.parse(userData)
        reporterEmail = user.email
      }

      const response = await fetch(`${backendUrl}/api/content/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          report_type: "content",
          content_type: contentType,
          content_id: contentId,
          reason: formData.reason,
          description: formData.description,
          severity: formData.severity,
          reporter_email: reporterEmail,
          token: token,
        }),
      })

      if (response.ok) {
        alert("Report submitted successfully. We will review it shortly.")
        onClose()
        setFormData({
          reason: "",
          description: "",
          severity: "medium",
          reporter_email: "",
        })
      } else {
        throw new Error("Failed to submit report")
      }
    } catch (error) {
      console.error("Failed to submit report:", error)
      alert("Failed to submit report. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <h2 className="text-xl font-bold">Report Content</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {contentTitle && (
            <div className="mb-4 p-3 bg-slate-50 rounded">
              <p className="text-sm text-slate-600">
                Reporting: <strong>{contentTitle}</strong>
              </p>
              <Badge variant="outline" className="mt-1">
                {contentType}
              </Badge>
            </div>
          )}

          <form onSubmit={submitReport} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Reason for Report *</label>
              <select
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              >
                <option value="">Select a reason</option>
                <option value="inappropriate_content">Inappropriate Content</option>
                <option value="spam">Spam</option>
                <option value="harassment">Harassment</option>
                <option value="copyright">Copyright Violation</option>
                <option value="violence">Violence or Threats</option>
                <option value="hate_speech">Hate Speech</option>
                <option value="misinformation">Misinformation</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Severity</label>
              <select
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Additional Details</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Please provide additional context about why you're reporting this content..."
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Your Email (for follow-up)</label>
              <Input
                type="email"
                value={formData.reporter_email}
                onChange={(e) => setFormData({ ...formData, reporter_email: e.target.value })}
                placeholder="your@email.com"
              />
            </div>

            <div className="flex space-x-4 pt-4">
              <Button
                type="submit"
                disabled={loading || !formData.reason}
                className="bg-red-600 hover:bg-red-700 flex-1"
              >
                {loading ? "Submitting..." : "Submit Report"}
              </Button>
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
            </div>
          </form>

          <div className="mt-4 p-3 bg-blue-50 rounded text-sm text-blue-700">
            <p>
              <strong>Note:</strong> False reports may result in restrictions on your account. Please only report
              content that genuinely violates our community guidelines.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
