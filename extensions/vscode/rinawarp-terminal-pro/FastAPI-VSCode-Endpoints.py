# FastAPI Backend Endpoints for VS Code Extension Paywall System
# Add these to your fastapi_server.py

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
import jwt
import bcrypt
import sqlite3
import json
from datetime import datetime, timedelta
from typing import Optional, List

app = FastAPI(title="RinaWarp VS Code Extension API")
security = HTTPBearer()

# Configuration
JWT_SECRET = "your-super-secret-jwt-key"  # Change this in production
JWT_ALGORITHM = "HS256"
TOKEN_EXPIRE_MINUTES = 30 * 24 * 60  # 30 days

# Database setup (you might want to use a proper database)
def init_db():
    conn = sqlite3.connect('rinawarp.db')
    cursor = conn.cursor()
    
    # Users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            plan TEXT DEFAULT 'community',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            stripe_customer_id TEXT,
            subscription_status TEXT DEFAULT 'active'
        )
    ''')
    
    # VS Code sessions table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS vscode_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            token TEXT UNIQUE NOT NULL,
            expires_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    conn.commit()
    conn.close()

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    init_db()

# Pydantic models
class LoginRequest(BaseModel):
    email: str
    password: str
    plan: str = "community"

class TokenResponse(BaseModel):
    success: bool
    token: Optional[str] = None
    userId: Optional[str] = None
    error: Optional[str] = None

class UserProfile(BaseModel):
    id: str
    email: str
    plan: str
    subscription_status: str
    created_at: str

class LicenseResponse(BaseModel):
    valid: bool
    plan: str
    features: List[str]
    expires_at: Optional[str] = None

# Helper functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_access_token(user_id: str, email: str, plan: str) -> str:
    payload = {
        'user_id': user_id,
        'email': email,
        'plan': plan,
        'exp': datetime.utcnow() + timedelta(minutes=TOKEN_EXPIRE_MINUTES),
        'iat': datetime.utcnow()
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# =============================================================================
# 🔐 AUTHENTICATION ENDPOINTS
# =============================================================================

@app.post("/api/vscode/login", response_model=TokenResponse)
async def vscode_login(request: LoginRequest):
    """
    Handle VS Code extension login request
    """
    conn = sqlite3.connect('rinawarp.db')
    cursor = conn.cursor()
    
    try:
        # Find user by email
        cursor.execute("SELECT id, password_hash, plan, subscription_status FROM users WHERE email = ?", (request.email,))
        user = cursor.fetchone()
        
        if not user or not verify_password(request.password, user[1]):
            return TokenResponse(success=False, error="Invalid email or password")
        
        user_id, password_hash, current_plan, subscription_status = user
        
        # Check if user has access to requested plan
        if request.plan != 'community' and current_plan != request.plan:
            return TokenResponse(
                success=False, 
                error=f"You don't have access to {request.plan} plan. Please upgrade."
            )
        
        # Create access token
        token = create_access_token(str(user_id), request.email, current_plan)
        
        # Store session in database
        expires_at = datetime.utcnow() + timedelta(minutes=TOKEN_EXPIRE_MINUTES)
        cursor.execute(
            "INSERT INTO vscode_sessions (user_id, token, expires_at) VALUES (?, ?, ?)",
            (user_id, token, expires_at)
        )
        conn.commit()
        
        return TokenResponse(
            success=True,
            token=token,
            userId=str(user_id)
        )
        
    except Exception as e:
        return TokenResponse(success=False, error=f"Login failed: {str(e)}")
    finally:
        conn.close()

@app.get("/api/vscode/me", response_model=UserProfile)
async def get_current_user(user_data: dict = Depends(verify_token)):
    """
    Get current user profile for VS Code extension
    """
    conn = sqlite3.connect('rinawarp.db')
    cursor = conn.cursor()
    
    try:
        cursor.execute(
            "SELECT id, email, plan, subscription_status, created_at FROM users WHERE id = ?",
            (user_data['user_id'],)
        )
        user = cursor.fetchone()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return UserProfile(
            id=str(user[0]),
            email=user[1],
            plan=user[2],
            subscription_status=user[3],
            created_at=user[4]
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching user: {str(e)}")
    finally:
        conn.close()

@app.get("/api/vscode/license", response_model=LicenseResponse)
async def check_license(user_data: dict = Depends(verify_token)):
    """
    Check user's license status and available features
    """
    plan = user_data['plan']
    
    # Define features by plan
    plan_features = {
        'community': [
            'dev_dashboard',
            'kilo_fix_pack', 
            'basic_deploy',
            'terminal_pro_launch'
        ],
        'pioneer': [
            'community_features',
            'ai_suggestions',
            'advanced_analytics', 
            'priority_support',
            'early_access'
        ],
        'founder': [
            'pioneer_features',
            'founder_benefits',
            'custom_integrations'
        ],
        'monthly_creator': [
            'ai_suggestions',
            'advanced_analytics',
            'team_features'
        ],
        'monthly_pro': [
            'creator_features', 
            'enterprise_support',
            'custom_deployments'
        ]
    }
    
    features = plan_features.get(plan, plan_features['community'])
    
    return LicenseResponse(
        valid=True,
        plan=plan,
        features=features
    )

@app.get("/api/vscode/ai/suggestions")
async def get_ai_suggestions(user_data: dict = Depends(verify_token)):
    """
    Get AI-powered suggestions (premium feature)
    """
    plan = user_data['plan']
    
    # Only premium plans get AI suggestions
    if plan in ['community']:
        raise HTTPException(
            status_code=403, 
            detail="AI suggestions require Pioneer or monthly subscription"
        )
    
    try:
        # Load recent errors from kilo-memory.json
        try:
            with open('.kilo/kilo-memory.json', 'r') as f:
                memory_data = json.load(f)
            recent_errors = memory_data.get('recentErrors', [])[:5]
        except:
            recent_errors = []
        
        # Generate AI-like suggestions based on recent activity
        suggestions_html = f"""
        <div class="ai-suggestion">
            <h4>🧠 Kilo AI Analysis</h4>
            <p><strong>Plan:</strong> {plan}</p>
            <p><strong>Recent Activity:</strong> {len(recent_errors)} recent errors detected</p>
            
            <div style="background: #1a1f2e; padding: 15px; border-radius: 8px; margin: 10px 0;">
                <h5>🔍 Smart Recommendations</h5>
                <p>• Run: <code>node .kilo/kilo-fix-pack.js</code> for automated fixes</p>
                <p>• Check: <code>pm2 logs rinawarp-api --lines 50</code> for detailed errors</p>
                <p>• Optimize: Consider upgrading to {plan} features for better performance</p>
                <p>• Monitor: Set up automated health checks with RinaWarp</p>
            </div>
            
            <div style="background: #2a1f3e; padding: 15px; border-radius: 8px; margin: 10px 0;">
                <h5>🚀 Performance Insights</h5>
                <p>• Your system is {90 - len(recent_errors) * 10}% healthy</p>
                <p>• Most common issue: Configuration inconsistencies</p>
                <p>• Recommendation: Enable automated deployment checks</p>
            </div>
            
            <button onclick="runAutoFix()" style="margin: 10px 5px; padding: 8px 16px; background: #ff0080; color: white; border: none; border-radius: 5px; cursor: pointer;">
                🚀 Apply AI Recommendations
            </button>
            <button onclick="scheduleScan()" style="margin: 10px 5px; padding: 8px 16px; background: #00f7c3; color: #0a0f14; border: none; border-radius: 5px; cursor: pointer;">
                ⏰ Schedule Auto-Scan
            </button>
        </div>
        """
        
        return {"html": suggestions_html}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI suggestions failed: {str(e)}")

# =============================================================================
# 🚀 DEPLOYMENT ENDPOINTS  
# =============================================================================

@app.post("/run-deploy")
async def run_deployment(user_data: dict = Depends(verify_token)):
    """
    Run deployment with authentication check
    """
    try:
        import subprocess
        import os
        
        # Run the deployment script
        result = subprocess.run(
            ['bash', 'scripts/rinawarp-one-click-deploy.sh'], 
            capture_output=True, 
            text=True,
            cwd=os.getcwd()
        )
        
        if result.returncode == 0:
            return {
                "success": True, 
                "output": result.stdout,
                "message": "Deployment completed successfully"
            }
        else:
            return {
                "success": False,
                "error": result.stderr,
                "output": result.stdout
            }
            
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

@app.post("/run-kilo-scan")
async def run_kilo_scan(user_data: dict = Depends(verify_token)):
    """
    Run Kilo Fix Pack scan with authentication
    """
    try:
        import subprocess
        import os
        
        result = subprocess.run(
            ['node', '.kilo/kilo-fix-pack.js'],
            capture_output=True,
            text=True,
            cwd=os.getcwd()
        )
        
        return {
            "success": True,
            "output": result.stdout,
            "errors": result.stderr
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

# =============================================================================
# 💳 STRIPE INTEGRATION ENDPOINTS
# =============================================================================

@app.post("/api/vscode/create-checkout-session")
async def create_checkout_session(request: dict, user_data: dict = Depends(verify_token)):
    """
    Create Stripe checkout session for plan upgrades
    """
    plan = request.get('plan')
    user_id = user_data['user_id']
    
    # Define plan prices
    plan_prices = {
        'pioneer': 4900,  # $49.00 in cents
        'monthly_creator': 1500,  # $15.00/month
        'monthly_pro': 2900  # $29.00/month
    }
    
    if plan not in plan_prices:
        raise HTTPException(status_code=400, detail="Invalid plan")
    
    # Create Stripe checkout session
    # You'll need to implement Stripe integration here
    checkout_session = {
        "url": f"https://checkout.stripe.com/pay/{plan}_checkout_session_123",
        "session_id": f"cs_test_{plan}_{user_id}"
    }
    
    return checkout_session

# =============================================================================
# 🔧 ADMIN ENDPOINTS (Add authentication as needed)
# =============================================================================

@app.get("/api/admin/users")
async def get_all_users(user_data: dict = Depends(verify_token)):
    """
    Get all users (admin only)
    """
    if user_data['plan'] not in ['admin']:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    conn = sqlite3.connect('rinawarp.db')
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT id, email, plan, subscription_status, created_at FROM users")
        users = cursor.fetchall()
        
        return {
            "users": [
                {
                    "id": str(user[0]),
                    "email": user[1],
                    "plan": user[2],
                    "subscription_status": user[3],
                    "created_at": user[4]
                }
                for user in users
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching users: {str(e)}")
    finally:
        conn.close()

@app.post("/api/admin/upgrade-user")
async def upgrade_user(request: dict, user_data: dict = Depends(verify_token)):
    """
    Upgrade user plan (admin only)
    """
    if user_data['plan'] not in ['admin']:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    target_user_id = request.get('user_id')
    new_plan = request.get('plan')
    
    conn = sqlite3.connect('rinawarp.db')
    cursor = conn.cursor()
    
    try:
        cursor.execute(
            "UPDATE users SET plan = ? WHERE id = ?",
            (new_plan, target_user_id)
        )
        conn.commit()
        
        return {"success": True, "message": f"User upgraded to {new_plan}"}
        
    except Exception as e:
        return {"success": False, "error": str(e)}
    finally:
        conn.close()

# =============================================================================
# 📊 ANALYTICS ENDPOINTS (Premium Feature)
# =============================================================================

@app.get("/api/vscode/analytics")
async def get_analytics(user_data: dict = Depends(verify_token)):
    """
    Get analytics dashboard (premium feature)
    """
    if user_data['plan'] in ['community']:
        raise HTTPException(status_code=403, detail="Analytics require Pioneer or monthly subscription")
    
    # Mock analytics data
    return {
        "usage_stats": {
            "deployments_today": 3,
            "errors_resolved": 12,
            "ai_suggestions_used": 8,
            "uptime_percentage": 99.2
        },
        "recent_activity": [
            {"type": "deploy", "status": "success", "timestamp": "2025-11-25T06:30:00Z"},
            {"type": "ai_fix", "status": "applied", "timestamp": "2025-11-25T06:25:00Z"},
            {"type": "scan", "status": "completed", "timestamp": "2025-11-25T06:20:00Z"}
        ],
        "health_score": 85
    }

# =============================================================================
# 🛡️ ERROR HANDLERS
# =============================================================================

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return {"success": False, "error": exc.detail}

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    return {"success": False, "error": "Internal server error"}

# =============================================================================
# 🚀 UTILITY ENDPOINTS
# =============================================================================

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

@app.get("/api/vscode/version")
async def get_api_version():
    """Get API version"""
    return {"version": "1.0.0", "features": ["auth", "license_check", "ai_suggestions", "deploy"]}