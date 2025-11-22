from pydantic import BaseModel
from typing import Dict, Any

class ResponseModel(BaseModel):
    answers: Dict[str, Any]
