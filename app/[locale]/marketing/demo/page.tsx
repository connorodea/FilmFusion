"use client"

import type React from "react"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar, Clock, Users, CheckCircle, Video, Sparkles, Target } from "lucide-react"
import { Link } from "@/i18n/routing"

export default function DemoPage() {
  const t = useTranslations()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    jobTitle: "",
    teamSize: "",
    useCase: "",
    currentSolution: "",
    challenges: "",
    timeline: "",
    agreeToContact: false,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsSubmitted(true)
    setIsSubmitting(false)
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const benefits = [
    {
      icon: Video,
      title: "Live Product Demo",
      description: "See FilmFusion in action with a personalized walkthrough of key features",
    },
    {
      icon: Target,
      title: "Custom Use Case Review",
      description: "Discuss your specific video creation needs and see tailored solutions",
    },
    {
      icon: Users,
      title: "Team Collaboration Features",
      description: "Explore enterprise features like approval workflows and brand management",
    },
    {
      icon: Sparkles,
      title: "ROI Calculator",
      description: "Get a personalized estimate of time and cost savings for your organization",
    },
  ]

  const demoFeatures = [
    "AI Script Generation for your industry",
    "Multi-language voiceover capabilities",
    "Brand-compliant video templates",
    "Team collaboration workflows",
    "Analytics and performance tracking",
    "Enterprise security features",
  ]

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="max-w-2xl mx-auto text-center">
            <CardContent className="pt-12 pb-8">
              <div className="w-16 h-16 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-4">Demo Request Submitted!</h1>
              <p className="text-lg text-muted-foreground mb-8">
                Thank you for your interest in FilmFusion. Our team will contact you within 24 hours to schedule your
                personalized demo.
              </p>
              <div className="space-y-4 text-left bg-card/50 p-6 rounded-lg mb-8">
                <h3 className="font-semibold text-foreground">What happens next:</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-primary">1</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Our team reviews your requirements and prepares a customized demo
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-primary">2</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      We'll contact you to schedule a convenient time for your demo
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-primary">3</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Experience a live, personalized demo tailored to your use case
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild>
                  <Link href="/">Return to Homepage</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/auth/signup">Start Free Trial</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-primary/5 via-accent/5 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 font-medium">Personalized Demo</Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              See FilmFusion
              <span className="text-primary block">In Action</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Get a personalized demo tailored to your specific use case. See how FilmFusion can transform your video
              creation process and deliver measurable ROI.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">30 min</div>
                <div className="text-sm text-muted-foreground">Demo Duration</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">Live</div>
                <div className="text-sm text-muted-foreground">Interactive Demo</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">Custom</div>
                <div className="text-sm text-muted-foreground">Tailored to You</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">Free</div>
                <div className="text-sm text-muted-foreground">No Commitment</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Demo Form */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Request Your Demo</CardTitle>
              <CardDescription>
                Fill out the form below and we'll contact you within 24 hours to schedule your personalized demo.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Work Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company">Company *</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => handleInputChange("company", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="jobTitle">Job Title *</Label>
                    <Input
                      id="jobTitle"
                      value={formData.jobTitle}
                      onChange={(e) => handleInputChange("jobTitle", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="teamSize">Team Size</Label>
                    <Select value={formData.teamSize} onValueChange={(value) => handleInputChange("teamSize", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select team size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-5">1-5 people</SelectItem>
                        <SelectItem value="6-20">6-20 people</SelectItem>
                        <SelectItem value="21-50">21-50 people</SelectItem>
                        <SelectItem value="51-200">51-200 people</SelectItem>
                        <SelectItem value="200+">200+ people</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="useCase">Primary Use Case</Label>
                    <Select value={formData.useCase} onValueChange={(value) => handleInputChange("useCase", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select use case" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="marketing">Marketing Videos</SelectItem>
                        <SelectItem value="training">Training & Education</SelectItem>
                        <SelectItem value="sales">Sales Enablement</SelectItem>
                        <SelectItem value="internal">Internal Communications</SelectItem>
                        <SelectItem value="social">Social Media Content</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="currentSolution">Current Video Creation Solution</Label>
                  <Input
                    id="currentSolution"
                    value={formData.currentSolution}
                    onChange={(e) => handleInputChange("currentSolution", e.target.value)}
                    placeholder="e.g., In-house team, Agency, Other tools"
                  />
                </div>

                <div>
                  <Label htmlFor="challenges">Biggest Video Creation Challenges</Label>
                  <Textarea
                    id="challenges"
                    value={formData.challenges}
                    onChange={(e) => handleInputChange("challenges", e.target.value)}
                    placeholder="Tell us about your current pain points..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="timeline">Implementation Timeline</Label>
                  <Select value={formData.timeline} onValueChange={(value) => handleInputChange("timeline", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="When are you looking to implement?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediately</SelectItem>
                      <SelectItem value="1-3months">1-3 months</SelectItem>
                      <SelectItem value="3-6months">3-6 months</SelectItem>
                      <SelectItem value="6+months">6+ months</SelectItem>
                      <SelectItem value="exploring">Just exploring</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="agreeToContact"
                    checked={formData.agreeToContact}
                    onCheckedChange={(checked) => handleInputChange("agreeToContact", checked as boolean)}
                  />
                  <Label htmlFor="agreeToContact" className="text-sm">
                    I agree to be contacted by FilmFusion regarding this demo request *
                  </Label>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={isSubmitting || !formData.agreeToContact}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Calendar className="w-4 h-4 mr-2" />
                      Request Demo
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Demo Benefits */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-4">What You'll See in Your Demo</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Our product experts will show you exactly how FilmFusion can solve your video creation challenges.
              </p>

              <div className="space-y-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">{benefit.title}</h3>
                      <p className="text-muted-foreground">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Card className="bg-card/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Demo Highlights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {demoFeatures.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-foreground">Quick Response Guarantee</span>
                </div>
                <p className="text-muted-foreground">
                  We'll contact you within 24 hours to schedule your demo at a time that works for you. No pushy sales
                  tactics - just a genuine conversation about your needs.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
