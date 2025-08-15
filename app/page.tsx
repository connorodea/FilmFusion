import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Edit3, Zap, Users, Star, ArrowRight, Video, FileText, Volume2 } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
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
                Features
              </a>
              <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
                How It Works
              </a>
              <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </a>
              <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">
                Reviews
              </a>
            </nav>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" className="hidden sm:inline-flex" asChild>
                <a href="/auth/signin">Sign In</a>
              </Button>
              <Button className="bg-primary hover:bg-primary/90" asChild>
                <a href="/auth/signup">Start Free Trial</a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-background via-muted/30 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-accent/10 text-accent border-accent/20">AI-Powered Video Creation</Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 font-[family-name:var(--font-work-sans)]">
              Create Professional Videos with <span className="text-primary">AI Automation</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Transform your ideas into compelling long-form videos with AI-driven scriptwriting, natural voiceovers,
              automated editing, and cloud-based rendering.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8 py-3" asChild>
                <a href="/auth/signup">
                  <Play className="w-5 h-5 mr-2" />
                  Start Creating Now
                </a>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-3 bg-transparent" asChild>
                <a href="#demo">
                  Watch Demo
                  <ArrowRight className="w-5 h-5 ml-2" />
                </a>
              </Button>
            </div>
            <div className="mt-12 flex items-center justify-center space-x-8 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-2" />
                10,000+ creators
              </div>
              <div className="flex items-center">
                <Star className="w-4 h-4 mr-2 text-accent fill-current" />
                4.9/5 rating
              </div>
              <div className="flex items-center">
                <Zap className="w-4 h-4 mr-2" />
                10x faster production
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 font-[family-name:var(--font-work-sans)]">
              Everything You Need to Create Amazing Videos
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our AI-powered platform handles every aspect of video production, from script to final render.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-border shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="font-[family-name:var(--font-work-sans)]">AI Scriptwriting</CardTitle>
                <CardDescription>
                  Generate compelling scripts tailored to your content goals with advanced AI that understands your
                  brand voice.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-border shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Volume2 className="w-6 h-6 text-accent" />
                </div>
                <CardTitle className="font-[family-name:var(--font-work-sans)]">Natural Voiceovers</CardTitle>
                <CardDescription>
                  Choose from dozens of realistic AI voices or clone your own voice for consistent branding across all
                  content.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-border shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Edit3 className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="font-[family-name:var(--font-work-sans)]">Automated Editing</CardTitle>
                <CardDescription>
                  Smart editing algorithms automatically sync visuals, add transitions, and optimize pacing for maximum
                  engagement.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-border shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-accent" />
                </div>
                <CardTitle className="font-[family-name:var(--font-work-sans)]">Cloud Rendering</CardTitle>
                <CardDescription>
                  Lightning-fast cloud processing ensures your videos are ready in minutes, not hours, with 4K quality
                  output.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-border shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Video className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="font-[family-name:var(--font-work-sans)]">Timeline Editor</CardTitle>
                <CardDescription>
                  Fine-tune your videos with our intuitive timeline editor, complete with drag-and-drop functionality
                  and real-time preview.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-border shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-accent" />
                </div>
                <CardTitle className="font-[family-name:var(--font-work-sans)]">Team Collaboration</CardTitle>
                <CardDescription>
                  Work together seamlessly with real-time collaboration tools, comments, and approval workflows for team
                  projects.
                </CardDescription>
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
              From Idea to Video in 4 Simple Steps
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our streamlined process makes professional video creation accessible to everyone.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Input Your Idea",
                description: "Describe your video concept, target audience, and key messages in plain English.",
              },
              {
                step: "02",
                title: "AI Generates Script",
                description: "Our AI creates a compelling script optimized for engagement and your specific goals.",
              },
              {
                step: "03",
                title: "Choose Voice & Style",
                description: "Select from premium AI voices and visual styles that match your brand identity.",
              },
              {
                step: "04",
                title: "Render & Share",
                description:
                  "Your professional video is rendered in the cloud and ready to share across all platforms.",
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

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 font-[family-name:var(--font-work-sans)]">
              Trusted by Content Creators Worldwide
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See what our users are saying about their FilmFusion experience.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Chen",
                role: "Marketing Director",
                content:
                  "FilmFusion has revolutionized our content creation process. What used to take weeks now takes hours, and the quality is consistently professional.",
                rating: 5,
              },
              {
                name: "Marcus Rodriguez",
                role: "YouTube Creator",
                content:
                  "The AI scriptwriting is incredibly smart. It understands my style and creates content that sounds authentically like me. Game changer!",
                rating: 5,
              },
              {
                name: "Emily Watson",
                role: "Course Creator",
                content:
                  "I've created over 50 educational videos with FilmFusion. The automated editing saves me countless hours while maintaining high production value.",
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
            Ready to Transform Your Video Creation?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Join thousands of creators who are already using FilmFusion to produce professional videos at scale.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-3" asChild>
              <a href="/auth/signup">
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-3 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 bg-transparent"
              asChild
            >
              <a href="#demo">Schedule Demo</a>
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
              <p className="text-muted-foreground mb-4">
                AI-powered video creation platform for professional long-form content.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4 font-[family-name:var(--font-work-sans)]">Product</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a href="#features" className="hover:text-foreground transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-foreground transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#api" className="hover:text-foreground transition-colors">
                    API
                  </a>
                </li>
                <li>
                  <a href="#integrations" className="hover:text-foreground transition-colors">
                    Integrations
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4 font-[family-name:var(--font-work-sans)]">Company</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a href="#about" className="hover:text-foreground transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#blog" className="hover:text-foreground transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#careers" className="hover:text-foreground transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#contact" className="hover:text-foreground transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4 font-[family-name:var(--font-work-sans)]">Support</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a href="#help-center" className="hover:text-foreground transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#documentation" className="hover:text-foreground transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#community" className="hover:text-foreground transition-colors">
                    Community
                  </a>
                </li>
                <li>
                  <a href="#status" className="hover:text-foreground transition-colors">
                    Status
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 FilmFusion. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
