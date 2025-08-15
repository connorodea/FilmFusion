import os
import logging
from typing import Dict, Any, Optional
from datetime import datetime
import resend
from jinja2 import Environment, FileSystemLoader, select_autoescape
from pathlib import Path

# Configure Resend
resend.api_key = os.getenv("RESEND_API_KEY")

# Setup Jinja2 for email templates
template_dir = Path(__file__).parent / "email_templates"
template_dir.mkdir(exist_ok=True)

jinja_env = Environment(
    loader=FileSystemLoader(template_dir),
    autoescape=select_autoescape(['html', 'xml'])
)

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        self.from_email = os.getenv("FROM_EMAIL", "noreply@filmfusion.ai")
        self.company_name = "FilmFusion"
        self.app_url = os.getenv("FRONTEND_URL", "https://filmfusion.vercel.app")
    
    async def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None
    ) -> bool:
        """Send email using Resend"""
        try:
            params = {
                "from": self.from_email,
                "to": [to_email],
                "subject": subject,
                "html": html_content,
            }
            
            if text_content:
                params["text"] = text_content
            
            response = resend.Emails.send(params)
            logger.info(f"Email sent successfully to {to_email}: {response}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            return False
    
    def render_template(self, template_name: str, context: Dict[str, Any]) -> str:
        """Render email template with context"""
        try:
            template = jinja_env.get_template(template_name)
            return template.render(**context, company_name=self.company_name, app_url=self.app_url)
        except Exception as e:
            logger.error(f"Failed to render template {template_name}: {str(e)}")
            return ""
    
    async def send_welcome_email(self, user_email: str, user_name: str) -> bool:
        """Send welcome email to new users"""
        context = {
            "user_name": user_name,
            "login_url": f"{self.app_url}/auth/signin"
        }
        
        html_content = self.render_template("welcome.html", context)
        if not html_content:
            html_content = f"""
            <h1>Welcome to {self.company_name}!</h1>
            <p>Hi {user_name},</p>
            <p>Welcome to FilmFusion! We're excited to help you create amazing videos with AI.</p>
            <p><a href="{self.app_url}/dashboard">Get Started</a></p>
            """
        
        return await self.send_email(
            to_email=user_email,
            subject=f"Welcome to {self.company_name}!",
            html_content=html_content
        )
    
    async def send_render_completion_email(
        self, 
        user_email: str, 
        user_name: str, 
        project_name: str,
        download_url: str,
        render_time: str
    ) -> bool:
        """Send email when video render is completed"""
        context = {
            "user_name": user_name,
            "project_name": project_name,
            "download_url": download_url,
            "render_time": render_time,
            "dashboard_url": f"{self.app_url}/dashboard"
        }
        
        html_content = self.render_template("render_complete.html", context)
        if not html_content:
            html_content = f"""
            <h1>Your video is ready!</h1>
            <p>Hi {user_name},</p>
            <p>Great news! Your video "{project_name}" has finished rendering in {render_time}.</p>
            <p><a href="{download_url}" style="background: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Download Video</a></p>
            <p>You can also view it in your <a href="{self.app_url}/dashboard">dashboard</a>.</p>
            """
        
        return await self.send_email(
            to_email=user_email,
            subject=f"🎬 Your video '{project_name}' is ready!",
            html_content=html_content
        )
    
    async def send_render_failed_email(
        self, 
        user_email: str, 
        user_name: str, 
        project_name: str,
        error_message: str
    ) -> bool:
        """Send email when video render fails"""
        context = {
            "user_name": user_name,
            "project_name": project_name,
            "error_message": error_message,
            "support_url": f"{self.app_url}/support"
        }
        
        html_content = self.render_template("render_failed.html", context)
        if not html_content:
            html_content = f"""
            <h1>Video render failed</h1>
            <p>Hi {user_name},</p>
            <p>Unfortunately, your video "{project_name}" failed to render.</p>
            <p><strong>Error:</strong> {error_message}</p>
            <p>Please try again or <a href="{self.app_url}/support">contact support</a> if the issue persists.</p>
            """
        
        return await self.send_email(
            to_email=user_email,
            subject=f"❌ Video render failed: '{project_name}'",
            html_content=html_content
        )
    
    async def send_subscription_confirmation_email(
        self, 
        user_email: str, 
        user_name: str, 
        plan_name: str,
        amount: str
    ) -> bool:
        """Send email when user subscribes to a plan"""
        context = {
            "user_name": user_name,
            "plan_name": plan_name,
            "amount": amount,
            "billing_url": f"{self.app_url}/billing"
        }
        
        html_content = self.render_template("subscription_confirmation.html", context)
        if not html_content:
            html_content = f"""
            <h1>Subscription Confirmed!</h1>
            <p>Hi {user_name},</p>
            <p>Thank you for subscribing to {plan_name} for {amount}/month!</p>
            <p>You now have access to premium features. <a href="{self.app_url}/dashboard">Start creating</a>!</p>
            <p>Manage your subscription in your <a href="{self.app_url}/billing">billing settings</a>.</p>
            """
        
        return await self.send_email(
            to_email=user_email,
            subject=f"🎉 Welcome to {plan_name}!",
            html_content=html_content
        )
    
    async def send_usage_limit_warning_email(
        self, 
        user_email: str, 
        user_name: str, 
        usage_type: str,
        current_usage: int,
        limit: int
    ) -> bool:
        """Send email when user approaches usage limits"""
        percentage = (current_usage / limit) * 100
        
        context = {
            "user_name": user_name,
            "usage_type": usage_type,
            "current_usage": current_usage,
            "limit": limit,
            "percentage": round(percentage),
            "upgrade_url": f"{self.app_url}/billing"
        }
        
        html_content = self.render_template("usage_warning.html", context)
        if not html_content:
            html_content = f"""
            <h1>Usage Limit Warning</h1>
            <p>Hi {user_name},</p>
            <p>You've used {current_usage} of your {limit} {usage_type} limit ({percentage:.0f}%).</p>
            <p>Consider <a href="{self.app_url}/billing">upgrading your plan</a> to continue creating without interruption.</p>
            """
        
        return await self.send_email(
            to_email=user_email,
            subject=f"⚠️ {usage_type.title()} usage at {percentage:.0f}%",
            html_content=html_content
        )
    
    async def send_subscription_welcome_email(self, user_email: str, user_name: str, plan_name: str) -> bool:
        """Send welcome email when user subscribes to a paid plan"""
        context = {
            "user_name": user_name,
            "plan_name": plan_name.title(),
            "dashboard_url": f"{self.app_url}/dashboard",
            "billing_url": f"{self.app_url}/billing"
        }
        
        html_content = self.render_template("subscription_welcome.html", context)
        if not html_content:
            html_content = f"""
            <h1>Welcome to {plan_name.title()}!</h1>
            <p>Hi {user_name},</p>
            <p>Thank you for upgrading to {plan_name.title()}! You now have access to premium features.</p>
            <p><a href="{self.app_url}/dashboard" style="background: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Start Creating</a></p>
            <p>You can manage your subscription anytime in your <a href="{self.app_url}/billing">billing settings</a>.</p>
            """
        
        return await self.send_email(
            to_email=user_email,
            subject=f"🎉 Welcome to {plan_name.title()}!",
            html_content=html_content
        )
    
    async def send_subscription_cancelled_email(self, user_email: str, user_name: str, period_end: datetime) -> bool:
        """Send email when subscription is cancelled"""
        context = {
            "user_name": user_name,
            "period_end": period_end.strftime("%B %d, %Y"),
            "billing_url": f"{self.app_url}/billing",
            "pricing_url": f"{self.app_url}/pricing"
        }
        
        html_content = self.render_template("subscription_cancelled.html", context)
        if not html_content:
            html_content = f"""
            <h1>Subscription Cancelled</h1>
            <p>Hi {user_name},</p>
            <p>We've processed your subscription cancellation. You'll continue to have access to premium features until {period_end.strftime("%B %d, %Y")}.</p>
            <p>We're sorry to see you go! If you change your mind, you can <a href="{self.app_url}/pricing">resubscribe anytime</a>.</p>
            <p>Questions? <a href="{self.app_url}/support">Contact our support team</a>.</p>
            """
        
        return await self.send_email(
            to_email=user_email,
            subject="Subscription Cancelled - Access Until Period End",
            html_content=html_content
        )
    
    async def send_subscription_ended_email(self, user_email: str, user_name: str) -> bool:
        """Send email when subscription has ended"""
        context = {
            "user_name": user_name,
            "pricing_url": f"{self.app_url}/pricing",
            "dashboard_url": f"{self.app_url}/dashboard"
        }
        
        html_content = self.render_template("subscription_ended.html", context)
        if not html_content:
            html_content = f"""
            <h1>Your Subscription Has Ended</h1>
            <p>Hi {user_name},</p>
            <p>Your premium subscription has ended, and your account has been moved to the free plan.</p>
            <p>You can still create videos with our free plan limits, or <a href="{self.app_url}/pricing">upgrade anytime</a> to regain full access.</p>
            <p><a href="{self.app_url}/dashboard">Continue with Free Plan</a></p>
            """
        
        return await self.send_email(
            to_email=user_email,
            subject="Subscription Ended - Now on Free Plan",
            html_content=html_content
        )
    
    async def send_payment_receipt_email(self, user_email: str, user_name: str, amount: float, description: str) -> bool:
        """Send payment receipt email"""
        context = {
            "user_name": user_name,
            "amount": f"${amount:.2f}",
            "description": description,
            "date": datetime.now().strftime("%B %d, %Y"),
            "billing_url": f"{self.app_url}/billing"
        }
        
        html_content = self.render_template("payment_receipt.html", context)
        if not html_content:
            html_content = f"""
            <h1>Payment Receipt</h1>
            <p>Hi {user_name},</p>
            <p>Thank you for your payment of ${amount:.2f} for {description}.</p>
            <p><strong>Date:</strong> {datetime.now().strftime("%B %d, %Y")}</p>
            <p>View your complete billing history in your <a href="{self.app_url}/billing">billing settings</a>.</p>
            """
        
        return await self.send_email(
            to_email=user_email,
            subject=f"Payment Receipt - ${amount:.2f}",
            html_content=html_content
        )
    
    async def send_payment_failed_email(self, user_email: str, user_name: str, amount: float, invoice_url: str = None) -> bool:
        """Send email when payment fails"""
        context = {
            "user_name": user_name,
            "amount": f"${amount:.2f}",
            "billing_url": f"{self.app_url}/billing",
            "invoice_url": invoice_url,
            "support_url": f"{self.app_url}/support"
        }
        
        html_content = self.render_template("payment_failed.html", context)
        if not html_content:
            invoice_link = f'<p><a href="{invoice_url}">View Invoice</a></p>' if invoice_url else ""
            html_content = f"""
            <h1>Payment Failed</h1>
            <p>Hi {user_name},</p>
            <p>We were unable to process your payment of ${amount:.2f}. This could be due to insufficient funds, an expired card, or other payment issues.</p>
            {invoice_link}
            <p>Please <a href="{self.app_url}/billing">update your payment method</a> to continue your subscription.</p>
            <p>Need help? <a href="{self.app_url}/support">Contact support</a>.</p>
            """
        
        return await self.send_email(
            to_email=user_email,
            subject=f"⚠️ Payment Failed - ${amount:.2f}",
            html_content=html_content
        )
    
    async def send_trial_ending_email(self, user_email: str, user_name: str, trial_end: datetime) -> bool:
        """Send email when trial is ending"""
        context = {
            "user_name": user_name,
            "trial_end": trial_end.strftime("%B %d, %Y"),
            "pricing_url": f"{self.app_url}/pricing",
            "billing_url": f"{self.app_url}/billing"
        }
        
        html_content = self.render_template("trial_ending.html", context)
        if not html_content:
            html_content = f"""
            <h1>Your Trial is Ending Soon</h1>
            <p>Hi {user_name},</p>
            <p>Your free trial ends on {trial_end.strftime("%B %d, %Y")}. To continue enjoying premium features, please choose a subscription plan.</p>
            <p><a href="{self.app_url}/pricing" style="background: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Choose Your Plan</a></p>
            <p>Questions? We're here to help!</p>
            """
        
        return await self.send_email(
            to_email=user_email,
            subject="⏰ Your Trial Ends Soon",
            html_content=html_content
        )
    
    async def send_upcoming_invoice_email(self, user_email: str, user_name: str, amount: float, due_date: datetime) -> bool:
        """Send email for upcoming invoice"""
        context = {
            "user_name": user_name,
            "amount": f"${amount:.2f}",
            "due_date": due_date.strftime("%B %d, %Y"),
            "billing_url": f"{self.app_url}/billing"
        }
        
        html_content = self.render_template("upcoming_invoice.html", context)
        if not html_content:
            html_content = f"""
            <h1>Upcoming Payment</h1>
            <p>Hi {user_name},</p>
            <p>Your next payment of ${amount:.2f} will be processed on {due_date.strftime("%B %d, %Y")}.</p>
            <p>Make sure your payment method is up to date in your <a href="{self.app_url}/billing">billing settings</a>.</p>
            <p>Thank you for being a valued FilmFusion customer!</p>
            """
        
        return await self.send_email(
            to_email=user_email,
            subject=f"Upcoming Payment - ${amount:.2f}",
            html_content=html_content
        )

# Global email service instance
email_service = EmailService()
