"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Users, Tag, List, Settings, Check } from "lucide-react"

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [targets, setTargets] = useState<string[]>([])
  const [keywords, setKeywords] = useState<string[]>([])
  const [maxAlerts, setMaxAlerts] = useState(10)

  const steps = [
    { id: 1, name: "Connect Account", icon: Users },
    { id: 2, name: "Add Targets", icon: Tag },
    { id: 3, name: "Set Keywords", icon: List },
    { id: 4, name: "Preferences", icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-foreground">Welcome to EngageAlpha</h1>
            <p className="mt-2 text-foreground-muted">
              Let&apos;s set up your decision intelligence engine
            </p>
          </div>

          <div className="mb-8 flex justify-center space-x-4">
            {steps.map((s) => (
              <div
                key={s.id}
                className={`flex items-center space-x-2 ${
                  s.id === step ? "text-accent" : s.id < step ? "text-green-500" : "text-foreground-muted"
                }`}
              >
                {s.id < step ? (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                ) : (
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      s.id === step ? "bg-accent" : "bg-background-card"
                    }`}
                  >
                    <s.icon className="h-4 w-4" />
                  </div>
                )}
                <span className="hidden text-sm font-medium sm:inline">{s.name}</span>
              </div>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{steps[step - 1].name}</CardTitle>
              <CardDescription>
                {step === 1 && "Connect your X account to get started"}
                {step === 2 && "Add accounts you want to monitor for opportunities"}
                {step === 3 && "Define topics and keywords you care about"}
                {step === 4 && "Customize your alert preferences"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {step === 1 && (
                <div className="space-y-4">
                  <Button className="w-full" size="lg">
                    <Users className="mr-2 h-4 w-4" />
                    Connect X Account
                  </Button>
                  <div className="text-center">
                    <span className="text-sm text-foreground-muted">or</span>
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" placeholder="your@email.com" />
                  </div>
                  <Button variant="outline" className="w-full">
                    Continue with Email
                  </Button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Target Accounts</Label>
                    <Input
                      placeholder="@username"
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && e.currentTarget.value) {
                          setTargets([...targets, e.currentTarget.value])
                          e.currentTarget.value = ""
                        }
                      }}
                    />
                    <p className="text-xs text-foreground-muted">
                      Press Enter to add accounts
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {targets.map((target, i) => (
                      <Badge key={i} variant="secondary">
                        {target}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Keywords & Topics</Label>
                    <Input
                      placeholder="e.g., growth marketing, SaaS"
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && e.currentTarget.value) {
                          setKeywords([...keywords, e.currentTarget.value])
                          e.currentTarget.value = ""
                        }
                      }}
                    />
                    <p className="text-xs text-foreground-muted">
                      Press Enter to add keywords
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {keywords.map((keyword, i) => (
                      <Badge key={i} variant="default">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Max Alerts Per Day</Label>
                      <span className="text-sm font-semibold text-foreground">
                        {maxAlerts}
                      </span>
                    </div>
                    <Slider
                      value={[maxAlerts]}
                      onValueChange={(value) => setMaxAlerts(value[0])}
                      min={5}
                      max={50}
                      step={5}
                      className="py-4"
                    />
                  </div>
                  <div className="rounded-lg border border-accent/20 bg-accent/5 p-4">
                    <p className="text-sm text-foreground-muted">
                      Quality over quantity. Start with fewer alerts and adjust as you learn
                      what works.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex space-x-2">
                {step > 1 && (
                  <Button variant="outline" onClick={() => setStep(step - 1)}>
                    Back
                  </Button>
                )}
                <Button
                  className="flex-1"
                  onClick={() => {
                    if (step < 4) {
                      setStep(step + 1)
                    } else {
                      window.location.href = "/radar"
                    }
                  }}
                >
                  {step === 4 ? "Get Started" : "Continue"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
