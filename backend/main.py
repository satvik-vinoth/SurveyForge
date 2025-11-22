from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.auth_routes import router as auth_router
from routes.survey_routes import router as survey_router
from routes.response_routes import router as response_router
from routes.ai_routes import router as ai_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://survey-forge-inky.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, tags=["Auth"])
app.include_router(survey_router, tags=["Surveys"])
app.include_router(response_router, tags=["Responses"])
app.include_router(ai_router, tags=["AI Support"])


@app.get("/ping")
def ping():
    return {"status": "ok"}
