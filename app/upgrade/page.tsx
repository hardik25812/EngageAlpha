"use client"

import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Zap } from "lucide-react"

export default function UpgradePage() {
  const plans = [
    {
      name: "Starter",
      price: "Free",
      description: "Get started with basic opportunity detection",
      features: [
        "10 alerts per day",
        "Basic velocity signals",
        "Reply composer",
        "Weekly insights",
      ],
      current: true,
    },
    {
      name: "Pro",
      price: "$29",
      period: "/month",
      description: "For serious creators ready to scale engagement",
      features: [
        "50 alerts per day",
        "Advanced scoring engine",
        "Outcome predictions",
        "Learning personalization",
        "Priority support",
        "API access",
      ],
      highlighted: true,
    },
    {
      name: "Team",
      price: "$99",
      period: "/month",
      description: "For teams managing multiple accounts",
      features: [
        "Unlimited alerts",
        "Multi-account management",
        "Team collaboration",
        "Custom scoring models",
        "White-label reports",
        "Dedicated support",
      ],
    },
  ]

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">Upgrade Your Growth</h1>
          <p className="mt-2 text-foreground-muted">
            Choose the plan that fits your engagement goals
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={plan.highlighted ? "border-accent shadow-lg shadow-accent/20" : ""}
            >
              <CardHeader>
                {plan.highlighted && (
                  <Badge className="mb-2 w-fit" variant="default">
                    <Zap className="mr-1 h-3 w-3" />
                    Most Popular
                  </Badge>
                )}
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                  {plan.period && (
                    <span className="text-foreground-muted">{plan.period}</span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <ul className="mb-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start space-x-2">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" />
                      <span className="text-sm text-foreground-muted">{feature}</span>
                    </li>
                  ))}
                </ul>
                {plan.current ? (
                  <Button variant="outline" className="w-full" disabled>
                    Current Plan
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    variant={plan.highlighted ? "default" : "outline"}
                  >
                    Upgrade Now
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-accent/20 bg-accent/5">
          <CardHeader>
            <CardTitle>Need a Custom Solution?</CardTitle>
            <CardDescription>
              We offer enterprise plans with custom features, dedicated infrastructure, and
              hands-on support
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline">Contact Sales</Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
