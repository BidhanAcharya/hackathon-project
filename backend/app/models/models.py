
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Enum, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from . import Base
import uuid
import enum
class DomainExpertise(enum.Enum):
    RELATIONSHIP="relationship"
    FINANCIAL='financial'
    STUDY='study'
    WORK='work'
    GENERAL='general'

class SessionStatus(enum.Enum):
    PENDING="pending"
    ACTIVE="active"
    CLOSED="closed"


# Table to store individual chat session information only
class ChatSession(Base):
    __tablename__ = "chat_sessions"
    session_id = Column(String(36), primary_key=True, default = lambda: str(uuid.uuid4()))
    user_id = Column(Integer, ForeignKey("users.user_id"))
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)  
    title = Column(String, nullable = True)

    user = relationship("User", back_populates="chat_sessions")
    chat_history = relationship("ChatHistory", back_populates="session")

class ChatHistory(Base):
    __tablename__ = "chat_history"
    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String(36), ForeignKey("chat_sessions.session_id"))
    role = Column(String(50), nullable=False)  # for either 'user' or 'assistant'
    content = Column (String, nullable = False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow) 

    session = relationship("ChatSession", back_populates="chat_history")

class User(Base):
    __tablename__ = "users"
    user_id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    username = Column(String(200), index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String, nullable=False)
    initial_assesment = Column(JSON, nullable=True)  # Stores dict directly
    chat_sessions = relationship("ChatSession", back_populates="user")
    help_sessions = relationship("HelpSession", back_populates="user")
    assessments = relationship("UserAssessment", back_populates="user")
    
    
 ## Assessment table store the question and answer collected for user   
class UserAssessment(Base):
    __tablename__="user_assessments"
    id=Column(Integer,primary_key=True, autoincrement=True)
    user_id=Column(Integer,ForeignKey("users.user_id"),nullable=False)
    question=Column(String,nullable=False)
    answer=Column(String,nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.now())
    user = relationship("User", back_populates="assessments")
    
class Helper(Base):
    __tablename__="helpers"
    helper_id=Column(Integer, primary_key=True, autoincrement=True, index=True)
    username=Column(String(200),index=True)
    email=Column(String,unique=True,index=True)
    password=Column(String,nullable=False)
    domain_expertise=Column(Enum(DomainExpertise), nullable=False)
    help_sessions=relationship("HelpSession", back_populates="helper")
    assessments = relationship("HelperAssessment", back_populates="helper")
    
    
 ## Assessment table store the question and answer collected for helper  
class HelperAssessment(Base):
    __tablename__ = "helper_assessments"
    id=Column(Integer,primary_key=True, autoincrement=True)
    helper_id = Column(Integer, ForeignKey("helpers.helper_id"), nullable=False)
    question = Column(String, nullable=False)
    answer = Column(String, nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.now())
    helper = relationship("Helper", back_populates="assessments")


    
    

class HelpSession(Base):
    __tablename__="help_sessions"
    session_id=Column(String(36), primary_key=True, default = lambda: str(uuid.uuid4()))
    user_id=Column(Integer, ForeignKey("users.user_id"))
    helper_id=Column(Integer, ForeignKey("helpers.helper_id"), nullable=True)
    status = Column(Enum(SessionStatus), default=SessionStatus.PENDING) ## This one to track whether the particuaar one to one session is closed or not , if the status is  closed then other user can be assigned and if the status is active then another user is in queue, while querying check the status too with the domain expertise
    preferences = Column(JSON, nullable=True)  # Stores helper_type, categories, message from user
    created_at=Column(DateTime, nullable=False, default=datetime.now())
    
    user=relationship("User",back_populates="help_sessions")
    helper=relationship("Helper",back_populates="help_sessions")
    messages=relationship("HelpChatHistory", back_populates="help_session")
    
class HelpChatHistory(Base):
    __tablename__="help_chat_history"
    id=Column(Integer,primary_key=True, autoincrement=True)
    session_id=Column(String(36), ForeignKey("help_sessions.session_id"))
    role=Column(String(50), nullable=False) 
    content=Column(String, nullable=False)
    created_at=Column(DateTime, nullable=False, default=datetime.now())
    help_session = relationship("HelpSession", back_populates="messages")
    
    
    
    
## Workflow 

## User clicks "Get Help" : HelpSession created:
# user_id = 1
# helper_id = NULL        ← no helper yet
# status = PENDING        ← waiting for helper

# Helper accepts the request
# HelpSession updated:
# user_id = 1
# helper_id = 5           ← helper assigned
# status = ACTIVE         ← chat is now ongoing


# During chat
# Every message → HelpChatHistory row added:
# session_id = abc123
# role = 'user' or 'helper'
# content = "message text"

# Chat ends
# HelpSession updated:
# status = CLOSED         ← helper is free again