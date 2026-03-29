import uuid
import random
from typing import Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import get_password_hash, verify_password
from app.models import User, ChatHistory
from app.models.models import Helper

from app.schemas import UserRegisterSchema
from app.schemas.schemas import HelperRegisterSchema


def _generate_alias(prefix: str) -> str:
    return f"{prefix}_{random.randint(1000, 9999)}"


## the * in the first makes sure that the function is only called with named arguments
def create_user(*,db: Session, user_create: UserRegisterSchema) -> User:
    hashed_password = get_password_hash(user_create.password)
    alias = user_create.alias.strip() if user_create.alias and user_create.alias.strip() else _generate_alias("Anon")

    db_user = User(
        username=user_create.username,
        email=user_create.email,
        password=hashed_password,
        alias=alias,
    )
    try:
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error registering user"
        )
    return db_user

def get_user_by_email(*,db: Session, email: str) -> Optional[User]:
    session_user = db.query(User).filter(User.email == email).first()
    return session_user

def authenticate(*, db: Session, email:str, password:str) -> Optional[User]:
    user = get_user_by_email(db=db,email=email)
    if not user:
        return None
    if not verify_password(password, user.password):
        return None
    return user


# ── Helper CRUD ──────────────────────────────────────────────────────────────

def create_helper(*, db: Session, helper_create: HelperRegisterSchema) -> Helper:
    hashed_password = get_password_hash(helper_create.password)

    role = helper_create.role.lower() if helper_create.role else "peer"

    # Auto-generate alias: peer gets "Peer_XXXX", therapist gets "Dr_XXXX"
    if helper_create.alias and helper_create.alias.strip():
        alias = helper_create.alias.strip()
    else:
        prefix = "Dr" if role == "therapist" else "Peer"
        alias = _generate_alias(prefix)

    db_helper = Helper(
        username=helper_create.username,
        email=helper_create.email,
        password=hashed_password,
        domain_expertise=helper_create.domain_expertise,
        role=role,
        proof_id=helper_create.proof_id,
        alias=alias,
    )
    try:
        db.add(db_helper)
        db.commit()
        db.refresh(db_helper)
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error registering helper"
        )
    return db_helper

def get_helper_by_email(*, db: Session, email: str) -> Optional[Helper]:
    return db.query(Helper).filter(Helper.email == email).first()

def get_helper_by_id(*, db: Session, helper_id: int) -> Optional[Helper]:
    return db.query(Helper).filter(Helper.helper_id == helper_id).first()

def authenticate_helper(*, db: Session, email: str, password: str) -> Optional[Helper]:
    helper = get_helper_by_email(db=db, email=email)
    if not helper:
        return None
    if not verify_password(password, helper.password):
        return None
    return helper
