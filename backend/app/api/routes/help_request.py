
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_current_user, get_db
from app.models.models import HelpSession, SessionStatus, User, UserAssessment
from app.services.analyze import onboarding_assesment,analyze_conversation
from app.schemas.schemas import HelpRequestSchema, AnalyzeRequest, AssessmentRequest
from app.services.matching import find_available_helper
from pydantic import BaseModel
import uuid

router = APIRouter(tags=["Help Request"], prefix="/api/v1")


def store_user_assessments(db: Session, user_id: int, assessments: list) -> None:
    """
    Store individual question/answer pairs in UserAssessment table.
    Clears existing assessments for the user before adding new ones.
    """
    # Delete existing assessments for this user
    db.query(UserAssessment).filter(UserAssessment.user_id == user_id).delete()
    
    # Add new assessments
    for item in assessments:
        assessment = UserAssessment(
            user_id=user_id,
            question=item.question if hasattr(item, 'question') else item.get('question', ''),
            answer=item.answer if hasattr(item, 'answer') else item.get('answer', '')
        )
        db.add(assessment)
    
    db.commit()


def get_user_assessments_as_string(db: Session, user_id: int) -> str:
    """
    Retrieve user assessments and format as string for LLM context.
    """
    assessments = db.query(UserAssessment).filter(UserAssessment.user_id == user_id).all()
    if not assessments:
        return ""
    
    formatted = []
    for a in assessments:
        formatted.append(f"Q: {a.question}\nA: {a.answer}")
    
    return "\n\n".join(formatted)


def process_initial_assessment(db: Session, user: User, conversation: str) -> dict:
    """
    Process initial assessment - analyze conversation and store results.
    Can be called from initial-assessment endpoint or from chat when assessment is missing.
    """
    assessment_result = onboarding_assesment(conversation)
    user.initial_assesment = assessment_result
    db.commit()
    return assessment_result


@router.post("/assessments")
def store_assessments(
    data: AssessmentRequest, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """
    Store individual question/answer pairs from onboarding.
    """
    store_user_assessments(db, current_user.user_id, data.assessments)
    return {"message": "Assessments stored successfully", "count": len(data.assessments)}


@router.post("/initial-assessment")
def initial_assesment(data: AnalyzeRequest, db: Session = Depends(get_db),current_user : User = Depends(get_current_user)):
    assessment_result = process_initial_assessment(db, current_user, data.conversation)
    return assessment_result

@router.post("/analyze")
def analyze(data: AnalyzeRequest):
    result = analyze_conversation(data.conversation)
    return { "domain": result["domain"] }


@router.post("/request")
def request_help(data:HelpRequestSchema, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    helper=find_available_helper(data.domain,db)
    if not helper:
        raise HTTPException(status_code=404, detail="No helper available at the moment. Please try again later.")
    
    session=HelpSession(
        session_id=str(uuid.uuid4()),
        user_id=current_user.user_id,
        helper_id=helper.helper_id,
        status=SessionStatus.PENDING,
        preferences=data.preferences
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return {
        "session_id": session.session_id,
        "helper_id": session.helper_id,
        "status": session.status.value
    }

# User polls this while on waiting screen
@router.get("/status/{session_id}")
def get_session_status(session_id: str, db: Session = Depends(get_db)):
    session = db.query(HelpSession).filter(
        HelpSession.session_id == session_id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")

    return { "status": session.status }


## Get session details with user info (for helper's request brief page)
@router.get("/session-detail/{session_id}")
def get_session_detail(session_id: str, db: Session = Depends(get_db)):
    session = db.query(HelpSession).filter(
        HelpSession.session_id == session_id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")

    user = db.query(User).filter(User.user_id == session.user_id).first()

    return {
        "session_id": session.session_id,
        "user_id": session.user_id,
        "helper_id": session.helper_id,
        "status": session.status,
        "created_at": session.created_at,
        "preferences": session.preferences,
        "initial_assessment": user.initial_assesment if user else None,
    }


## Helper sees all active sessions assigned to them
@router.get("/active/{helper_id}")
def get_active_sessions(helper_id: int, db: Session = Depends(get_db)):
    sessions = db.query(HelpSession).filter(
        HelpSession.helper_id == helper_id,
        HelpSession.status == SessionStatus.ACTIVE
    ).all()
    return [
        {
            "session_id": s.session_id,
            "user_id": s.user_id,
            "helper_id": s.helper_id,
            "status": s.status,
            "created_at": s.created_at,
            "preferences": s.preferences,
        }
        for s in sessions
    ]


## Helper sees all pending requests assigned to them
@router.get("/pending/{helper_id}")
def get_pending_requests(helper_id:int, db:Session=Depends(get_db)):
    sessions=db.query(HelpSession).filter(
        HelpSession.helper_id==helper_id,
        HelpSession.status==SessionStatus.PENDING
    ).all()
    return [
        {
            "session_id": s.session_id,
            "user_id": s.user_id,
            "helper_id": s.helper_id,
            "status": s.status,
            "created_at": s.created_at,
            "preferences": s.preferences,
        }
        for s in sessions
    ]


## User sees all their own help requests
@router.get("/my-requests")
def get_my_requests(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    sessions = db.query(HelpSession).filter(
        HelpSession.user_id == current_user.user_id
    ).order_by(HelpSession.created_at.desc()).all()
    return [
        {
            "session_id": s.session_id,
            "user_id": s.user_id,
            "helper_id": s.helper_id,
            "status": s.status.value,
            "created_at": s.created_at,
            "preferences": s.preferences,
        }
        for s in sessions
    ]



## Helper accepts the request
@router.post("/accept/{session_id}")
def accept_request(session_id:str,db:Session=Depends(get_db)):
    session= db.query(HelpSession).filter(HelpSession.session_id==session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Help session not found.")
    if session.status != SessionStatus.PENDING:
        raise HTTPException(status_code=400, detail="Help session is not pending.")
    session.status=SessionStatus.ACTIVE
    db.commit()
    return {
        "message": "Request accepted. Chat is now active.",
        "session_id": session.session_id
    }
    

## Rejection case is not handled for now
# Helper rejects the request — find next available helper
# @router.post("/reject/{session_id}")
# def reject_request(session_id: str, db: Session = Depends(get_db)):
#     session = db.query(HelpSession).filter(
#         HelpSession.session_id == session_id
#     ).first()

#     if not session:
#         raise HTTPException(status_code=404, detail="Session not found.")

#     # mark current session as closed
#     session.status = SessionStatus.CLOSED
#     db.commit()

#     # try to find another helper
#     new_helper = find_available_helper(session.domain, db)

#     if not new_helper:
#         return {"message": "No helpers available right now. Please try again later."}

#     # create new session with next helper
#     new_session = HelpSession(
#         session_id=str(uuid.uuid4()),
#         user_id=session.user_id,
#         helper_id=new_helper.helper_id,
#         status=SessionStatus.PENDING
#     )
#     db.add(new_session)
#     db.commit()
#     db.refresh(new_session)

#     return {
#         "message": "Redirected to next available helper.",
#         "session_id": new_session.session_id,
#         "helper_id": new_helper.helper_id
    # }
    
    
## Get all available helpers
@router.get("/helpers")
def get_all_helpers(db: Session = Depends(get_db)):
    from app.models.models import Helper
    helpers = db.query(Helper).all()
    return [
        {
            "helper_id": h.helper_id,
            "username": h.username,
            "email": h.email,
            "domain_expertise": h.domain_expertise,
        }
        for h in helpers
    ]


## Web socket closed by either side
@router.post("/close/{session_id}")
def close_session(session_id: str, db: Session = Depends(get_db)):
    session = db.query(HelpSession).filter(
        HelpSession.session_id == session_id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")

    session.status = SessionStatus.CLOSED
    db.commit()

    return {"message": "Session closed successfully."}