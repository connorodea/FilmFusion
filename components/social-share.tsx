"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Share2, Twitter, Facebook, Linkedin, Copy, Check } from "lucide-react"
import { useTranslations } from "next-intl"

interface SocialShareProps {
  url: string
  title: string
  description?: string
  image?: string
  hashtags?: string[]
}

export function SocialShare({ url, title, description, image, hashtags = [] }: SocialShareProps) {
  const t = useTranslations()
  const [copied, setCopied] = useState(false)
  const [customMessage, setCustomMessage] = useState(description || "")

  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}&hashtags=${hashtags.join(",")}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    reddit: `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
    pinterest: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(title)}${image ? `&media=${encodeURIComponent(image)}` : ""}`,
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const openShareWindow = (shareUrl: string) => {
    window.open(shareUrl, "_blank", "width=600,height=400,scrollbars=yes,resizable=yes")
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="w-4 h-4 mr-2" />
          {t("social.share")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("social.shareTitle")}</DialogTitle>
          <DialogDescription>{t("social.shareDescription")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Custom Message */}
          <div>
            <Label htmlFor="message">{t("social.customMessage")}</Label>
            <Textarea
              id="message"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder={t("social.messagePlaceholder")}
              rows={3}
            />
          </div>

          {/* Hashtags */}
          {hashtags.length > 0 && (
            <div>
              <Label>{t("social.hashtags")}</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {hashtags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Social Media Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => openShareWindow(shareUrls.twitter)}
              className="flex items-center gap-2"
            >
              <Twitter className="w-4 h-4 text-blue-400" />
              Twitter
            </Button>

            <Button
              variant="outline"
              onClick={() => openShareWindow(shareUrls.facebook)}
              className="flex items-center gap-2"
            >
              <Facebook className="w-4 h-4 text-blue-600" />
              Facebook
            </Button>

            <Button
              variant="outline"
              onClick={() => openShareWindow(shareUrls.linkedin)}
              className="flex items-center gap-2"
            >
              <Linkedin className="w-4 h-4 text-blue-700" />
              LinkedIn
            </Button>

            <Button
              variant="outline"
              onClick={() => openShareWindow(shareUrls.pinterest)}
              className="flex items-center gap-2"
            >
              <div className="w-4 h-4 bg-red-600 rounded-full" />
              Pinterest
            </Button>
          </div>

          {/* Copy Link */}
          <div className="flex items-center space-x-2">
            <Input value={url} readOnly className="flex-1" />
            <Button variant="outline" size="sm" onClick={copyToClipboard}>
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Quick share buttons for inline use
export function QuickSocialShare({ url, title, className }: { url: string; title: string; className?: string }) {
  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  }

  const openShareWindow = (shareUrl: string) => {
    window.open(shareUrl, "_blank", "width=600,height=400,scrollbars=yes,resizable=yes")
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button variant="ghost" size="sm" onClick={() => openShareWindow(shareUrls.twitter)} className="p-2">
        <Twitter className="w-4 h-4 text-blue-400" />
      </Button>

      <Button variant="ghost" size="sm" onClick={() => openShareWindow(shareUrls.facebook)} className="p-2">
        <Facebook className="w-4 h-4 text-blue-600" />
      </Button>

      <Button variant="ghost" size="sm" onClick={() => openShareWindow(shareUrls.linkedin)} className="p-2">
        <Linkedin className="w-4 h-4 text-blue-700" />
      </Button>
    </div>
  )
}
