"use client"

import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, TrendingUp, Target, Brain } from "lucide-react"

export default function LearnPage() {
  const lessons = [
    {
      id: "1",
      title: "Understanding Velocity Signals",
      description: "Learn how to identify tweets with high engagement momentum",
      icon: TrendingUp,
      category: "Fundamentals",
      readTime: "5 min",
    },
    {
      id: "2",
      title: "Reply Saturation Analysis",
      description: "Know when a conversation is too crowded for meaningful engagement",
      icon: Target,
      category: "Fundamentals",
      readTime: "4 min",
    },
    {
      id: "3",
      title: "Building Reply Credibility",
      description: "Strategies for establishing authority in your replies",
      icon: Brain,
      category: "Strategy",
      readTime: "7 min",
    },
    {
      id: "4",
      title: "Timing and Context",
      description: "Why when you reply matters as much as what you say",
      icon: BookOpen,
      category: "Advanced",
      readTime: "6 min",
    },
  ]

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Learn</h1>
          <p className="mt-2 text-foreground-muted">
            Master the art and science of high-leverage replies
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {lessons.map((lesson) => (
            <Card key={lesson.id} className="cursor-pointer transition-all hover:border-accent/50">
              <CardHeader>
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                    <lesson.icon className="h-6 w-6 text-accent" />
                  </div>
                  <Badge variant="secondary">{lesson.readTime}</Badge>
                </div>
                <CardTitle>{lesson.title}</CardTitle>
                <CardDescription>{lesson.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="outline">{lesson.category}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-accent/20 bg-accent/5">
          <CardHeader>
            <CardTitle>Your Learning Progress</CardTitle>
            <CardDescription>
              Based on your reply patterns, we recommend focusing on timing and saturation analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-foreground-muted">Fundamentals</span>
                  <span className="font-semibold text-foreground">75%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-background-card">
                  <div className="h-full w-3/4 rounded-full bg-accent" />
                </div>
              </div>
              <div>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-foreground-muted">Strategy</span>
                  <span className="font-semibold text-foreground">45%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-background-card">
                  <div className="h-full w-[45%] rounded-full bg-accent" />
                </div>
              </div>
              <div>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-foreground-muted">Advanced</span>
                  <span className="font-semibold text-foreground">20%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-background-card">
                  <div className="h-full w-1/5 rounded-full bg-accent" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
