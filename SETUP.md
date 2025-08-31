# Setup Guide

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Database Configuration
# Replace with your actual PostgreSQL connection string
DATABASE_URL="postgresql://username:password@localhost:5432/businessbobby"

# Stripe Configuration
# Replace with your actual Stripe keys
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key_here"
STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_publishable_key_here"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret_here"

# Next.js Configuration
NEXTAUTH_SECRET="your_nextauth_secret_here"
NEXTAUTH_URL="http://localhost:3000"
```

## Database Setup

1. Make sure you have PostgreSQL installed and running
2. Create a database named `businessbobby`
3. Update the `DATABASE_URL` in your `.env.local` file with your actual database credentials

## Stripe Setup

1. Create a Stripe account if you don't have one
2. Get your API keys from the Stripe dashboard
3. Update the Stripe environment variables in your `.env.local` file
4. Set up webhooks in your Stripe dashboard pointing to `/api/stripe-webhook`

## Running the Application

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. The application will be available at `http://localhost:3000`

## Fixed Issues

- ✅ Replaced React Router DOM with Next.js routing
- ✅ Fixed `useLocation()` error by using Next.js navigation hooks
- ✅ Added database initialization to checkout-complete route
- ✅ Removed unnecessary React Router dependencies

## Troubleshooting

If you're still having database issues:

1. Check that your `DATABASE_URL` is correct
2. Ensure PostgreSQL is running
3. Verify the database exists
4. Check the console logs for any database connection errors

If you're having Stripe issues:

1. Verify your Stripe keys are correct
2. Check that webhooks are properly configured
3. Ensure the webhook endpoint is accessible
