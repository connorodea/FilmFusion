"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Eye, User, Search } from "lucide-react"
import Link from "next/link"
import { useLocale } from "next-intl"

interface BlogPost {
  id: number
  title: string
  slug: string
  excerpt: string
  featured_image_url?: string
  published_at: string
  view_count: number
  author: {
    full_name: string
    username: string
  }
  category: {
    name: string
    slug: string
    color: string
  }
  tags: Array<{
    name: string
    slug: string
    color: string
  }>
}

interface BlogCategory {
  id: number
  name: string
  slug: string
  color: string
}

export default function BlogPage() {
  const t = useTranslations()
  const locale = useLocale()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all") // Updated default value
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    fetchBlogData()
  }, [locale, selectedCategory, currentPage])

  const fetchBlogData = async () => {
    try {
      setLoading(true)
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

      // Fetch blog posts
      const postsParams = new URLSearchParams({
        language: locale,
        skip: ((currentPage - 1) * 10).toString(),
        limit: "10",
      })

      if (selectedCategory !== "all") {
        postsParams.append("category_slug", selectedCategory)
      }

      const [postsRes, categoriesRes, featuredRes] = await Promise.all([
        fetch(`${backendUrl}/api/blog/posts?${postsParams}`),
        fetch(`${backendUrl}/api/blog/categories?language=${locale}`),
        fetch(`${backendUrl}/api/blog/posts/featured?language=${locale}&limit=3`),
      ])

      if (postsRes.ok) {
        const postsData = await postsRes.json()
        setPosts(postsData.posts || [])
      }

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json()
        setCategories(categoriesData.categories || [])
      }

      if (featuredRes.ok) {
        const featuredData = await featuredRes.json()
        setFeaturedPosts(featuredData.posts || [])
      }
    } catch (error) {
      console.error("Failed to fetch blog data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    try {
      setLoading(true)
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"
      const response = await fetch(
        `${backendUrl}/api/blog/search?query=${encodeURIComponent(searchQuery)}&language=${locale}`,
      )

      if (response.ok) {
        const data = await response.json()
        setPosts(data.posts || [])
      }
    } catch (error) {
      console.error("Search failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t("blog.title")}</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">{t("blog.subtitle")}</p>
        </div>

        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t("blog.featured")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredPosts.map((post) => (
                <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {post.featured_image_url && (
                    <div className="aspect-video bg-gray-200">
                      <img
                        src={post.featured_image_url || "/placeholder.svg"}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge style={{ backgroundColor: post.category.color }} className="text-white">
                        {post.category.name}
                      </Badge>
                      <Badge variant="secondary">{t("blog.featured")}</Badge>
                    </div>
                    <CardTitle className="line-clamp-2">
                      <Link href={`/${locale}/blog/${post.slug}`} className="hover:text-blue-600 transition-colors">
                        {post.title}
                      </Link>
                    </CardTitle>
                    <CardDescription className="line-clamp-3">{post.excerpt}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {post.author.full_name || post.author.username}
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {post.view_count}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(post.published_at)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 flex gap-2">
            <Input
              placeholder={t("blog.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button onClick={handleSearch} variant="outline">
              <Search className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex gap-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t("blog.allCategories")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("blog.allCategories")}</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.slug}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {posts.map((post) => (
            <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {post.featured_image_url && (
                <div className="aspect-video bg-gray-200">
                  <img
                    src={post.featured_image_url || "/placeholder.svg"}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge style={{ backgroundColor: post.category.color }} className="text-white">
                    {post.category.name}
                  </Badge>
                  {post.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag.slug} variant="outline" style={{ borderColor: tag.color, color: tag.color }}>
                      {tag.name}
                    </Badge>
                  ))}
                </div>
                <CardTitle className="line-clamp-2">
                  <Link href={`/${locale}/blog/${post.slug}`} className="hover:text-blue-600 transition-colors">
                    {post.title}
                  </Link>
                </CardTitle>
                <CardDescription className="line-clamp-3">{post.excerpt}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {post.author.full_name || post.author.username}
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {post.view_count}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(post.published_at)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            {t("common.previous")}
          </Button>
          <Button variant="outline" onClick={() => setCurrentPage((prev) => prev + 1)} disabled={posts.length < 10}>
            {t("common.next")}
          </Button>
        </div>
      </div>
    </div>
  )
}
