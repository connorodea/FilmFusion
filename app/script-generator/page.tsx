"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Video,
  ArrowLeft,
  Wand2,
  Copy,
  Download,
  Save,
  RefreshCw,
  Clock,
  Users,
  Target,
  Lightbulb,
  FileText,
  Sparkles,
} from "lucide-react"
import Link from "next/link"

const scriptTemplates = [
  {
    id: "explainer",
    name: "Explainer Video",
    description: "Perfect for explaining concepts, products, or services",
    icon: <Lightbulb className="w-5 h-5" />,
  },
  {
    id: "tutorial",
    name: "Tutorial/How-to",
    description: "Step-by-step instructional content",
    icon: <FileText className="w-5 h-5" />,
  },
  {
    id: "promotional",
    name: "Promotional",
    description: "Marketing and promotional content",
    icon: <Target className="w-5 h-5" />,
  },
  {
    id: "educational",
    name: "Educational",
    description: "Learning and educational content",
    icon: <Users className="w-5 h-5" />,
  },
]

const toneOptions = [
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual & Friendly" },
  { value: "enthusiastic", label: "Enthusiastic" },
  { value: "authoritative", label: "Authoritative" },
  { value: "conversational", label: "Conversational" },
  { value: "humorous", label: "Humorous" },
]

const audienceOptions = [
  { value: "general", label: "General Audience" },
  { value: "business", label: "Business Professionals" },
  { value: "students", label: "Students" },
  { value: "consumers", label: "Consumers" },
  { value: "technical", label: "Technical Audience" },
  { value: "creative", label: "Creative Professionals" },
]

const durationOptions = [
  { value: "30s", label: "30 seconds" },
  { value: "1min", label: "1 minute" },
  { value: "2min", label: "2 minutes" },
  { value: "3min", label: "3-5 minutes" },
  { value: "5min", label: "5-10 minutes" },
  { value: "long", label: "10+ minutes" },
]

export default function ScriptGeneratorPage() {
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [topic, setTopic] = useState("")
  const [keyPoints, setKeyPoints] = useState("")
  const [tone, setTone] = useState("")
  const [audience, setAudience] = useState("")
  const [duration, setDuration] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedScript, setGeneratedScript] = useState("")
  const [scriptTitle, setScriptTitle] = useState("")

  const handleGenerate = async () => {
    if (!topic || !selectedTemplate) return

    setIsGenerating(true)

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"}/api/generate-script`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            topic,
            template: selectedTemplate,
            tone,
            audience,
            duration,
            key_points: keyPoints
              .split(",")
              .map((point) => point.trim())
              .filter(Boolean),
          }),
        },
      )

      if (!response.ok) {
        throw new Error("Failed to generate script")
      }

      const data = await response.json()
      setGeneratedScript(data.script)
      setScriptTitle(`${topic} - ${scriptTemplates.find((t) => t.id === selectedTemplate)?.name}`)
    } catch (error) {
      console.error("Error generating script:", error)
      // Fallback to sample script if API fails
      const sampleScript = generateSampleScript(topic, selectedTemplate, tone, audience, duration)
      setGeneratedScript(sampleScript)
      setScriptTitle(`${topic} - ${scriptTemplates.find((t) => t.id === selectedTemplate)?.name}`)
    } finally {
      setIsGenerating(false)
    }
  }

  const generateSampleScript = (topic: string, template: string, tone: string, audience: string, duration: string) => {
    // This would be replaced with actual AI generation
    return `# ${topic} Script

## Hook (0-5 seconds)
Did you know that ${topic.toLowerCase()} could completely transform the way you work? In the next ${duration === "30s" ? "30 seconds" : "few minutes"}, I'll show you exactly how.

## Introduction (5-15 seconds)
Hi there! I'm excited to share with you everything you need to know about ${topic}. Whether you're a ${audience === "business" ? "business professional" : "beginner"} or someone looking to level up your skills, this video is for you.

## Main Content (15-80% of video)
Let me break this down into three key points:

**Point 1: The Foundation**
${keyPoints ? keyPoints.split(",")[0]?.trim() || `Understanding the basics of ${topic} is crucial for success.` : `Understanding the basics of ${topic} is crucial for success.`}

**Point 2: The Process**
${keyPoints ? keyPoints.split(",")[1]?.trim() || `Here's the step-by-step approach that works every time.` : `Here's the step-by-step approach that works every time.`}

**Point 3: The Results**
${keyPoints ? keyPoints.split(",")[2]?.trim() || `The impact this will have on your ${audience === "business" ? "business" : "life"} is remarkable.` : `The impact this will have on your ${audience === "business" ? "business" : "life"} is remarkable.`}

## Call to Action (Final 10-20%)
If you found this helpful, make sure to subscribe for more content like this. And if you're ready to take the next step with ${topic}, check out the links in the description below.

## Closing (Final 5 seconds)
Thanks for watching, and I'll see you in the next video!

---
**Estimated Duration:** ${duration}
**Target Audience:** ${audience}
**Tone:** ${tone}
**Template:** ${template}`
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedScript)
  }

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
                  FilmFusion
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Save className="w-4 h-4 mr-2" />
                Save Script
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <Wand2 className="w-6 h-6 text-primary" />
              <h1 className="text-3xl font-bold text-foreground font-[family-name:var(--font-work-sans)]">
                AI Script Generator
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Create compelling video scripts in seconds with our AI-powered writing assistant.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Form */}
            <div className="space-y-6">
              <Card className="border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 font-[family-name:var(--font-work-sans)]">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <span>Script Configuration</span>
                  </CardTitle>
                  <CardDescription>
                    Tell us about your video and we'll generate a professional script tailored to your needs.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Template Selection */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Choose a Template</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {scriptTemplates.map((template) => (
                        <Card
                          key={template.id}
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            selectedTemplate === template.id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                          onClick={() => setSelectedTemplate(template.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start space-x-3">
                              <div
                                className={`p-2 rounded-lg ${
                                  selectedTemplate === template.id ? "bg-primary/10" : "bg-muted"
                                }`}
                              >
                                {template.icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-sm">{template.name}</h3>
                                <p className="text-xs text-muted-foreground mt-1">{template.description}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Topic Input */}
                  <div className="space-y-2">
                    <Label htmlFor="topic">Video Topic *</Label>
                    <Input
                      id="topic"
                      placeholder="e.g., How to use AI for content creation"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                    />
                  </div>

                  {/* Key Points */}
                  <div className="space-y-2">
                    <Label htmlFor="keyPoints">Key Points (Optional)</Label>
                    <Textarea
                      id="keyPoints"
                      placeholder="List the main points you want to cover, separated by commas"
                      value={keyPoints}
                      onChange={(e) => setKeyPoints(e.target.value)}
                      rows={3}
                    />
                  </div>

                  {/* Configuration Options */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Tone</Label>
                      <Select value={tone} onValueChange={setTone}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select tone" />
                        </SelectTrigger>
                        <SelectContent>
                          {toneOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Target Audience</Label>
                      <Select value={audience} onValueChange={setAudience}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select audience" />
                        </SelectTrigger>
                        <SelectContent>
                          {audienceOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Duration</Label>
                      <Select value={duration} onValueChange={setDuration}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          {durationOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Generate Button */}
                  <Button
                    onClick={handleGenerate}
                    disabled={!topic || !selectedTemplate || isGenerating}
                    className="w-full bg-primary hover:bg-primary/90"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Generating Script...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4 mr-2" />
                        Generate Script
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Generated Script */}
            <div className="space-y-6">
              <Card className="border-border shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2 font-[family-name:var(--font-work-sans)]">
                      <FileText className="w-5 h-5 text-primary" />
                      <span>Generated Script</span>
                    </CardTitle>
                    {generatedScript && (
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={copyToClipboard}>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Export
                        </Button>
                      </div>
                    )}
                  </div>
                  {scriptTitle && <CardDescription className="font-medium">{scriptTitle}</CardDescription>}
                </CardHeader>
                <CardContent>
                  {!generatedScript && !isGenerating && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <Wand2 className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2 font-[family-name:var(--font-work-sans)]">
                        Ready to Generate
                      </h3>
                      <p className="text-muted-foreground">
                        Fill out the form on the left and click "Generate Script" to create your AI-powered video
                        script.
                      </p>
                    </div>
                  )}

                  {isGenerating && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2 font-[family-name:var(--font-work-sans)]">
                        Generating Your Script
                      </h3>
                      <p className="text-muted-foreground">
                        Our AI is crafting a professional script tailored to your specifications...
                      </p>
                    </div>
                  )}

                  {generatedScript && (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>Est. {duration || "2-3 min"}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>{audience || "General"}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {tone || "Professional"}
                        </Badge>
                      </div>
                      <Textarea
                        value={generatedScript}
                        onChange={(e) => setGeneratedScript(e.target.value)}
                        className="min-h-[500px] font-mono text-sm"
                        placeholder="Your generated script will appear here..."
                      />
                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <p className="text-sm text-muted-foreground">
                          Script generated • {generatedScript.split(" ").length} words
                        </p>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Regenerate
                          </Button>
                          <Button size="sm" className="bg-primary hover:bg-primary/90">
                            <Save className="w-4 h-4 mr-2" />
                            Save & Continue
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
