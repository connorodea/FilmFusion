"use client"

import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Play,
  Star,
  ArrowRight,
  Building2,
  Shield,
  Users,
  DollarSign,
  CheckCircle,
  TrendingUp,
  Globe,
  Award,
} from "lucide-react"
import { Link } from "@/i18n/routing"
import { SocialShare } from "@/components/social-share"
import { useLocale } from "next-intl"

export default function BusinessesPage() {
  const t = useTranslations()
  const locale = useLocale()
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://filmfusion.app"
  const currentUrl = `${baseUrl}/${locale}/marketing/businesses`

  const features = [
    {
      icon: Building2,
      title: "Enterprise-Grade Security",
      description: "SOC 2 compliant with enterprise SSO, advanced permissions, and data encryption.",
      benefit: "Bank-level security",
      metric: "99.9% uptime SLA",
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Centralized workspace with role-based access, approval workflows, and brand guidelines.",
      benefit: "Streamlined workflows",
      metric: "50% faster approvals",
    },
    {
      icon: Globe,
      title: "Global Brand Consistency",
      description: "Maintain brand standards across all markets with automated brand compliance checks.",
      benefit: "Consistent messaging",
      metric: "100% brand compliance",
    },
    {
      icon: DollarSign,
      title: "Cost-Effective Production",
      description: "Reduce video production costs by 80% while maintaining professional quality.",
      benefit: "Massive cost savings",
      metric: "ROI in first month",
    },
  ]

  const testimonials = [
    {
      name: "Robert Chen",
      role: "Chief Marketing Officer",
      company: "Fortune 500 Tech Company",
      content:
        "FilmFusion transformed our global video strategy. We reduced production costs by 75% while increasing output by 400%.",
      avatar: "/avatars/robert-chen.jpg",
      rating: 5,
      metrics: "75% cost reduction",
    },
    {
      name: "Sarah Williams",
      role: "VP of Communications",
      company: "Global Manufacturing Corp",
      content:
        "The enterprise features and security standards exceeded our expectations. Our legal team approved it immediately.",
      avatar: "/avatars/sarah-williams.jpg",
      rating: 5,
      metrics: "Enterprise approved",
    },
    {
      name: "Michael Torres",
      role: "Director of Digital Strategy",
      company: "International Retail Chain",
      content:
        "We're now creating localized content for 25 markets simultaneously. What used to take months now takes days.",
      avatar: "/avatars/michael-torres.jpg",
      rating: 5,
      metrics: "25 markets, one platform",
    },
  ]

  const useCases = [
    {
      title: "Internal Communications",
      description: "Engage employees with professional training videos and company updates",
      examples: ["Training materials", "Company announcements", "Onboarding videos", "Safety protocols"],
      icon: Users,
    },
    {
      title: "Customer Education",
      description: "Help customers succeed with product tutorials and support content",
      examples: ["Product demos", "How-to guides", "Troubleshooting", "Feature updates"],
      icon: Award,
    },
    {
      title: "Sales Enablement",
      description: "Empower sales teams with compelling pitch materials and case studies",
      examples: ["Sales presentations", "Customer testimonials", "Product comparisons", "ROI calculators"],
      icon: TrendingUp,
    },
    {
      title: "Brand Marketing",
      description: "Build brand awareness with consistent, professional marketing content",
      examples: ["Brand stories", "Product launches", "Event coverage", "Thought leadership"],
      icon: Building2,
    },
  ]

  const enterprise_benefits = [
    { metric: "80%", label: "Cost Reduction", description: "vs traditional video agencies" },
    { metric: "400%", label: "Output Increase", description: "More videos, same resources" },
    { metric: "50%", label: "Faster Approvals", description: "Streamlined review process" },
    { metric: "25+", label: "Global Markets", description: "Simultaneous localization" },
  ]

  const security_features = [
    "SOC 2 Type II Compliance",
    "Enterprise SSO Integration",
    "Advanced User Permissions",
    "Data Encryption at Rest",
    "GDPR & CCPA Compliant",
    "Audit Logs & Reporting",
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-gradient-to-br from-primary/5 via-accent/5 to-background overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 font-medium">
              For Enterprise & Business
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
              Enterprise Video
              <span className="text-primary block">At Scale</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Trusted by Fortune 500 companies to create professional video content at enterprise scale. Reduce costs by
              80% while maintaining brand consistency across global markets.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8 py-4 h-auto" asChild>
                <Link href="/auth/signup?ref=enterprise">
                  <Play className="w-5 h-5 mr-2" />
                  Request Demo
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-4 h-auto border-primary/20 hover:bg-primary/5 bg-transparent"
                asChild
              >
                <a href="#security">
                  View Security
                  <Shield className="w-5 h-5 ml-2" />
                </a>
              </Button>
            </div>

            {/* Enterprise Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {enterprise_benefits.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-primary mb-1">{stat.metric}</div>
                  <div className="text-sm font-medium text-foreground mb-1">{stat.label}</div>
                  <div className="text-xs text-muted-foreground">{stat.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Built for Enterprise Needs</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Enterprise-grade features that scale with your business requirements
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="border-border/50 shadow-sm hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                      <CardDescription className="text-base mb-3">{feature.description}</CardDescription>
                      <div className="flex flex-col gap-2">
                        <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20 w-fit">
                          {feature.benefit}
                        </Badge>
                        <div className="text-sm text-muted-foreground font-medium">{feature.metric}</div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Enterprise Security & Compliance</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built with security-first architecture to meet the most stringent enterprise requirements
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="border-border/50 shadow-lg">
              <CardHeader className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Bank-Level Security Standards</CardTitle>
                <CardDescription>
                  Your data and content are protected with the same security measures used by financial institutions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {security_features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Enterprise Use Cases</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Streamline video creation across all business functions
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map((useCase, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                    <useCase.icon className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl text-center">{useCase.title}</CardTitle>
                  <CardDescription className="text-center">{useCase.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {useCase.examples.map((example, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                        {example}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Trusted by Industry Leaders</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See how enterprise companies are transforming their video strategy
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-border/50 shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-accent fill-current" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6 italic">"{testimonial.content}"</p>
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={testimonial.avatar || "/placeholder.svg"} alt={testimonial.name} />
                      <AvatarFallback>
                        {testimonial.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-foreground">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.company}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-primary/20 text-primary">
                    {testimonial.metrics}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-primary-foreground mb-4">
            Ready to Transform Your Enterprise Video Strategy?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Join Fortune 500 companies using FilmFusion to create professional video content at scale while reducing
            costs by 80%.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-4 h-auto" asChild>
              <Link href="/auth/signup?ref=enterprise-cta">
                Request Demo
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-4 h-auto border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 bg-transparent"
              asChild
            >
              <a href="#contact">Contact Sales</a>
            </Button>
          </div>

          <div className="flex items-center justify-center gap-4">
            <SocialShare
              url={currentUrl}
              title="Enterprise Video At Scale - FilmFusion for Business"
              description="Trusted by Fortune 500 companies to create professional video content at enterprise scale. Reduce costs by 80%."
              hashtags={["Enterprise", "VideoProduction", "BusinessTech", "AIVideo", "DigitalTransformation"]}
            />
            <span className="text-primary-foreground/70 text-sm">Share with your leadership team</span>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 pt-8 border-t border-primary-foreground/20">
            <div className="flex flex-wrap justify-center items-center gap-8 text-primary-foreground/70">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                <span>SOC 2 Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>99.9% Uptime SLA</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>Dedicated Success Manager</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
