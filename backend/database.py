from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Boolean, Float, JSON, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from sqlalchemy.sql import func
import os
from typing import Optional
from datetime import datetime

# Database URL from Railway PostgreSQL
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/filmfusion")

# Create SQLAlchemy engine
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Database Models
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    is_active = Column(Boolean, default=True)
    is_premium = Column(Boolean, default=False)
    is_admin = Column(Boolean, default=False)
    role = Column(String, default="user")  # user, admin, super_admin
    permissions = Column(JSON, default=lambda: [])  # List of specific permissions
    
    stripe_customer_id = Column(String, unique=True)
    stripe_subscription_id = Column(String)
    subscription_status = Column(String, default="inactive")  # active, inactive, canceled, past_due
    subscription_plan = Column(String, default="free")  # free, pro, enterprise
    subscription_period_start = Column(DateTime(timezone=True))
    subscription_period_end = Column(DateTime(timezone=True))
    
    # Usage tracking
    monthly_ai_calls = Column(Integer, default=0)
    monthly_render_minutes = Column(Integer, default=0)
    monthly_storage_gb = Column(Float, default=0.0)
    usage_reset_date = Column(DateTime(timezone=True))
    
    last_login = Column(DateTime(timezone=True))
    login_count = Column(Integer, default=0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    projects = relationship("Project", back_populates="owner")
    render_jobs = relationship("RenderJob", back_populates="user")
    payments = relationship("Payment", back_populates="user")
    support_tickets = relationship("SupportTicket", back_populates="user")
    assigned_tickets = relationship("SupportTicket", back_populates="assigned_to")
    content_reports = relationship("ContentReport", back_populates="reporter")
    moderation_actions = relationship("ModerationAction", back_populates="moderator")
    content_flags = relationship("ContentFlag", back_populates="flagged_by_user")
    blog_posts = relationship("BlogPost", back_populates="author")

class Project(Base):
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    status = Column(String, default="draft")  # draft, in_progress, completed
    project_type = Column(String)  # explainer, tutorial, promotional, etc.
    duration = Column(Float)  # in seconds
    platform = Column(String)  # YouTube, Instagram, etc.
    
    # Content data
    script_content = Column(Text)
    voiceover_settings = Column(JSON)
    timeline_data = Column(JSON)
    export_settings = Column(JSON)
    
    # Metadata
    thumbnail_url = Column(String)
    video_url = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Foreign keys
    owner_id = Column(Integer, ForeignKey("users.id"))
    
    # Relationships
    owner = relationship("User", back_populates="projects")
    render_jobs = relationship("RenderJob", back_populates="project")
    analytics = relationship("ProjectAnalytics", back_populates="project")
    content_flags = relationship("ContentFlag", back_populates="related_report")

class RenderJob(Base):
    __tablename__ = "render_jobs"
    
    id = Column(String, primary_key=True)  # UUID
    status = Column(String, default="queued")  # queued, processing, completed, failed
    progress = Column(Integer, default=0)
    current_step = Column(String)
    error_message = Column(Text)
    
    # Render settings
    export_format = Column(String)
    resolution = Column(String)
    quality = Column(String)
    
    # Output info
    output_url = Column(String)
    file_size = Column(Integer)  # in bytes
    duration = Column(Float)  # in seconds
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    started_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    
    # Foreign keys
    user_id = Column(Integer, ForeignKey("users.id"))
    project_id = Column(Integer, ForeignKey("projects.id"))
    
    # Relationships
    user = relationship("User", back_populates="render_jobs")
    project = relationship("Project", back_populates="render_jobs")

class ProjectAnalytics(Base):
    __tablename__ = "project_analytics"
    
    id = Column(Integer, primary_key=True, index=True)
    views = Column(Integer, default=0)
    likes = Column(Integer, default=0)
    shares = Column(Integer, default=0)
    comments = Column(Integer, default=0)
    engagement_rate = Column(Float, default=0.0)
    watch_time = Column(Float, default=0.0)  # in seconds
    
    # Performance metrics
    click_through_rate = Column(Float, default=0.0)
    conversion_rate = Column(Float, default=0.0)
    retention_rate = Column(Float, default=0.0)
    
    # Timestamps
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Foreign keys
    project_id = Column(Integer, ForeignKey("projects.id"))
    
    # Relationships
    project = relationship("Project", back_populates="analytics")

class AISession(Base):
    __tablename__ = "ai_sessions"
    
    id = Column(String, primary_key=True)  # UUID
    session_type = Column(String)  # script_generation, voiceover, reasoning, etc.
    model_used = Column(String)
    tokens_used = Column(Integer, default=0)
    reasoning_tokens = Column(Integer, default=0)
    cost = Column(Float, default=0.0)
    
    # Request/Response data
    request_data = Column(JSON)
    response_data = Column(JSON)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Foreign keys
    user_id = Column(Integer, ForeignKey("users.id"))
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)

class Payment(Base):
    __tablename__ = "payments"
    
    id = Column(Integer, primary_key=True, index=True)
    stripe_payment_intent_id = Column(String, unique=True)
    stripe_invoice_id = Column(String)
    amount = Column(Integer)  # in cents
    currency = Column(String, default="usd")
    status = Column(String)  # succeeded, failed, pending, canceled
    payment_type = Column(String)  # subscription, usage, one_time
    description = Column(Text)
    
    # Usage details for usage-based billing
    ai_calls_charged = Column(Integer, default=0)
    render_minutes_charged = Column(Integer, default=0)
    storage_gb_charged = Column(Float, default=0.0)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    paid_at = Column(DateTime(timezone=True))
    
    # Foreign keys
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Relationships
    user = relationship("User", back_populates="payments")

class SupportTicket(Base):
    __tablename__ = "support_tickets"
    
    id = Column(Integer, primary_key=True, index=True)
    ticket_number = Column(String, unique=True, index=True)  # e.g., "FF-2024-001"
    subject = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String, default="general")  # general, technical, billing, feature_request
    priority = Column(String, default="medium")  # low, medium, high, urgent
    status = Column(String, default="open")  # open, in_progress, waiting_response, resolved, closed
    
    # User information
    user_email = Column(String, nullable=False)
    user_name = Column(String)
    
    # Assignment and resolution
    assigned_to_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    resolved_at = Column(DateTime(timezone=True))
    resolution_notes = Column(Text)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_response_at = Column(DateTime(timezone=True))
    
    # Foreign keys
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Nullable for non-registered users
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    assigned_to = relationship("User", foreign_keys=[assigned_to_id])
    responses = relationship("TicketResponse", back_populates="ticket", cascade="all, delete-orphan")

class TicketResponse(Base):
    __tablename__ = "ticket_responses"
    
    id = Column(Integer, primary_key=True, index=True)
    message = Column(Text, nullable=False)
    is_internal = Column(Boolean, default=False)  # Internal notes vs customer-facing responses
    is_from_admin = Column(Boolean, default=False)
    
    # Attachments
    attachment_urls = Column(JSON, default=lambda: [])  # List of file URLs
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Foreign keys
    ticket_id = Column(Integer, ForeignKey("support_tickets.id"))
    author_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    ticket = relationship("SupportTicket", back_populates="responses")
    author = relationship("User")

class ContentReport(Base):
    __tablename__ = "content_reports"
    
    id = Column(Integer, primary_key=True, index=True)
    report_type = Column(String, nullable=False)  # project, user_profile, support_ticket
    content_id = Column(Integer, nullable=False)  # ID of the reported content
    content_type = Column(String, nullable=False)  # project, user, ticket_response
    
    # Report details
    reason = Column(String, nullable=False)  # spam, inappropriate, copyright, harassment, etc.
    description = Column(Text)  # Additional details from reporter
    severity = Column(String, default="medium")  # low, medium, high, critical
    
    # Reporter information
    reporter_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Nullable for anonymous reports
    reporter_email = Column(String)  # For anonymous reports
    reporter_ip = Column(String)  # For tracking abuse
    
    # Moderation status
    status = Column(String, default="pending")  # pending, under_review, resolved, dismissed
    reviewed_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    reviewed_at = Column(DateTime(timezone=True))
    resolution = Column(String)  # no_action, content_removed, user_warned, user_suspended, etc.
    resolution_notes = Column(Text)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    reporter = relationship("User", foreign_keys=[reporter_id])
    reviewed_by = relationship("User", foreign_keys=[reviewed_by_id])

class ModerationAction(Base):
    __tablename__ = "moderation_actions"
    
    id = Column(Integer, primary_key=True, index=True)
    action_type = Column(String, nullable=False)  # warning, suspension, content_removal, account_restriction
    target_type = Column(String, nullable=False)  # user, project, content
    target_id = Column(Integer, nullable=False)
    
    # Action details
    reason = Column(String, nullable=False)
    description = Column(Text)
    severity = Column(String, default="medium")  # low, medium, high, critical
    duration = Column(Integer)  # Duration in hours for temporary actions
    
    # Moderation info
    moderator_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    related_report_id = Column(Integer, ForeignKey("content_reports.id"), nullable=True)
    
    # Status
    status = Column(String, default="active")  # active, expired, revoked
    expires_at = Column(DateTime(timezone=True))
    revoked_at = Column(DateTime(timezone=True))
    revoked_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    revoke_reason = Column(Text)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    moderator = relationship("User", foreign_keys=[moderator_id])
    related_report = relationship("ContentReport", foreign_keys=[related_report_id])
    revoked_by = relationship("User", foreign_keys=[revoked_by_id])

class ContentFlag(Base):
    __tablename__ = "content_flags"
    
    id = Column(Integer, primary_key=True, index=True)
    content_type = Column(String, nullable=False)  # project, user_profile, comment
    content_id = Column(Integer, nullable=False)
    
    # Flag details
    flag_type = Column(String, nullable=False)  # automated, manual, ai_detected
    flag_reason = Column(String, nullable=False)  # inappropriate_content, spam, copyright, etc.
    confidence_score = Column(Float, default=0.0)  # For AI-detected flags (0.0-1.0)
    
    # Flag metadata
    flagged_by_system = Column(String)  # openai_moderation, custom_filter, user_report
    flagged_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Status
    status = Column(String, default="active")  # active, resolved, false_positive
    reviewed_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    reviewed_at = Column(DateTime(timezone=True))
    review_notes = Column(Text)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    flagged_by_user = relationship("User", foreign_keys=[flagged_by_user_id])
    reviewed_by = relationship("User", foreign_keys=[reviewed_by_id])

class BlogPost(Base):
    __tablename__ = "blog_posts"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    slug = Column(String, unique=True, index=True, nullable=False)
    excerpt = Column(Text)
    content = Column(Text, nullable=False)
    featured_image_url = Column(String)
    
    # SEO fields
    meta_title = Column(String)
    meta_description = Column(Text)
    meta_keywords = Column(String)
    
    # Publishing
    status = Column(String, default="draft")  # draft, published, archived
    published_at = Column(DateTime(timezone=True))
    featured = Column(Boolean, default=False)
    
    # Engagement
    view_count = Column(Integer, default=0)
    like_count = Column(Integer, default=0)
    share_count = Column(Integer, default=0)
    
    # Internationalization
    language = Column(String, default="en")
    translated_from_id = Column(Integer, ForeignKey("blog_posts.id"), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Foreign keys
    author_id = Column(Integer, ForeignKey("users.id"))
    category_id = Column(Integer, ForeignKey("blog_categories.id"))
    
    # Relationships
    author = relationship("User")
    category = relationship("BlogCategory", back_populates="posts")
    tags = relationship("BlogTag", secondary="blog_post_tags", back_populates="posts")
    comments = relationship("BlogComment", back_populates="post", cascade="all, delete-orphan")
    translations = relationship("BlogPost", remote_side=[id])

class BlogCategory(Base):
    __tablename__ = "blog_categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, index=True, nullable=False)
    description = Column(Text)
    color = Column(String, default="#3B82F6")  # Hex color for UI
    
    # SEO
    meta_title = Column(String)
    meta_description = Column(Text)
    
    # Internationalization
    language = Column(String, default="en")
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    posts = relationship("BlogPost", back_populates="category")

class BlogTag(Base):
    __tablename__ = "blog_tags"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, index=True, nullable=False)
    color = Column(String, default="#10B981")  # Hex color for UI
    
    # Internationalization
    language = Column(String, default="en")
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    posts = relationship("BlogPost", secondary="blog_post_tags", back_populates="tags")

# Association table for many-to-many relationship between posts and tags
from sqlalchemy import Table
blog_post_tags = Table(
    'blog_post_tags',
    Base.metadata,
    Column('post_id', Integer, ForeignKey('blog_posts.id'), primary_key=True),
    Column('tag_id', Integer, ForeignKey('blog_tags.id'), primary_key=True)
)

class BlogComment(Base):
    __tablename__ = "blog_comments"
    
    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    author_name = Column(String, nullable=False)
    author_email = Column(String, nullable=False)
    author_website = Column(String)
    
    # Moderation
    status = Column(String, default="pending")  # pending, approved, spam, deleted
    moderated_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    moderated_at = Column(DateTime(timezone=True))
    
    # Threading
    parent_id = Column(Integer, ForeignKey("blog_comments.id"), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Foreign keys
    post_id = Column(Integer, ForeignKey("blog_posts.id"))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # For registered users
    
    # Relationships
    post = relationship("BlogPost", back_populates="comments")
    user = relationship("User")
    moderator = relationship("User", foreign_keys=[moderated_by_id])
    replies = relationship("BlogComment", remote_side=[id])

# Create all tables
def create_tables():
    Base.metadata.create_all(bind=engine)

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Database utility functions
def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()

def get_user_by_username(db: Session, username: str) -> Optional[User]:
    return db.query(User).filter(User.username == username).first()

def create_user(db: Session, email: str, username: str, hashed_password: str, full_name: str = None) -> User:
    db_user = User(
        email=email,
        username=username,
        hashed_password=hashed_password,
        full_name=full_name
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user_projects(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(Project).filter(Project.owner_id == user_id).offset(skip).limit(limit).all()

def create_project(db: Session, user_id: int, name: str, description: str = None, project_type: str = None) -> Project:
    db_project = Project(
        name=name,
        description=description,
        project_type=project_type,
        owner_id=user_id
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

def update_project(db: Session, project_id: int, **kwargs) -> Optional[Project]:
    project = db.query(Project).filter(Project.id == project_id).first()
    if project:
        for key, value in kwargs.items():
            if hasattr(project, key):
                setattr(project, key, value)
        db.commit()
        db.refresh(project)
    return project

def create_render_job(db: Session, job_id: str, user_id: int, project_id: int, export_settings: dict) -> RenderJob:
    db_job = RenderJob(
        id=job_id,
        user_id=user_id,
        project_id=project_id,
        export_format=export_settings.get('format', 'mp4'),
        resolution=export_settings.get('resolution', '1080p'),
        quality=export_settings.get('quality', 'high')
    )
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job

def update_render_job(db: Session, job_id: str, **kwargs) -> Optional[RenderJob]:
    job = db.query(RenderJob).filter(RenderJob.id == job_id).first()
    if job:
        for key, value in kwargs.items():
            if hasattr(job, key):
                setattr(job, key, value)
        db.commit()
        db.refresh(job)
    return job

def log_ai_session(db: Session, session_id: str, user_id: int, session_type: str, model_used: str, 
                   tokens_used: int, request_data: dict, response_data: dict, 
                   project_id: int = None, reasoning_tokens: int = 0, cost: float = 0.0) -> AISession:
    db_session = AISession(
        id=session_id,
        user_id=user_id,
        project_id=project_id,
        session_type=session_type,
        model_used=model_used,
        tokens_used=tokens_used,
        reasoning_tokens=reasoning_tokens,
        cost=cost,
        request_data=request_data,
        response_data=response_data
    )
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session

def get_user_by_stripe_customer_id(db: Session, stripe_customer_id: str) -> Optional[User]:
    return db.query(User).filter(User.stripe_customer_id == stripe_customer_id).first()

def update_user_subscription(db: Session, user_id: int, subscription_data: dict) -> Optional[User]:
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        user.stripe_subscription_id = subscription_data.get('subscription_id')
        user.subscription_status = subscription_data.get('status')
        user.subscription_plan = subscription_data.get('plan')
        user.subscription_period_start = subscription_data.get('period_start')
        user.subscription_period_end = subscription_data.get('period_end')
        user.is_premium = subscription_data.get('status') == 'active'
        db.commit()
        db.refresh(user)
    return user

def create_payment_record(db: Session, user_id: int, payment_data: dict) -> Payment:
    db_payment = Payment(
        user_id=user_id,
        stripe_payment_intent_id=payment_data.get('payment_intent_id'),
        stripe_invoice_id=payment_data.get('invoice_id'),
        amount=payment_data.get('amount'),
        currency=payment_data.get('currency', 'usd'),
        status=payment_data.get('status'),
        payment_type=payment_data.get('type'),
        description=payment_data.get('description'),
        ai_calls_charged=payment_data.get('ai_calls_charged', 0),
        render_minutes_charged=payment_data.get('render_minutes_charged', 0),
        storage_gb_charged=payment_data.get('storage_gb_charged', 0.0)
    )
    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)
    return db_payment

def update_user_usage(db: Session, user_id: int, ai_calls: int = 0, render_minutes: int = 0, storage_gb: float = 0.0):
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        user.monthly_ai_calls += ai_calls
        user.monthly_render_minutes += render_minutes
        user.monthly_storage_gb += storage_gb
        db.commit()
        db.refresh(user)
    return user

def reset_monthly_usage(db: Session, user_id: int):
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        user.monthly_ai_calls = 0
        user.monthly_render_minutes = 0
        user.monthly_storage_gb = 0.0
        user.usage_reset_date = func.now()
        db.commit()
        db.refresh(user)
    return user

def get_all_users(db: Session, skip: int = 0, limit: int = 100, search: str = None):
    query = db.query(User)
    if search:
        query = query.filter(
            (User.email.contains(search)) | 
            (User.username.contains(search)) | 
            (User.full_name.contains(search))
        )
    return query.offset(skip).limit(limit).all()

def get_user_count(db: Session) -> int:
    return db.query(User).count()

def get_system_stats(db: Session):
    total_users = db.query(User).count()
    premium_users = db.query(User).filter(User.is_premium == True).count()
    total_projects = db.query(Project).count()
    total_renders = db.query(RenderJob).count()
    successful_renders = db.query(RenderJob).filter(RenderJob.status == "completed").count()
    
    return {
        "total_users": total_users,
        "premium_users": premium_users,
        "free_users": total_users - premium_users,
        "total_projects": total_projects,
        "total_renders": total_renders,
        "successful_renders": successful_renders,
        "render_success_rate": (successful_renders / total_renders * 100) if total_renders > 0 else 0
    }

def update_user_role(db: Session, user_id: int, role: str, permissions: list = None) -> Optional[User]:
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        user.role = role
        user.is_admin = role in ["admin", "super_admin"]
        if permissions:
            user.permissions = permissions
        db.commit()
        db.refresh(user)
    return user

def deactivate_user(db: Session, user_id: int) -> Optional[User]:
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        user.is_active = False
        db.commit()
        db.refresh(user)
    return user

def create_support_ticket(db: Session, ticket_data: dict) -> SupportTicket:
    """Create a new support ticket"""
    # Generate ticket number
    year = datetime.now().year
    count = db.query(SupportTicket).filter(
        SupportTicket.ticket_number.like(f"FF-{year}-%")
    ).count() + 1
    ticket_number = f"FF-{year}-{count:03d}"
    
    db_ticket = SupportTicket(
        ticket_number=ticket_number,
        subject=ticket_data['subject'],
        description=ticket_data['description'],
        category=ticket_data.get('category', 'general'),
        priority=ticket_data.get('priority', 'medium'),
        user_email=ticket_data['user_email'],
        user_name=ticket_data.get('user_name'),
        user_id=ticket_data.get('user_id')
    )
    db.add(db_ticket)
    db.commit()
    db.refresh(db_ticket)
    return db_ticket

def get_support_tickets(db: Session, skip: int = 0, limit: int = 50, status: str = None, category: str = None):
    """Get support tickets with filtering"""
    query = db.query(SupportTicket)
    
    if status:
        query = query.filter(SupportTicket.status == status)
    if category:
        query = query.filter(SupportTicket.category == category)
    
    return query.order_by(SupportTicket.created_at.desc()).offset(skip).limit(limit).all()

def get_user_tickets(db: Session, user_id: int, skip: int = 0, limit: int = 20):
    """Get tickets for a specific user"""
    return db.query(SupportTicket).filter(
        SupportTicket.user_id == user_id
    ).order_by(SupportTicket.created_at.desc()).offset(skip).limit(limit).all()

def update_ticket_status(db: Session, ticket_id: int, status: str, resolution_notes: str = None) -> Optional[SupportTicket]:
    """Update ticket status and resolution"""
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    if ticket:
        ticket.status = status
        ticket.updated_at = func.now()
        
        if status in ['resolved', 'closed']:
            ticket.resolved_at = func.now()
            if resolution_notes:
                ticket.resolution_notes = resolution_notes
        
        db.commit()
        db.refresh(ticket)
    return ticket

def assign_ticket(db: Session, ticket_id: int, admin_id: int) -> Optional[SupportTicket]:
    """Assign ticket to an admin"""
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    if ticket:
        ticket.assigned_to_id = admin_id
        ticket.status = 'in_progress'
        ticket.updated_at = func.now()
        db.commit()
        db.refresh(ticket)
    return ticket

def add_ticket_response(db: Session, response_data: dict) -> TicketResponse:
    """Add a response to a ticket"""
    db_response = TicketResponse(
        ticket_id=response_data['ticket_id'],
        message=response_data['message'],
        is_internal=response_data.get('is_internal', False),
        is_from_admin=response_data.get('is_from_admin', False),
        author_id=response_data.get('author_id'),
        attachment_urls=response_data.get('attachment_urls', [])
    )
    db.add(db_response)
    
    # Update ticket's last response time
    ticket = db.query(SupportTicket).filter(SupportTicket.id == response_data['ticket_id']).first()
    if ticket:
        ticket.last_response_at = func.now()
        ticket.updated_at = func.now()
    
    db.commit()
    db.refresh(db_response)
    return db_response

def get_ticket_responses(db: Session, ticket_id: int, include_internal: bool = False):
    """Get responses for a ticket"""
    query = db.query(TicketResponse).filter(TicketResponse.ticket_id == ticket_id)
    
    if not include_internal:
        query = query.filter(TicketResponse.is_internal == False)
    
    return query.order_by(TicketResponse.created_at.asc()).all()

def get_ticket_stats(db: Session):
    """Get support ticket statistics"""
    total_tickets = db.query(SupportTicket).count()
    open_tickets = db.query(SupportTicket).filter(SupportTicket.status == 'open').count()
    in_progress_tickets = db.query(SupportTicket).filter(SupportTicket.status == 'in_progress').count()
    resolved_tickets = db.query(SupportTicket).filter(SupportTicket.status.in_(['resolved', 'closed'])).count()
    
    return {
        "total_tickets": total_tickets,
        "open_tickets": open_tickets,
        "in_progress_tickets": in_progress_tickets,
        "resolved_tickets": resolved_tickets,
        "resolution_rate": (resolved_tickets / total_tickets * 100) if total_tickets > 0 else 0
    }

def create_content_report(db: Session, report_data: dict) -> ContentReport:
    """Create a new content report"""
    db_report = ContentReport(
        report_type=report_data['report_type'],
        content_id=report_data['content_id'],
        content_type=report_data['content_type'],
        reason=report_data['reason'],
        description=report_data.get('description'),
        severity=report_data.get('severity', 'medium'),
        reporter_id=report_data.get('reporter_id'),
        reporter_email=report_data.get('reporter_email'),
        reporter_ip=report_data.get('reporter_ip')
    )
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    return db_report

def get_content_reports(db: Session, skip: int = 0, limit: int = 50, status: str = None, severity: str = None):
    """Get content reports with filtering"""
    query = db.query(ContentReport)
    
    if status:
        query = query.filter(ContentReport.status == status)
    if severity:
        query = query.filter(ContentReport.severity == severity)
    
    return query.order_by(ContentReport.created_at.desc()).offset(skip).limit(limit).all()

def update_report_status(db: Session, report_id: int, status: str, resolution: str = None, 
                        resolution_notes: str = None, reviewer_id: int = None) -> Optional[ContentReport]:
    """Update content report status and resolution"""
    report = db.query(ContentReport).filter(ContentReport.id == report_id).first()
    if report:
        report.status = status
        report.resolution = resolution
        report.resolution_notes = resolution_notes
        report.reviewed_by_id = reviewer_id
        report.reviewed_at = func.now()
        report.updated_at = func.now()
        db.commit()
        db.refresh(report)
    return report

def create_moderation_action(db: Session, action_data: dict) -> ModerationAction:
    """Create a new moderation action"""
    db_action = ModerationAction(
        action_type=action_data['action_type'],
        target_type=action_data['target_type'],
        target_id=action_data['target_id'],
        reason=action_data['reason'],
        description=action_data.get('description'),
        severity=action_data.get('severity', 'medium'),
        duration=action_data.get('duration'),
        moderator_id=action_data['moderator_id'],
        related_report_id=action_data.get('related_report_id')
    )
    
    # Set expiration if duration is provided
    if action_data.get('duration'):
        from datetime import timedelta
        db_action.expires_at = func.now() + timedelta(hours=action_data['duration'])
    
    db.add(db_action)
    db.commit()
    db.refresh(db_action)
    return db_action

def get_moderation_actions(db: Session, skip: int = 0, limit: int = 50, target_type: str = None, status: str = None):
    """Get moderation actions with filtering"""
    query = db.query(ModerationAction)
    
    if target_type:
        query = query.filter(ModerationAction.target_type == target_type)
    if status:
        query = query.filter(ModerationAction.status == status)
    
    return query.order_by(ModerationAction.created_at.desc()).offset(skip).limit(limit).all()

def create_content_flag(db: Session, flag_data: dict) -> ContentFlag:
    """Create a content flag"""
    db_flag = ContentFlag(
        content_type=flag_data['content_type'],
        content_id=flag_data['content_id'],
        flag_type=flag_data['flag_type'],
        flag_reason=flag_data['flag_reason'],
        confidence_score=flag_data.get('confidence_score', 0.0),
        flagged_by_system=flag_data.get('flagged_by_system'),
        flagged_by_user_id=flag_data.get('flagged_by_user_id')
    )
    db.add(db_flag)
    db.commit()
    db.refresh(db_flag)
    return db_flag

def get_content_flags(db: Session, skip: int = 0, limit: int = 50, status: str = None, flag_type: str = None):
    """Get content flags with filtering"""
    query = db.query(ContentFlag)
    
    if status:
        query = query.filter(ContentFlag.status == status)
    if flag_type:
        query = query.filter(ContentFlag.flag_type == flag_type)
    
    return query.order_by(ContentFlag.created_at.desc()).offset(skip).limit(limit).all()

def get_moderation_stats(db: Session):
    """Get moderation statistics"""
    total_reports = db.query(ContentReport).count()
    pending_reports = db.query(ContentReport).filter(ContentReport.status == 'pending').count()
    resolved_reports = db.query(ContentReport).filter(ContentReport.status == 'resolved').count()
    
    total_flags = db.query(ContentFlag).count()
    active_flags = db.query(ContentFlag).filter(ContentFlag.status == 'active').count()
    
    total_actions = db.query(ModerationAction).count()
    active_actions = db.query(ModerationAction).filter(ModerationAction.status == 'active').count()
    
    return {
        "total_reports": total_reports,
        "pending_reports": pending_reports,
        "resolved_reports": resolved_reports,
        "resolution_rate": (resolved_reports / total_reports * 100) if total_reports > 0 else 0,
        "total_flags": total_flags,
        "active_flags": active_flags,
        "total_actions": total_actions,
        "active_actions": active_actions
    }

def moderate_content_with_ai(content: str, content_type: str = "text") -> dict:
    """Use OpenAI moderation API to check content"""
    try:
        response = openai_client.moderations.create(input=content)
        result = response.results[0]
        
        return {
            "flagged": result.flagged,
            "categories": result.categories.model_dump(),
            "category_scores": result.category_scores.model_dump(),
            "confidence_score": max(result.category_scores.model_dump().values()) if result.flagged else 0.0
        }
    except Exception as e:
        logger.error(f"AI moderation failed: {str(e)}")
        return {"flagged": False, "error": str(e)}

def auto_moderate_project(db: Session, project: Project) -> Optional[ContentFlag]:
    """Automatically moderate a project using AI"""
    try:
        # Combine project content for moderation
        content_to_check = f"{project.name}\n{project.description or ''}\n{project.script_content or ''}"
        
        if not content_to_check.strip():
            return None
        
        moderation_result = moderate_content_with_ai(content_to_check)
        
        if moderation_result.get("flagged"):
            # Find the most likely violation category
            categories = moderation_result.get("categories", {})
            flagged_categories = [cat for cat, flagged in categories.items() if flagged]
            
            if flagged_categories:
                flag_data = {
                    'content_type': 'project',
                    'content_id': project.id,
                    'flag_type': 'automated',
                    'flag_reason': f"ai_detected_{flagged_categories[0]}",
                    'confidence_score': moderation_result.get("confidence_score", 0.0),
                    'flagged_by_system': 'openai_moderation'
                }
                
                return create_content_flag(db, flag_data)
        
        return None
    except Exception as e:
        logger.error(f"Auto moderation failed for project {project.id}: {str(e)}")
        return None

# Blog-related utility functions
def create_blog_post(db: Session, post_data: dict, author_id: int) -> BlogPost:
    """Create a new blog post"""
    db_post = BlogPost(
        title=post_data['title'],
        slug=post_data['slug'],
        excerpt=post_data.get('excerpt'),
        content=post_data['content'],
        featured_image_url=post_data.get('featured_image_url'),
        meta_title=post_data.get('meta_title'),
        meta_description=post_data.get('meta_description'),
        meta_keywords=post_data.get('meta_keywords'),
        status=post_data.get('status', 'draft'),
        featured=post_data.get('featured', False),
        language=post_data.get('language', 'en'),
        author_id=author_id,
        category_id=post_data.get('category_id')
    )
    
    if post_data.get('status') == 'published' and not post_data.get('published_at'):
        db_post.published_at = func.now()
    
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post

def get_blog_posts(db: Session, skip: int = 0, limit: int = 10, status: str = "published", 
                   language: str = "en", category_id: int = None, featured: bool = None):
    """Get blog posts with filtering"""
    query = db.query(BlogPost).filter(BlogPost.language == language)
    
    if status:
        query = query.filter(BlogPost.status == status)
    if category_id:
        query = query.filter(BlogPost.category_id == category_id)
    if featured is not None:
        query = query.filter(BlogPost.featured == featured)
    
    return query.order_by(BlogPost.published_at.desc()).offset(skip).limit(limit).all()

def get_blog_post_by_slug(db: Session, slug: str, language: str = "en") -> Optional[BlogPost]:
    """Get a blog post by slug"""
    return db.query(BlogPost).filter(
        BlogPost.slug == slug,
        BlogPost.language == language,
        BlogPost.status == "published"
    ).first()

def increment_post_views(db: Session, post_id: int):
    """Increment view count for a blog post"""
    post = db.query(BlogPost).filter(BlogPost.id == post_id).first()
    if post:
        post.view_count += 1
        db.commit()

def create_blog_category(db: Session, category_data: dict) -> BlogCategory:
    """Create a new blog category"""
    db_category = BlogCategory(
        name=category_data['name'],
        slug=category_data['slug'],
        description=category_data.get('description'),
        color=category_data.get('color', '#3B82F6'),
        meta_title=category_data.get('meta_title'),
        meta_description=category_data.get('meta_description'),
        language=category_data.get('language', 'en')
    )
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

def get_blog_categories(db: Session, language: str = "en"):
    """Get all blog categories"""
    return db.query(BlogCategory).filter(BlogCategory.language == language).all()

def create_blog_tag(db: Session, tag_data: dict) -> BlogTag:
    """Create a new blog tag"""
    db_tag = BlogTag(
        name=tag_data['name'],
        slug=tag_data['slug'],
        color=tag_data.get('color', '#10B981'),
        language=tag_data.get('language', 'en')
    )
    db.add(db_tag)
    db.commit()
    db.refresh(db_tag)
    return db_tag

def get_blog_tags(db: Session, language: str = "en"):
    """Get all blog tags"""
    return db.query(BlogTag).filter(BlogTag.language == language).all()

def get_popular_posts(db: Session, limit: int = 5, language: str = "en"):
    """Get popular blog posts by view count"""
    return db.query(BlogPost).filter(
        BlogPost.status == "published",
        BlogPost.language == language
    ).order_by(BlogPost.view_count.desc()).limit(limit).all()

def get_recent_posts(db: Session, limit: int = 5, language: str = "en"):
    """Get recent blog posts"""
    return db.query(BlogPost).filter(
        BlogPost.status == "published",
        BlogPost.language == language
    ).order_by(BlogPost.published_at.desc()).limit(limit).all()

def search_blog_posts(db: Session, query: str, language: str = "en", skip: int = 0, limit: int = 10):
    """Search blog posts by title and content"""
    search_filter = (
        BlogPost.title.contains(query) |
        BlogPost.content.contains(query) |
        BlogPost.excerpt.contains(query)
    )
    
    return db.query(BlogPost).filter(
        search_filter,
        BlogPost.status == "published",
        BlogPost.language == language
    ).order_by(BlogPost.published_at.desc()).offset(skip).limit(limit).all()

def get_blog_stats(db: Session):
    """Get blog statistics"""
    total_posts = db.query(BlogPost).count()
    published_posts = db.query(BlogPost).filter(BlogPost.status == "published").count()
    draft_posts = db.query(BlogPost).filter(BlogPost.status == "draft").count()
    total_categories = db.query(BlogCategory).count()
    total_tags = db.query(BlogTag).count()
    total_comments = db.query(BlogComment).count()
    approved_comments = db.query(BlogComment).filter(BlogComment.status == "approved").count()
    
    return {
        "total_posts": total_posts,
        "published_posts": published_posts,
        "draft_posts": draft_posts,
        "total_categories": total_categories,
        "total_tags": total_tags,
        "total_comments": total_comments,
        "approved_comments": approved_comments,
        "publish_rate": (published_posts / total_posts * 100) if total_posts > 0 else 0
    }
