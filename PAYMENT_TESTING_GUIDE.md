# FilmFusion Payment Flow Testing Guide

This guide provides comprehensive testing procedures for the complete FilmFusion payment system, from user registration through subscription management.

## Prerequisites

Before testing, ensure you have:
- ✅ Railway backend deployed with all environment variables set
- ✅ Stripe keys configured (test mode recommended)
- ✅ Frontend deployed and connected to backend
- ✅ Webhook endpoints configured in Stripe dashboard
- ✅ Test payment methods available

## Environment Variables Checklist

### Backend (Railway)
\`\`\`bash
# Database
DATABASE_URL=postgresql://...
REDIS_URL=redis://...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_ENTERPRISE_PRICE_ID=price_...

# Other APIs
OPENAI_API_KEY=sk-...
ELEVENLABS_API_KEY=...
RESEND_API_KEY=re_...
BLOB_READ_WRITE_TOKEN=vercel_blob_...

# Security
JWT_SECRET=your-secret-key
ENVIRONMENT=production
\`\`\`

### Frontend (Vercel)
\`\`\`bash
NEXT_PUBLIC_BACKEND_URL=https://filmfusion-production-16fd.up.railway.app
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
\`\`\`

## Complete Payment Flow Test Scenarios

### 1. User Registration & Free Plan
**Test Steps:**
1. Navigate to `/auth/signup`
2. Fill out registration form with valid data
3. Submit form and verify:
   - ✅ User account created in database
   - ✅ Welcome email sent
   - ✅ User redirected to dashboard
   - ✅ Free plan limits displayed correctly
   - ✅ Subscription status shows "Free Plan"

**Expected Results:**
- User created with `subscription_plan: "free"`
- Usage limits: 5 videos, 50 API calls, 10 render minutes
- No Stripe customer created yet

### 2. Plan Upgrade Flow
**Test Steps:**
1. From dashboard, click "Upgrade" or navigate to `/pricing`
2. Select Pro plan ($29/month)
3. Click "Upgrade to Pro"
4. Complete Stripe checkout:
   - Use test card: `4242 4242 4242 4242`
   - Any future expiry date
   - Any 3-digit CVC
5. Verify successful payment and redirect

**Expected Results:**
- ✅ Stripe customer created
- ✅ Subscription created in Stripe
- ✅ Webhook received and processed
- ✅ User subscription updated in database
- ✅ Dashboard shows Pro plan status
- ✅ Usage limits updated to Pro tier
- ✅ Confirmation email sent

### 3. Subscription Management
**Test Steps:**
1. Navigate to `/billing`
2. Verify all subscription details display correctly:
   - Current plan and status
   - Billing cycle dates
   - Usage statistics with progress bars
   - Billing history
3. Test "Manage Billing" button (opens Stripe portal)
4. Test plan change functionality

**Expected Results:**
- ✅ All subscription data loads correctly
- ✅ Usage percentages calculate properly
- ✅ Stripe customer portal opens
- ✅ Plan changes reflect immediately

### 4. Payment Failure Handling
**Test Steps:**
1. Attempt upgrade with declined card: `4000 0000 0000 0002`
2. Verify error handling:
   - User sees appropriate error message
   - No partial subscription created
   - User remains on current plan

**Expected Results:**
- ✅ Graceful error handling
- ✅ Clear error messages
- ✅ No data corruption
- ✅ User can retry with valid payment method

### 5. Subscription Cancellation
**Test Steps:**
1. From billing dashboard, click "Cancel Subscription"
2. Confirm cancellation
3. Verify:
   - Subscription marked for cancellation
   - Access continues until period end
   - Status shows "Canceling"
   - Cancellation email sent

**Expected Results:**
- ✅ Subscription `cancel_at_period_end: true`
- ✅ User retains access until period end
- ✅ Webhook processed correctly
- ✅ Email notification sent

### 6. Webhook Processing
**Test Steps:**
1. Use Stripe CLI to forward webhooks: `stripe listen --forward-to localhost:8000/api/stripe-webhook`
2. Trigger various events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
3. Verify each webhook is processed correctly

**Expected Results:**
- ✅ All webhooks return 200 status
- ✅ Database updates correctly for each event
- ✅ Email notifications sent appropriately
- ✅ Error handling for invalid signatures

### 7. Usage Limit Enforcement
**Test Steps:**
1. Create test user with Free plan
2. Make API calls to exceed limits:
   - Generate 6+ scripts (exceeds 5 video limit)
   - Make 51+ API calls (exceeds 50 call limit)
3. Verify limits are enforced

**Expected Results:**
- ✅ API returns 429 (rate limited) when limits exceeded
- ✅ Clear error messages about upgrade requirements
- ✅ Usage tracking accurate in dashboard

## API Endpoint Testing

### Authentication Endpoints
\`\`\`bash
# Register new user
POST /api/auth/register
{
  "full_name": "Test User",
  "username": "testuser",
  "email": "test@example.com",
  "password": "TestPass123!"
}

# Login user
POST /api/auth/login
{
  "email": "test@example.com",
  "password": "TestPass123!"
}
\`\`\`

### Payment Endpoints
\`\`\`bash
# Create checkout session
POST /api/create-checkout-session
Authorization: Bearer <token>
{
  "plan": "pro",
  "success_url": "https://app.com/dashboard?payment=success",
  "cancel_url": "https://app.com/pricing?payment=canceled"
}

# Get usage data
GET /api/usage
Authorization: Bearer <token>

# Cancel subscription
POST /api/cancel-subscription
Authorization: Bearer <token>

# Get customer portal
POST /api/customer-portal
Authorization: Bearer <token>
\`\`\`

## Error Scenarios to Test

### 1. Invalid Payment Methods
- Expired cards: `4000 0000 0000 0069`
- Insufficient funds: `4000 0000 0000 9995`
- Generic decline: `4000 0000 0000 0002`

### 2. Network Issues
- Backend unavailable during checkout
- Webhook delivery failures
- Database connection issues

### 3. Edge Cases
- Duplicate subscription attempts
- Plan changes during billing cycle
- Webhook replay attacks
- Invalid JWT tokens

## Monitoring & Debugging

### Stripe Dashboard
- Monitor test payments in Stripe dashboard
- Check webhook delivery status
- Review customer and subscription data

### Backend Logs
- Check Railway logs for webhook processing
- Monitor API response times
- Verify database updates

### Frontend Debugging
- Use browser dev tools to monitor API calls
- Check localStorage for auth tokens
- Verify error handling in UI

## Production Deployment Checklist

Before going live:
- ✅ Switch to Stripe live keys
- ✅ Update webhook endpoints to production URLs
- ✅ Test with real payment methods (small amounts)
- ✅ Verify email delivery in production
- ✅ Set up monitoring and alerting
- ✅ Configure proper CORS settings
- ✅ Enable rate limiting
- ✅ Set up backup and recovery procedures

## Common Issues & Solutions

### Issue: Webhooks not being received
**Solution:** 
- Verify webhook URL in Stripe dashboard
- Check Railway deployment logs
- Ensure webhook secret is correct

### Issue: Payment succeeds but subscription not updated
**Solution:**
- Check webhook processing logs
- Verify database connection
- Ensure proper error handling in webhook handlers

### Issue: Users can't access premium features after payment
**Solution:**
- Verify JWT token includes updated subscription status
- Check frontend auth guard logic
- Ensure subscription status is properly cached

### Issue: Usage limits not enforcing correctly
**Solution:**
- Verify rate limiting middleware
- Check usage tracking in database
- Ensure proper plan limit configuration

## Test Data Cleanup

After testing:
1. Delete test users from database
2. Cancel test subscriptions in Stripe
3. Clear test payment methods
4. Reset usage counters if needed

## Automated Testing

Consider implementing:
- Unit tests for payment logic
- Integration tests for API endpoints
- End-to-end tests for complete user journeys
- Webhook testing with mock Stripe events
