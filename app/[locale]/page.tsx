"use client"

import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Play,
  Edit3,
  Zap,
  Users,
  Star,
  ArrowRight,
  Video,
  FileText,
  Volume2,
  Twitter,
  Facebook,
  Linkedin,
  Instagram,
} from "lucide-react"
import { Link } from "@/i18n/routing"
import { LanguageSwitcher } from "@/components/language-switcher"
import { SocialProof, FloatingSocialProof } from "@/components/social-proof"
import { QuickSocialShare } from "@/components/social-share"
import {
  WebSiteStructuredData,
  OrganizationStructuredData,
  SoftwareApplicationStructuredData,
} from "@/components/structured-data"
import { useLocale } from "next-intl"

export default function HomePage() {
  const t = useTranslations()
  const locale = useLocale()
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://filmfusion.app"
  const currentUrl = `${baseUrl}/${locale}`

  return (
    <div className="min-h-screen bg-background">
      <WebSiteStructuredData locale={locale} />
      <OrganizationStructuredData />
      <SoftwareApplicationStructuredData locale={locale} />

      <FloatingSocialProof />

      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Video className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground font-[family-name:var(--font-work-sans)]">
                FilmFusion
              </span>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                {t("navigation.features")}
              </a>
              <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
                {t("navigation.howItWorks")}
              </a>
              <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                {t("navigation.pricing")}
              </a>
              <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">
                {t("navigation.reviews")}
              </a>
            </nav>
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              <Button variant="ghost" className="hidden sm:inline-flex" asChild>
                <Link href="/auth/signin">{t("navigation.signIn")}</Link>
              </Button>
              <Button className="bg-primary hover:bg-primary/90" asChild>
                <Link href="/auth/signup">{t("navigation.startFreeTrial")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-background via-muted/30 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-accent/10 text-accent border-accent/20">{t("hero.badge")}</Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 font-[family-name:var(--font-work-sans)]">
              {t("hero.title", { aiAutomation: t("hero.aiAutomation") })}
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              {t("hero.description")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8 py-3" asChild>
                <Link href="/auth/signup">
                  <Play className="w-5 h-5 mr-2" />
                  {t("hero.startCreating")}
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-3 bg-transparent" asChild>
                <a href="#demo">
                  {t("hero.watchDemo")}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </a>
              </Button>
            </div>

            <div className="mt-8 flex items-center justify-center gap-4">
              <QuickSocialShare url={currentUrl} title={t("hero.title", { aiAutomation: t("hero.aiAutomation") })} />
              <div className="text-sm text-muted-foreground">{t("social.shareWith")}</div>
            </div>

            <div className="mt-12 flex items-center justify-center space-x-8 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-2" />
                {t("hero.stats.creators")}
              </div>
              <div className="flex items-center">
                <Star className="w-4 h-4 mr-2 text-accent fill-current" />
                {t("hero.stats.rating")}
              </div>
              <div className="flex items-center">
                <Zap className="w-4 h-4 mr-2" />
                {t("hero.stats.faster")}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <SocialProof showStats={true} showRecentActivity={true} showTrustBadges={true} />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 font-[family-name:var(--font-work-sans)]">
              {t("features.title")}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{t("features.description")}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-border shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="font-[family-name:var(--font-work-sans)]">
                  {t("features.aiScriptwriting.title")}
                </CardTitle>
                <CardDescription>{t("features.aiScriptwriting.description")}</CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-border shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Volume2 className="w-6 h-6 text-accent" />
                </div>
                <CardTitle className="font-[family-name:var(--font-work-sans)]">
                  {t("features.naturalVoiceovers.title")}
                </CardTitle>
                <CardDescription>{t("features.naturalVoiceovers.description")}</CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-border shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Edit3 className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="font-[family-name:var(--font-work-sans)]">
                  {t("features.automatedEditing.title")}
                </CardTitle>
                <CardDescription>{t("features.automatedEditing.description")}</CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-border shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-accent" />
                </div>
                <CardTitle className="font-[family-name:var(--font-work-sans)]">
                  {t("features.cloudRendering.title")}
                </CardTitle>
                <CardDescription>{t("features.cloudRendering.description")}</CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-border shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Video className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="font-[family-name:var(--font-work-sans)]">
                  {t("features.timelineEditor.title")}
                </CardTitle>
                <CardDescription>{t("features.timelineEditor.description")}</CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-border shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-accent" />
                </div>
                <CardTitle className="font-[family-name:var(--font-work-sans)]">
                  {t("features.teamCollaboration.title")}
                </CardTitle>
                <CardDescription>{t("features.teamCollaboration.description")}</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 font-[family-name:var(--font-work-sans)]">
              {t("howItWorks.title")}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{t("howItWorks.description")}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: t("howItWorks.steps.inputIdea.title"),
                description: t("howItWorks.steps.inputIdea.description"),
              },
              {
                step: "02",
                title: t("howItWorks.steps.aiGenerates.title"),
                description: t("howItWorks.steps.aiGenerates.description"),
              },
              {
                step: "03",
                title: t("howItWorks.steps.chooseVoice.title"),
                description: t("howItWorks.steps.chooseVoice.description"),
              },
              {
                step: "04",
                title: t("howItWorks.steps.renderShare.title"),
                description: t("howItWorks.steps.renderShare.description"),
              },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-primary font-[family-name:var(--font-work-sans)]">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3 font-[family-name:var(--font-work-sans)]">
                  {item.title}
                </h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 font-[family-name:var(--font-work-sans)]">
              {t("pricing.title")}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{t("pricing.description")}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <Card className="border-border shadow-sm relative">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold font-[family-name:var(--font-work-sans)]">
                  {t("pricing.plans.free.name")}
                </CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{t("pricing.plans.free.price")}</span>
                  <span className="text-muted-foreground">{t("pricing.plans.free.period")}</span>
                </div>
                <CardDescription className="mt-4">{t("pricing.plans.free.description")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    </div>
                    <span>{t("pricing.plans.free.features.videos")}</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    </div>
                    <span>{t("pricing.plans.free.features.quality")}</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    </div>
                    <span>{t("pricing.plans.free.features.voices")}</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    </div>
                    <span>{t("pricing.plans.free.features.templates")}</span>
                  </li>
                </ul>
                <Button className="w-full mt-8 bg-transparent" variant="outline" asChild>
                  <Link href="/auth/signup">{t("pricing.plans.free.cta")}</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="border-primary shadow-lg relative scale-105">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground px-4 py-1">{t("pricing.plans.pro.badge")}</Badge>
              </div>
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold font-[family-name:var(--font-work-sans)]">
                  {t("pricing.plans.pro.name")}
                </CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{t("pricing.plans.pro.price")}</span>
                  <span className="text-muted-foreground">{t("pricing.plans.pro.period")}</span>
                </div>
                <CardDescription className="mt-4">{t("pricing.plans.pro.description")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    </div>
                    <span>{t("pricing.plans.pro.features.videos")}</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    </div>
                    <span>{t("pricing.plans.pro.features.quality")}</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    </div>
                    <span>{t("pricing.plans.pro.features.voices")}</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    </div>
                    <span>{t("pricing.plans.pro.features.templates")}</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    </div>
                    <span>{t("pricing.plans.pro.features.rendering")}</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    </div>
                    <span>{t("pricing.plans.pro.features.support")}</span>
                  </li>
                </ul>
                <Button className="w-full mt-8 bg-primary hover:bg-primary/90" asChild>
                  <Link href="/pricing/checkout?plan=pro">{t("pricing.plans.pro.cta")}</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="border-border shadow-sm relative">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold font-[family-name:var(--font-work-sans)]">
                  {t("pricing.plans.enterprise.name")}
                </CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{t("pricing.plans.enterprise.price")}</span>
                  <span className="text-muted-foreground">{t("pricing.plans.enterprise.period")}</span>
                </div>
                <CardDescription className="mt-4">{t("pricing.plans.enterprise.description")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    </div>
                    <span>{t("pricing.plans.enterprise.features.videos")}</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    </div>
                    <span>{t("pricing.plans.enterprise.features.quality")}</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    </div>
                    <span>{t("pricing.plans.enterprise.features.voices")}</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    </div>
                    <span>{t("pricing.plans.enterprise.features.templates")}</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    </div>
                    <span>{t("pricing.plans.enterprise.features.collaboration")}</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    </div>
                    <span>{t("pricing.plans.enterprise.features.support")}</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    </div>
                    <span>{t("pricing.plans.enterprise.features.api")}</span>
                  </li>
                </ul>
                <Button className="w-full mt-8 bg-transparent" variant="outline" asChild>
                  <Link href="/pricing/checkout?plan=enterprise">{t("pricing.plans.enterprise.cta")}</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 font-[family-name:var(--font-work-sans)]">
              {t("testimonials.title")}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{t("testimonials.description")}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: t("testimonials.reviews.sarah.name"),
                role: t("testimonials.reviews.sarah.role"),
                content: t("testimonials.reviews.sarah.content"),
                rating: 5,
              },
              {
                name: t("testimonials.reviews.marcus.name"),
                role: t("testimonials.reviews.marcus.role"),
                content: t("testimonials.reviews.marcus.content"),
                rating: 5,
              },
              {
                name: t("testimonials.reviews.emily.name"),
                role: t("testimonials.reviews.emily.role"),
                content: t("testimonials.reviews.emily.content"),
                rating: 5,
              },
            ].map((testimonial, index) => (
              <Card key={index} className="border-border shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-accent fill-current" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold text-foreground font-[family-name:var(--font-work-sans)]">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-primary-foreground mb-4 font-[family-name:var(--font-work-sans)]">
            {t("cta.title")}
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">{t("cta.description")}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-3" asChild>
              <Link href="/auth/signup">
                {t("cta.startTrial")}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-3 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 bg-transparent"
              asChild
            >
              <a href="#demo">{t("cta.scheduleDemo")}</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Video className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-foreground font-[family-name:var(--font-work-sans)]">
                  FilmFusion
                </span>
              </div>
              <p className="text-muted-foreground mb-4">{t("footer.description")}</p>

              <div className="flex items-center space-x-4">
                <a
                  href="https://twitter.com/filmfusion"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <a
                  href="https://facebook.com/filmfusion"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href="https://linkedin.com/company/filmfusion"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <a
                  href="https://instagram.com/filmfusion"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4 font-[family-name:var(--font-work-sans)]">
                {t("footer.product.title")}
              </h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a href="#features" className="hover:text-foreground transition-colors">
                    {t("footer.product.features")}
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-foreground transition-colors">
                    {t("footer.product.pricing")}
                  </a>
                </li>
                <li>
                  <a href="#api" className="hover:text-foreground transition-colors">
                    {t("footer.product.api")}
                  </a>
                </li>
                <li>
                  <a href="#integrations" className="hover:text-foreground transition-colors">
                    {t("footer.product.integrations")}
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4 font-[family-name:var(--font-work-sans)]">
                {t("footer.company.title")}
              </h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a href="#about" className="hover:text-foreground transition-colors">
                    {t("footer.company.about")}
                  </a>
                </li>
                <li>
                  <a href="#blog" className="hover:text-foreground transition-colors">
                    {t("footer.company.blog")}
                  </a>
                </li>
                <li>
                  <a href="#careers" className="hover:text-foreground transition-colors">
                    {t("footer.company.careers")}
                  </a>
                </li>
                <li>
                  <a href="#contact" className="hover:text-foreground transition-colors">
                    {t("footer.company.contact")}
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4 font-[family-name:var(--font-work-sans)]">
                {t("footer.support.title")}
              </h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a href="#help-center" className="hover:text-foreground transition-colors">
                    {t("footer.support.helpCenter")}
                  </a>
                </li>
                <li>
                  <a href="#documentation" className="hover:text-foreground transition-colors">
                    {t("footer.support.documentation")}
                  </a>
                </li>
                <li>
                  <a href="#community" className="hover:text-foreground transition-colors">
                    {t("footer.support.community")}
                  </a>
                </li>
                <li>
                  <a href="#status" className="hover:text-foreground transition-colors">
                    {t("footer.support.status")}
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>{t("footer.copyright")}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
