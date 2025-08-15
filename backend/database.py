from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Boolean, Float, JSON, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from sqlalchemy.sql import func
import os
from typing import Optional

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
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    projects = relationship("Project", back_populates="owner")
    render_jobs = relationship("RenderJob", back_populates="user")
    payments = relationship("Payment", back_populates="user")

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
