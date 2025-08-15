"use client"

import { useTranslations, useLocale } from "next-intl"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { I18nTestPanel } from "@/components/i18n-test-panel"
import { Globe, CheckCircle, AlertCircle } from "lucide-react"

export default function I18nTestPage() {
  const t = useTranslations()
  const locale = useLocale()

  const sampleTranslations = [
    { key: "navigation.features", value: t("navigation.features") },
    { key: "hero.title", value: t("hero.title", { aiAutomation: t("hero.aiAutomation") }) },
    { key: "hero.description", value: t("hero.description") },
    { key: "features.title", value: t("features.title") },
    { key: "pricing.title", value: t("pricing.title") },
    { key: "testimonials.title", value: t("testimonials.title") },
    { key: "cta.title", value: t("cta.title") },
    { key: "footer.copyright", value: t("footer.copyright") },
    { key: "auth.signIn.title", value: t("auth.signIn.title") },
    { key: "auth.signUp.title", value: t("auth.signUp.title") },
    { key: "common.loading", value: t("common.loading") },
    { key: "common.error", value: t("common.error") },
  ]

  return (
    <div className="min-h-screen bg-muted/30 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Globe className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">i18n Testing Dashboard</h1>
          </div>
          <p className="text-muted-foreground">
            Comprehensive testing interface for FilmFusion's internationalization system
          </p>
          <Badge variant="outline" className="mt-2">
            Current Locale: {locale.toUpperCase()}
          </Badge>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Translation Verification</span>
              </CardTitle>
              <CardDescription>Sample translations for current locale ({locale})</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {sampleTranslations.map((item, index) => (
                  <div key={index} className="border-l-2 border-primary/20 pl-3">
                    <div className="text-xs text-muted-foreground font-mono">{item.key}</div>
                    <div className="text-sm">{item.value}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                <span>Testing Instructions</span>
              </CardTitle>
              <CardDescription>How to test the i18n functionality</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">1. Language Switching</h4>
                  <p className="text-muted-foreground">
                    Use the language switcher in the header or the test panel to switch between languages.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">2. URL Testing</h4>
                  <p className="text-muted-foreground">
                    Navigate directly to /en, /es, /fr, /de, /zh, /ja to test locale routing.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">3. Content Verification</h4>
                  <p className="text-muted-foreground">Check that all text content updates when switching languages.</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">4. Layout Testing</h4>
                  <p className="text-muted-foreground">Verify that longer translations don't break the layout.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Supported Languages</CardTitle>
            <CardDescription>FilmFusion supports 6 languages with comprehensive translations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { code: "en", name: "English", flag: "🇺🇸", status: "Complete" },
                { code: "es", name: "Español", flag: "🇪🇸", status: "Complete" },
                { code: "fr", name: "Français", flag: "🇫🇷", status: "Complete" },
                { code: "de", name: "Deutsch", flag: "🇩🇪", status: "Complete" },
                { code: "zh", name: "中文", flag: "🇨🇳", status: "Complete" },
                { code: "ja", name: "日本語", flag: "🇯🇵", status: "Complete" },
              ].map((lang) => (
                <div
                  key={lang.code}
                  className={`p-3 rounded-lg border-2 ${
                    locale === lang.code ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-lg">{lang.flag}</span>
                    <span className="font-semibold">{lang.name}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">{lang.code.toUpperCase()}</div>
                  <Badge size="sm" className="mt-1">
                    {lang.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <I18nTestPanel />
    </div>
  )
}
