"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Plus, Edit, Trash2, Eye, Calendar, User } from "lucide-react"
import { useLocale } from "next-intl"

export default function AdminBlogPage() {
  const t = useTranslations()
  const locale = useLocale()
  const [posts, setPosts] = useState([])
  const [categories, setCategories] = useState([])
  const [tags, setTags] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [editingPost, setEditingPost] = useState(null)

  const [newPost, setNewPost] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category_id: "",
    status: "draft",
    featured: false,
    meta_title: "",
    meta_description: "",
    language: locale,
  })

  useEffect(() => {
    fetchBlogData()
  }, [locale])

  const fetchBlogData = async () => {
    try {
      setLoading(true)
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"
      const token = localStorage.getItem("token")

      const [postsRes, categoriesRes, tagsRes, statsRes] = await Promise.all([
        fetch(`${backendUrl}/api/admin/blog/posts?language=${locale}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${backendUrl}/api/blog/categories?language=${locale}`),
        fetch(`${backendUrl}/api/blog/tags?language=${locale}`),
        fetch(`${backendUrl}/api/admin/blog/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      if (postsRes.ok) {
        const postsData = await postsRes.json()
        setPosts(postsData.posts || [])
      }

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json()
        setCategories(categoriesData.categories || [])
      }

      if (tagsRes.ok) {
        const tagsData = await tagsRes.json()
        setTags(tagsData.tags || [])
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }
    } catch (error) {
      console.error("Failed to fetch blog data:", error)
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  const handleCreatePost = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"
      const token = localStorage.getItem("token")

      const postData = {
        ...newPost,
        slug: newPost.slug || generateSlug(newPost.title),
      }

      const response = await fetch(`${backendUrl}/api/admin/blog/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(postData),
      })

      if (response.ok) {
        setShowCreatePost(false)
        setNewPost({
          title: "",
          slug: "",
          excerpt: "",
          content: "",
          category_id: "",
          status: "draft",
          featured: false,
          meta_title: "",
          meta_description: "",
          language: locale,
        })
        fetchBlogData()
      }
    } catch (error) {
      console.error("Failed to create post:", error)
    }
  }

  const handleDeletePost = async (postId) => {
    if (!confirm(t("admin.blog.confirmDelete"))) return

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"
      const token = localStorage.getItem("token")

      const response = await fetch(`${backendUrl}/api/admin/blog/posts/${postId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        fetchBlogData()
      }
    } catch (error) {
      console.error("Failed to delete post:", error)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{t("admin.blog.title")}</h1>
        <Dialog open={showCreatePost} onOpenChange={setShowCreatePost}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              {t("admin.blog.createPost")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("admin.blog.createPost")}</DialogTitle>
              <DialogDescription>{t("admin.blog.createPostDescription")}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">{t("admin.blog.title")}</Label>
                  <Input
                    id="title"
                    value={newPost.title}
                    onChange={(e) => {
                      setNewPost((prev) => ({
                        ...prev,
                        title: e.target.value,
                        slug: generateSlug(e.target.value),
                      }))
                    }}
                    placeholder={t("admin.blog.titlePlaceholder")}
                  />
                </div>
                <div>
                  <Label htmlFor="slug">{t("admin.blog.slug")}</Label>
                  <Input
                    id="slug"
                    value={newPost.slug}
                    onChange={(e) => setNewPost((prev) => ({ ...prev, slug: e.target.value }))}
                    placeholder={t("admin.blog.slugPlaceholder")}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="excerpt">{t("admin.blog.excerpt")}</Label>
                <Textarea
                  id="excerpt"
                  value={newPost.excerpt}
                  onChange={(e) => setNewPost((prev) => ({ ...prev, excerpt: e.target.value }))}
                  placeholder={t("admin.blog.excerptPlaceholder")}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="content">{t("admin.blog.content")}</Label>
                <Textarea
                  id="content"
                  value={newPost.content}
                  onChange={(e) => setNewPost((prev) => ({ ...prev, content: e.target.value }))}
                  placeholder={t("admin.blog.contentPlaceholder")}
                  rows={10}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="category">{t("admin.blog.category")}</Label>
                  <Select
                    value={newPost.category_id}
                    onValueChange={(value) => setNewPost((prev) => ({ ...prev, category_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("admin.blog.selectCategory")} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status">{t("admin.blog.status")}</Label>
                  <Select
                    value={newPost.status}
                    onValueChange={(value) => setNewPost((prev) => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">{t("admin.blog.draft")}</SelectItem>
                      <SelectItem value="published">{t("admin.blog.published")}</SelectItem>
                      <SelectItem value="archived">{t("admin.blog.archived")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2 pt-6">
                  <Switch
                    id="featured"
                    checked={newPost.featured}
                    onCheckedChange={(checked) => setNewPost((prev) => ({ ...prev, featured: checked }))}
                  />
                  <Label htmlFor="featured">{t("admin.blog.featured")}</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreatePost(false)}>
                  {t("common.cancel")}
                </Button>
                <Button onClick={handleCreatePost}>{t("admin.blog.createPost")}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">{t("admin.blog.totalPosts")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_posts || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">{t("admin.blog.publishedPosts")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.published_posts || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">{t("admin.blog.draftPosts")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.draft_posts || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">{t("admin.blog.totalComments")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_comments || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Posts Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t("admin.blog.allPosts")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">{post.title}</h3>
                    <Badge variant={post.status === "published" ? "default" : "secondary"}>{post.status}</Badge>
                    {post.featured && <Badge variant="outline">{t("admin.blog.featured")}</Badge>}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{post.excerpt}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {post.author?.full_name || post.author?.username}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(post.created_at)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {post.view_count} views
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDeletePost(post.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
