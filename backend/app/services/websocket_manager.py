
from fastapi import WebSocket

class WebSocketManager:
    def __init__(self):
        self.active_connections: dict = {}
        
    async def connect(self, session_id: str,role:str ,websocket: WebSocket):
        await websocket.accept()
        if session_id not in self.active_connections:
            self.active_connections[session_id] = {}
        self.active_connections[session_id][role] = websocket
    
    def disconnect(self, session_id: str, role: str):
        if session_id in self.active_connections:
            self.active_connections[session_id].pop(role, None)
            # if both disconnected clean up room
            if not self.active_connections[session_id]:
                del self.active_connections[session_id]
    async def send_message(self, session_id: str, sender_role: str, message: str):
        connections = self.active_connections.get(session_id, {})
        # send to the other party only
        for role, websocket in connections.items():
            if role != sender_role:
                await websocket.send_text(message)
                
manager=WebSocketManager()