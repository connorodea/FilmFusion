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
  BarChart3,
  Target,
  Clock,
  DollarSign,
  CheckCircle,
  TrendingUp,
  Globe,
  Megaphone,
} from "lucide-react"
import { Link } from "@/i18n/routing"
import { SocialShare } from "@/components/social-share"
import { useLocale } from "next-intl"

export default function MarketersPage() {
  const t = useTranslations()
  const locale = useLocale()
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://filmfusion.app"
  const currentUrl = `${baseUrl}/${locale}/marketing/marketers`

  const features = [
    {
      icon: Target,
      title: "Campaign-Ready Videos",
      description: "Create conversion-focused videos optimized for ads, landing pages, and email campaigns.",
      benefit: "3x higher conversion rates",
      metric: "Average 15% CTR increase",
    },
    {
      icon: BarChart3,
      title: "A/B Testing Built-In",
      description: "Generate multiple video variations instantly to test what resonates with your audience.",
      benefit: "Data-driven optimization",
      metric: "Test 10+ variations in minutes",
    },
    {
      icon: Globe,
      title: "Multi-Language Campaigns",
      description: "Expand globally with AI-powered translation and localized voiceovers in 50+ languages.",
      benefit: "Global reach, local impact",
      metric: "Reach 95% of internet users",
    },
    {
      icon: Clock,
      title: "Rapid Campaign Deployment",
      description: "Launch video campaigns 90% faster with automated production and instant rendering.",
      benefit: "Beat competitors to market",
      metric: "Hours instead of weeks",
    },
  ]

  const testimonials = [
    {
      name: "Jennifer Walsh",
      role: "VP Marketing, TechFlow",
      company: "TechFlow",
      content:
        "FilmFusion revolutionized our video marketing. We increased our campaign ROI by 340% while cutting production costs by 80%.",
      avatar: "/avatars/jennifer-walsh.jpg",
      rating: 5,
      metrics: "340% ROI increase",
    },
    {
      name: "David Kim",
      role: "Digital Marketing Director",
      company: "GrowthLabs",
      content:
        "The A/B testing capabilities are game-changing. We can test 15 video variations in the time it used to take to create one.",
      avatar: "/avatars/david-kim.jpg",
      rating: 5,
      metrics: "15x faster testing",
    },
    {
      name: "Maria Santos",
      role: "Performance Marketing Lead",
      company: "ScaleUp Inc",
      content:
        "Multi-language campaigns that used to take months now take days. Our global expansion accelerated dramatically.",
      avatar: "/avatars/maria-santos.jpg",
      rating: 5,
      metrics: "10x faster localization",
    },
  ]

  const useCases = [
    {
      title: "Social Media Ads",
      description: "High-converting video ads for Facebook, Instagram, LinkedIn, and TikTok",
      examples: ["Product demos", "Testimonial videos", "Brand awareness", "Retargeting campaigns"],
      icon: Megaphone,
    },
    {
      title: "Email Marketing",
      description: "Engaging video content that boosts email open rates and click-through rates",
      examples: ["Product launches", "Newsletter content", "Onboarding sequences", "Customer stories"],
      icon: Target,
    },
    {
      title: "Landing Pages",
      description: "Conversion-optimized videos that explain value propositions clearly",
      examples: ["Explainer videos", "Product walkthroughs", "Social proof", "Call-to-action videos"],
      icon: TrendingUp,
    },
    {
      title: "Sales Enablement",
      description: "Professional videos that help sales teams close more deals",
      examples: ["Pitch decks", "Case studies", "Product comparisons", "Demo videos"],
      icon: DollarSign,
    },
  ]

  const roi_stats = [
    { metric: "340%", label: "Average ROI Increase", description: "Compared to traditional video production" },
    { metric: "80%", label: "Cost Reduction", description: "Lower production costs vs agencies" },
    { metric: "15%", label: "CTR Improvement", description: "Higher click-through rates on video ads" },
    { metric: "90%", label: "Faster Deployment", description: "Quicker campaign launch times" },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-gradient-to-br from-primary/5 via-accent/5 to-background overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 font-medium">For Marketing Teams</Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
              Scale Video Marketing
              <span className="text-primary block">Without the Budget</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Create high-converting video campaigns in minutes, not months. Trusted by 1,000+ marketing teams to
              deliver results faster and cheaper than traditional production.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8 py-4 h-auto" asChild>
                <Link href="/auth/signup?ref=marketers">
                  <Play className="w-5 h-5 mr-2" />
                  Start Free Trial
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-4 h-auto border-primary/20 hover:bg-primary/5 bg-transparent"
                asChild
              >
                <a href="#roi-calculator">
                  Calculate ROI
                  <ArrowRight className="w-5 h-5 ml-2" />
                </a>
              </Button>
            </div>

            {/* ROI Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {roi_stats.map((stat, index) => (
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
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Marketing Tools That Drive Results</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to create, test, and optimize video campaigns at scale
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

      {/* Use Cases Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Perfect for Every Campaign</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Create videos optimized for every stage of your marketing funnel
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
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Trusted by Marketing Leaders</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See how marketing teams are driving better results with FilmFusion
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
            Ready to Scale Your Video Marketing?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Join 1,000+ marketing teams already using FilmFusion to create high-converting campaigns faster and cheaper
            than ever before.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-4 h-auto" asChild>
              <Link href="/auth/signup?ref=marketers-cta">
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-4 h-auto border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 bg-transparent"
              asChild
            >
              <a href="#demo">Request Demo</a>
            </Button>
          </div>

          <div className="flex items-center justify-center gap-4">
            <SocialShare
              url={currentUrl}
              title="Scale Video Marketing Without the Budget - FilmFusion for Marketers"
              description="Create high-converting video campaigns in minutes, not months. Trusted by 1,000+ marketing teams."
              hashtags={["VideoMarketing", "MarketingTech", "AIVideo", "DigitalMarketing", "MarTech"]}
            />
            <span className="text-primary-foreground/70 text-sm">Share with your marketing team</span>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 pt-8 border-t border-primary-foreground/20">
            <div className="flex flex-wrap justify-center items-center gap-8 text-primary-foreground/70">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>Enterprise security</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>Team collaboration tools</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>Priority support</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
