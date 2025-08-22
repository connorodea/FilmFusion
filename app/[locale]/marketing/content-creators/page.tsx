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
  Video,
  TrendingUp,
  Zap,
  CheckCircle,
  Youtube,
  Instagram,
  Twitter,
  Sparkles,
} from "lucide-react"
import { Link } from "@/i18n/routing"
import { SocialShare } from "@/components/social-share"
import { useLocale } from "next-intl"

export default function ContentCreatorsPage() {
  const t = useTranslations()
  const locale = useLocale()
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://filmfusion.app"
  const currentUrl = `${baseUrl}/${locale}/marketing/content-creators`

  const features = [
    {
      icon: Video,
      title: "AI Script Generation",
      description:
        "Generate engaging scripts for any topic in seconds. Perfect for YouTube, TikTok, and Instagram content.",
      benefit: "Save 5+ hours per video",
    },
    {
      icon: Sparkles,
      title: "Natural AI Voiceovers",
      description: "Choose from 50+ realistic voices in multiple languages. No expensive recording equipment needed.",
      benefit: "Professional quality instantly",
    },
    {
      icon: Zap,
      title: "Automated Editing",
      description: "AI handles cuts, transitions, and pacing. Focus on creativity while we handle the technical work.",
      benefit: "10x faster production",
    },
    {
      icon: TrendingUp,
      title: "Viral Content Optimization",
      description: "Built-in templates and strategies proven to increase engagement and reach on social platforms.",
      benefit: "Higher engagement rates",
    },
  ]

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "YouTube Creator (2.3M subscribers)",
      content:
        "FilmFusion transformed my content creation process. I went from spending 12 hours per video to just 2 hours, and my engagement actually increased!",
      avatar: "/avatars/sarah-chen.jpg",
      rating: 5,
      metrics: "300% faster production",
    },
    {
      name: "Marcus Rodriguez",
      role: "TikTok Influencer (850K followers)",
      content:
        "The AI voiceovers are incredible - my audience can't tell the difference. I can now create content in multiple languages effortlessly.",
      avatar: "/avatars/marcus-rodriguez.jpg",
      rating: 5,
      metrics: "5 languages, 1 creator",
    },
    {
      name: "Emma Thompson",
      role: "Instagram Content Creator",
      content:
        "As a solo creator, FilmFusion is like having an entire production team. The quality is professional and the speed is unmatched.",
      avatar: "/avatars/emma-thompson.jpg",
      rating: 5,
      metrics: "Solo creator, pro results",
    },
  ]

  const useCases = [
    {
      platform: "YouTube",
      icon: Youtube,
      color: "text-red-600",
      examples: ["Educational tutorials", "Product reviews", "Vlogs & storytelling", "How-to guides"],
    },
    {
      platform: "TikTok",
      icon: Video,
      color: "text-black",
      examples: ["Trending challenges", "Quick tips", "Behind-the-scenes", "Comedy skits"],
    },
    {
      platform: "Instagram",
      icon: Instagram,
      color: "text-pink-600",
      examples: ["Reels & Stories", "Product showcases", "Lifestyle content", "Brand partnerships"],
    },
    {
      platform: "Twitter",
      icon: Twitter,
      color: "text-blue-400",
      examples: ["Video tweets", "Thread explanations", "News commentary", "Personal updates"],
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-gradient-to-br from-primary/5 via-accent/5 to-background overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 font-medium">
              For Content Creators
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
              Create Viral Videos
              <span className="text-primary block">10x Faster</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Join 50,000+ creators using AI to produce professional videos in minutes, not hours. Perfect for YouTube,
              TikTok, Instagram, and more.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8 py-4 h-auto" asChild>
                <Link href="/auth/signup?ref=content-creators">
                  <Play className="w-5 h-5 mr-2" />
                  Start Creating Free
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-4 h-auto border-primary/20 hover:bg-primary/5 bg-transparent"
                asChild
              >
                <a href="#demo">
                  Watch Demo
                  <ArrowRight className="w-5 h-5 ml-2" />
                </a>
              </Button>
            </div>

            {/* Social Proof Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">50K+</div>
                <div className="text-sm text-muted-foreground">Active Creators</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">2M+</div>
                <div className="text-sm text-muted-foreground">Videos Created</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">4.9★</div>
                <div className="text-sm text-muted-foreground">Creator Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">10x</div>
                <div className="text-sm text-muted-foreground">Faster Production</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Everything You Need to Go Viral</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Professional video creation tools designed specifically for content creators
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
                      <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
                        {feature.benefit}
                      </Badge>
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
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Perfect for Every Platform</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Create optimized content for all major social media platforms
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map((useCase, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-16 h-16 mx-auto mb-4 bg-card rounded-full flex items-center justify-center">
                    <useCase.icon className={`w-8 h-8 ${useCase.color}`} />
                  </div>
                  <CardTitle className="text-xl">{useCase.platform}</CardTitle>
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
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Loved by Top Creators</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See how creators are transforming their content with FilmFusion
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
            Ready to 10x Your Content Creation?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Join thousands of creators who've already transformed their workflow. Start creating professional videos in
            minutes, not hours.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-4 h-auto" asChild>
              <Link href="/auth/signup?ref=content-creators-cta">
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
              <a href="#pricing">View Pricing</a>
            </Button>
          </div>

          <div className="flex items-center justify-center gap-4">
            <SocialShare
              url={currentUrl}
              title="Create Viral Videos 10x Faster with AI - FilmFusion for Content Creators"
              description="Join 50,000+ creators using AI to produce professional videos in minutes. Perfect for YouTube, TikTok, Instagram, and more."
              hashtags={["ContentCreator", "AIVideo", "VideoCreation", "YouTube", "TikTok"]}
            />
            <span className="text-primary-foreground/70 text-sm">Share with fellow creators</span>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 pt-8 border-t border-primary-foreground/20">
            <div className="flex flex-wrap justify-center items-center gap-8 text-primary-foreground/70">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>30-day money back guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
