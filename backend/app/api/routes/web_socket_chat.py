
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.models.models import HelpChatHistory, HelpSession, SessionStatus
from app.services.websocket_manager import manager
from datetime import datetime

router = APIRouter(tags=["WebSocket Chat"], prefix="/api/v1/websocket/chat")

## Websocket - real time chat between user and helper
@router.websocket("/{session_id}/{role}")
async def websocket_chat(
    websocket: WebSocket,
    session_id: str,
    role: str,              # 'user' or 'helper'
    db: Session = Depends(get_db)
):
    # check session is active before allowing connection
    session = db.query(HelpSession).filter(
        HelpSession.session_id == session_id,
        HelpSession.status == SessionStatus.ACTIVE
    ).first()

    if not session:
        await websocket.close(code=4001)
        return

    await manager.connect(session_id, role, websocket)

    try:
        while True:
            message = await websocket.receive_text()

            # save message to DB
            chat_message = HelpChatHistory(
                session_id=session_id,
                role=role,
                content=message,
                created_at=datetime.utcnow()
            )
            db.add(chat_message)
            db.commit()

            # send to other party
            await manager.send_message(session_id, role, message)

    except WebSocketDisconnect:
        manager.disconnect(session_id, role)
        
        
# Fetch chat history for a session between the helper and User
@router.get("/{session_id}/history")
def get_chat_history(session_id: str, db: Session = Depends(get_db)):
    messages = db.query(HelpChatHistory).filter(
        HelpChatHistory.session_id == session_id
    ).order_by(HelpChatHistory.created_at.asc()).all()

    return messages