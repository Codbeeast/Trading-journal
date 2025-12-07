# Razorpay Integration Setup Guide

This guide will help you set up Razorpay payment integration for the Trading Journal subscription system.

## Prerequisites

- Razorpay account (sign up at https://dashboard.razorpay.com/)
- MongoDB database connection
- Clerk authentication set up

## Step 1: Get Razorpay API Credentials

1. Login to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Navigate to **Settings → API Keys**
3. Generate **Test Mode** keys for development:
   - You'll get a **Key ID** (starts with `rzp_test_`)
   - And a **Key Secret**
4. Save these credentials securely

## Step 2: Create Subscription Plans

Create three subscription plans on Razorpay:

### Plan 1: Monthly Subscription
- **Name**: "1 Month Subscription"
- **Billing Amount**: ₹599
- **Billing Interval**: Monthly (1 month)
- **Billing Count**: 0 (unlimited renewals)

### Plan 2: 6 Months Subscription
- **Name**: "6 Months Subscription + 1 Bonus Month"
- **Billing Amount**: ₹2999
- **Billing Interval**: Every 7 months
- **Billing Count**: 0 (unlimited renewals)

### Plan 3: Yearly Subscription
- **Name**: "12 Months Subscription + 2 Bonus Months"
- **Billing Amount**: ₹5990
- **Billing Interval**: Every 14 months
- **Billing Count**: 0 (unlimited renewals)

**Save the Plan IDs** for each plan (format: `plan_xxxxxxxxxxxxx`)

## Step 3: Setup Webhooks

1. Go to **Settings → Webhooks** in Razorpay Dashboard
2. Create a new webhook with:
   - **Webhook URL**: `https://your-domain.com/api/subscription/webhook`
   - **Active Events**:
     - `subscription.activated`
     - `subscription.charged`
     - `subscription.completed`
     - `subscription.cancelled`
     - `subscription.paused`
     - `subscription.resumed`
     - `payment.failed`
   - **Alert Email**: Your email
3. Save and copy the **Webhook Secret**

## Step 4: Configure Environment Variables

Add the following to your `.env.local` file:

```env
# Razorpay API Credentials
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Razorpay Plan IDs
RAZORPAY_PLAN_1_MONTH=plan_monthly_id
RAZORPAY_PLAN_6_MONTHS=plan_6months_id
RAZORPAY_PLAN_12_MONTHS=plan_12months_id

# Public Key (for frontend)
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
```

Replace the placeholder values with your actual credentials.

## Step 5: Initialize Database Plans

Run the plan initialization script to create Plan records in MongoDB:

```bash
node scripts/init-plans.js
```

Or use the npm script:

```bash
npm run init-plans
```

This creates the plan configurations in your database.

## Step 6: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `/pricing` page

3. Select a plan and click "Start Free Trial"

4. Use Razorpay test credentials:
   - **Test Card Number**: 4111 1111 1111 1111
   - **CVV**: Any 3 digits
   - **Expiry**: Any future date

5. Verify:
   - Subscription is created in database
   - 7-day trial is activated
   - User redirected to success page

## Step 7: Webhook Testing

1. Use ngrok or similar tool to expose local server:
   ```bash
   ngrok http 3000
   ```

2. Update webhook URL in Razorpay with ngrok URL:
   ```
   https://your-ngrok-url.ngrok.io/api/subscription/webhook
   ```

3. Trigger test events from Razorpay dashboard

4. Check server logs to verify webhook processing

## Going Live

When ready for production:

1. Complete KYC verification on Razorpay dashboard
2. Switch to **Live Mode** in Razorpay
3. Generate **Live API Keys** (start with `rzp_live_`)
4. Update `.env.local` with live credentials
5. Update webhook URL to production domain
6. Test entire flow with real payment methods
7. Monitor transactions in Razorpay dashboard

## Subscription Features

✅ **7-Day Free Trial** - No credit card required to start
✅ **Autopay** - Automatic renewals using Razorpay Subscriptions
✅ **Multiple Plans** - 1, 6, 12 month options with bonus periods
✅ **Secure Payments** - Razorpay handles all payment security
✅ **Webhook Integration** - Real-time payment status updates
✅ **Trial Management** - Automatic trial expiry and conversion
✅ **Access Control** - Middleware protection for premium routes

## API Endpoints

- `POST /api/subscription/create` - Create new subscription/trial
- `POST /api/subscription/verify` - Verify payment signature
- `GET /api/subscription/status` - Get user's subscription status
- `POST /api/subscription/cancel` - Cancel subscription
- `POST /api/subscription/upgrade` - Upgrade/downgrade plan
- `POST /api/subscription/webhook` - Razorpay webhooks
- `GET /api/subscription/plans` - Get all pricing plans

## Troubleshooting

### Payment Failing
- Verify API keys are correct
- Check if using test mode with test cards
- Ensure sufficient test balance in Razorpay

### Webhook Not Received
- Verify webhook URL is accessible
- Check webhook secret is correct
- Review Razorpay webhook logs

### Subscription Not Activating
- Check MongoDB connection
- Verify Plan IDs match Razorpay plans
- Review server logs for errors

## Support

For issues or questions:
- Razorpay Docs: https://razorpay.com/docs/
- Razorpay Support: support@razorpay.com
- Integration Guide: https://razorpay.com/docs/subscriptions/

---

**Security Note**: Never commit `.env.local` to version control. Keep API keys and secrets confidential.
