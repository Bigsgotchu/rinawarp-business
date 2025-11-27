"""
RinaWarp FastAPI Backend - Public Endpoints
Copyright (c) 2024-2025 RinaWarp Technologies, LLC. All rights reserved.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pathlib import Path
import os
import stripe
from pydantic import BaseModel
from typing import Optional

# Initialize FastAPI
app = FastAPI(title="RinaWarp API")

# ===== CORS: allow your website + local dev + VS Code webview =====
allowed_origins = [
    "https://rinawarptech.com",
    "https://www.rinawarptech.com",
    "https://6925fad0871c4a7fbff52ef0--rinawarp-deploy-20251125-114332.netlify.app",
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:4000",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
    "vscode-webview://*",  # VS Code webview
    "https://*.netlify.app",
    "https://*.netlify.com"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===== Configuration =====
BASE_DIR = Path(__file__).resolve().parent
DOWNLOADS_DIR = os.getenv("RINAWARP_DOWNLOADS_DIR", str(BASE_DIR / "downloads"))

# Create downloads directory if it doesn't exist
Path(DOWNLOADS_DIR).mkdir(parents=True, exist_ok=True)

# Stripe configuration
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY")
STRIPE_FOUNDER_PRICE_ID = os.getenv("STRIPE_FOUNDER_PRICE_ID")
STRIPE_SUCCESS_URL = os.getenv(
    "STRIPE_SUCCESS_URL",
    "https://rinawarptech.com/terminal-pro-success.html",
)
STRIPE_CANCEL_URL = os.getenv(
    "STRIPE_CANCEL_URL",
    "https://rinawarptech.com/pricing.html",
)
FOUNDER_TOTAL_SEATS = int(os.getenv("FOUNDER_TOTAL_SEATS", "500"))

if STRIPE_SECRET_KEY:
    stripe.api_key = STRIPE_SECRET_KEY

# ===== 1) Public License Count =====
@app.get("/api/license-count")
async def license_count():
    """
    Public endpoint for the seat counter on the website.
    NO AUTH. SAFE TO CALL FROM FRONTEND.
    """
    try:
        # TODO: Replace this stub with your real DB logic.
        # For now this keeps the endpoint alive even if DB is offline.
        used_seats = 0
        
        # Example if you have a License model + DB:
        # from .models import License
        # db = SessionLocal()
        # used_seats = db.query(License).filter(
        #     License.tier == "founder",
        #     License.revoked == False
        # ).count()
        # db.close()
        
        remaining = max(FOUNDER_TOTAL_SEATS - used_seats, 0)
        
        return {
            "total": FOUNDER_TOTAL_SEATS,
            "used": used_seats,
            "remaining": remaining,
            "timestamp": "2025-11-26T02:41:15.638Z",
            "source": "fallback"  # or "database" when real DB is connected
        }
        
    except Exception as e:
        # Fallback: if DB fails, treat as 0 used seats
        print(f"[License Count] Database error: {e}")
        return {
            "total": FOUNDER_TOTAL_SEATS,
            "used": 0,
            "remaining": FOUNDER_TOTAL_SEATS,
            "error": "Using fallback data",
            "timestamp": "2025-11-26T02:41:15.638Z",
            "source": "fallback"
        }

# ===== 2) Public Downloads =====
@app.get("/downloads/{filename}")
async def download_file(filename: str):
    """
    Public download endpoint.
    Example:
      https://api.rinawarptech.com/downloads/RinaWarp.Terminal.Pro-1.0.0.AppImage
    """
    # Prevent "../../../" traversal
    safe_name = os.path.basename(filename)
    file_path = Path(DOWNLOADS_DIR) / safe_name

    # Ensure the file is within the downloads directory
    try:
        file_path = file_path.resolve()
        downloads_path = Path(DOWNLOADS_DIR).resolve()
        if not str(file_path).startswith(str(downloads_path)):
            raise HTTPException(status_code=400, detail="Invalid file path")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid file path")

    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")

    # Let FastAPI infer content-type from filename
    return FileResponse(
        path=str(file_path),
        filename=safe_name,
        media_type="application/octet-stream",
    )

# ===== 3) Stripe Checkout (Public) =====
class CheckoutRequest(BaseModel):
    # For now we only support "founder"; extend later for more plans
    plan: str = "founder"
    email: Optional[str] = None

@app.post("/api/terminal-pro/checkout")
async def terminal_pro_checkout(payload: CheckoutRequest):
    """
    Public checkout endpoint.

    Called by the pricing page. Anonymous users allowed.
    Creates a Stripe Checkout Session and returns the URL.
    """
    if not STRIPE_SECRET_KEY or not STRIPE_FOUNDER_PRICE_ID:
        raise HTTPException(
            status_code=500,
            detail="Stripe is not configured on the server.",
        )

    try:
        # Choose price by plan if you add more later
        if payload.plan != "founder":
            raise HTTPException(status_code=400, detail="Only 'founder' plan is currently supported")

        checkout_params = {
            "mode": "payment",
            "line_items": [
                {
                    "price": STRIPE_FOUNDER_PRICE_ID,
                    "quantity": 1,
                }
            ],
            "success_url": STRIPE_SUCCESS_URL + "?session_id={CHECKOUT_SESSION_ID}",
            "cancel_url": STRIPE_CANCEL_URL,
            "metadata": {
                "product": "rinawarp-terminal-pro",
                "plan": payload.plan,
            },
        }

        if payload.email:
            checkout_params["customer_email"] = payload.email

        session = stripe.checkout.Session.create(**checkout_params)

        return {"url": session.url}
        
    except stripe.error.StripeError as e:
        # Log `e.user_message` on server if you want
        print(f"[Stripe Error] {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"[Checkout Error] {e}")
        raise HTTPException(status_code=500, detail="Checkout failed")

# ===== Health Endpoints =====
@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy",
        "timestamp": "2025-11-26T02:41:15.638Z",
        "service": "RinaWarp FastAPI",
        "version": "1.0.0"
    }

@app.get("/api/health")
async def api_health():
    """API health check"""
    return {
        "ok": True,
        "uptime": 0,  # Could track actual uptime if needed
        "timestamp": "2025-11-26T02:41:15.638Z",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting RinaWarp FastAPI server on port 8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)