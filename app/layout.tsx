import type React from "react"
import type { Metadata } from "next"
import { redirect } from "next/navigation"
import "./globals.css"

export const metadata: Metadata = {
  title: "FilmFusion - AI-Driven Video Creation Platform",
  description: "Create professional long-form videos with AI-powered scriptwriting, voiceovers, and automated editing",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  redirect("/en")
}
