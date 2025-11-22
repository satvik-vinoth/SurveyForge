from pydantic import BaseModel
from typing import List

class Question(BaseModel):
    text: str
    type: str
    options: List[str]
    required: bool

class Survey(BaseModel):
    title: str
    description: str
    questions: List[Question]
