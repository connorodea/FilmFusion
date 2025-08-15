import type React from "react"
import type { Metadata } from "next"
import { Work_Sans, Open_Sans } from "next/font/google"
import { NextIntlClientProvider } from "next-intl"
import { getMessages } from "next-intl/server"
import { notFound } from "next/navigation"
import "../globals.css"

const workSans = Work_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-work-sans",
})

const openSans = Open_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-open-sans",
})

const locales = ["en", "es", "fr", "de", "zh", "ja"]

export const metadata: Metadata = {
  title: "FilmFusion - AI-Driven Video Creation Platform",
  description: "Create professional long-form videos with AI-powered scriptwriting, voiceovers, and automated editing",
  generator: "v0.app",
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  // Ensure that the incoming `locale` is valid
  if (!locales.includes(locale as any)) {
    notFound()
  }

  // Providing all messages to the client side
  const messages = await getMessages()

  return (
    <html lang={locale} className={`${workSans.variable} ${openSans.variable} antialiased`}>
      <body className="font-sans">
        <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
      </body>
    </html>
  )
}
