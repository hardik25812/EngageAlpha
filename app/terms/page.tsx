"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-foreground-muted hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        
        <div className="prose prose-invert max-w-none space-y-6 text-foreground-muted">
          <p className="text-lg">
            Last updated: January 2026
          </p>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">1. Acceptance of Terms</h2>
            <p>
              By accessing or using EngageAlpha, you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use our service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">2. Description of Service</h2>
            <p>
              EngageAlpha is a decision intelligence platform for X (Twitter) that helps users 
              discover engagement opportunities and generate AI-powered replies. The service 
              is currently in development and available through a waitlist.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">3. Waitlist</h2>
            <p>
              By joining our waitlist, you agree to receive email communications about:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Product launch updates</li>
              <li>Early access invitations</li>
              <li>Important announcements</li>
            </ul>
            <p>
              You can unsubscribe from these communications at any time.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">4. User Responsibilities</h2>
            <p>
              When using EngageAlpha, you agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate information</li>
              <li>Use the service in compliance with X (Twitter) terms of service</li>
              <li>Not use the service for spam or malicious purposes</li>
              <li>Respect other users and content creators</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">5. Intellectual Property</h2>
            <p>
              All content, features, and functionality of EngageAlpha are owned by us and are 
              protected by international copyright, trademark, and other intellectual property laws.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">6. Limitation of Liability</h2>
            <p>
              EngageAlpha is provided &quot;as is&quot; without warranties of any kind. We are not 
              responsible for any damages arising from your use of the service, including but 
              not limited to direct, indirect, incidental, or consequential damages.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">7. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms of Service at any time. We will notify 
              users of any material changes via email or through the service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">8. Contact</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at the 
              email address provided in our communications.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-surface-3">
          <p className="text-foreground-muted text-sm">
            EngageAlpha - Decision Intelligence for X
          </p>
        </div>
      </div>
    </main>
  )
}
