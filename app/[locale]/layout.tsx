import type React from "react"
import type { Metadata } from "next"
import { Work_Sans, Open_Sans } from "next/font/google"
import { NextIntlClientProvider } from "next-intl"
import { getMessages } from "next-intl/server"
import { notFound } from "next/navigation"
import "../globals.css"
import { GoogleAnalytics } from "../../components/analytics"
import { PerformanceMonitor } from "../../components/performance-monitor"

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

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://filmfusion.app"

  const localeMetadata = {
    en: {
      title: "FilmFusion - AI-Driven Video Creation Platform",
      description:
        "Create professional long-form videos with AI-powered scriptwriting, voiceovers, and automated editing. Transform your ideas into engaging content with cutting-edge AI technology.",
      keywords:
        "AI video creation, video editing, scriptwriting, voiceover, automated editing, content creation, video production, AI tools",
    },
    es: {
      title: "FilmFusion - Plataforma de Creación de Videos con IA",
      description:
        "Crea videos profesionales de formato largo con guiones, locuciones y edición automatizada impulsados por IA. Transforma tus ideas en contenido atractivo.",
      keywords:
        "creación de videos IA, edición de video, guiones, locución, edición automatizada, creación de contenido",
    },
    fr: {
      title: "FilmFusion - Plateforme de Création Vidéo IA",
      description:
        "Créez des vidéos professionnelles longues avec des scripts, des voix off et un montage automatisé alimentés par l'IA. Transformez vos idées en contenu engageant.",
      keywords: "création vidéo IA, montage vidéo, scripts, voix off, montage automatisé, création de contenu",
    },
    de: {
      title: "FilmFusion - KI-gesteuerte Video-Erstellungsplattform",
      description:
        "Erstellen Sie professionelle Langform-Videos mit KI-gestützten Drehbüchern, Voiceovers und automatisierter Bearbeitung. Verwandeln Sie Ihre Ideen in ansprechende Inhalte.",
      keywords:
        "KI-Videoerstellung, Videobearbeitung, Drehbücher, Voiceover, automatisierte Bearbeitung, Content-Erstellung",
    },
    zh: {
      title: "FilmFusion - AI驱动的视频创作平台",
      description: "使用AI驱动的脚本编写、配音和自动编辑创建专业的长视频。将您的想法转化为引人入胜的内容。",
      keywords: "AI视频创作, 视频编辑, 脚本编写, 配音, 自动编辑, 内容创作",
    },
    ja: {
      title: "FilmFusion - AI駆動動画作成プラットフォーム",
      description:
        "AI搭載の脚本作成、ナレーション、自動編集でプロフェッショナルな長編動画を作成。アイデアを魅力的なコンテンツに変換します。",
      keywords: "AI動画作成, 動画編集, 脚本作成, ナレーション, 自動編集, コンテンツ作成",
    },
  }

  const meta = localeMetadata[locale as keyof typeof localeMetadata] || localeMetadata.en

  return {
    title: {
      default: meta.title,
      template: `%s | FilmFusion`,
    },
    description: meta.description,
    keywords: meta.keywords,
    authors: [{ name: "FilmFusion Team" }],
    creator: "FilmFusion",
    publisher: "FilmFusion",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages: {
        en: `${baseUrl}/en`,
        es: `${baseUrl}/es`,
        fr: `${baseUrl}/fr`,
        de: `${baseUrl}/de`,
        zh: `${baseUrl}/zh`,
        ja: `${baseUrl}/ja`,
      },
    },
    openGraph: {
      type: "website",
      locale: locale,
      url: `${baseUrl}/${locale}`,
      title: meta.title,
      description: meta.description,
      siteName: "FilmFusion",
      images: [
        {
          url: `${baseUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: "FilmFusion - AI-Driven Video Creation Platform",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
      images: [`${baseUrl}/twitter-image.png`],
      creator: "@filmfusion",
      site: "@filmfusion",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
      yandex: process.env.YANDEX_VERIFICATION,
      yahoo: process.env.YAHOO_VERIFICATION,
    },
    category: "technology",
  }
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//api.filmfusion.app" />
        <meta name="theme-color" content="#0EA5E9" />
        <meta name="msapplication-TileColor" content="#0EA5E9" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="FilmFusion" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />

        <GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ""} />

        {/* Facebook Pixel */}
        {process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID && (
          <>
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  !function(f,b,e,v,n,t,s)
                  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                  n.queue=[];t=b.createElement(e);t.async=!0;
                  t.src=v;s=b.getElementsByTagName(e)[0];
                  s.parentNode.insertBefore(t,s)}(window, document,'script',
                  'https://connect.facebook.net/en_US/fbevents.js');
                  fbq('init', '${process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID}');
                  fbq('track', 'PageView');
                `,
              }}
            />
            <noscript>
              <img
                height="1"
                width="1"
                style={{ display: "none" }}
                src={`https://www.facebook.com/tr?id=${process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID}&ev=PageView&noscript=1`}
                alt=""
              />
            </noscript>
          </>
        )}

        {/* LinkedIn Insight Tag */}
        {process.env.NEXT_PUBLIC_LINKEDIN_PARTNER_ID && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                _linkedin_partner_id = "${process.env.NEXT_PUBLIC_LINKEDIN_PARTNER_ID}";
                window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
                window._linkedin_data_partner_ids.push(_linkedin_partner_id);
                (function(l) {
                if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
                window.lintrk.q=[]}
                var s = document.getElementsByTagName("script")[0];
                var b = document.createElement("script");
                b.type = "text/javascript";b.async = true;
                b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
                s.parentNode.insertBefore(b, s);})(window.lintrk);
              `,
            }}
          />
        )}

        {/* Hotjar Tracking */}
        {process.env.NEXT_PUBLIC_HOTJAR_ID && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function(h,o,t,j,a,r){
                    h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                    h._hjSettings={hjid:${process.env.NEXT_PUBLIC_HOTJAR_ID},hjsv:6};
                    a=o.getElementsByTagName('head')[0];
                    r=o.createElement('script');r.async=1;
                    r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                    a.appendChild(r);
                })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
              `,
            }}
          />
        )}
      </head>
      <body className="font-sans">
        <NextIntlClientProvider messages={messages}>
          {children}
          <PerformanceMonitor />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
