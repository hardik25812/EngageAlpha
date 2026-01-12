import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client with service role for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      email, 
      name, 
      twitterHandle,
      referralSource,
      utmSource,
      utmMedium,
      utmCampaign 
    } = body

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      )
    }

    // Get request metadata
    const forwardedFor = request.headers.get('x-forwarded-for')
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0] : 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Store in Supabase
    const { data: waitlistEntry, error: dbError } = await supabaseAdmin
      .from('waitlist')
      .upsert(
        {
          email: email.toLowerCase().trim(),
          name: name || null,
          twitter_handle: twitterHandle || null,
          referral_source: referralSource || null,
          utm_source: utmSource || null,
          utm_medium: utmMedium || null,
          utm_campaign: utmCampaign || null,
          ip_address: ipAddress,
          user_agent: userAgent,
          metadata: {
            signup_page: request.headers.get('referer') || 'direct',
            timestamp: new Date().toISOString(),
          },
        },
        { 
          onConflict: 'email',
          ignoreDuplicates: false 
        }
      )
      .select()
      .single()

    if (dbError && dbError.code !== '23505') { // 23505 is unique violation (duplicate)
      console.error('Database error:', dbError)
      // Continue with email even if DB fails
    }

    // Create transporter with Gmail SMTP
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    })

    // Send confirmation email to the subscriber
    await transporter.sendMail({
      from: `"EngageAlpha" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "You're on the EngageAlpha waitlist!",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #0a0a0b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0b; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px;">
                  <tr>
                    <td align="center" style="padding-bottom: 32px;">
                      <div style="display: flex; align-items: center; justify-content: center; gap: 12px;">
                        <img src="https://engage-alpha5656.vercel.app/logo.png" alt="EngageAlpha Logo" width="40" height="40" style="border-radius: 8px;" />
                        <span style="color: #e5e5e6; font-size: 24px; font-weight: 600;">EngageAlpha</span>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="background-color: #141416; border: 1px solid #27272a; border-radius: 16px; padding: 48px 40px;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding-bottom: 24px;">
                            <div style="width: 64px; height: 64px; background: rgba(16, 185, 129, 0.2); border: 1px solid rgba(16, 185, 129, 0.4); border-radius: 50%; line-height: 64px; text-align: center;">
                              <span style="color: #10b981; font-size: 32px;">✓</span>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td align="center" style="padding-bottom: 16px;">
                            <h1 style="margin: 0; color: #e5e5e6; font-size: 28px; font-weight: 600;">You're on the list!</h1>
                          </td>
                        </tr>
                        <tr>
                          <td align="center" style="padding-bottom: 32px;">
                            <p style="margin: 0; color: #94969c; font-size: 16px; line-height: 1.6;">
                              Thanks for joining the EngageAlpha waitlist! We're building decision intelligence for X (Twitter) - helping you reply to the right tweets, at the right time.
                            </p>
                          </td>
                        </tr>
                        <tr>
                          <td style="background-color: #0f0f12; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                            <h3 style="margin: 0 0 16px 0; color: #0ea5e9; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">What's next?</h3>
                            <ul style="margin: 0; padding-left: 20px; color: #94969c; font-size: 14px; line-height: 1.8;">
                              <li>We're opening access in small batches</li>
                              <li>Early users get priority access + founding member perks</li>
                              <li>We'll email you as soon as we're back with updates</li>
                            </ul>
                          </td>
                        </tr>
                        <tr>
                          <td style="background: linear-gradient(135deg, rgba(14, 165, 233, 0.1), rgba(139, 92, 246, 0.1)); border: 1px solid rgba(14, 165, 233, 0.3); border-radius: 12px; padding: 20px;">
                            <p style="margin: 0; color: #0ea5e9; font-size: 14px; font-weight: 600; text-align: center;">
                              📧 We'll share updates as soon as it gets back!
                            </p>
                            <p style="margin: 8px 0 0 0; color: #94969c; font-size: 13px; text-align: center;">
                              Stay tuned for launch announcements and exclusive early access.
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding-top: 32px;">
                      <p style="margin: 0; color: #94969c; font-size: 14px; font-weight: 500;">
                        - Hardik
                      </p>
                      <p style="margin: 16px 0 0 0; color: #52525b; font-size: 12px;">
                        EngageAlpha - Decision Intelligence for X
                      </p>
                      <p style="margin: 8px 0 0 0; color: #52525b; font-size: 12px;">
                        No spam. No noise. Just signal.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    })

    // Send notification email to admin
    await transporter.sendMail({
      from: `"EngageAlpha Waitlist" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      subject: `New Waitlist Signup: ${email}`,
      html: `
        <div style="font-family: sans-serif; background-color: #0a0a0b; padding: 40px; color: #e5e5e6;">
          <div style="max-width: 500px; margin: 0 auto; background-color: #141416; border: 1px solid #27272a; border-radius: 12px; padding: 32px;">
            <h2 style="margin: 0 0 16px 0; color: #0ea5e9;">New Waitlist Signup!</h2>
            <p style="margin: 0 0 8px 0; color: #94969c;">Someone just joined the EngageAlpha waitlist:</p>
            <p style="margin: 0; padding: 16px; background-color: #0f0f12; border-radius: 8px; color: #e5e5e6; font-family: monospace;">
              ${email}
            </p>
          </div>
        </div>
      `,
    })

    return NextResponse.json({ success: true, message: 'Successfully joined waitlist' })
  } catch (error) {
    console.error('Waitlist signup error:', error)
    return NextResponse.json(
      { error: 'Failed to process signup. Please try again.' },
      { status: 500 }
    )
  }
}
