from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import compile_router
import uvicorn

app = FastAPI(title="CodePod API")

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    # Add your Render frontend URL here in production
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(compile_router.router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "Welcome to CodePod Backend. Visit /docs for API documentation."}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)