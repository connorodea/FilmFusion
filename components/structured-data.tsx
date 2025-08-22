interface StructuredDataProps {
  type: "WebSite" | "Organization" | "SoftwareApplication" | "Article" | "VideoObject" | "BreadcrumbList"
  data: any
}

export function StructuredData({ type, data }: StructuredDataProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://filmfusion.app"

  const structuredData = {
    "@context": "https://schema.org",
    "@type": type,
    ...data,
  }

  // Add common properties based on type
  if (type === "WebSite") {
    structuredData.url = baseUrl
    structuredData.potentialAction = {
      "@type": "SearchAction",
      target: `${baseUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    }
  }

  if (type === "Organization") {
    structuredData.url = baseUrl
    structuredData.logo = `${baseUrl}/logo.png`
    structuredData.sameAs = [
      "https://twitter.com/filmfusion",
      "https://linkedin.com/company/filmfusion",
      "https://github.com/filmfusion",
    ]
  }

  if (type === "SoftwareApplication") {
    structuredData.applicationCategory = "MultimediaApplication"
    structuredData.operatingSystem = "Web Browser"
    structuredData.offers = {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      priceValidUntil: "2025-12-31",
    }
  }

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
}

// Predefined structured data components
export function WebSiteStructuredData({ locale }: { locale: string }) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://filmfusion.app"

  return (
    <StructuredData
      type="WebSite"
      data={{
        name: "FilmFusion",
        description: "AI-Driven Video Creation Platform for professional long-form content",
        url: `${baseUrl}/${locale}`,
        inLanguage: locale,
        publisher: {
          "@type": "Organization",
          name: "FilmFusion",
          url: baseUrl,
        },
      }}
    />
  )
}

export function OrganizationStructuredData() {
  return (
    <StructuredData
      type="Organization"
      data={{
        name: "FilmFusion",
        description: "AI-Driven Video Creation Platform",
        foundingDate: "2024",
        industry: "Software",
        numberOfEmployees: "10-50",
        address: {
          "@type": "PostalAddress",
          addressCountry: "US",
        },
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer service",
          email: "support@filmfusion.app",
        },
      }}
    />
  )
}

export function SoftwareApplicationStructuredData({ locale }: { locale: string }) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://filmfusion.app"

  return (
    <StructuredData
      type="SoftwareApplication"
      data={{
        name: "FilmFusion",
        description: "Create professional videos with AI-powered tools",
        url: `${baseUrl}/${locale}`,
        applicationCategory: "MultimediaApplication",
        operatingSystem: "Web Browser",
        browserRequirements: "Requires JavaScript. Requires HTML5.",
        softwareVersion: "1.0",
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.8",
          ratingCount: "1250",
          bestRating: "5",
          worstRating: "1",
        },
        author: {
          "@type": "Organization",
          name: "FilmFusion",
        },
      }}
    />
  )
}
