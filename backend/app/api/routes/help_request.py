
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.models.models import HelpSession, SessionStatus
from app.services.analyze import analyze_conversation
from app.schemas.schemas import HelpRequestSchema, AnalyzeRequest
from app.services.matching import find_available_helper
from pydantic import BaseModel
import uuid

router = APIRouter(tags=["Help Request"], prefix="/api/v1")



@router.post("/analyze")
def analyze(data: AnalyzeRequest):
    result = analyze_conversation(data.conversation)
    return { "domain": result["domain"] }


@router.post("/request")
def request_help(data:HelpRequestSchema, db: Session = Depends(get_db)):
    helper=find_available_helper(data.domain,db)
    if not helper:
        raise HTTPException(status_code=404, detail="No helper available at the moment. Please try again later.")
    
    session=HelpSession(
        session_id=str(uuid.uuid4()),
        user_id=data.user_id,
        helper_id=helper.helper_id,
        status=SessionStatus.ACTIVE
    )
# User polls this while on waiting screen
@router.get("/status/{session_id}")
def get_session_status(session_id: str, db: Session = Depends(get_db)):
    session = db.query(HelpSession).filter(
        HelpSession.session_id == session_id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")

    return { "status": session.status }



## Helper sees all pending requests assigned to them
@router.get("/pending/{helper_id}")
def get_pending_requests(helper_i:int, db:Session=Depends(get_db)):
    sessions=db.query(HelpSession).filter(
        HelpSession.helper_id==helper_i,
        HelpSession.status==SessionStatus.PENDING
    ).all()
    return sessions



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