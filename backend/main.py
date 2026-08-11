import os
import shutil
from datetime import datetime
from fastapi import FastAPI, HTTPException, Depends, status, UploadFile, File
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

load_dotenv()

models.Base.metadata.create_all(bind=engine)

# Migração simples para SQLite (se as colunas não existirem, adiciona)
with engine.connect() as conn:
    try:
        conn.execute(text("ALTER TABLE page_content ADD COLUMN draft_content VARCHAR"))
        conn.execute(text("ALTER TABLE page_content ADD COLUMN meta_title VARCHAR"))
        conn.execute(text("ALTER TABLE page_content ADD COLUMN meta_description VARCHAR"))
        conn.execute(text("ALTER TABLE page_content ADD COLUMN slug VARCHAR"))
        conn.commit()
    except Exception:
        pass # Ignora se já existirem

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

@app.post("/api/auth/register", response_model=schemas.UserResponse)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email já cadastrado")
    
    hashed_password = auth.get_password_hash(user.senha)
    new_user = models.User(
        email=user.email,
        nome=user.nome,
        senha_hash=hashed_password,
        cargo=user.cargo or "aluno"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/api/auth/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not user.senha_hash or not auth.verify_password(form_data.password, user.senha_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = auth.create_access_token(data={"sub": user.email, "role": user.cargo})
    
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "nome": user.nome,
            "cargo": user.cargo
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
    
    # Se não existir, cria o usuário automaticamente
    if not user:
        user = models.User(
            email=email,
            nome=nome,
            senha_hash=None, # Não tem senha local
            cargo="aluno"
        )
        db.add(user)
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
            "cargo": user.cargo
        }
    }

@app.get("/api/auth/me", response_model=schemas.UserResponse)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user

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