"use client"

import { useLocale, useTranslations } from "next-intl"
import { useRouter, usePathname } from "@/i18n/routing"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, XCircle, TestTube, Zap } from "lucide-react"
import { useState, useEffect } from "react"

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
]

const testKeys = [
  "navigation.features",
  "hero.title",
  "hero.description",
  "features.title",
  "pricing.title",
  "testimonials.title",
  "cta.title",
  "footer.copyright",
  "auth.signIn.title",
  "auth.signUp.title",
  "common.loading",
  "common.error",
]

export function I18nTestPanel() {
  const locale = useLocale()
  const t = useTranslations()
  const router = useRouter()
  const pathname = usePathname()
  const [testResults, setTestResults] = useState<Record<string, boolean>>({})
  const [isRunningTests, setIsRunningTests] = useState(false)

  const runTranslationTests = () => {
    setIsRunningTests(true)
    const results: Record<string, boolean> = {}

    testKeys.forEach((key) => {
      try {
        const translation = t(key as any)
        // Check if translation exists and is not just the key
        results[key] = translation && translation !== key && !translation.startsWith("Missing")
      } catch (error) {
        results[key] = false
      }
    })

    setTestResults(results)
    setIsRunningTests(false)
  }

  const switchLanguage = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale })
  }

  const runQuickLanguageTest = async () => {
    setIsRunningTests(true)

    for (const lang of languages) {
      if (lang.code !== locale) {
        switchLanguage(lang.code)
        await new Promise((resolve) => setTimeout(resolve, 1000)) // Wait for language switch
      }
    }

    // Return to original language
    switchLanguage(locale)
    setIsRunningTests(false)
  }

  useEffect(() => {
    runTranslationTests()
  }, [locale, t])

  const passedTests = Object.values(testResults).filter(Boolean).length
  const totalTests = testKeys.length
  const testScore = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-96 max-h-96 overflow-hidden shadow-lg border-2 border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TestTube className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">i18n Test Panel</CardTitle>
            </div>
            <Badge variant={testScore >= 90 ? "default" : testScore >= 70 ? "secondary" : "destructive"}>
              {testScore}%
            </Badge>
          </div>
          <CardDescription>
            Current: {languages.find((l) => l.code === locale)?.flag} {languages.find((l) => l.code === locale)?.name}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue="tests" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="tests">Tests</TabsTrigger>
              <TabsTrigger value="languages">Languages</TabsTrigger>
              <TabsTrigger value="tools">Tools</TabsTrigger>
            </TabsList>

            <TabsContent value="tests" className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Translation Tests</span>
                <Button size="sm" onClick={runTranslationTests} disabled={isRunningTests}>
                  {isRunningTests ? "Testing..." : "Run Tests"}
                </Button>
              </div>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {testKeys.map((key) => (
                  <div key={key} className="flex items-center justify-between text-xs">
                    <span className="truncate flex-1">{key}</span>
                    {testResults[key] ? (
                      <CheckCircle className="w-4 h-4 text-green-500 ml-2" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500 ml-2" />
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="languages" className="space-y-3">
              <div className="text-sm font-medium">Quick Language Switch</div>
              <div className="grid grid-cols-3 gap-2">
                {languages.map((lang) => (
                  <Button
                    key={lang.code}
                    size="sm"
                    variant={locale === lang.code ? "default" : "outline"}
                    onClick={() => switchLanguage(lang.code)}
                    className="text-xs p-2"
                  >
                    <span className="mr-1">{lang.flag}</span>
                    {lang.code.toUpperCase()}
                  </Button>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="tools" className="space-y-3">
              <Button size="sm" onClick={runQuickLanguageTest} disabled={isRunningTests} className="w-full">
                <Zap className="w-4 h-4 mr-2" />
                {isRunningTests ? "Testing..." : "Quick Language Test"}
              </Button>
              <div className="text-xs text-muted-foreground">Tests all languages automatically</div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
