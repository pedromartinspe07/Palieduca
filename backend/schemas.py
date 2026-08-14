from pydantic import BaseModel, EmailStr
from typing import Optional

class UserBase(BaseModel):
    email: EmailStr
    nome: str
    cargo: Optional[str] = "aluno"
    email_verified: Optional[bool] = False
    last_password_change: Optional[str] = None
    foto_url: Optional[str] = None

class UserCreate(UserBase):
    senha: str

class UserLogin(BaseModel):
    email: EmailStr
    senha: str

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

class VerifyEmailRequest(BaseModel):
    email: EmailStr
    code: str

class ResendCodeRequest(BaseModel):
    email: EmailStr

class UserResponse(UserBase):
    id: int

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class GoogleToken(BaseModel):
    token: str

class ModuleBase(BaseModel):
    slug_id: str
    title: str
    description: str
    icon_name: str
    progress: int
    resources: str
    image_url: str
    delay: int

class ModuleUpdate(BaseModel):
    title: str
    description: str
    image_url: str

class ModuleResponse(ModuleBase):
    id: int

    class Config:
        from_attributes = True

class PageContentBase(BaseModel):
    page_name: str
    content: str
    draft_content: Optional[str] = None
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    slug: Optional[str] = None

class PageContentUpdate(BaseModel):
    content: Optional[str] = None
    draft_content: Optional[str] = None
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    slug: Optional[str] = None

class PageContentResponse(PageContentBase):
    id: int

    class Config:
        from_attributes = True

class PageRevisionResponse(BaseModel):
    id: int
    page_name: str
    content: str
    author_name: str
    created_at: str
    description: Optional[str] = None

    class Config:
        from_attributes = True

class MediaFileResponse(BaseModel):
    id: int
    filename: str
    file_url: str
    uploaded_at: str

    class Config:
        from_attributes = True

class InteractiveResourceBase(BaseModel):
    module_slug: str
    type: str
    title: str
    content_json: str

class InteractiveResourceCreate(InteractiveResourceBase):
    pass

class InteractiveResourceUpdate(BaseModel):
    title: str
    content_json: str

class InteractiveResourceResponse(InteractiveResourceBase):
    id: int

    class Config:
        from_attributes = True

# Schemas de Progresso Granular
class ActivityToggleRequest(BaseModel):
    module_slug: str
    activity_id: str
    completed: bool

class ActivityProgressResponse(BaseModel):
    completed_activities: list[str] # Lista de IDs concluídos
    module_progress: dict[str, dict] # { "fundamentos": { "completed": 2, "total": 4, "percentage": 50 } }
    overall_percentage: int # Porcentagem global do curso
    total_completed: int
    total_activities: int

# Schemas de Gestão da Dona / Admin
class StudentMetricItem(BaseModel):
    id: int
    nome: str
    email: str
    email_verified: bool
    cargo: str
    foto_url: Optional[str] = None
    completed_activities_count: int
    total_activities_count: int
    progress_percentage: int
    points: int
    is_certificate_eligible: bool

class UserRoleUpdateRequest(BaseModel):
    cargo: str

class AdminDashboardMetrics(BaseModel):
    total_students: int
    total_team_members: int
    total_modules: int
    total_activities: int
    average_progress_percentage: int
    status_distribution: dict # { "completed": int, "in_progress": int, "not_started": int }
    module_stats: list[dict] # [ { "slug": str, "title": str, "activities_count": int, "completion_rate": int } ]
    students: list[StudentMetricItem]
    all_users: list[StudentMetricItem]

# Schemas do Agente IA Construtor de Páginas e Imagens
class AIGenerateBlocksRequest(BaseModel):
    prompt: str
    target_type: Optional[str] = "full_page" # "full_page", "cards", "quiz", "text", "hero", "flashcard"
    context_module: Optional[str] = None

class AIGenerateBlocksResponse(BaseModel):
    summary: str
    blocks: list[dict]

class ImageSearchItem(BaseModel):
    id: str
    title: str
    category: str
    url: str
    thumb_url: str
    author: str
