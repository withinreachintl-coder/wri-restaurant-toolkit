# WRI Restaurant Toolkit - Setup Guide

## Stripe Configuration

### Create Stripe Product

1. Go to https://dashboard.stripe.com/products
2. Click "Create product"
3. **Name**: `WRI Restaurant Toolkit - Pro`
4. **Description**: `Monthly subscription for restaurant operations tracking`
5. **Pricing model**: Recurring
6. **Billing cycle**: Monthly
7. **Price**: $49.00 USD
8. **Billing period**: Monthly
9. **Trial period**: 14 days
10. Save product
11. Copy **Price ID** (price_xxx...) and **Product ID** (prod_xxx...)

### Store in .env.local

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx...
STRIPE_SECRET_KEY=sk_live_xxx...
NEXT_PUBLIC_STRIPE_PRICE_ID=price_xxx...
NEXT_PUBLIC_STRIPE_PRODUCT_ID=prod_xxx...
STRIPE_WEBHOOK_SECRET=whsec_xxx...
```

---

## Supabase Configuration

### Create Project (or use existing org DB)

1. Go to https://supabase.com
2. Create new project or select existing org
3. Database: `wri_restaurant_toolkit`
4. Note: **Project URL** and **Anon Key**

### Run Schema

1. Go to SQL Editor in Supabase dashboard
2. Copy `DATABASE_SCHEMA.sql` content
3. Run all SQL
4. Verify tables created (Organizations, Users, LP_Audits, etc.)

### Configure Auth

1. **Email provider**: Supabase (built-in)
2. **Redirect URL**: `http://localhost:3000/auth/callback` (dev) + `https://toolkit.wireach.tools/auth/callback` (prod)
3. **Magic Link**: Enable (used for passwordless auth)

### Store in .env.local

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
```

---

## Resend Configuration

### Create Sender

1. Go to https://resend.com
2. Create API key
3. **Sender email**: `noreply@wireach.tools` (verify domain ownership)
4. Create template or use transactional emails

### Store in .env.local

```
RESEND_API_KEY=re_xxx...
RESEND_FROM_EMAIL=noreply@wireach.tools
```

---

## Vercel Deployment

### Create Project

1. Go to https://vercel.com
2. Import repo: `withinreachintl-coder/wri-restaurant-toolkit`
3. Configure environment variables (copy .env.local values)
4. Deploy

### Configure Subdomain

1. **Domain**: toolkit.wireach.tools
2. **CNAME**: toolkit.wireach.tools.vercel.app (Vercel will generate)
3. Add CNAME record to DNS (same as other two products)
4. Wait for DNS propagation (~5 minutes)

---

## Supabase Storage Configuration

### Create Bucket for R&M Request Photos

1. Go to Storage in Supabase dashboard
2. Create new bucket: `rm-request-photos`
3. Make public (or add RLS policy for authenticated users)
4. Store bucket URL in .env.local:

```
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=rm-request-photos
```

---

## Database Initialization on First Signup

When user signs up:

1. Magic link sent to email (Resend)
2. User lands on `/auth/callback` (Supabase redirects)
3. Auth session created
4. User fill signup form: Email + Restaurant Name
5. Create organizations record (name from form)
6. Create users record (auth_id linked to Supabase auth)
7. Redirect to `/dashboard`
8. Org is fully isolated via RLS

---

## Environment Variables (.env.local)

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx...
STRIPE_SECRET_KEY=sk_live_xxx...
NEXT_PUBLIC_STRIPE_PRICE_ID=price_xxx...
NEXT_PUBLIC_STRIPE_PRODUCT_ID=prod_xxx...
STRIPE_WEBHOOK_SECRET=whsec_xxx...

# Resend
RESEND_API_KEY=re_xxx...
RESEND_FROM_EMAIL=noreply@wireach.tools

# App
NEXT_PUBLIC_APP_URL=https://toolkit.wireach.tools

# Vercel
NODE_ENV=production
```

---

## Health Checks

Before building the app:

- [ ] Supabase project created and schema deployed
- [ ] Stripe product created with $49/mo price and 14-day trial
- [ ] Resend API key configured with noreply@wireach.tools sender
- [ ] Vercel project created
- [ ] Environment variables loaded in Vercel
- [ ] Supabase RLS policies enabled
- [ ] Stripe webhook configured for `payment_intent.succeeded` and `customer.subscription.updated`

---

## Cron Jobs (Daily Summary)

### Job: Generate daily summary at 11:59 PM UTC

Use Vercel Cron or external cron service:

```
POST /api/cron/daily-summary
```

This job will:
1. Get all active organizations
2. For each org:
   - Count LP audits from today
   - Count R&M requests (opened/resolved) from today
   - Check if shift handoff note exists from today
   - Generate summary text
   - Insert into daily_summaries table
   - Email summary to owner (if opted in)

---

## Next Steps

1. Create Supabase project and run schema
2. Create Stripe product
3. Set up Resend domain + API key
4. Create Vercel project
5. Configure all environment variables
6. Approve schema → begin app development
