"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Sparkles,
  Users,
  MessageCircle,
  Calendar,
  Target,
  Heart,
  Star,
  ArrowRight,
  Zap,
  Shield,
  Globe,
  Brain,
  TrendingUp,
} from "lucide-react"

const features = [
  {
    icon: Brain,
    title: "AI-Powered Matching",
    description: "Advanced algorithms analyze your profile, interests, and goals to find perfect matches in real-time.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Zap,
    title: "Real-Time Connections",
    description: "Connect instantly with qualified professionals who share your interests and objectives.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: MessageCircle,
    title: "Smart Chat System",
    description: "Engage in meaningful conversations with AI-generated conversation starters and insights.",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: Calendar,
    title: "Meeting Scheduler",
    description: "Seamlessly schedule and manage meetings with your matches using our integrated calendar.",
    color: "from-orange-500 to-red-500",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your data is protected with enterprise-grade security and privacy controls.",
    color: "from-indigo-500 to-purple-500",
  },
  {
    icon: TrendingUp,
    title: "Analytics Dashboard",
    description: "Track your networking success with detailed analytics and performance insights.",
    color: "from-pink-500 to-rose-500",
  },
]

const stats = [
  { label: "Active Users", value: "10,000+", icon: Users },
  { label: "Successful Matches", value: "50,000+", icon: Heart },
  { label: "Meetings Scheduled", value: "25,000+", icon: Calendar },
  { label: "Satisfaction Rate", value: "95%", icon: Star },
]

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Product Manager at TechCorp",
    content:
      "MatchAI helped me connect with industry leaders I never would have met otherwise. The AI matching is incredibly accurate!",
    avatar: "SC",
  },
  {
    name: "Michael Rodriguez",
    role: "Startup Founder",
    content:
      "I found my co-founder through MatchAI. The platform's ability to understand what I was looking for was amazing.",
    avatar: "MR",
  },
  {
    name: "Emily Johnson",
    role: "Marketing Director",
    content:
      "The networking opportunities are endless. I've built valuable professional relationships that have advanced my career.",
    avatar: "EJ",
  },
]

export default function HomePage() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                MatchAI
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <Link href="/auth/signin">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <Badge className="mb-6 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-200">
                <Sparkles className="h-3 w-3 mr-1" />
                AI-Powered Professional Networking
              </Badge>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
                Connect with the
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {" "}
                  Right People
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Discover meaningful professional connections through AI-powered matching. Build relationships that
                matter and accelerate your career growth.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/signup">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-lg px-8 py-3"
                  >
                    Start Matching Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/auth/signin">
                  <Button size="lg" variant="outline" className="text-lg px-8 py-3 bg-transparent">
                    Sign In
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg mb-4">
                  <stat.icon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {" "}
                Smart Networking
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our AI-powered platform provides everything you need to build meaningful professional relationships
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                onHoverStart={() => setHoveredFeature(index)}
                onHoverEnd={() => setHoveredFeature(null)}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <div
                      className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r ${feature.color} rounded-lg mb-4 transition-transform duration-300 ${hoveredFeature === index ? "scale-110" : ""}`}
                    >
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 text-base">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get started in minutes and begin building valuable connections
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Create Your Profile",
                description: "Tell us about your professional background, interests, and networking goals.",
                icon: Users,
              },
              {
                step: "2",
                title: "AI Finds Matches",
                description: "Our advanced AI analyzes your profile and finds the most relevant connections.",
                icon: Target,
              },
              {
                step: "3",
                title: "Start Connecting",
                description: "Chat, schedule meetings, and build meaningful professional relationships.",
                icon: MessageCircle,
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="text-center"
              >
                <div className="relative mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white text-xl font-bold mb-4">
                    {item.step}
                  </div>
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-lg shadow-lg absolute -bottom-2 -right-2">
                    <item.icon className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join thousands of professionals who have transformed their networking
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{testimonial.name}</div>
                        <div className="text-sm text-gray-600">{testimonial.role}</div>
                      </div>
                    </div>
                    <p className="text-gray-700 italic">"{testimonial.content}"</p>
                    <div className="flex mt-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Transform Your Networking?</h2>
            <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
              Join thousands of professionals who are already building meaningful connections with MatchAI
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-3">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/auth/signin">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-purple-600 text-lg px-8 py-3 bg-transparent"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <span className="text-xl font-bold">MatchAI</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                AI-powered professional networking platform that connects you with the right people to accelerate your
                career growth.
              </p>
              <div className="flex space-x-4">
                <Globe className="h-5 w-5 text-gray-400" />
                <span className="text-gray-400">Global Network</span>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    API
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Integrations
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 MatchAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
