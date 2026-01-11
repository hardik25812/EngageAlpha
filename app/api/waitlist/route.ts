import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      )
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
                      <span style="color: #e5e5e6; font-size: 24px; font-weight: 600;">EngageAlpha</span>
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
                              Thanks for joining the EngageAlpha waitlist. We're building decision intelligence for X (Twitter) - helping you reply to the right tweets, at the right time.
                            </p>
                          </td>
                        </tr>
                        <tr>
                          <td style="background-color: #0f0f12; border-radius: 12px; padding: 24px;">
                            <h3 style="margin: 0 0 16px 0; color: #0ea5e9; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">What's next?</h3>
                            <ul style="margin: 0; padding-left: 20px; color: #94969c; font-size: 14px; line-height: 1.8;">
                              <li>We're opening access in small batches</li>
                              <li>Early users get priority access + founding member perks</li>
                              <li>We'll email you when it's your turn</li>
                            </ul>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding-top: 32px;">
                      <p style="margin: 0; color: #52525b; font-size: 12px;">
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
