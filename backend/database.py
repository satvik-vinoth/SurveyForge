from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv() 

MONGODB_URL = os.getenv("MONGODB_URL")

client = AsyncIOMotorClient(MONGODB_URL)
db = client["survey_db"]

users_collection = db["users"]
surveys_collection = db["surveys"]
responses_collection = db["responses"]
chat_collection = db["chat_history"]
