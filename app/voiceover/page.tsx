"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import {
  Video,
  ArrowLeft,
  Volume2,
  Play,
  Pause,
  Download,
  Save,
  RefreshCw,
  Mic,
  User,
  Globe,
  Settings,
  AudioWaveformIcon as Waveform,
  Clock,
  FileAudio,
  Sparkles,
} from "lucide-react"
import Link from "next/link"

const voiceCategories = [
  {
    id: "professional",
    name: "Professional",
    description: "Clear, authoritative voices for business content",
    voices: [
      {
        id: "sarah-pro",
        name: "Sarah",
        gender: "Female",
        accent: "American",
        description: "Warm, professional female voice",
        sample: "/voice-samples/sarah-pro.mp3",
      },
      {
        id: "david-pro",
        name: "David",
        gender: "Male",
        accent: "American",
        description: "Confident, authoritative male voice",
        sample: "/voice-samples/david-pro.mp3",
      },
      {
        id: "emma-brit",
        name: "Emma",
        gender: "Female",
        accent: "British",
        description: "Sophisticated British female voice",
        sample: "/voice-samples/emma-brit.mp3",
      },
    ],
  },
  {
    id: "conversational",
    name: "Conversational",
    description: "Friendly, casual voices for engaging content",
    voices: [
      {
        id: "alex-casual",
        name: "Alex",
        gender: "Male",
        accent: "American",
        description: "Friendly, approachable male voice",
        sample: "/voice-samples/alex-casual.mp3",
      },
      {
        id: "maya-warm",
        name: "Maya",
        gender: "Female",
        accent: "American",
        description: "Warm, conversational female voice",
        sample: "/voice-samples/maya-warm.mp3",
      },
      {
        id: "james-aussie",
        name: "James",
        gender: "Male",
        accent: "Australian",
        description: "Laid-back Australian male voice",
        sample: "/voice-samples/james-aussie.mp3",
      },
    ],
  },
  {
    id: "educational",
    name: "Educational",
    description: "Clear, patient voices perfect for tutorials",
    voices: [
      {
        id: "lisa-teacher",
        name: "Lisa",
        gender: "Female",
        accent: "American",
        description: "Patient, educational female voice",
        sample: "/voice-samples/lisa-teacher.mp3",
      },
      {
        id: "michael-tutor",
        name: "Michael",
        gender: "Male",
        accent: "Canadian",
        description: "Clear, instructional male voice",
        sample: "/voice-samples/michael-tutor.mp3",
      },
    ],
  },
]

export default function VoiceoverPage() {
  const [selectedCategory, setSelectedCategory] = useState("professional")
  const [selectedVoice, setSelectedVoice] = useState("")
  const [scriptText, setScriptText] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedAudio, setGeneratedAudio] = useState("")
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [speed, setSpeed] = useState([1.0])
  const [pitch, setPitch] = useState([0])
  const [emphasis, setEmphasis] = useState([0])
  const audioRef = useRef<HTMLAudioElement>(null)

  const currentCategory = voiceCategories.find((cat) => cat.id === selectedCategory)
  const currentVoice = currentCategory?.voices.find((voice) => voice.id === selectedVoice)

  const handleVoiceSelect = (voiceId: string) => {
    setSelectedVoice(voiceId)
  }

  const playVoiceSample = (sampleUrl: string) => {
    // In a real implementation, this would play the voice sample
    console.log("Playing voice sample:", sampleUrl)
  }

  const handleGenerate = async () => {
    if (!scriptText || !selectedVoice) return

    setIsGenerating(true)

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"}/api/generate-voiceover`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: scriptText,
            voice_id: selectedVoice,
            speed: speed[0],
            pitch: pitch[0],
            emphasis: emphasis[0],
          }),
        },
      )

      if (!response.ok) {
        throw new Error("Failed to generate voiceover")
      }

      const data = await response.json()
      setGeneratedAudio(data.audio_url)
      setDuration(data.duration || 45) // Use actual duration from API
    } catch (error) {
      console.error("Error generating voiceover:", error)
      // Fallback to mock audio if API fails
      setGeneratedAudio("/generated-voiceover.mp3")
      setDuration(45)
    } finally {
      setIsGenerating(false)
    }
  }

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
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
                Save Voiceover
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
              <Volume2 className="w-6 h-6 text-primary" />
              <h1 className="text-3xl font-bold text-foreground font-[family-name:var(--font-work-sans)]">
                AI Voiceover Studio
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Transform your scripts into professional voiceovers with our AI-powered voice generation.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Voice Selection */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 font-[family-name:var(--font-work-sans)]">
                    <Mic className="w-5 h-5 text-primary" />
                    <span>Choose Voice</span>
                  </CardTitle>
                  <CardDescription>Select the perfect AI voice for your content</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Category Selection */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Voice Category</Label>
                    <div className="grid gap-2">
                      {voiceCategories.map((category) => (
                        <Card
                          key={category.id}
                          className={`cursor-pointer transition-all hover:shadow-sm ${
                            selectedCategory === category.id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                          onClick={() => setSelectedCategory(category.id)}
                        >
                          <CardContent className="p-3">
                            <h3 className="font-medium text-sm">{category.name}</h3>
                            <p className="text-xs text-muted-foreground mt-1">{category.description}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Voice Selection */}
                  {currentCategory && (
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Available Voices</Label>
                      <div className="space-y-2">
                        {currentCategory.voices.map((voice) => (
                          <Card
                            key={voice.id}
                            className={`cursor-pointer transition-all hover:shadow-sm ${
                              selectedVoice === voice.id
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/50"
                            }`}
                            onClick={() => handleVoiceSelect(voice.id)}
                          >
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <h3 className="font-medium text-sm">{voice.name}</h3>
                                    <Badge variant="secondary" className="text-xs">
                                      {voice.gender}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      <Globe className="w-3 h-3 mr-1" />
                                      {voice.accent}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground">{voice.description}</p>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    playVoiceSample(voice.sample)
                                  }}
                                >
                                  <Play className="w-3 h-3" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Voice Settings */}
                  {selectedVoice && (
                    <div className="space-y-4 pt-4 border-t border-border">
                      <Label className="text-sm font-medium flex items-center space-x-2">
                        <Settings className="w-4 h-4" />
                        <span>Voice Settings</span>
                      </Label>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs">Speed</Label>
                            <span className="text-xs text-muted-foreground">{speed[0]}x</span>
                          </div>
                          <Slider
                            value={speed}
                            onValueChange={setSpeed}
                            min={0.5}
                            max={2.0}
                            step={0.1}
                            className="w-full"
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs">Pitch</Label>
                            <span className="text-xs text-muted-foreground">
                              {pitch[0] > 0 ? "+" : ""}
                              {pitch[0]}
                            </span>
                          </div>
                          <Slider
                            value={pitch}
                            onValueChange={setPitch}
                            min={-10}
                            max={10}
                            step={1}
                            className="w-full"
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs">Emphasis</Label>
                            <span className="text-xs text-muted-foreground">
                              {emphasis[0] > 0 ? "+" : ""}
                              {emphasis[0]}
                            </span>
                          </div>
                          <Slider
                            value={emphasis}
                            onValueChange={setEmphasis}
                            min={-5}
                            max={5}
                            step={1}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Script Input & Generation */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 font-[family-name:var(--font-work-sans)]">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <span>Script & Generation</span>
                  </CardTitle>
                  <CardDescription>Enter your script text and generate professional voiceover</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Script Input */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="script">Script Text</Label>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          Import from Script Generator
                        </Button>
                        <span className="text-xs text-muted-foreground">{scriptText.length} characters</span>
                      </div>
                    </div>
                    <Textarea
                      id="script"
                      placeholder="Enter your script text here. The AI will generate a natural-sounding voiceover based on your selected voice and settings..."
                      value={scriptText}
                      onChange={(e) => setScriptText(e.target.value)}
                      className="min-h-[200px] font-mono text-sm"
                    />
                  </div>

                  {/* Generation Controls */}
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      {currentVoice && (
                        <>
                          <div className="flex items-center space-x-1">
                            <User className="w-4 h-4" />
                            <span>{currentVoice.name}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>Est. {Math.ceil(scriptText.length / 150)} min</span>
                          </div>
                        </>
                      )}
                    </div>
                    <Button
                      onClick={handleGenerate}
                      disabled={!scriptText || !selectedVoice || isGenerating}
                      className="bg-primary hover:bg-primary/90"
                      size="lg"
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-4 h-4 mr-2" />
                          Generate Voiceover
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Generated Audio Player */}
              <Card className="border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 font-[family-name:var(--font-work-sans)]">
                    <FileAudio className="w-5 h-5 text-primary" />
                    <span>Generated Voiceover</span>
                  </CardTitle>
                  <CardDescription>Preview, edit, and download your AI-generated voiceover</CardDescription>
                </CardHeader>
                <CardContent>
                  {!generatedAudio && !isGenerating && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <Volume2 className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2 font-[family-name:var(--font-work-sans)]">
                        Ready to Generate
                      </h3>
                      <p className="text-muted-foreground">
                        Select a voice, enter your script, and click "Generate Voiceover" to create your audio.
                      </p>
                    </div>
                  )}

                  {isGenerating && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2 font-[family-name:var(--font-work-sans)]">
                        Generating Voiceover
                      </h3>
                      <p className="text-muted-foreground">
                        Our AI is creating your professional voiceover. This may take a few moments...
                      </p>
                      <div className="mt-4 max-w-md mx-auto">
                        <div className="bg-muted rounded-full h-2">
                          <div className="bg-primary rounded-full h-2 animate-pulse" style={{ width: "60%" }} />
                        </div>
                      </div>
                    </div>
                  )}

                  {generatedAudio && (
                    <div className="space-y-6">
                      {/* Audio Player */}
                      <div className="bg-muted/30 rounded-lg p-6">
                        <div className="flex items-center space-x-4 mb-4">
                          <Button size="lg" onClick={togglePlayback} className="bg-primary hover:bg-primary/90">
                            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                          </Button>
                          <div className="flex-1">
                            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                              <span>{formatTime(currentTime)}</span>
                              <span>{formatTime(duration)}</span>
                            </div>
                            <div className="bg-muted rounded-full h-2">
                              <div
                                className="bg-primary rounded-full h-2 transition-all duration-300"
                                style={{ width: `${(currentTime / duration) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Waveform className="w-4 h-4" />
                              <span>High Quality</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{formatTime(duration)}</span>
                            </div>
                            {currentVoice && (
                              <div className="flex items-center space-x-1">
                                <User className="w-4 h-4" />
                                <span>{currentVoice.name}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Regenerate
                            </Button>
                            <Button variant="outline" size="sm">
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                            <Button size="sm" className="bg-primary hover:bg-primary/90">
                              <Save className="w-4 h-4 mr-2" />
                              Save & Continue
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Hidden audio element for playback */}
                      <audio
                        ref={audioRef}
                        src={generatedAudio}
                        onTimeUpdate={() => {
                          if (audioRef.current) {
                            setCurrentTime(audioRef.current.currentTime)
                          }
                        }}
                        onLoadedMetadata={() => {
                          if (audioRef.current) {
                            setDuration(audioRef.current.duration)
                          }
                        }}
                        onEnded={() => setIsPlaying(false)}
                      />
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
