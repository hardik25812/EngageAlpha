"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function PrivacyPage() {
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

        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="prose prose-invert max-w-none space-y-6 text-foreground-muted">
          <p className="text-lg">
            Last updated: January 2026
          </p>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">1. Information We Collect</h2>
            <p>
              When you join our waitlist, we collect the following information:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Email address (required)</li>
              <li>Name (optional)</li>
              <li>Twitter/X handle (optional)</li>
              <li>Basic analytics data (IP address, browser type)</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">2. How We Use Your Information</h2>
            <p>
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Send you updates about EngageAlpha launch and early access</li>
              <li>Communicate important product announcements</li>
              <li>Improve our services and user experience</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">3. Data Security</h2>
            <p>
              We take the security of your data seriously. Your information is stored securely 
              using industry-standard encryption and security practices. We use Supabase for 
              secure data storage.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">4. Third-Party Services</h2>
            <p>
              We may use third-party services to help us operate our business, such as:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Supabase (database and authentication)</li>
              <li>Vercel (hosting)</li>
              <li>Gmail (email communications)</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">5. Your Rights</h2>
            <p>
              You have the right to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Request access to your personal data</li>
              <li>Request deletion of your data</li>
              <li>Unsubscribe from our communications at any time</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">6. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at the 
              email address provided in our communications.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">7. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any 
              changes by posting the new Privacy Policy on this page.
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
