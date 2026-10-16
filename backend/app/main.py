import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.routes import router

app = FastAPI(
    title="Oorjan — Solar Plant Health Check API",
    description=(
        "Rule-based monitoring API for 5 solar plants across 90 days. "
        "Calculates daily Performance Ratio (PR), 7-day rolling PR, and detects "
        "outages, sudden drops, and gradual decline."
    ),
    version="1.0.0",
)

# Enable CORS for local Vite development and deployed frontends
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routes
app.include_router(router, prefix="/api")
# Also mount directly at root for convenience as per prompt specs: GET /plants, GET /plants/{id}
app.include_router(router)


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "solar-plant-health-api", "version": "1.0.0"}


# Serve static built frontend if available
FRONTEND_DIST = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    "frontend",
    "dist",
)

if os.path.exists(FRONTEND_DIST):
    app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_DIST, "assets")), name="assets")

    @app.get("/")
    def serve_frontend():
        return FileResponse(os.path.join(FRONTEND_DIST, "index.html"))


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)
