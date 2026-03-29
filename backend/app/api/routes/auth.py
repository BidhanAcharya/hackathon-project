from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.models import User
from app.models.models import Helper
from app.api.deps import get_db, get_current_user, get_current_helper
from app.schemas import UserRegisterSchema, UserLoginSchema, Token, RefreshTokenRequest
from app.schemas.schemas import HelperRegisterSchema
from app.api.routes import crud
from app.core.security import create_access_token, create_refresh_token, token_expired, decode_token

router = APIRouter(tags=["auth"], prefix="/api/v1/auth")


# ── Seeker Auth ───────────────────────────────────────────────────────────────

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_user(user: UserRegisterSchema, db: Session = Depends(get_db)):
    existing_user = crud.get_user_by_email(db=db, email=user.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The user with this email already exists in the system"
        )
    user_create = UserRegisterSchema.model_validate(user)
    db_user = crud.create_user(db=db, user_create=user_create)
    return {
        "message": "User Registered Successfully",
        "user": {
            "username": db_user.username,
            "email": db_user.email,
            "user_id": db_user.user_id,
            "alias": db_user.alias,
        },
    }


@router.post("/login/access-token", status_code=status.HTTP_200_OK)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)) -> Token:
    user = crud.authenticate(db=db, email=form_data.username, password=form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.email, "role": "seeker"})
    refresh_token = create_refresh_token(data={"sub": user.email, "role": "seeker"})
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        role="seeker",
        user_id=user.user_id,
    )


@router.post("/refresh-token", status_code=status.HTTP_200_OK)
async def refresh_access_token(refresh_token_request: RefreshTokenRequest, db: Session = Depends(get_db)) -> Token:
    token = refresh_token_request.refresh_token
    if token_expired(token):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token is expired.")
    payload = decode_token(token)
    role = payload.get("role", "seeker")
    access_token = create_access_token(data={"sub": payload["sub"], "role": role})
    refresh_token = create_refresh_token(data={"sub": payload["sub"], "role": role})
    return Token(access_token=access_token, refresh_token=refresh_token, token_type="bearer", role=role)


@router.get("/users/me", status_code=status.HTTP_200_OK)
def read_users_me(current_user: User = Depends(get_current_user)):
    return {
        "username": current_user.username,
        "email": current_user.email,
        "user_id": current_user.user_id,
        "alias": current_user.alias,
    }


# ── Helper Auth ───────────────────────────────────────────────────────────────

@router.post("/helper/register", status_code=status.HTTP_201_CREATED)
def register_helper(helper: HelperRegisterSchema, db: Session = Depends(get_db)):
    existing = crud.get_helper_by_email(db=db, email=helper.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A helper with this email already exists"
        )

    role = helper.role.lower() if helper.role else "peer"
    if role not in ("peer", "therapist"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role must be 'peer' or 'therapist'."
        )
    if role == "therapist" and not helper.proof_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Therapists must provide a Proof ID (license or credential number)."
        )

    db_helper = crud.create_helper(db=db, helper_create=helper)
    return {
        "message": "Helper Registered Successfully",
        "helper": {
            "username": db_helper.username,
            "email": db_helper.email,
            "helper_id": db_helper.helper_id,
            "domain_expertise": db_helper.domain_expertise.value if db_helper.domain_expertise else None,
            "role": db_helper.role,
            "alias": db_helper.alias,
        },
    }


@router.post("/helper/login/access-token", status_code=status.HTTP_200_OK)
def helper_login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)) -> Token:
    helper = crud.authenticate_helper(db=db, email=form_data.username, password=form_data.password)
    if not helper:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": helper.email, "role": "helper"})
    refresh_token = create_refresh_token(data={"sub": helper.email, "role": "helper"})
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        role="helper",
        user_id=helper.helper_id,
    )


@router.get("/helpers/me", status_code=status.HTTP_200_OK)
def read_helpers_me(current_helper: Helper = Depends(get_current_helper)):
    return {
        "username": current_helper.username,
        "email": current_helper.email,
        "helper_id": current_helper.helper_id,
        "domain_expertise": current_helper.domain_expertise.value if current_helper.domain_expertise else None,
        "role": current_helper.role or "peer",
        "alias": current_helper.alias,
        "proof_id": current_helper.proof_id,
    }
