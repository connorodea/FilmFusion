import type { MetadataRoute } from "next"

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://filmfusion.app"
const locales = ["en", "es", "fr", "de", "zh", "ja"]

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/auth/signin",
    "/auth/signup",
    "/pricing",
    "/blog",
    "/dashboard",
    "/script-generator",
    "/voiceover",
    "/editor",
    "/render",
    "/billing",
    "/support",
  ]

  const sitemap: MetadataRoute.Sitemap = []

  // Add routes for each locale
  locales.forEach((locale) => {
    routes.forEach((route) => {
      sitemap.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: route === "" ? "daily" : route.includes("blog") ? "weekly" : "monthly",
        priority: route === "" ? 1 : route.includes("blog") ? 0.8 : 0.7,
        alternates: {
          languages: Object.fromEntries(locales.map((loc) => [loc, `${baseUrl}/${loc}${route}`])),
        },
      })
    })
  })

  // Add blog posts (this would be dynamic in a real implementation)
  sitemap.push({
    url: `${baseUrl}/en/blog/getting-started-with-ai-video-creation`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  })

  return sitemap
}
