from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import auth_routes, image_routes, knowledge_routes, interact_routes

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(knowledge_routes.router, prefix="/knowledge", tags=["knowledge"])
app.include_router(image_routes.router, prefix="/image", tags=["image"])
app.include_router(interact_routes.router, prefix="/interact", tags=["interact"])

#app.include_router(auth_routes.router, tags=["auth"])