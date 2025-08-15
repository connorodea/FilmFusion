import stripe
import os
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

# Initialize Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")

# Pricing configuration
PRICING_CONFIG = {
    "plans": {
        "free": {
            "price_id": None,
            "ai_calls_limit": 50,
            "render_minutes_limit": 10,
            "storage_gb_limit": 1.0,
            "features": ["Basic AI script generation", "Standard voiceovers", "720p rendering"]
        },
        "pro": {
            "price_id": os.getenv("STRIPE_PRO_PRICE_ID"),
            "monthly_price": 2900,  # $29.00
            "ai_calls_limit": 1000,
            "render_minutes_limit": 120,
            "storage_gb_limit": 10.0,
            "features": ["Advanced AI with reasoning", "Premium voices", "4K rendering", "Priority support"]
        },
        "enterprise": {
            "price_id": os.getenv("STRIPE_ENTERPRISE_PRICE_ID"),
            "monthly_price": 9900,  # $99.00
            "ai_calls_limit": -1,  # unlimited
            "render_minutes_limit": -1,  # unlimited
            "storage_gb_limit": 100.0,
            "features": ["Unlimited AI usage", "Custom voices", "8K rendering", "API access", "White-label"]
        }
    },
    "usage_pricing": {
        "ai_call_overage": 5,  # $0.05 per call over limit
        "render_minute_overage": 50,  # $0.50 per minute over limit
        "storage_gb_overage": 200  # $2.00 per GB over limit
    }
}

async def create_stripe_customer(email: str, name: str = None) -> Dict[str, Any]:
    """Create a new Stripe customer"""
    try:
        customer = stripe.Customer.create(
            email=email,
            name=name,
            metadata={"source": "filmfusion"}
        )
        return {
            "success": True,
            "customer_id": customer.id,
            "customer": customer
        }
    except stripe.error.StripeError as e:
        return {
            "success": False,
            "error": str(e)
        }

async def create_checkout_session(customer_id: str, price_id: str, success_url: str, cancel_url: str) -> Dict[str, Any]:
    """Create a Stripe checkout session for subscription"""
    try:
        session = stripe.checkout.Session.create(
            customer=customer_id,
            payment_method_types=['card'],
            line_items=[{
                'price': price_id,
                'quantity': 1,
            }],
            mode='subscription',
            success_url=success_url,
            cancel_url=cancel_url,
            allow_promotion_codes=True,
            billing_address_collection='required',
            metadata={
                "source": "filmfusion_subscription"
            }
        )
        return {
            "success": True,
            "session_id": session.id,
            "checkout_url": session.url
        }
    except stripe.error.StripeError as e:
        return {
            "success": False,
            "error": str(e)
        }

async def create_usage_invoice(customer_id: str, usage_charges: Dict[str, int]) -> Dict[str, Any]:
    """Create usage-based invoice for overage charges"""
    try:
        invoice_items = []
        total_amount = 0
        
        # AI calls overage
        if usage_charges.get('ai_calls_overage', 0) > 0:
            ai_amount = usage_charges['ai_calls_overage'] * PRICING_CONFIG['usage_pricing']['ai_call_overage']
            invoice_items.append({
                'customer': customer_id,
                'amount': ai_amount,
                'currency': 'usd',
                'description': f"AI API calls overage ({usage_charges['ai_calls_overage']} calls)"
            })
            total_amount += ai_amount
        
        # Render minutes overage
        if usage_charges.get('render_minutes_overage', 0) > 0:
            render_amount = usage_charges['render_minutes_overage'] * PRICING_CONFIG['usage_pricing']['render_minute_overage']
            invoice_items.append({
                'customer': customer_id,
                'amount': render_amount,
                'currency': 'usd',
                'description': f"Video rendering overage ({usage_charges['render_minutes_overage']} minutes)"
            })
            total_amount += render_amount
        
        # Storage overage
        if usage_charges.get('storage_gb_overage', 0) > 0:
            storage_amount = int(usage_charges['storage_gb_overage'] * PRICING_CONFIG['usage_pricing']['storage_gb_overage'])
            invoice_items.append({
                'customer': customer_id,
                'amount': storage_amount,
                'currency': 'usd',
                'description': f"Storage overage ({usage_charges['storage_gb_overage']:.1f} GB)"
            })
            total_amount += storage_amount
        
        if not invoice_items:
            return {"success": True, "message": "No overage charges"}
        
        # Create invoice items
        for item in invoice_items:
            stripe.InvoiceItem.create(**item)
        
        # Create and finalize invoice
        invoice = stripe.Invoice.create(
            customer=customer_id,
            auto_advance=True,
            collection_method='charge_automatically',
            metadata={
                "source": "filmfusion_usage",
                "total_amount": total_amount
            }
        )
        
        invoice = stripe.Invoice.finalize_invoice(invoice.id)
        
        return {
            "success": True,
            "invoice_id": invoice.id,
            "amount": total_amount,
            "status": invoice.status
        }
    except stripe.error.StripeError as e:
        return {
            "success": False,
            "error": str(e)
        }

async def cancel_subscription(subscription_id: str) -> Dict[str, Any]:
    """Cancel a Stripe subscription"""
    try:
        subscription = stripe.Subscription.modify(
            subscription_id,
            cancel_at_period_end=True
        )
        return {
            "success": True,
            "subscription": subscription,
            "canceled_at": subscription.canceled_at
        }
    except stripe.error.StripeError as e:
        return {
            "success": False,
            "error": str(e)
        }

async def get_customer_portal_url(customer_id: str, return_url: str) -> Dict[str, Any]:
    """Create customer portal session for subscription management"""
    try:
        session = stripe.billing_portal.Session.create(
            customer=customer_id,
            return_url=return_url
        )
        return {
            "success": True,
            "portal_url": session.url
        }
    except stripe.error.StripeError as e:
        return {
            "success": False,
            "error": str(e)
        }

def verify_webhook_signature(payload: bytes, signature: str) -> bool:
    """Verify Stripe webhook signature"""
    try:
        stripe.Webhook.construct_event(payload, signature, STRIPE_WEBHOOK_SECRET)
        return True
    except (ValueError, stripe.error.SignatureVerificationError):
        return False

def calculate_usage_charges(user_usage: Dict[str, Any], plan_limits: Dict[str, Any]) -> Dict[str, int]:
    """Calculate overage charges based on usage and plan limits"""
    charges = {}
    
    # AI calls overage
    if plan_limits['ai_calls_limit'] != -1:  # -1 means unlimited
        ai_overage = max(0, user_usage.get('ai_calls', 0) - plan_limits['ai_calls_limit'])
        if ai_overage > 0:
            charges['ai_calls_overage'] = ai_overage
    
    # Render minutes overage
    if plan_limits['render_minutes_limit'] != -1:
        render_overage = max(0, user_usage.get('render_minutes', 0) - plan_limits['render_minutes_limit'])
        if render_overage > 0:
            charges['render_minutes_overage'] = render_overage
    
    # Storage overage
    storage_overage = max(0, user_usage.get('storage_gb', 0) - plan_limits['storage_gb_limit'])
    if storage_overage > 0:
        charges['storage_gb_overage'] = storage_overage
    
    return charges

def get_plan_limits(plan_name: str) -> Dict[str, Any]:
    """Get plan limits and features"""
    return PRICING_CONFIG['plans'].get(plan_name, PRICING_CONFIG['plans']['free'])
