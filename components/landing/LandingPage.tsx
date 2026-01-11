"use client"

import { ArrowRight, Zap, Clock, TrendingUp, Target, BarChart3, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState, useRef } from "react"
import { motion, AnimatePresence, useInView } from "framer-motion"
import { WaitlistExperience } from "@/components/ui/waitlist-landing-page-with-countdown-timer"

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

// Animated Section Wrapper
function AnimatedSection({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.section>
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

// Product Preview Section
function ProductPreviewSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const previews = [
    {
      title: "Real-time reply opportunities ranked by leverage",
      icon: Target,
      gradient: "from-accent/20 to-transparent"
    },
    {
      title: "Smart alerts when the window is open",
      icon: Bell,
      gradient: "from-success/20 to-transparent"
    },
    {
      title: "Understand why a reply worked",
      icon: BarChart3,
      gradient: "from-revive/20 to-transparent"
    },
    {
      title: "Track how long attention actually lives",
      icon: Clock,
      gradient: "from-accent/20 to-transparent"
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
              <div className="relative overflow-hidden rounded-xl bg-surface-1 border border-surface-3 p-8 h-64 flex flex-col justify-between transition-all duration-300 hover:border-accent/50 hover:shadow-glow-primary">
                {/* Gradient background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${preview.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                <div className="relative z-10">
                  <motion.div
                    whileHover={{ rotate: 10, scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <preview.icon className="h-8 w-8 text-accent mb-4" />
                  </motion.div>
                </div>

                <p className="relative z-10 text-xl font-medium text-foreground">
                  {preview.title}
                </p>
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
      description: "across your targets and topics."
    },
    {
      number: "02",
      title: "EngageAlpha scores timing, velocity, saturation,",
      description: "and attention decay in real time."
    },
    {
      number: "03",
      title: "You reply when the odds are",
      description: "stacked in your favor."
    }
  ]

  return (
    <section className="py-24 px-6 bg-surface-1" ref={sectionRef} id="how-it-works">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold">
            How EngageAlpha works
          </h2>
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
              whileHover={{ x: 10 }}
              transition={{ duration: 0.3 }}
              className="flex items-start gap-6"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="flex-shrink-0 w-16 h-16 rounded-full bg-surface-2 border border-surface-3 flex items-center justify-center transition-all duration-300 hover:border-accent hover:shadow-glow-primary"
              >
                <span className="text-2xl font-bold text-accent">{step.number}</span>
              </motion.div>

              <div className="pt-3">
                <p className="text-xl md:text-2xl text-foreground font-medium">
                  {step.title}
                </p>
                <p className="text-xl md:text-2xl text-foreground-muted">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
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
            <motion.span
              className="gradient-text"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              3-5x
            </motion.span>.
          </motion.p>

          <motion.p variants={fadeInUp} className="text-lg text-foreground-muted">
            Built for people who care about leverage, not volume.
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}

// CTA Section
function CTASection({ onGetAccess }: { onGetAccess: () => void }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section className="py-24 px-6" ref={ref}>
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
            className="absolute -inset-px rounded-2xl bg-gradient-to-r from-accent via-revive to-accent blur-sm"
          />

          <div className="relative rounded-2xl bg-surface-1 border border-surface-3 p-12 md:p-16 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              Be early to the conversations that matter.
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-lg text-foreground-muted mb-8"
            >
              EngageAlpha is opening access in small batches.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={onGetAccess}
                size="lg"
                className="h-14 px-10 text-lg font-semibold shadow-glow-primary hover:shadow-[0_0_30px_rgba(14,165,233,0.5)] transition-all duration-300"
              >
                Get Early Access
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="mt-6 text-sm text-foreground-muted"
            >
              No spam. No noise. Just signal.
            </motion.p>
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
  const [showWaitlist, setShowWaitlist] = useState(false)
  const howItWorksRef = useRef<HTMLElement>(null)

  const handleGetAccess = () => {
    setShowWaitlist(true)
  }

  const handleSeeHow = () => {
    howItWorksRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleBackFromWaitlist = () => {
    setShowWaitlist(false)
  }

  return (
    <AnimatePresence mode="wait">
      {showWaitlist ? (
        <WaitlistExperience key="waitlist" onBack={handleBackFromWaitlist} />
      ) : (
        <motion.div
          key="landing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="min-h-screen bg-background text-foreground"
        >
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
            <HowItWorksSection sectionRef={howItWorksRef} />
            <SocialProofSection />
            <CTASection onGetAccess={handleGetAccess} />
          </main>

          <Footer />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
