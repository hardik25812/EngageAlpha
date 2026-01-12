# SMTP Email Setup Guide for EngageAlpha

This guide will help you configure SMTP email notifications so users receive beautiful confirmation emails when they join the waitlist.

## 📧 What Users Will Receive

When someone joins your waitlist, they will automatically receive a **beautiful, professionally designed email** that includes:

- ✅ Confirmation that they're on the list
- 📋 What to expect next
- 🎯 Clear messaging that you'll share updates as soon as the platform is back
- 🎨 Brand-consistent design matching EngageAlpha's theme

## 🚀 Quick Setup (Gmail - Recommended)

### Step 1: Enable 2-Factor Authentication on Gmail

1. Go to your Google Account: https://myaccount.google.com/
2. Navigate to **Security**
3. Enable **2-Step Verification** if not already enabled

### Step 2: Generate App Password

1. Go to: https://myaccount.google.com/apppasswords
2. Select **Mail** as the app
3. Select **Other (Custom name)** as the device
4. Enter "EngageAlpha" as the name
5. Click **Generate**
6. Copy the **16-character password** (it will look like: `xxxx xxxx xxxx xxxx`)

### Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env` in your project root:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and add your Gmail credentials:
   ```env
   GMAIL_USER="your-email@gmail.com"
   GMAIL_APP_PASSWORD="your-16-character-app-password"
   ```

   **Example:**
   ```env
   GMAIL_USER="hello@yourdomain.com"
   GMAIL_APP_PASSWORD="abcd efgh ijkl mnop"
   ```

### Step 4: Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the waitlist page
3. Enter a test email address
4. Submit the form
5. Check both:
   - The test email inbox (should receive beautiful confirmation email)
   - Your Gmail inbox (should receive admin notification)

## ✅ What's Already Configured

The EngageAlpha codebase already includes:

- ✅ **Nodemailer** package installed
- ✅ **Beautiful HTML email template** with brand colors
- ✅ **Automatic email sending** on waitlist signup
- ✅ **Admin notifications** for new signups
- ✅ **Error handling** for failed emails
- ✅ **Supabase integration** for storing waitlist entries

## 📧 Email Features

### User Confirmation Email Includes:

1. **Welcome Message**: "You're on the list!"
2. **What's Next Section**:
   - Opening access in small batches
   - Early users get priority access + founding member perks
   - Email notifications as soon as platform is back
3. **Highlighted Promise**: "We'll share updates as soon as it gets back!"
4. **Professional Footer**: Brand tagline and reassurance

### Admin Notification Email:

- Instant notification when someone joins
- Shows the email address
- Clean, readable format

## 🔧 Alternative SMTP Providers

If you prefer not to use Gmail, you can use other providers:

### SendGrid

```env
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASSWORD="your-sendgrid-api-key"
```

### Mailgun

```env
SMTP_HOST="smtp.mailgun.org"
SMTP_PORT="587"
SMTP_USER="postmaster@your-domain.mailgun.org"
SMTP_PASSWORD="your-mailgun-password"
```

### AWS SES

```env
SMTP_HOST="email-smtp.us-east-1.amazonaws.com"
SMTP_PORT="587"
SMTP_USER="your-aws-smtp-username"
SMTP_PASSWORD="your-aws-smtp-password"
```

**Note:** If using alternative providers, you'll need to update `app/api/waitlist/route.ts` to use custom SMTP settings instead of Gmail service.

## 🐛 Troubleshooting

### Email Not Sending

1. **Check environment variables**: Ensure `.env` file exists and has correct values
2. **Verify App Password**: Make sure you're using the app password, not your regular Gmail password
3. **Check console logs**: Look for error messages in your terminal
4. **Test Gmail login**: Try logging into Gmail with the same credentials

### "Invalid login" Error

- Make sure 2-Factor Authentication is enabled
- Regenerate the App Password
- Remove any spaces from the app password in `.env`

### Email Goes to Spam

- Add a custom domain email (e.g., `hello@yourdomain.com`) instead of personal Gmail
- Consider using a professional email service like SendGrid or Mailgun for production
- Add SPF and DKIM records to your domain

### Rate Limiting

Gmail has sending limits:
- **Free Gmail**: ~500 emails/day
- **Google Workspace**: ~2,000 emails/day

For higher volume, consider:
- SendGrid (100 emails/day free, then paid)
- Mailgun (5,000 emails/month free)
- AWS SES (62,000 emails/month free)

## 🎨 Customizing the Email Template

The email template is located in `app/api/waitlist/route.ts` (lines 82-150).

You can customize:
- Colors (currently using EngageAlpha brand colors)
- Text content
- Logo/branding
- Call-to-action buttons
- Footer information

## 📊 Monitoring

All waitlist signups are stored in Supabase in the `waitlist` table with:
- Email address
- Name (optional)
- Twitter handle (optional)
- Referral source
- UTM parameters
- IP address
- User agent
- Timestamp

## 🔒 Security Best Practices

1. **Never commit `.env` file** - It's already in `.gitignore`
2. **Use App Passwords** - Never use your main Gmail password
3. **Rotate credentials** - Change app passwords periodically
4. **Monitor usage** - Check for unusual sending patterns
5. **Validate emails** - The API already validates email format

## 📝 Current Status

✅ **Join Count Fixed**: Changed from "2k+" to "23" in both landing pages
✅ **Email Template Updated**: Added messaging about sharing updates when platform is back
✅ **Environment Variables**: Added to `.env.example` with clear instructions
✅ **Beautiful Email Design**: Professional HTML template with brand colors

## 🚀 Next Steps

1. Set up your Gmail App Password (see Step 2 above)
2. Add credentials to `.env` file
3. Test the waitlist signup flow
4. Monitor your admin email for new signup notifications
5. Consider upgrading to a professional email service for production

## 💡 Tips

- **Test thoroughly** before launching to ensure emails are delivered
- **Check spam folders** during testing
- **Use a professional email** (e.g., hello@yourdomain.com) for better deliverability
- **Monitor your inbox** for admin notifications of new signups
- **Keep backups** of your Supabase data

---

**Need Help?** Check the console logs for detailed error messages or review the API route at `app/api/waitlist/route.ts`.
