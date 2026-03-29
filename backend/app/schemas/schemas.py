from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from app.models.models import DomainExpertise

class UserLoginSchema(BaseModel):
    email : EmailStr
    password : str

class UserBaseSchema(BaseModel):
    username: str
    email: EmailStr

class UserRegisterSchema(UserBaseSchema):
    password: str
    alias: Optional[str] = None   # anonymous display name; auto-generated if omitted

class HelperRegisterSchema(BaseModel):
    username: str
    email: EmailStr
    password: str
    domain_expertise: Optional[DomainExpertise] = DomainExpertise.GENERAL
    role: str = "peer"            # "peer" or "therapist"
    proof_id: Optional[str] = None  # required when role="therapist"
    alias: Optional[str] = None     # anonymous display name; auto-generated for peer if omitted

class Message(BaseModel):
    message : str

class Token(BaseModel):
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    token_type: str = "bearer"
    role: Optional[str] = None
    user_id: Optional[int] = None

class TokenPayload(BaseModel):
    user_id: int
    exp: Optional[int] = None

class RefreshTokenRequest(BaseModel):
    refresh_token: str


class QueryRequestSchema(BaseModel):
    query: str

class HelpRequestSchema(BaseModel):
    message: str
    helper_type: str = "peer"  # "peer" or "therapist"
    categories: list[str] = []

class HelpSessionResponse(BaseModel):
    session_id: str
    user_id: int
    helper_id: Optional[int]
    status: str
    message: Optional[str]
    helper_type: Optional[str]
    created_at: str

    class Config:
        from_attributes = True

class AnalyzeRequest(BaseModel):
    conversation: str

class SessionFeedbackSchema(BaseModel):
    rating: int           # 1–5
    feedback_type: str    # impressed | neutral | not_impressed
    note: str = ""
