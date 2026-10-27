from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.schemas.auth import LoginInput, RegisterInput
from backend.app.security import password_hash

router = APIRouter(prefix="/api/auth", tags=["Autenticação"])


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(
    payload: RegisterInput,
    request: Request,
    db: Session = Depends(get_db),
):
    email = str(payload.email).strip().lower()
    existing_user = db.scalar(select(User).where(User.email == email))

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Este e-mail já está cadastrado.",
        )

    user = User(
        name=payload.name.strip(),
        email=email,
        password_hash=password_hash.hash(payload.password),
    )

    # INSERT: adiciona o novo usuário e persiste os dados no SQLite.
    db.add(user)
    db.commit()
    db.refresh(user)

    request.session.clear()
    request.session["user_id"] = user.id

    return {
        "message": "Conta criada com sucesso.",
        "user": {"id": user.id, "name": user.name, "email": user.email},
    }


@router.post("/login")
def login(
    payload: LoginInput,
    request: Request,
    db: Session = Depends(get_db),
):
    email = str(payload.email).strip().lower()
    user = db.scalar(select(User).where(User.email == email))

    if not user or not password_hash.verify(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha inválidos.",
        )

    request.session.clear()
    request.session["user_id"] = user.id

    return {
        "message": "Login realizado com sucesso.",
        "user": {"id": user.id, "name": user.name, "email": user.email},
    }


@router.post("/logout")
def logout(request: Request):
    request.session.clear()
    return {"message": "Você saiu da sua conta."}


@router.get("/me")
def current_user(request: Request, db: Session = Depends(get_db)):
    user_id = request.session.get("user_id")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Você não está autenticado.",
        )

    user = db.get(User, user_id)
    if not user:
        request.session.clear()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sessão inválida. Entre novamente.",
        )

    return {"user": {"id": user.id, "name": user.name, "email": user.email}}
