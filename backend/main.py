import os
import shutil
from datetime import datetime
from typing import Optional
from fastapi import FastAPI, HTTPException, Depends, status, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
import httpx
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from sqlalchemy import text

from database import engine, get_db
import models
import schemas
import auth

import seed
import email_service

load_dotenv()

models.Base.metadata.create_all(bind=engine)

# Migração simples para SQLite (se as colunas não existirem, adiciona)
with engine.connect() as conn:
    try:
        conn.execute(text("ALTER TABLE page_content ADD COLUMN draft_content VARCHAR"))
        conn.execute(text("ALTER TABLE page_content ADD COLUMN meta_title VARCHAR"))
        conn.execute(text("ALTER TABLE page_content ADD COLUMN meta_description VARCHAR"))
        conn.execute(text("ALTER TABLE page_content ADD COLUMN slug VARCHAR"))
    except Exception:
        pass
    try:
        conn.execute(text("ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT 0"))
        conn.execute(text("ALTER TABLE users ADD COLUMN verification_code VARCHAR"))
        conn.execute(text("ALTER TABLE users ADD COLUMN auth_provider VARCHAR DEFAULT 'local'"))
        conn.execute(text("ALTER TABLE users ADD COLUMN last_password_change VARCHAR"))
        conn.execute(text("ALTER TABLE users ADD COLUMN foto_url VARCHAR"))
    except Exception:
        pass
    try:
        conn.commit()
    except Exception:
        pass

# Auto-seed inicial para garantir dados no Render mesmo em ambientes voláteis
seed.seed_users()
seed.seed_modules()
seed.seed_pages()

app = FastAPI()

# Configura pasta para upload de mídias
os.makedirs("static/uploads", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Permitir requisições tanto locais quanto do seu site oficial
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://palieduca.com.br",
        "https://www.palieduca.com.br",
        "https://pedromartinspe07.github.io"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = auth.decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido ou expirado")
    
    email = payload.get("sub")
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuário não encontrado")
    return user

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: list[ChatMessage]

SYSTEM_PROMPT = {
    "role": "system",
    "content": "Você é um assistente virtual especialista em Enfermagem e Cuidados Paliativos. Seu tom deve ser sempre acolhedor, empático, profissional e pautado na ética de enfermagem. Suas respostas devem focar no alívio do sofrimento, controle de sintomas (dor, dispneia, etc.) e apoio psicológico ao paciente e à família. Se o usuário perguntar sobre tópicos fora da área da saúde ou cuidados paliativos, redirecione educadamente a conversa de volta para o seu propósito principal. Não prescreva medicamentos, apenas discuta manejos baseados em evidências."
}

@app.get("/api/health")
async def health_check():
    return {"status": "ok"}

@app.post("/api/auth/register")
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        if not db_user.email_verified:
            # Reenvia código se ainda não confirmou
            code = email_service.generate_verification_code()
            db_user.verification_code = code
            db.commit()
            email_service.send_verification_email(db_user.email, db_user.nome, code)
            return {
                "require_verification": True,
                "email": db_user.email,
                "message": "Conta já cadastrada aguardando verificação. Novo código enviado para o seu e-mail!"
            }
        raise HTTPException(status_code=400, detail="Email já cadastrado")
    
    hashed_password = auth.get_password_hash(user.senha)
    code = email_service.generate_verification_code()
    
    # Se for conta dona ou desenvolvedor já nasce verificada
    is_admin = user.cargo in ["dona", "desenvolvedor"]
    
    new_user = models.User(
        email=user.email,
        nome=user.nome,
        senha_hash=hashed_password,
        cargo=user.cargo or "aluno",
        email_verified=is_admin,
        verification_code=None if is_admin else code,
        auth_provider="local"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    if not is_admin:
        email_service.send_verification_email(new_user.email, new_user.nome, code)
        return {
            "require_verification": True,
            "email": new_user.email,
            "message": f"Enviamos um código de confirmação de 6 dígitos para {new_user.email}."
        }
    
    # Se for admin, já loga direto
    access_token = auth.create_access_token(data={"sub": new_user.email, "role": new_user.cargo})
    return {
        "require_verification": False,
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": new_user.id,
            "email": new_user.email,
            "nome": new_user.nome,
            "cargo": new_user.cargo
        }
    }

@app.post("/api/auth/verify-email")
def verify_email(data: schemas.VerifyEmailRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")
    
    if user.email_verified:
        access_token = auth.create_access_token(data={"sub": user.email, "role": user.cargo})
        return {
            "message": "E-mail já verificado!",
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "email": user.email,
                "nome": user.nome,
                "cargo": user.cargo
            }
        }
    
    if not user.verification_code or user.verification_code.strip() != data.code.strip():
        raise HTTPException(status_code=400, detail="Código de verificação incorreto ou expirado.")
    
    user.email_verified = True
    user.verification_code = None
    db.commit()
    db.refresh(user)
    
    access_token = auth.create_access_token(data={"sub": user.email, "role": user.cargo})
    return {
        "message": "E-mail verificado com sucesso!",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "nome": user.nome,
            "cargo": user.cargo
        }
    }

@app.post("/api/auth/resend-code")
def resend_verification_code(data: schemas.ResendCodeRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")
    
    if user.email_verified:
        return {"message": "Este e-mail já está verificado."}
    
    code = email_service.generate_verification_code()
    user.verification_code = code
    db.commit()
    
    email_service.send_verification_email(user.email, user.nome, code)
    return {"message": f"Novo código enviado para {user.email}!"}

@app.post("/api/auth/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not user.senha_hash or not auth.verify_password(form_data.password, user.senha_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Se ainda não verificou o email (e não for dono/admin)
    if not user.email_verified and user.cargo == "aluno":
        # Reenvia código
        code = email_service.generate_verification_code()
        user.verification_code = code
        db.commit()
        email_service.send_verification_email(user.email, user.nome, code)
        
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Por favor, confirme seu e-mail antes de entrar. Um novo código de 6 dígitos foi enviado para a sua caixa de entrada."
        )
    
    access_token = auth.create_access_token(data={"sub": user.email, "role": user.cargo})
    
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "nome": user.nome,
            "cargo": user.cargo,
            "foto_url": user.foto_url
        }
    }

@app.post("/api/auth/google")
def google_auth(token_data: schemas.GoogleToken, db: Session = Depends(get_db)):
    idinfo = auth.verify_google_token(token_data.token)
    if not idinfo:
        raise HTTPException(status_code=401, detail="Token do Google inválido ou expirado.")
    
    email = idinfo.get("email")
    nome = idinfo.get("name", "Usuário do Google")
    
    # Verifica se o usuário já existe
    user = db.query(models.User).filter(models.User.email == email).first()
    
    # Se não existir, cria o usuário automaticamente com email já verificado pelo Google
    if not user:
        user = models.User(
            email=email,
            nome=nome,
            senha_hash=None, # Não tem senha local
            cargo="aluno",
            email_verified=True,
            auth_provider="google"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        # Se já existia, garante que está verificado
        if not user.email_verified:
            user.email_verified = True
            user.auth_provider = "google"
            db.commit()
            db.refresh(user)
        
    access_token = auth.create_access_token(data={"sub": user.email, "role": user.cargo})
    
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "nome": user.nome,
            "cargo": user.cargo,
            "foto_url": user.foto_url
        }
    }

@app.get("/api/auth/me", response_model=schemas.UserResponse)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user

@app.post("/api/auth/change-password")
def change_password(
    data: schemas.ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Verifica a senha atual se tiver senha cadastrada
    if current_user.senha_hash:
        if not auth.verify_password(data.current_password, current_user.senha_hash):
            raise HTTPException(status_code=400, detail="Senha atual incorreta.")
    
    # Validação de intervalo de 1 semana (7 dias)
    if current_user.last_password_change:
        try:
            last_change = datetime.fromisoformat(current_user.last_password_change)
            diff = datetime.now() - last_change
            if diff.total_seconds() < 7 * 24 * 3600:
                remaining_days = max(1, 7 - diff.days)
                raise HTTPException(
                    status_code=400,
                    detail=f"Por segurança, você só pode alterar a sua senha uma vez a cada 1 semana. Próxima alteração disponível em aproximadamente {remaining_days} dia(s)."
                )
        except Exception:
            pass

    if len(data.new_password) < 6:
        raise HTTPException(status_code=400, detail="A nova senha deve conter pelo menos 6 caracteres.")

    # Atualiza a senha e salva a data da troca
    current_user.senha_hash = auth.get_password_hash(data.new_password)
    current_user.last_password_change = datetime.now().isoformat()
    db.commit()
    db.refresh(current_user)

    return {
        "message": "Senha alterada com sucesso!",
        "last_password_change": current_user.last_password_change
    }

class PhotoUrlRequest(BaseModel):
    foto_url: str

@app.post("/api/auth/profile-photo")
async def update_profile_photo(
    file: UploadFile = File(None),
    foto_url: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    import shutil
    # Upload direto de arquivo
    if file and file.filename:
        filename_ext = os.path.splitext(file.filename)[1].lower()
        if filename_ext not in [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"]:
            raise HTTPException(status_code=400, detail="Formato de imagem inválido")
            
        unique_filename = f"avatar_{current_user.id}_{datetime.now().strftime('%Y%m%d%H%M%S')}{filename_ext}"
        file_path = os.path.join("static/uploads", unique_filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        current_user.foto_url = f"/static/uploads/{unique_filename}"
    elif foto_url:
        current_user.foto_url = foto_url.strip()
    else:
        raise HTTPException(status_code=400, detail="Nenhum arquivo ou URL de imagem fornecida.")
        
    db.commit()
    db.refresh(current_user)
    return {
        "message": "Foto de perfil atualizada com sucesso!",
        "foto_url": current_user.foto_url,
        "user": {
            "id": current_user.id,
            "email": current_user.email,
            "nome": current_user.nome,
            "cargo": current_user.cargo,
            "foto_url": current_user.foto_url
        }
    }

@app.delete("/api/auth/profile-photo")
def delete_profile_photo(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    current_user.foto_url = None
    db.commit()
    db.refresh(current_user)
    return {
        "message": "Foto de perfil removida.",
        "user": {
            "id": current_user.id,
            "email": current_user.email,
            "nome": current_user.nome,
            "cargo": current_user.cargo,
            "foto_url": None
        }
    }

@app.get("/api/modules", response_model=list[schemas.ModuleResponse])
def get_modules(db: Session = Depends(get_db)):
    return db.query(models.Module).all()

@app.put("/api/modules/{module_id}", response_model=schemas.ModuleResponse)
def update_module(
    module_id: int, 
    module_update: schemas.ModuleUpdate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.cargo not in ["dona", "desenvolvedor"]:
        raise HTTPException(status_code=403, detail="Sem permissão para editar conteúdo")
        
    db_module = db.query(models.Module).filter(models.Module.id == module_id).first()
    if not db_module:
        raise HTTPException(status_code=404, detail="Módulo não encontrado")
        
    db_module.title = module_update.title
    db_module.description = module_update.description
    db_module.image_url = module_update.image_url
    
    db.commit()
    db.refresh(db_module)
    return db_module

@app.get("/api/pages/{page_name}", response_model=schemas.PageContentResponse)
def get_page_content(page_name: str, db: Session = Depends(get_db)):
    page = db.query(models.PageContent).filter(models.PageContent.page_name == page_name).first()
    if not page:
        return schemas.PageContentResponse(id=0, page_name=page_name, content="")
    return page

@app.get("/api/pages/{page_name}/edit", response_model=schemas.PageContentResponse)
def get_page_content_edit(page_name: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.cargo not in ["dona", "desenvolvedor"]:
        raise HTTPException(status_code=403, detail="Sem permissão para editar conteúdo")
    
    page = db.query(models.PageContent).filter(models.PageContent.page_name == page_name).first()
    if not page:
        return schemas.PageContentResponse(id=0, page_name=page_name, content="")
    return page

@app.put("/api/pages/{page_name}/draft", response_model=schemas.PageContentResponse)
def update_page_draft(
    page_name: str, 
    page_update: schemas.PageContentUpdate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.cargo not in ["dona", "desenvolvedor"]:
        raise HTTPException(status_code=403, detail="Sem permissão para editar conteúdo")
        
    page = db.query(models.PageContent).filter(models.PageContent.page_name == page_name).first()
    if not page:
        page = models.PageContent(page_name=page_name, content="", draft_content=page_update.draft_content)
        if page_update.meta_title is not None: page.meta_title = page_update.meta_title
        if page_update.meta_description is not None: page.meta_description = page_update.meta_description
        if page_update.slug is not None: page.slug = page_update.slug
        db.add(page)
    else:
        if page_update.draft_content is not None: page.draft_content = page_update.draft_content
        if page_update.meta_title is not None: page.meta_title = page_update.meta_title
        if page_update.meta_description is not None: page.meta_description = page_update.meta_description
        if page_update.slug is not None: page.slug = page_update.slug
        
    db.commit()
    db.refresh(page)
    return page

@app.post("/api/pages/{page_name}/publish", response_model=schemas.PageContentResponse)
def publish_page_content(
    page_name: str, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.cargo not in ["dona", "desenvolvedor"]:
        raise HTTPException(status_code=403, detail="Sem permissão para editar conteúdo")
        
    page = db.query(models.PageContent).filter(models.PageContent.page_name == page_name).first()
    if not page or not page.draft_content:
        raise HTTPException(status_code=400, detail="Não há rascunho para publicar")
        
    # Salva no histórico de versões
    revision = models.PageRevision(
        page_name=page_name,
        content=page.content,
        author_name=current_user.nome,
        created_at=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        description="Publicação via Editor Visual"
    )
    db.add(revision)
    
    # Atualiza conteúdo ao vivo e limpa rascunho
    page.content = page.draft_content
    page.draft_content = None
    
    db.commit()
    db.refresh(page)
    return page

@app.get("/api/pages/{page_name}/revisions", response_model=list[schemas.PageRevisionResponse])
def get_page_revisions(page_name: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.cargo not in ["dona", "desenvolvedor"]:
        raise HTTPException(status_code=403, detail="Sem permissão")
    return db.query(models.PageRevision).filter(models.PageRevision.page_name == page_name).order_by(models.PageRevision.id.desc()).all()

@app.post("/api/pages/{page_name}/revisions/{revision_id}/restore", response_model=schemas.PageContentResponse)
def restore_page_revision(
    page_name: str, 
    revision_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.cargo not in ["dona", "desenvolvedor"]:
        raise HTTPException(status_code=403, detail="Sem permissão")
        
    revision = db.query(models.PageRevision).filter(models.PageRevision.id == revision_id, models.PageRevision.page_name == page_name).first()
    if not revision:
        raise HTTPException(status_code=404, detail="Revisão não encontrada")
        
    page = db.query(models.PageContent).filter(models.PageContent.page_name == page_name).first()
    if page:
        page.draft_content = revision.content
        db.commit()
        db.refresh(page)
        return page
    raise HTTPException(status_code=404, detail="Página não encontrada")

# ================================
# CMS v1 Routes (used by ModuleContentEditor)
# ================================

@app.get("/api/v1/cms/pages/{page_name}")
def get_cms_page(page_name: str, db: Session = Depends(get_db)):
    page = db.query(models.PageContent).filter(models.PageContent.page_name == page_name).first()
    if not page:
        return {"id": 0, "page_name": page_name, "content": "[]", "draft_content": None}
    return page

@app.put("/api/v1/cms/pages/{page_name}")
def update_cms_page(
    page_name: str,
    page_update: schemas.PageContentUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.cargo not in ["dona", "desenvolvedor"]:
        raise HTTPException(status_code=403, detail="Sem permissão")

    page = db.query(models.PageContent).filter(models.PageContent.page_name == page_name).first()
    if not page:
        page = models.PageContent(
            page_name=page_name,
            content=page_update.content or "[]",
            draft_content=page_update.draft_content
        )
        db.add(page)
    else:
        if page_update.content is not None:
            page.content = page_update.content
        if page_update.draft_content is not None:
            page.draft_content = page_update.draft_content

    # Save a revision for history
    revision = models.PageRevision(
        page_name=page_name,
        content=page.content,
        author_name=current_user.nome,
        created_at=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        description=page_update.slug or "Atualização via CMS"
    )
    db.add(revision)

    db.commit()
    db.refresh(page)
    return page

@app.post("/api/v1/cms/revisions/{revision_id}/restore")
def restore_cms_revision(
    revision_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.cargo not in ["dona", "desenvolvedor"]:
        raise HTTPException(status_code=403, detail="Sem permissão")

    revision = db.query(models.PageRevision).filter(models.PageRevision.id == revision_id).first()
    if not revision:
        raise HTTPException(status_code=404, detail="Revisão não encontrada")

    page = db.query(models.PageContent).filter(models.PageContent.page_name == revision.page_name).first()
    if not page:
        raise HTTPException(status_code=404, detail="Página não encontrada")

    page.content = revision.content
    page.draft_content = revision.content
    db.commit()
    db.refresh(page)
    return page

# ================================
# PageEditor: PUT /api/pages/{page_name} for saving content directly
# ================================

@app.put("/api/pages/{page_name}", response_model=schemas.PageContentResponse)
def update_page_content_direct(
    page_name: str,
    page_update: schemas.PageContentUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.cargo not in ["dona", "desenvolvedor"]:
        raise HTTPException(status_code=403, detail="Sem permissão para editar conteúdo")

    page = db.query(models.PageContent).filter(models.PageContent.page_name == page_name).first()
    if not page:
        page = models.PageContent(
            page_name=page_name,
            content=page_update.content or "[]",
            draft_content=page_update.draft_content
        )
        db.add(page)
    else:
        if page_update.content is not None:
            page.content = page_update.content
        if page_update.draft_content is not None:
            page.draft_content = page_update.draft_content

    db.commit()
    db.refresh(page)
    return page

@app.post("/api/chat")
async def chat(request: ChatRequest):
    groq_api_key = os.getenv("GROQ_API_KEY")
    if not groq_api_key:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY não configurada no servidor backend.")

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {groq_api_key}"
    }

    # Prepends the system prompt to the conversation history incoming from frontend
    ai_messages = [SYSTEM_PROMPT] + [msg.model_dump() for msg in request.messages]

    payload = {
        # Atualizado para o modelo atual e ativo da Groq
        "model": "llama-3.3-70b-versatile",
        "messages": ai_messages,
        "temperature": 0.7,
        "max_tokens": 1024
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers=headers,
                json=payload,
                timeout=30.0
            )
            response.raise_for_status()
            data = response.json()
            reply = data.get("choices", [{}])[0].get("message", {}).get("content")
            if not reply:
                raise ValueError("Resposta inválida da API do Groq.")
            return {"reply": reply}

        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/modules/{module_slug}/resources", response_model=list[schemas.InteractiveResourceResponse])
def get_interactive_resources(module_slug: str, db: Session = Depends(get_db)):
    return db.query(models.InteractiveResource).filter(models.InteractiveResource.module_slug == module_slug).all()

@app.post("/api/modules/{module_slug}/resources", response_model=schemas.InteractiveResourceResponse)
def create_interactive_resource(
    module_slug: str,
    resource: schemas.InteractiveResourceCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.cargo not in ["dona", "desenvolvedor"]:
        raise HTTPException(status_code=403, detail="Sem permissão")
    
    new_resource = models.InteractiveResource(
        module_slug=module_slug,
        type=resource.type,
        title=resource.title,
        content_json=resource.content_json
    )
    db.add(new_resource)
    db.commit()
    db.refresh(new_resource)
    return new_resource

@app.put("/api/resources/{resource_id}", response_model=schemas.InteractiveResourceResponse)
def update_interactive_resource(
    resource_id: int,
    resource_update: schemas.InteractiveResourceUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.cargo not in ["dona", "desenvolvedor"]:
        raise HTTPException(status_code=403, detail="Sem permissão")
        
    db_resource = db.query(models.InteractiveResource).filter(models.InteractiveResource.id == resource_id).first()
    if not db_resource:
        raise HTTPException(status_code=404, detail="Recurso não encontrado")
        
    db_resource.title = resource_update.title
    db_resource.content_json = resource_update.content_json
    db.commit()
    db.refresh(db_resource)
    return db_resource

@app.delete("/api/resources/{resource_id}")
def delete_interactive_resource(
    resource_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.cargo not in ["dona", "desenvolvedor"]:
        raise HTTPException(status_code=403, detail="Sem permissão")
        
    db_resource = db.query(models.InteractiveResource).filter(models.InteractiveResource.id == resource_id).first()
    if not db_resource:
        raise HTTPException(status_code=404, detail="Recurso não encontrado")
        
    db.delete(db_resource)
    db.commit()
    return {"message": "Recurso deletado com sucesso"}

# ================================
# Biblioteca de Mídia
# ================================

@app.post("/api/media/upload", response_model=schemas.MediaFileResponse)
async def upload_media_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.cargo not in ["dona", "desenvolvedor"]:
        raise HTTPException(status_code=403, detail="Sem permissão")
        
    # Salvar arquivo no disco
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    safe_filename = f"{timestamp}_{file.filename}"
    file_path = f"static/uploads/{safe_filename}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # A URL que será devolvida pro frontend (caminho relativo)
    file_url = f"/static/uploads/{safe_filename}"
    
    # Salvar no banco
    media = models.MediaFile(
        filename=file.filename,
        file_url=file_url,
        uploaded_at=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    )
    db.add(media)
    db.commit()
    db.refresh(media)
class DriveLinkRequest(BaseModel):
    url: str
    filename: str | None = None

@app.post("/api/media/drive-link", response_model=schemas.MediaFileResponse)
def add_google_drive_link(
    data: DriveLinkRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.cargo not in ["dona", "desenvolvedor"]:
        raise HTTPException(status_code=403, detail="Sem permissão")

    url = data.url.strip()
    import re
    match = re.search(r"/d/([a-zA-Z0-9_-]+)", url) or re.search(r"[?&]id=([a-zA-Z0-9_-]+)", url)
    if not match:
        raise HTTPException(status_code=400, detail="Link do Google Drive inválido. Use o link de compartilhamento da imagem.")

    file_id = match.group(1)
    cdn_url = f"https://lh3.googleusercontent.com/d/{file_id}"
    safe_filename = data.filename or f"GoogleDrive_{file_id[:8]}.jpg"

    media = models.MediaFile(
        filename=safe_filename,
        file_url=cdn_url,
        uploaded_at=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    )
    db.add(media)
    db.commit()
    db.refresh(media)
    return media

@app.post("/api/media/workdrive-link", response_model=schemas.MediaFileResponse)
def add_zoho_workdrive_link(
    data: DriveLinkRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.cargo not in ["dona", "desenvolvedor"]:
        raise HTTPException(status_code=403, detail="Sem permissão")

    url = data.url.strip()
    import re
    # Match Zoho WorkDrive file id (ex: /file/12345 or /embed/12345 or /download/12345)
    match = re.search(r"/(?:file|embed|download|open)/([a-zA-Z0-9_-]+)", url) or re.search(r"[?&]id=([a-zA-Z0-9_-]+)", url)
    
    if match:
        file_id = match.group(1)
        # Zoho WorkDrive embed / download link
        if "zohopublic" in url:
            direct_url = f"https://workdrive.zohopublic.com/download/{file_id}"
        elif "zohoexternal" in url:
            direct_url = f"https://workdrive.zohoexternal.com/download/{file_id}"
        else:
            direct_url = f"https://workdrive.zoho.com/download/{file_id}"
        safe_filename = data.filename or f"ZohoWorkDrive_{file_id[:8]}.jpg"
    else:
        # Se for link direto de imagem do Zoho
        direct_url = url
        safe_filename = data.filename or f"ZohoWorkDrive_{datetime.now().strftime('%H%M%S')}.jpg"

    media = models.MediaFile(
        filename=safe_filename,
        file_url=direct_url,
        uploaded_at=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    )
    db.add(media)
    db.commit()
    db.refresh(media)
    return media

@app.get("/api/media", response_model=list[schemas.MediaFileResponse])
def get_media_files(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.cargo not in ["dona", "desenvolvedor"]:
        raise HTTPException(status_code=403, detail="Sem permissão")
    return db.query(models.MediaFile).order_by(models.MediaFile.id.desc()).all()

@app.delete("/api/media/{media_id}")
def delete_media_file(
    media_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.cargo not in ["dona", "desenvolvedor"]:
        raise HTTPException(status_code=403, detail="Sem permissão")
        
    media = db.query(models.MediaFile).filter(models.MediaFile.id == media_id).first()
    if not media:
        raise HTTPException(status_code=404, detail="Arquivo não encontrado")
        
    # Remover arquivo físico
    file_path = media.file_url.lstrip("/") # de /static/uploads/x.jpg para static/uploads/x.jpg
    if os.path.exists(file_path):
        os.remove(file_path)
        
    db.delete(media)
    db.commit()
    return {"message": "Arquivo deletado"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)