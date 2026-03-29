from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from app.models.models import DomainExpertise

class UserLoginSchema(BaseModel):
    email : EmailStr
    password : str

class UserBaseSchema(BaseModel):
    username: str
    email: EmailStr

class UserRegisterSchema(UserBaseSchema):
    # password: str = Field(..., min_length=8, description="password must be at least 8 characters long")
    password: str 
    # confirm_password: str

class Message(BaseModel):
    message : str

class Token(BaseModel):
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    token_type: str = "bearer"

class TokenPayload(BaseModel):
    user_id: int
    exp: Optional[int] = None

class RefreshTokenRequest(BaseModel):
    refresh_token: str


class QueryRequestSchema(BaseModel):
    query: str

# class ChatHistorySchema(BaseModel):
#     session_id: int
#     limit: int = None

class HelpRequestSchema(BaseModel):
    user_id: int
    domain: DomainExpertise
    preferences: Optional[dict] = None  # { helper_type, categories, message }
    
    
class AnalyzeRequest(BaseModel):
    conversation: str


class AssessmentItem(BaseModel):
    question: str
    answer: str


class AssessmentRequest(BaseModel):
    assessments: list[AssessmentItem]


class HelperRegisterSchema(BaseModel):
    username: str
    email: EmailStr
    password: str
    domain_expertise: DomainExpertise = DomainExpertise.GENERAL