
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List
from app.api.deps import get_db, get_current_user, get_current_helper
from app.models import User
from app.models.models import HelpSession, SessionStatus, Helper, HelpRequestAcceptance, SessionFeedback
from app.services.analyze import analyze_conversation
from app.schemas.schemas import HelpRequestSchema, AnalyzeRequest, SessionFeedbackSchema
import uuid

router = APIRouter(tags=["Help Request"], prefix="/api/v1")


def _parse_categories(raw: Optional[str]) -> List[str]:
    if not raw:
        return []
    return [c.strip() for c in raw.split(",") if c.strip()]


def _helper_info(h: Helper) -> dict:
    return {
        "helper_id": h.helper_id,
        "alias": h.alias or f"Peer_{h.helper_id}",
        "role": h.role or "peer",
        "domain_expertise": h.domain_expertise.value if h.domain_expertise else None,
    }


def _seeker_alias(u: User) -> str:
    return u.alias or f"Anon_{u.user_id}"


@router.post("/analyze")
def analyze(data: AnalyzeRequest):
    result = analyze_conversation(data.conversation)
    return {"domain": result["domain"]}


# ── Seeker: place a help request ─────────────────────────────────────────────

@router.post("/request")
def request_help(
    data: HelpRequestSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.models.models import DomainExpertise

    analysis = analyze_conversation(data.message)
    domain_str = analysis.get("domain", "general")
    try:
        domain = DomainExpertise(domain_str.lower())
    except ValueError:
        domain = DomainExpertise.GENERAL

    session = HelpSession(
        session_id=str(uuid.uuid4()),
        user_id=current_user.user_id,
        helper_id=None,
        status=SessionStatus.PENDING,
        message=data.message,
        helper_type=data.helper_type,
        categories=",".join(data.categories) if data.categories else None,
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    return {
        "session_id": session.session_id,
        "status": session.status.value,
        "helper_id": None,
        "message": session.message,
        "helper_type": session.helper_type,
        "categories": data.categories,
        "waiting": True,
    }


# ── Seeker: delete a completed help request ───────────────────────────────────

@router.delete("/request/{session_id}")
def delete_request(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = db.query(HelpSession).filter(HelpSession.session_id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Help request not found.")
    if session.user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="You can only delete your own requests.")
    if session.status != SessionStatus.CLOSED:
        raise HTTPException(
            status_code=400,
            detail="You can only delete a request after the session is fully closed."
        )
    # Remove related feedback and acceptances, then the session
    db.query(SessionFeedback).filter(SessionFeedback.session_id == session_id).delete()
    db.query(HelpRequestAcceptance).filter(HelpRequestAcceptance.session_id == session_id).delete()
    db.delete(session)
    db.commit()
    return {"message": "Request deleted successfully."}


# ── Seeker: list their own help sessions ─────────────────────────────────────

@router.get("/user/sessions")
def get_user_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sessions = (
        db.query(HelpSession)
        .filter(HelpSession.user_id == current_user.user_id)
        .order_by(HelpSession.created_at.desc())
        .all()
    )
    result = []
    for s in sessions:
        acceptances = (
            db.query(HelpRequestAcceptance)
            .filter(HelpRequestAcceptance.session_id == s.session_id)
            .all()
        )
        accepted_helpers = []
        for a in acceptances:
            h = db.query(Helper).filter(Helper.helper_id == a.helper_id).first()
            if h:
                accepted_helpers.append(_helper_info(h))
        result.append({
            "session_id": s.session_id,
            "status": s.status.value,
            "message": s.message,
            "helper_type": s.helper_type,
            "categories": _parse_categories(s.categories),
            "created_at": s.created_at.isoformat(),
            "helper": accepted_helpers[0] if accepted_helpers else None,
            "accepted_helpers": accepted_helpers,
            "acceptance_count": len(accepted_helpers),
        })
    return result


# ── Helper: browse all open requests they can accept ─────────────────────────

@router.get("/helper/open-requests")
def get_open_requests(
    db: Session = Depends(get_db),
    current_helper: Helper = Depends(get_current_helper),
):
    helper_role = (current_helper.role or "peer").lower()

    # Sessions this helper already accepted
    already_accepted_ids = {
        r.session_id
        for r in db.query(HelpRequestAcceptance.session_id)
        .filter(HelpRequestAcceptance.helper_id == current_helper.helper_id)
        .all()
    }

    sessions = (
        db.query(HelpSession)
        .filter(
            HelpSession.status != SessionStatus.CLOSED,
            HelpSession.helper_type == helper_role,   # only matching role type
        )
        .order_by(HelpSession.created_at.desc())
        .all()
    )

    result = []
    for s in sessions:
        if s.session_id in already_accepted_ids:
            continue
        acceptance_count = len(s.acceptances)
        if acceptance_count >= 3:
            continue
        seeker = db.query(User).filter(User.user_id == s.user_id).first()
        result.append({
            "session_id": s.session_id,
            "user_id": s.user_id,
            "seeker_alias": _seeker_alias(seeker) if seeker else f"Anon_{s.user_id}",
            "status": s.status.value,
            "message": s.message,
            "helper_type": s.helper_type,
            "categories": _parse_categories(s.categories),
            "created_at": s.created_at.isoformat(),
            "acceptance_count": acceptance_count,
        })
    return result


# ── Helper: list sessions they have accepted ──────────────────────────────────

@router.get("/helper/sessions")
def get_helper_sessions(
    db: Session = Depends(get_db),
    current_helper: Helper = Depends(get_current_helper),
):
    accepted_session_ids = [
        r.session_id
        for r in db.query(HelpRequestAcceptance.session_id)
        .filter(HelpRequestAcceptance.helper_id == current_helper.helper_id)
        .all()
    ]

    if not accepted_session_ids:
        return []

    sessions = (
        db.query(HelpSession)
        .filter(
            HelpSession.session_id.in_(accepted_session_ids),
            HelpSession.status != SessionStatus.CLOSED,
        )
        .order_by(HelpSession.created_at.desc())
        .all()
    )

    result = []
    for s in sessions:
        acceptance_count = (
            db.query(HelpRequestAcceptance)
            .filter(HelpRequestAcceptance.session_id == s.session_id)
            .count()
        )
        seeker = db.query(User).filter(User.user_id == s.user_id).first()
        result.append({
            "session_id": s.session_id,
            "user_id": s.user_id,
            "seeker_alias": _seeker_alias(seeker) if seeker else f"Anon_{s.user_id}",
            "status": s.status.value,
            "message": s.message,
            "helper_type": s.helper_type,
            "created_at": s.created_at.isoformat(),
            "acceptance_count": acceptance_count,
        })
    return result


# ── Get full session detail ──────────────────────────────────────────────────

@router.get("/session/{session_id}")
def get_session(session_id: str, db: Session = Depends(get_db)):
    session = db.query(HelpSession).filter(HelpSession.session_id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")

    acceptances = (
        db.query(HelpRequestAcceptance)
        .filter(HelpRequestAcceptance.session_id == session_id)
        .all()
    )
    accepted_helpers = []
    for a in acceptances:
        h = db.query(Helper).filter(Helper.helper_id == a.helper_id).first()
        if h:
            accepted_helpers.append(_helper_info(h))

    seeker = db.query(User).filter(User.user_id == session.user_id).first()

    has_feedback = db.query(SessionFeedback).filter(
        SessionFeedback.session_id == session_id
    ).first() is not None

    return {
        "session_id": session.session_id,
        "user_id": session.user_id,
        "seeker_alias": _seeker_alias(seeker) if seeker else f"Anon_{session.user_id}",
        "status": session.status.value,
        "message": session.message,
        "helper_type": session.helper_type,
        "categories": _parse_categories(session.categories),
        "created_at": session.created_at.isoformat(),
        "helper": accepted_helpers[0] if accepted_helpers else None,
        "accepted_helpers": accepted_helpers,
        "acceptance_count": len(accepted_helpers),
        "has_feedback": has_feedback,
    }


# ── Poll session status ───────────────────────────────────────────────────────

@router.get("/status/{session_id}")
def get_session_status(session_id: str, db: Session = Depends(get_db)):
    session = db.query(HelpSession).filter(HelpSession.session_id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")
    acceptance_count = (
        db.query(HelpRequestAcceptance)
        .filter(HelpRequestAcceptance.session_id == session_id)
        .count()
    )
    return {"status": session.status.value, "acceptance_count": acceptance_count}


# ── Helper: accept a help request ────────────────────────────────────────────

@router.post("/accept/{session_id}")
def accept_request(
    session_id: str,
    db: Session = Depends(get_db),
    current_helper: Helper = Depends(get_current_helper),
):
    session = db.query(HelpSession).filter(HelpSession.session_id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Help session not found.")
    if session.status == SessionStatus.CLOSED:
        raise HTTPException(status_code=400, detail="Session is already closed.")

    # Enforce role match: helper can only accept requests matching their role
    helper_role = (current_helper.role or "peer").lower()
    session_type = (session.helper_type or "peer").lower()
    if helper_role != session_type:
        raise HTTPException(
            status_code=403,
            detail=f"You are registered as a '{helper_role}'. This request requires a '{session_type}'."
        )

    existing = (
        db.query(HelpRequestAcceptance)
        .filter(
            HelpRequestAcceptance.session_id == session_id,
            HelpRequestAcceptance.helper_id == current_helper.helper_id,
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="You have already accepted this request.")

    current_count = (
        db.query(HelpRequestAcceptance)
        .filter(HelpRequestAcceptance.session_id == session_id)
        .count()
    )
    if current_count >= 3:
        raise HTTPException(status_code=400, detail="This request already has 3 helpers. No more can join.")

    acceptance = HelpRequestAcceptance(
        session_id=session_id,
        helper_id=current_helper.helper_id,
    )
    db.add(acceptance)

    # First acceptance activates the session
    if current_count == 0:
        session.status = SessionStatus.ACTIVE
        session.helper_id = current_helper.helper_id

    db.commit()
    return {
        "message": "Request accepted.",
        "session_id": session_id,
        "acceptance_count": current_count + 1,
    }


# ── Close session ─────────────────────────────────────────────────────────────

@router.post("/close/{session_id}")
def close_session(session_id: str, db: Session = Depends(get_db)):
    session = db.query(HelpSession).filter(HelpSession.session_id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")
    session.status = SessionStatus.CLOSED
    db.commit()
    return {"message": "Session closed successfully."}


# ── Seeker: submit feedback after session closes ──────────────────────────────

@router.post("/feedback/{session_id}")
def submit_feedback(
    session_id: str,
    data: SessionFeedbackSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = db.query(HelpSession).filter(HelpSession.session_id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")
    if session.user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Not your session.")
    if session.status != SessionStatus.CLOSED:
        raise HTTPException(status_code=400, detail="Session must be closed before leaving feedback.")

    existing = db.query(SessionFeedback).filter(SessionFeedback.session_id == session_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Feedback already submitted for this session.")

    if not (1 <= data.rating <= 5):
        raise HTTPException(status_code=422, detail="Rating must be between 1 and 5.")

    feedback = SessionFeedback(
        session_id=session_id,
        user_id=current_user.user_id,
        rating=data.rating,
        feedback_type=data.feedback_type,
        note=data.note or None,
    )
    db.add(feedback)
    db.commit()
    return {"message": "Thank you for your feedback!"}


# ── Helper: session history with feedback ─────────────────────────────────────

@router.get("/helper/history")
def get_helper_history(
    db: Session = Depends(get_db),
    current_helper: Helper = Depends(get_current_helper),
):
    accepted_session_ids = [
        r.session_id
        for r in db.query(HelpRequestAcceptance.session_id)
        .filter(HelpRequestAcceptance.helper_id == current_helper.helper_id)
        .all()
    ]

    if not accepted_session_ids:
        return {"sessions": [], "stats": {"total": 0, "avg_rating": None, "impressed_rate": None}}

    sessions = (
        db.query(HelpSession)
        .filter(
            HelpSession.session_id.in_(accepted_session_ids),
            HelpSession.status == SessionStatus.CLOSED,
        )
        .order_by(HelpSession.created_at.desc())
        .all()
    )

    result = []
    total_rating = 0
    rating_count = 0
    impressed_count = 0

    for s in sessions:
        fb = db.query(SessionFeedback).filter(SessionFeedback.session_id == s.session_id).first()
        seeker = db.query(User).filter(User.user_id == s.user_id).first()
        entry = {
            "session_id": s.session_id,
            "user_id": s.user_id,
            "seeker_alias": _seeker_alias(seeker) if seeker else f"Anon_{s.user_id}",
            "categories": _parse_categories(s.categories),
            "helper_type": s.helper_type,
            "created_at": s.created_at.isoformat(),
            "feedback": None,
        }
        if fb:
            entry["feedback"] = {
                "rating": fb.rating,
                "feedback_type": fb.feedback_type,
                "note": fb.note,
            }
            total_rating += fb.rating
            rating_count += 1
            if fb.feedback_type == "impressed":
                impressed_count += 1
        result.append(entry)

    avg_rating = round(total_rating / rating_count, 1) if rating_count > 0 else None
    impressed_rate = round(impressed_count / len(sessions) * 100) if sessions else None

    return {
        "sessions": result,
        "stats": {
            "total": len(sessions),
            "avg_rating": avg_rating,
            "impressed_rate": impressed_rate,
        },
    }
