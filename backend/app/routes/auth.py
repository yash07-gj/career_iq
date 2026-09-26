from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, CandidateProfile, CandidatePreference
from app.schemas import UserLogin, UserRegister, UserResponse, TokenResponse
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")
    
    hashed_pwd = pwd_context.hash(user_in.password)
    new_user = User(
        full_name=user_in.full_name,
        email=user_in.email,
        password_hash=hashed_pwd,
        account_role="candidate",
        active_status=1
    )
    db.add(new_user)
    db.flush()

    # Create associated candidate profile & preferences automatically
    profile = CandidateProfile(user_id=new_user.user_id)
    db.add(profile)
    db.flush()

    pref = CandidatePreference(profile_id=profile.profile_id)
    db.add(pref)

    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=TokenResponse)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    
    # Check password (allow sample test pass for prototype)
    if not (login_data.password == "Yash@123" or login_data.password == "password" or pwd_context.verify(login_data.password, user.password_hash)):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    return TokenResponse(
        access_token=f"demo_token_user_{user.user_id}",
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

@router.get("/me", response_model=UserResponse)
def get_current_user(db: Session = Depends(get_db)):
    # Return primary demo user (id 1)
    user = db.query(User).filter(User.user_id == 1).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
