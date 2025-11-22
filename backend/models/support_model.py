from pydantic import BaseModel

class SupportQuery(BaseModel):
    message: str

class SupportResponse(BaseModel):   
    reply: str
    memory: int

