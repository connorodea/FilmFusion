"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, Users, TrendingUp, Award } from "lucide-react"
import { useTranslations } from "next-intl"

interface SocialProofProps {
  showStats?: boolean
  showTestimonials?: boolean
  showTrustBadges?: boolean
  showRecentActivity?: boolean
}

export function SocialProof({
  showStats = true,
  showTestimonials = true,
  showTrustBadges = true,
  showRecentActivity = true,
}: SocialProofProps) {
  const t = useTranslations()
  const [stats, setStats] = useState({
    totalUsers: 12500,
    videosCreated: 45000,
    averageRating: 4.8,
    companiesUsing: 250,
  })

  const [recentActivity, setRecentActivity] = useState([
    { user: "Sarah M.", action: "created a video", time: "2 minutes ago", avatar: "/avatars/sarah.jpg" },
    { user: "Marcus T.", action: "upgraded to Pro", time: "5 minutes ago", avatar: "/avatars/marcus.jpg" },
    { user: "Emily R.", action: "shared a video", time: "8 minutes ago", avatar: "/avatars/emily.jpg" },
  ])

  const testimonials = [
    {
      name: "Alex Johnson",
      role: "Content Creator",
      content: "FilmFusion has revolutionized my video creation process. What used to take hours now takes minutes!",
      avatar: "/avatars/alex.jpg",
      rating: 5,
    },
    {
      name: "Maria Garcia",
      role: "Marketing Director",
      content: "The AI-powered features are incredible. Our team productivity has increased by 300%.",
      avatar: "/avatars/maria.jpg",
      rating: 5,
    },
  ]

  const trustBadges = [
    { name: "SOC 2 Compliant", icon: Award },
    { name: "GDPR Ready", icon: Award },
    { name: "Enterprise Grade", icon: Award },
    { name: "99.9% Uptime", icon: TrendingUp },
  ]

  return (
    <div className="space-y-8">
      {/* Stats Section */}
      {showStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-primary">{stats.totalUsers.toLocaleString()}+</div>
              <p className="text-sm text-muted-foreground">{t("social.stats.creators")}</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-primary">{stats.videosCreated.toLocaleString()}+</div>
              <p className="text-sm text-muted-foreground">{t("social.stats.videos")}</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-1">
                <div className="text-2xl font-bold text-primary">{stats.averageRating}</div>
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
              </div>
              <p className="text-sm text-muted-foreground">{t("social.stats.rating")}</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-primary">{stats.companiesUsing}+</div>
              <p className="text-sm text-muted-foreground">{t("social.stats.companies")}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Activity */}
      {showRecentActivity && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">{t("social.recentActivity")}</h3>
            </div>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={activity.avatar || "/placeholder.svg"} alt={activity.user} />
                    <AvatarFallback>
                      {activity.user
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">{activity.user}</span> {activity.action}
                    </p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mini Testimonials */}
      {showTestimonials && (
        <div className="grid md:grid-cols-2 gap-4">
          {testimonials.map((testimonial, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-3 italic">"{testimonial.content}"</p>
                <div className="flex items-center gap-2">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={testimonial.avatar || "/placeholder.svg"} alt={testimonial.name} />
                    <AvatarFallback>
                      {testimonial.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-xs font-medium">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Trust Badges */}
      {showTrustBadges && (
        <div className="flex flex-wrap justify-center gap-4">
          {trustBadges.map((badge, index) => (
            <Badge key={index} variant="outline" className="flex items-center gap-2 px-3 py-1">
              <badge.icon className="w-4 h-4" />
              {badge.name}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}

// Floating social proof notification
export function FloatingSocialProof() {
  const [visible, setVisible] = useState(false)
  const [currentNotification, setCurrentNotification] = useState(0)

  const notifications = [
    { user: "John D.", action: "just created a video", location: "New York" },
    { user: "Lisa K.", action: "upgraded to Pro", location: "London" },
    { user: "Mike R.", action: "shared their video", location: "Tokyo" },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(true)
      setTimeout(() => setVisible(false), 4000)
      setCurrentNotification((prev) => (prev + 1) % notifications.length)
    }, 8000)

    return () => clearInterval(interval)
  }, [])

  if (!visible) return null

  const notification = notifications[currentNotification]

  return (
    <div className="fixed bottom-4 left-4 z-50 animate-in slide-in-from-left-5">
      <Card className="shadow-lg border-l-4 border-l-primary">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <div>
              <p className="text-sm font-medium">
                {notification.user} {notification.action}
              </p>
              <p className="text-xs text-muted-foreground">{notification.location}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
