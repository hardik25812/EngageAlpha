"use client"

import { ArrowRight, Zap, Clock, TrendingUp, Target, BarChart3, Bell, Activity, Sparkles, Loader2, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState, useRef } from "react"
import { motion, useInView } from "framer-motion"
import { EngageAIDemo } from "./EngageAIDemo"

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
}

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 }
}

// Animated grid background for hero
function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Animated grid pattern */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.03 }}
        transition={{ duration: 1.5 }}
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(rgba(14, 165, 233, 0.3) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(14, 165, 233, 0.3) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />

      {/* Animated radial glow */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.2, scale: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px]"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(14, 165, 233, 0.15) 0%, transparent 70%)'
        }}
      />

      {/* Floating particles */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-accent/30"
          initial={{
            x: `${20 + i * 15}%`,
            y: "100%",
            opacity: 0
          }}
          animate={{
            y: "-10%",
            opacity: [0, 0.5, 0]
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            delay: i * 1.5,
            ease: "linear"
          }}
        />
      ))}
    </div>
  )
}

// Hero Section
function HeroSection({ onGetAccess, onSeeHow }: { onGetAccess: () => void, onSeeHow: () => void }) {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center px-6">
      <AnimatedBackground />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Badge */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.6, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-surface-1 border border-surface-3"
        >
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-sm text-foreground-muted">Decision Intelligence for X</span>
        </motion.div>

        {/* Main headline */}
        <motion.h1
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="text-5xl md:text-7xl font-bold tracking-tight mb-6"
        >
          <motion.span
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
            className="block text-foreground"
          >
            Stop guessing on X.
          </motion.span>
          <motion.span
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="block gradient-text"
          >
            Reply with leverage.
          </motion.span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-xl md:text-2xl text-foreground-muted max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          EngageAlpha tells you which tweets to reply to,
          <br className="hidden md:block" />
          when to do it, and why it works.
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={onGetAccess}
              size="lg"
              className="h-14 px-8 text-lg font-semibold shadow-glow-primary hover:shadow-[0_0_30px_rgba(14,165,233,0.5)] transition-all duration-300"
            >
              Get Early Access
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={onSeeHow}
              variant="outline"
              size="lg"
              className="h-14 px-8 text-lg group"
            >
              See how it works
              <motion.span
                className="inline-block ml-2"
                animate={{ y: [0, 3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </motion.span>
            </Button>
          </motion.div>
        </motion.div>

        {/* Micro-trust */}
        <motion.p
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.6, delay: 0.7 }}
          className="text-sm text-foreground-muted"
        >
          Built for founders, creators, and growth operators
        </motion.p>
      </div>
    </section>
  )
}

// Problem Section
function ProblemSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section className="py-24 px-6" ref={ref}>
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="space-y-12"
        >
          {/* Problem statements */}
          <div className="text-center space-y-4">
            <motion.p variants={fadeInUp} className="text-2xl md:text-3xl text-foreground font-medium">
              Everyone tracks likes.
            </motion.p>
            <motion.p variants={fadeInUp} className="text-2xl md:text-3xl text-foreground font-medium">
              Nobody tracks timing.
            </motion.p>
            <motion.p variants={fadeInUp} className="text-2xl md:text-3xl text-foreground-muted">
              That&apos;s why most replies go nowhere.
            </motion.p>
          </div>

          {/* Separator */}
          <motion.div variants={fadeIn} className="flex justify-center">
            <motion.div
              initial={{ width: 0 }}
              animate={isInView ? { width: 64 } : { width: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="h-px bg-surface-3"
            />
          </motion.div>

          {/* Insight */}
          <motion.div variants={staggerContainer} className="text-center space-y-2">
            <motion.p variants={fadeInUp} className="text-xl md:text-2xl text-foreground">
              Two replies can be equally smart.
            </motion.p>
            <motion.p variants={fadeInUp} className="text-xl md:text-2xl text-accent font-medium">
              Only one gets seen.
            </motion.p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

// The Insight Section
function InsightSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section className="py-24 px-6 bg-surface-1" ref={ref}>
      <div className="max-w-3xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.7 }}
          className="text-3xl md:text-5xl font-bold mb-8"
        >
          The real growth lever is <span className="gradient-text">timing</span>.
        </motion.h2>

        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="space-y-6 text-lg md:text-xl text-foreground-muted leading-relaxed"
        >
          <motion.p variants={fadeInUp}>Attention spikes fast.</motion.p>
          <motion.p variants={fadeInUp}>It decays faster.</motion.p>
          <motion.p variants={fadeInUp}>Most people arrive late.</motion.p>
          <motion.p variants={fadeInUp} className="text-foreground font-medium pt-4">
            Replies compound only in small windows.
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}

// Product Preview Section - Enhanced with UI Mockups
function ProductPreviewSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const previews = [
    {
      title: "Real-time reply opportunities ranked by leverage",
      description: "The Radar surfaces high-signal tweets the moment they spike",
      icon: Target,
      mockup: (
        <div className="bg-surface-2 rounded-lg p-4 border border-surface-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-xs text-foreground-muted">LIVE RADAR</span>
          </div>
          <div className="space-y-2">
            {[92, 87, 76].map((score, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded bg-surface-1/50">
                <div className={`text-sm font-bold tabular-nums ${score >= 90 ? 'text-accent' : score >= 80 ? 'text-green-400' : 'text-yellow-400'}`}>
                  {score}
                </div>
                <div className="flex-1">
                  <div className="h-2 bg-surface-3 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={isInView ? { width: `${score}%` } : { width: 0 }}
                      transition={{ duration: 1, delay: 0.5 + i * 0.2 }}
                      className={`h-full rounded-full ${score >= 90 ? 'bg-accent' : score >= 80 ? 'bg-green-400' : 'bg-yellow-400'}`}
                    />
                  </div>
                </div>
                <span className="text-xs text-foreground-muted">2m ago</span>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      title: "Smart alerts when the window is open",
      description: "Get notified before opportunities decay",
      icon: Bell,
      mockup: (
        <div className="bg-surface-2 rounded-lg p-4 border border-surface-3">
          <div className="space-y-3">
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={isInView ? { x: 0, opacity: 1 } : { x: 20, opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="flex items-start gap-3 p-3 rounded-lg bg-accent/10 border border-accent/30"
            >
              <Bell className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-foreground font-medium">High-leverage window open</p>
                <p className="text-xs text-foreground-muted mt-1">@naval just posted about AI startups</p>
              </div>
              <span className="text-xs text-accent font-medium">NOW</span>
            </motion.div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-surface-1/50">
              <Clock className="h-4 w-4 text-foreground-muted mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-foreground-muted">Window closing soon</p>
                <p className="text-xs text-foreground-muted/70 mt-1">Reply within 8 minutes</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Track how long attention actually lives",
      description: "Visualize attention decay in real-time",
      icon: Activity,
      mockup: (
        <div className="bg-surface-2 rounded-lg p-4 border border-surface-3">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="h-3 w-3 text-purple-400" />
            <span className="text-xs text-foreground-muted">ATTENTION DECAY</span>
          </div>
          <div className="relative h-16">
            <svg className="w-full h-full" viewBox="0 0 200 60">
              <motion.path
                d="M 0 10 Q 30 10 50 20 T 100 35 T 150 50 T 200 55"
                fill="none"
                stroke="url(#decayGradient)"
                strokeWidth="2"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={isInView ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
                transition={{ duration: 1.5, delay: 0.5 }}
              />
              <defs>
                <linearGradient id="decayGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0ea5e9" />
                  <stop offset="50%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#6b7280" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] text-foreground-muted">
              <span>0m</span>
              <span>15m</span>
              <span>30m</span>
              <span>1h</span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2 text-xs">
            <span className="text-accent">Peak engagement</span>
            <span className="text-foreground-muted">Decay zone</span>
          </div>
        </div>
      )
    },
    {
      title: "Understand why a reply worked",
      description: "Learn from your wins with detailed breakdowns",
      icon: BarChart3,
      mockup: (
        <div className="bg-surface-2 rounded-lg p-4 border border-surface-3">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-3 w-3 text-green-400" />
            <span className="text-xs text-foreground-muted">WIN ANALYSIS</span>
          </div>
          <div className="space-y-2">
            {[
              { label: "Timing Score", value: 94, color: "bg-accent" },
              { label: "Saturation", value: 12, color: "bg-green-400", suffix: "%" },
              { label: "Velocity Match", value: 88, color: "bg-purple-400" }
            ].map((metric, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-xs text-foreground-muted">{metric.label}</span>
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 + i * 0.15 }}
                  className={`text-sm font-medium ${i === 0 ? 'text-accent' : i === 1 ? 'text-green-400' : 'text-purple-400'}`}
                >
                  {metric.value}{metric.suffix || ''}
                </motion.span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-surface-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-green-400/20 flex items-center justify-center">
                <svg className="w-3 h-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-xs text-foreground">+847 impressions from this reply</span>
            </div>
          </div>
        </div>
      )
    }
  ]

  return (
    <section className="py-24 px-6" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Intelligence at a glance
          </h2>
          <p className="text-foreground-muted text-lg">
            Every signal you need. Nothing you don&apos;t.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="grid md:grid-cols-2 gap-6"
        >
          {previews.map((preview, index) => (
            <motion.div
              key={index}
              variants={scaleIn}
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ duration: 0.3 }}
              className="group relative"
            >
              <div className="relative overflow-hidden rounded-xl bg-surface-1 border border-surface-3 p-6 transition-all duration-300 hover:border-accent/50 hover:shadow-glow-primary">
                <div className="flex items-start gap-4 mb-4">
                  <motion.div
                    whileHover={{ rotate: 10, scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                    className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0"
                  >
                    <preview.icon className="h-5 w-5 text-accent" />
                  </motion.div>
                  <div>
                    <p className="text-lg font-medium text-foreground mb-1">
                      {preview.title}
                    </p>
                    <p className="text-sm text-foreground-muted">
                      {preview.description}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  {preview.mockup}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// How It Works Section
function HowItWorksSection({ sectionRef }: { sectionRef: React.RefObject<HTMLElement | null> }) {
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" })

  const steps = [
    {
      number: "01",
      title: "We monitor high-signal conversations",
      description: "across your targets and topics.",
      detail: "Track specific accounts, keywords, and niches that matter to your growth.",
      icon: Target,
      visual: (
        <div className="flex items-center gap-2">
          {["@naval", "@paulg", "@elonmusk"].map((handle, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.4, delay: 0.8 + i * 0.1 }}
              className="px-2 py-1 rounded-full bg-surface-2 border border-surface-3 text-xs text-foreground-muted"
            >
              {handle}
            </motion.div>
          ))}
        </div>
      )
    },
    {
      number: "02",
      title: "EngageAlpha scores timing, velocity, saturation,",
      description: "and attention decay in real time.",
      detail: "Our algorithm weighs 12+ signals to rank every opportunity.",
      icon: Activity,
      visual: (
        <div className="flex items-center gap-4">
          {[
            { label: "Timing", value: 94, color: "text-accent" },
            { label: "Velocity", value: 87, color: "text-green-400" },
            { label: "Decay", value: 23, color: "text-purple-400" }
          ].map((metric, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              transition={{ duration: 0.4, delay: 1 + i * 0.1 }}
              className="text-center"
            >
              <div className={`text-lg font-bold tabular-nums ${metric.color}`}>{metric.value}</div>
              <div className="text-[10px] text-foreground-muted">{metric.label}</div>
            </motion.div>
          ))}
        </div>
      )
    },
    {
      number: "03",
      title: "You reply when the odds are",
      description: "stacked in your favor.",
      detail: "Act on high-confidence opportunities. Skip the noise.",
      icon: Zap,
      visual: (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent/10 border border-accent/30"
        >
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-sm text-accent font-medium">Reply now for max leverage</span>
        </motion.div>
      )
    }
  ]

  return (
    <section className="py-24 px-6 bg-surface-1" ref={sectionRef} id="how-it-works">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How EngageAlpha works
          </h2>
          <p className="text-foreground-muted text-lg max-w-xl mx-auto">
            Three steps to smarter replies. No guesswork.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="space-y-8"
        >
          {steps.map((step, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className="relative"
            >
              {index < steps.length - 1 && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={isInView ? { height: 32 } : { height: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.2 }}
                  className="absolute left-8 top-full w-px bg-gradient-to-b from-surface-3 to-transparent"
                />
              )}

              <motion.div
                whileHover={{ x: 10 }}
                transition={{ duration: 0.3 }}
                className="relative rounded-2xl bg-surface-2 border border-surface-3 p-6 md:p-8 hover:border-accent/30 transition-all duration-300"
              >
                <div className="flex flex-col md:flex-row md:items-start gap-6">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/20 to-purple-500/10 border border-accent/30 flex items-center justify-center transition-all duration-300 hover:shadow-glow-primary"
                  >
                    <span className="text-2xl font-bold text-accent">{step.number}</span>
                  </motion.div>

                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-2">
                      <step.icon className="h-5 w-5 text-accent mt-1 flex-shrink-0 hidden md:block" />
                      <div>
                        <p className="text-xl md:text-2xl text-foreground font-medium">
                          {step.title}
                        </p>
                        <p className="text-xl md:text-2xl text-foreground-muted">
                          {step.description}
                        </p>
                      </div>
                    </div>

                    <p className="text-sm text-foreground-muted mt-3 md:ml-8">
                      {step.detail}
                    </p>

                    <div className="mt-4 md:ml-8">
                      {step.visual}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 1.5 }}
          className="text-center mt-12"
        >
          <p className="text-foreground-muted">
            That&apos;s it. <span className="text-foreground">No overload. Just leverage.</span>
          </p>
        </motion.div>
      </div>
    </section>
  )
}

// Social Proof Section
function SocialProofSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section className="py-24 px-6" ref={ref}>
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="space-y-8"
        >
          <motion.div
            variants={scaleIn}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-1 border border-surface-3"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
            >
              <Zap className="h-4 w-4 text-accent" />
            </motion.div>
            <span className="text-sm text-foreground-muted">Early results</span>
          </motion.div>

          <motion.p variants={fadeInUp} className="text-2xl md:text-3xl text-foreground font-medium">
            Early users are seeing replies outperform posts by{" "}
            <span className="gradient-text">3-5x</span>.
          </motion.p>

          <motion.p variants={fadeInUp} className="text-lg text-foreground-muted">
            Built for people who care about leverage, not volume.
          </motion.p>

          <motion.div
            variants={fadeInUp}
            className="flex items-center justify-center gap-8 md:gap-16 pt-8"
          >
            {[
              { value: "12+", label: "Signals tracked" },
              { value: "< 30s", label: "Alert latency" },
              { value: "3-5x", label: "Reply leverage" }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-foreground tabular-nums">{stat.value}</div>
                <div className="text-xs text-foreground-muted mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

// Waitlist CTA Section with Email Form
function WaitlistSection({ sectionRef }: { sectionRef: React.RefObject<HTMLElement | null> }) {
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" })
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes("@")) return

    setStatus("loading")
    setErrorMessage("")

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus("success")
        setEmail("")
      } else {
        setStatus("error")
        setErrorMessage(data.error || "Something went wrong")
      }
    } catch {
      setStatus("error")
      setErrorMessage("Failed to connect. Please try again.")
    }
  }

  return (
    <section className="py-24 px-6" ref={sectionRef} id="waitlist">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.95 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          {/* Animated glow border effect */}
          <motion.div
            animate={{
              opacity: [0.2, 0.4, 0.2],
              scale: [1, 1.02, 1]
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute -inset-px rounded-2xl bg-gradient-to-r from-accent via-purple-500 to-accent blur-sm"
          />

          <div className="relative rounded-2xl bg-surface-1 border border-surface-3 p-12 md:p-16 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              Join waitlist for early access
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-lg text-foreground-muted mb-8"
            >
              Be early to the conversations that matter.
              <br />
              <span className="text-sm">EngageAlpha is opening access in small batches.</span>
            </motion.p>

            {status === "success" ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="py-8"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/40">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">You&apos;re on the list!</h3>
                <p className="text-foreground-muted text-sm">
                  Check your email for confirmation. We&apos;ll notify you when it&apos;s your turn.
                </p>
              </motion.div>
            ) : (
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                onSubmit={handleSubmit}
                className="max-w-md mx-auto"
              >
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={status === "loading"}
                    className="flex-1 h-14 px-5 bg-surface-2 border border-surface-3 text-foreground placeholder:text-foreground-muted rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all duration-300 disabled:opacity-50"
                  />
                  <motion.div
                    whileHover={{ scale: status === "loading" ? 1 : 1.05 }}
                    whileTap={{ scale: status === "loading" ? 1 : 0.98 }}
                  >
                    <Button
                      type="submit"
                      size="lg"
                      disabled={status === "loading"}
                      className="h-14 px-8 text-lg font-semibold shadow-glow-primary hover:shadow-[0_0_30px_rgba(14,165,233,0.5)] transition-all duration-300 w-full sm:w-auto"
                    >
                      {status === "loading" ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Joining...
                        </>
                      ) : (
                        <>
                          Get Early Access
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>
                  </motion.div>
                </div>

                {status === "error" && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-400 text-sm mt-3"
                  >
                    {errorMessage}
                  </motion.p>
                )}
              </motion.form>
            )}

            <motion.p
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="mt-6 text-sm text-foreground-muted"
            >
              No spam. No noise. Just signal.
            </motion.p>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="flex items-center justify-center gap-3 mt-8"
            >
              <div className="flex -space-x-2">
                {["J", "A", "M", "K"].map((letter, i) => (
                  <div
                    key={i}
                    className={`w-8 h-8 rounded-full border-2 border-surface-1 flex items-center justify-center text-white text-xs font-medium ${
                      i === 0 ? 'bg-gradient-to-br from-cyan-400 to-cyan-600' :
                      i === 1 ? 'bg-gradient-to-br from-green-400 to-green-600' :
                      i === 2 ? 'bg-gradient-to-br from-purple-400 to-purple-600' :
                      'bg-gradient-to-br from-orange-400 to-orange-600'
                    }`}
                  >
                    {letter}
                  </div>
                ))}
              </div>
              <span className="text-foreground-muted text-sm">Join 23 founders on the waitlist</span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// Footer
function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="py-12 px-6 border-t border-surface-3"
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-3"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-foreground">EngageAlpha</span>
          <span className="text-foreground-muted text-sm">Built for X</span>
        </motion.div>

        <div className="flex items-center gap-6 text-sm text-foreground-muted">
          <Link href="/privacy" className="hover:text-foreground transition-colors">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-foreground transition-colors">
            Terms
          </Link>
        </div>
      </div>
    </motion.footer>
  )
}

// Main Landing Page Component
export default function LandingPage() {
  const howItWorksRef = useRef<HTMLElement>(null)
  const waitlistRef = useRef<HTMLElement>(null)

  const handleGetAccess = () => {
    waitlistRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSeeHow = () => {
    howItWorksRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-surface-3"
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-foreground">EngageAlpha</span>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button onClick={handleGetAccess} size="sm" className="shadow-glow-primary">
              Get Early Access
            </Button>
          </motion.div>
        </div>
      </motion.nav>

      {/* Main content with padding for fixed nav */}
      <main className="pt-16">
        <HeroSection onGetAccess={handleGetAccess} onSeeHow={handleSeeHow} />
        <ProblemSection />
        <InsightSection />
        <ProductPreviewSection />
        <EngageAIDemo onGetAccess={handleGetAccess} />
        <HowItWorksSection sectionRef={howItWorksRef} />
        <SocialProofSection />
        <WaitlistSection sectionRef={waitlistRef} />
      </main>

      <Footer />
    </div>
  )
}
