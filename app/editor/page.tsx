"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  Video,
  ArrowLeft,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Scissors,
  Copy,
  Trash2,
  Save,
  Type,
  ImageIcon,
  Music,
  Layers,
  Maximize,
  RotateCcw,
  RotateCw,
  Square,
  Cloud,
} from "lucide-react"
import Link from "next/link"

// Sample timeline data
const sampleTimelineData = {
  duration: 120, // 2 minutes in seconds
  tracks: [
    {
      id: "video-1",
      type: "video",
      name: "Main Video Track",
      clips: [
        {
          id: "clip-1",
          name: "Intro Scene",
          start: 0,
          duration: 15,
          thumbnail: "/product-launch-thumbnail.png",
          type: "video",
        },
        {
          id: "clip-2",
          name: "Product Demo",
          start: 15,
          duration: 30,
          thumbnail: "/educational-course-intro.png",
          type: "video",
        },
        {
          id: "clip-3",
          name: "Testimonials",
          start: 45,
          duration: 25,
          thumbnail: "/company-culture-thumbnail.png",
          type: "video",
        },
      ],
    },
    {
      id: "audio-1",
      type: "audio",
      name: "Voiceover Track",
      clips: [
        {
          id: "audio-clip-1",
          name: "AI Voiceover",
          start: 0,
          duration: 70,
          type: "audio",
          waveform: true,
        },
      ],
    },
    {
      id: "text-1",
      type: "text",
      name: "Text & Captions",
      clips: [
        {
          id: "text-clip-1",
          name: "Title Card",
          start: 0,
          duration: 5,
          type: "text",
          content: "Welcome to FilmFusion",
        },
        {
          id: "text-clip-2",
          name: "Subtitle",
          start: 15,
          duration: 10,
          type: "text",
          content: "AI-Powered Video Creation",
        },
      ],
    },
    {
      id: "music-1",
      type: "music",
      name: "Background Music",
      clips: [
        {
          id: "music-clip-1",
          name: "Background Track",
          start: 0,
          duration: 120,
          type: "music",
          waveform: true,
        },
      ],
    },
  ],
}

const PIXELS_PER_SECOND = 10
const TRACK_HEIGHT = 80

export default function VideoEditorPage() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration] = useState(sampleTimelineData.duration)
  const [volume, setVolume] = useState([80])
  const [zoom, setZoom] = useState([1])
  const [selectedClip, setSelectedClip] = useState<string | null>(null)
  const [timelineData] = useState(sampleTimelineData)
  const timelineRef = useRef<HTMLDivElement>(null)
  const playheadRef = useRef<HTMLDivElement>(null)

  const togglePlayback = () => {
    setIsPlaying(!isPlaying)
  }

  const handleTimelineClick = (e: React.MouseEvent) => {
    if (timelineRef.current) {
      const rect = timelineRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const newTime = x / (PIXELS_PER_SECOND * zoom[0])
      setCurrentTime(Math.max(0, Math.min(duration, newTime)))
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getClipColor = (type: string) => {
    switch (type) {
      case "video":
        return "bg-blue-500"
      case "audio":
        return "bg-green-500"
      case "text":
        return "bg-purple-500"
      case "music":
        return "bg-orange-500"
      default:
        return "bg-gray-500"
    }
  }

  const getTrackIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="w-4 h-4" />
      case "audio":
        return <Volume2 className="w-4 h-4" />
      case "text":
        return <Type className="w-4 h-4" />
      case "music":
        return <Music className="w-4 h-4" />
      default:
        return <Square className="w-4 h-4" />
    }
  }

  // Simulate playback
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false)
            return duration
          }
          return prev + 0.1
        })
      }, 100)
    }
    return () => clearInterval(interval)
  }, [isPlaying, duration])

  return (
    <div className="min-h-screen bg-background flex flex-col">
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
                  FilmFusion Editor
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Save className="w-4 h-4 mr-2" />
                Save Project
              </Button>
              <Link href="/render">
                <Button size="sm" className="bg-primary hover:bg-primary/90">
                  <Cloud className="w-4 h-4 mr-2" />
                  Render Video
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Left Sidebar - Media Library */}
        <div className="w-80 border-r border-border bg-muted/30 p-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3 font-[family-name:var(--font-work-sans)]">
                Media Library
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="h-20 flex-col bg-transparent">
                  <Video className="w-6 h-6 mb-1" />
                  <span className="text-xs">Add Video</span>
                </Button>
                <Button variant="outline" size="sm" className="h-20 flex-col bg-transparent">
                  <Volume2 className="w-6 h-6 mb-1" />
                  <span className="text-xs">Add Audio</span>
                </Button>
                <Button variant="outline" size="sm" className="h-20 flex-col bg-transparent">
                  <ImageIcon className="w-6 h-6 mb-1" />
                  <span className="text-xs">Add Image</span>
                </Button>
                <Button variant="outline" size="sm" className="h-20 flex-col bg-transparent">
                  <Type className="w-6 h-6 mb-1" />
                  <span className="text-xs">Add Text</span>
                </Button>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-foreground mb-2">Recent Media</h4>
              <div className="space-y-2">
                {[
                  { name: "Intro Scene", type: "video", duration: "0:15" },
                  { name: "AI Voiceover", type: "audio", duration: "1:10" },
                  { name: "Background Music", type: "music", duration: "2:00" },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 p-2 rounded-lg bg-background hover:bg-muted cursor-pointer"
                  >
                    <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                      {getTrackIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.duration}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Preview Area */}
          <div className="flex-1 flex">
            {/* Video Preview */}
            <div className="flex-1 bg-black flex items-center justify-center relative">
              <div className="w-full max-w-2xl aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                <div className="text-center text-white">
                  <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Video Preview</p>
                  <p className="text-sm opacity-75">Your video will appear here</p>
                </div>
              </div>

              {/* Preview Controls Overlay */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/80 rounded-lg px-4 py-2">
                <div className="flex items-center space-x-2 text-white">
                  <Button size="sm" variant="ghost" onClick={togglePlayback}>
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <span className="text-sm">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                  <Button size="sm" variant="ghost">
                    <Maximize className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Panel - Properties */}
            <div className="w-80 border-l border-border bg-muted/30 p-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3 font-[family-name:var(--font-work-sans)]">
                    Properties
                  </h3>
                  {selectedClip ? (
                    <Card className="border-border shadow-sm">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Clip Settings</CardTitle>
                        <CardDescription className="text-xs">Adjust the selected clip properties</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-2">
                          <Label className="text-xs">Duration</Label>
                          <Input size="sm" placeholder="00:15" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs">Volume</Label>
                          <Slider value={volume} onValueChange={setVolume} max={100} step={1} />
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                            <Copy className="w-3 h-3 mr-1" />
                            Copy
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                            <Trash2 className="w-3 h-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="text-center py-8">
                      <Layers className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Select a clip to edit its properties</p>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">Quick Actions</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button size="sm" variant="outline">
                      <Scissors className="w-3 h-3 mr-1" />
                      Split
                    </Button>
                    <Button size="sm" variant="outline">
                      <Copy className="w-3 h-3 mr-1" />
                      Duplicate
                    </Button>
                    <Button size="sm" variant="outline">
                      <RotateCcw className="w-3 h-3 mr-1" />
                      Undo
                    </Button>
                    <Button size="sm" variant="outline">
                      <RotateCw className="w-3 h-3 mr-1" />
                      Redo
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Area */}
          <div className="h-80 border-t border-border bg-background">
            {/* Timeline Controls */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="outline" onClick={togglePlayback}>
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Button size="sm" variant="outline">
                    <SkipBack className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <SkipForward className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">{formatTime(currentTime)}</span>
                  <div className="w-px h-4 bg-border" />
                  <span className="text-sm text-muted-foreground">{formatTime(duration)}</span>
                </div>
              </div>

              {/* Timeline Content */}
              <div className="flex-1 overflow-auto">
                <div className="flex">
                  {/* Track Labels */}
                  <div className="w-40 bg-muted/30 border-r border-border">
                    {timelineData.tracks.map((track) => (
                      <div key={track.id} className="h-20 flex items-center px-3 border-b border-border">
                        <div className="flex items-center space-x-2">
                          <div
                            className={`w-6 h-6 rounded flex items-center justify-center text-white ${getClipColor(track.type)}`}
                          >
                            {getTrackIcon(track.type)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{track.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">{track.type}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Timeline Content */}
                  <div className="flex-1 relative" ref={timelineRef} onClick={handleTimelineClick}>
                    {/* Time Ruler */}
                    <div className="h-8 bg-muted/50 border-b border-border relative">
                      {Array.from({ length: Math.ceil(duration / 10) + 1 }, (_, i) => (
                        <div
                          key={i}
                          className="absolute top-0 h-full flex items-center"
                          style={{ left: `${i * 10 * PIXELS_PER_SECOND * zoom[0]}px` }}
                        >
                          <div className="w-px h-full bg-border" />
                          <span className="text-xs text-muted-foreground ml-1">{formatTime(i * 10)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Tracks */}
                    {timelineData.tracks.map((track, trackIndex) => (
                      <div
                        key={track.id}
                        className="h-20 border-b border-border relative bg-background hover:bg-muted/20"
                      >
                        {track.clips.map((clip) => (
                          <div
                            key={clip.id}
                            className={`absolute top-2 bottom-2 rounded cursor-pointer transition-all hover:opacity-80 ${getClipColor(track.type)} ${
                              selectedClip === clip.id ? "ring-2 ring-primary" : ""
                            }`}
                            style={{
                              left: `${clip.start * PIXELS_PER_SECOND * zoom[0]}px`,
                              width: `${clip.duration * PIXELS_PER_SECOND * zoom[0]}px`,
                            }}
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedClip(clip.id)
                            }}
                          >
                            <div className="h-full flex items-center px-2 text-white">
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium truncate">{clip.name}</p>
                                {clip.type === "text" && clip.content && (
                                  <p className="text-xs opacity-75 truncate">{clip.content}</p>
                                )}
                              </div>
                              {(clip.type === "audio" || clip.type === "music") && clip.waveform && (
                                <div className="flex items-center space-x-px ml-2">
                                  {Array.from({ length: 20 }, (_, i) => (
                                    <div
                                      key={i}
                                      className="w-px bg-white/50"
                                      style={{ height: `${Math.random() * 20 + 5}px` }}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}

                    {/* Playhead */}
                    <div
                      ref={playheadRef}
                      className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10 pointer-events-none"
                      style={{ left: `${currentTime * PIXELS_PER_SECOND * zoom[0]}px` }}
                    >
                      <div className="w-3 h-3 bg-red-500 rounded-full -translate-x-1/2 -translate-y-1/2 absolute top-4" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
