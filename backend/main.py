from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any
import os
from dotenv import load_dotenv
from bson import ObjectId

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "your_secret_key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

MONGODB_URL = os.getenv("MONGODB_URL")
client = AsyncIOMotorClient(MONGODB_URL)
db = client["survey_db"]

users_collection = db["users"]
surveys_collection = db["surveys"]  
responses_collection = db["responses"]


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000","https://survey-forge-inky.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

class User(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class Question(BaseModel):
    text: str
    type: str
    options: List[str]
    required: bool

class Survey(BaseModel):
    title: str
    description: str
    questions: List[Question]

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(password: str, hashed: str):
    return pwd_context.verify(password, hashed)

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid authentication token")
        return username
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication token")

@app.post("/register")
async def register(user: User):
    existing = await users_collection.find_one({"username": user.username})
    if existing:
        raise HTTPException(status_code=400, detail="Username already taken")
    hashed_pwd = hash_password(user.password)
    await users_collection.insert_one({"username": user.username, "password": hashed_pwd})
    return {"message": "User registered successfully"}

@app.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await users_collection.find_one({"username": form_data.username})
    if not user or not verify_password(form_data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    access_token = create_access_token(
        data={"sub": form_data.username},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/surveys")
async def create_survey(survey: Survey, username: str = Depends(get_current_user)):
    survey_data = survey.dict()
    survey_data["createdBy"] = username  
    result = await surveys_collection.insert_one(survey_data)
    return {"id": str(result.inserted_id), "message": "Survey created"}

@app.get("/my-surveys")
async def get_my_surveys(username: str = Depends(get_current_user)):
    surveys = await surveys_collection.find({"createdBy": username}).to_list(100)
    for s in surveys:
        s["_id"] = str(s["_id"])
    return surveys



@app.delete("/surveys/{survey_id}")
async def delete_survey(survey_id: str, username: str = Depends(get_current_user)):
    survey = await surveys_collection.find_one({"_id": ObjectId(survey_id)})

    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")

    if survey["createdBy"] != username:
        raise HTTPException(status_code=403, detail="Not authorized to delete this survey")

    await surveys_collection.delete_one({"_id": ObjectId(survey_id)})
    return {"message": "Survey deleted successfully"}

@app.get("/all-surveys")
async def get_all_surveys(username: str = Depends(get_current_user)):

    surveys = await surveys_collection.find({"createdBy": {"$ne": username}}).to_list(100)
    for s in surveys:
        s["_id"] = str(s["_id"])  
    return surveys

class Response(BaseModel):
    answers: Dict[str, Any]  

@app.post("/responses/{survey_id}")
async def submit_response(survey_id: str, response: Response, username: str = Depends(get_current_user)):
    response_data = {
        "survey_id": survey_id,
        "answers": response.answers,
        "respondedBy": username
    }
    await responses_collection.insert_one(response_data)
    return {"message": "Response submitted"}


@app.get("/survey/{survey_id}")
async def get_survey(survey_id: str, username: str = Depends(get_current_user)):
    survey = await surveys_collection.find_one({"_id": ObjectId(survey_id)})
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    survey["_id"] = str(survey["_id"])
    return survey

@app.get("/getresponses/{survey_id}")
async def get_responses(survey_id: str, username: str = Depends(get_current_user)):
    survey = await surveys_collection.find_one({"_id": ObjectId(survey_id)})
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    if survey["createdBy"] != username:
        raise HTTPException(status_code=403, detail="Not authorized to view responses")

    survey["_id"] = str(survey["_id"])

    responses = await responses_collection.find({"survey_id": survey_id}).to_list(100)
    for r in responses:
        r["_id"] = str(r["_id"])

    return {"survey": survey, "responses": responses}

@app.get("/ping")
async def ping():
    return {"status": "ok"}