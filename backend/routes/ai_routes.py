from fastapi import APIRouter, Depends, HTTPException
from models.support_model import SupportQuery,SupportResponse
from database import chat_collection
from routes.auth_routes import get_current_user
from config import SECRET_KEY

import google.generativeai as genai
import os

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY missing from .env")

genai.configure(api_key=GEMINI_API_KEY)

router = APIRouter()

@router.post("/support/ai",response_model=SupportResponse)
async def ai_support(query: SupportQuery, username: str = Depends(get_current_user)):

    if not query.message:
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    history_doc = await chat_collection.find_one({"username": username})
    messages = history_doc.get("messages", []) if history_doc else []
    messages = messages[-15:]  

    chat_log = ""
    for m in messages:
        role = "User" if m["role"] == "user" else "Assistant"
        chat_log += f"{role}: {m['content']}\n"

    prompt = f"""
You are SurveyForge's official AI Customer Support Assistant.

Below is the previous conversation between the user and you:

{chat_log}

The logged-in user is: {username}

Here is an overview of the SurveyForge platform so you fully understand the system:

SurveyForge is a modern online platform for building, sharing, and analyzing surveys. 
Users can create surveys using different question types such as multiple choice, short text, long text, yes/no, checkboxes, and ratings. 
They can write a title, description, add questions, mark them as required, and store the survey in their personal dashboard.

Users can manage surveys they created, view them in “My Surveys,” delete them, and explore surveys made by other users. 
They can share a public survey link that anyone can use to submit responses. 
Survey creators can view all submitted responses, including individual answers, securely stored in MongoDB.

SurveyForge uses a secure login system with JWT authentication. Only the creator of a survey can view or delete its responses. 
Responses are saved with the answers, the responding user, and the related survey ID. 
The backend is built using FastAPI, database is MongoDB, and the frontend is Next.js.

Your new message from the user is:
"{query.message}"

Your job:
- Provide accurate help about using SurveyForge
- Assist with surveys, dashboards, login issues, survey creation, response viewing, and error troubleshooting
- Keep answers short unless detailed guidance is needed
- NEVER make up features that do not exist
- Be friendly, professional, and clear at all times
- If the user asks about features not currently available, politely state that it’s not supported yet

"""

    try:
        model = genai.GenerativeModel("gemini-2.5-flash")
        result = model.generate_content(prompt)
        ai_reply = result.text
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Error: {str(e)}")

    messages.append({"role": "user", "content": query.message})
    messages.append({"role": "assistant", "content": ai_reply})

    await chat_collection.update_one(
        {"username": username},
        {"$set": {"messages": messages}},
        upsert=True
    )

    return {"reply": ai_reply, "memory": len(messages)}
