from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId

from database import surveys_collection
from models.survey_model import Survey
from routes.auth_routes import get_current_user

router = APIRouter()


@router.post("/surveys")
async def create_survey(survey: Survey, username: str = Depends(get_current_user)):
    data = survey.dict()
    data["createdBy"] = username
    res = await surveys_collection.insert_one(data)
    return {"id": str(res.inserted_id), "message": "Survey created"}


@router.get("/my-surveys")
async def get_my_surveys(username: str = Depends(get_current_user)):
    surveys = await surveys_collection.find({"createdBy": username}).to_list(100)
    for s in surveys:
        s["_id"] = str(s["_id"])
    return surveys


@router.get("/all-surveys")
async def get_all_surveys(username: str = Depends(get_current_user)):
    surveys = await surveys_collection.find({"createdBy": {"$ne": username}}).to_list(100)
    for s in surveys:
        s["_id"] = str(s["_id"])
    return surveys


@router.delete("/surveys/{survey_id}")
async def delete_survey(survey_id: str, username: str = Depends(get_current_user)):
    survey = await surveys_collection.find_one({"_id": ObjectId(survey_id)})
    
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    
    if survey["createdBy"] != username:
        raise HTTPException(status_code=403, detail="Not allowed")
    
    await surveys_collection.delete_one({"_id": ObjectId(survey_id)})
    return {"message": "Survey deleted"}
