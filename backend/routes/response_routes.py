from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId

from models.response_model import ResponseModel
from database import surveys_collection, responses_collection
from routes.auth_routes import get_current_user

router = APIRouter()


@router.post("/responses/{survey_id}")
async def submit_response(survey_id: str, resp: ResponseModel, username: str = Depends(get_current_user)):
    data = {
        "survey_id": survey_id,
        "answers": resp.answers,
        "respondedBy": username
    }
    await responses_collection.insert_one(data)
    return {"message": "Response submitted"}


@router.get("/getresponses/{survey_id}")
async def get_responses(survey_id: str, username: str = Depends(get_current_user)):
    survey = await surveys_collection.find_one({"_id": ObjectId(survey_id)})
    
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    
    if survey["createdBy"] != username:
        raise HTTPException(status_code=403, detail="Not allowed")
    
    survey["_id"] = str(survey["_id"])

    responses = await responses_collection.find({"survey_id": survey_id}).to_list(100)
    for r in responses:
        r["_id"] = str(r["_id"])

    return {"survey": survey, "responses": responses}
