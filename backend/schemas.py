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

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    code: str
    new_password: str

class ContactMessageRequest(BaseModel):
    nome: str
    email: EmailStr
    assunto: str
    categoria: Optional[str] = "Dúvidas Acadêmicas"
    mensagem: str

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

class PageRevisionCreate(BaseModel):
    content: str
    description: Optional[str] = "Ponto de restauração manual"
    author_name: Optional[str] = None

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

class GuestActivityToggleRequest(BaseModel):
    guest_id: str
    module_slug: str
    activity_id: str
    completed: bool

class ActivityProgressResponse(BaseModel):
    completed_activities: list[str] # Lista de IDs concluídos
    module_progress: dict[str, dict] # { "fundamentos": { "completed": 2, "total": 4, "percentage": 50 } }
    overall_percentage: int # Porcentagem global do curso
    total_completed: int
    total_activities: int

# Schemas de Quizzes (Visitantes e Alunos)
class QuizAnswerSubmitRequest(BaseModel):
    guest_id: Optional[str] = None
    module_slug: Optional[str] = None
    block_id: str
    question_index: int
    selected_option: int
    is_correct: bool

class QuizAnswerItem(BaseModel):
    block_id: str
    question_index: int
    selected_option: int
    is_correct: bool
    answered_at: Optional[str] = None

class GuestSyncRequest(BaseModel):
    guest_id: Optional[str] = None
    completed_activities: Optional[list[str]] = []
    quiz_answers: Optional[list[dict]] = []

# Schema de Validação Pública de Certificados
class CertificateValidationResponse(BaseModel):
    valid: bool
    code: str
    student_name: Optional[str] = None
    student_id: Optional[int] = None
    course_name: str = "Cuidados Paliativos em Enfermagem"
    workload_hours: int = 40
    institution: str = "Universidade Federal da Paraíba (UFPB)"
    department: str = "Departamento de Enfermagem"
    coordinator: str = "Prof.ª Patrícia Maria de Oliveira Andrade"
    issue_date: Optional[str] = None
    issue_year: Optional[int] = None
    status_label: str
    message: str



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
    target_type: Optional[str] = "full_page" # "full_page", "cards", "quiz", "text", "hero", "flashcard", "clinical_case"
    context_module: Optional[str] = None
    level: Optional[str] = "graduacao_pos"

class AIGenerateBlocksResponse(BaseModel):
    summary: str
    blocks: list[dict]

class AIEditBlockRequest(BaseModel):
    instruction: str
    block: dict
    action: Optional[str] = "edit" # "edit", "expand", "clinical_tone", "add_examples", "summarize", "to_quiz", "to_flashcards"
    context_module: Optional[str] = None
    all_blocks_context: Optional[list[dict]] = None

class AIEditBlockResponse(BaseModel):
    summary: str
    block: dict
    alternative_block: Optional[dict] = None

class ImageSearchItem(BaseModel):
    id: str
    title: str
    category: str
    url: str
    thumb_url: str
    author: str

class CreateCommentRequest(BaseModel):
    content: str
    parent_id: Optional[int] = None

class CommentResponse(BaseModel):
    id: int
    module_slug: str
    user_id: int
    author_name: str
    author_role: str
    author_avatar: Optional[str] = None
    content: str
    created_at: str
    is_pinned: bool = False
    likes_count: int = 0
    parent_id: Optional[int] = None
    replies: list[dict] = []

    class Config:
        from_attributes = True

# Schemas de Analytics Avançado
class SessionPingRequest(BaseModel):
    module_slug: Optional[str] = None
    duration_seconds: int = 30
    guest_id: Optional[str] = None

class QuizHeatmapItem(BaseModel):
    block_id: str
    module_slug: Optional[str] = None
    question_index: int
    total_attempts: int
    correct_count: int
    error_count: int
    error_rate_percentage: int

class DailyTimelineItem(BaseModel):
    date: str
    active_users: int
    activities_completed: int

class DetailedEngagementMetrics(BaseModel):
    average_study_minutes_per_module: dict[str, int]
    abandonment_rates: dict[str, int]
    quiz_error_heatmap: list[QuizHeatmapItem]
    activity_timeline: list[DailyTimelineItem]
    total_study_hours: float
    most_difficult_module: Optional[str] = None

# Schemas de Notificações & WhatsApp
class NotificationPreferencesRequest(BaseModel):
    telefone: Optional[str] = None
    whatsapp_notifications_enabled: bool = True

class TestWhatsAppRequest(BaseModel):
    telefone: str
    mensagem: Optional[str] = None

class BroadcastNotificationRequest(BaseModel):
    channel: str = "whatsapp" # "whatsapp", "email", "both"
    target_group: str = "all" # "all", "inactive_5_days", "in_progress", "completed"
    title: str = "Comunicado PaliEduca"
    message: str

class NotificationLogResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    type: str
    recipient: str
    title: Optional[str] = None
    content: str
    status: str
    sent_at: str

    class Config:
        from_attributes = True

# ─── Gamificação & Conquistas ───
class BadgeItemResponse(BaseModel):
    key: str
    title: str
    description: str
    icon: str
    category: str
    xp_points: int
    unlocked: bool
    unlocked_at: Optional[str] = None

class UserGamificationProfileResponse(BaseModel):
    total_xp: int
    current_level: int
    level_title: str
    next_level_xp: int
    badges_unlocked_count: int
    total_badges_count: int
    completion_percentage: int
    badges: list[BadgeItemResponse]

class LeaderboardItemResponse(BaseModel):
    rank: int
    user_id: int
    nome: str
    foto_url: Optional[str] = None
    total_xp: int
    level_title: str
    badges_count: int
    is_current_user: bool = False

# ─── Comunidade & Fórum de Casos Clínicos ───
class ForumPostCreateRequest(BaseModel):
    title: str
    content: str
    category: str = "casos_clinicos" # "casos_clinicos", "duvidas", "experiencias", "avisos"
    module_slug: Optional[str] = None

class ForumReplyCreateRequest(BaseModel):
    content: str

class ForumReplyResponse(BaseModel):
    id: int
    post_id: int
    user_id: int
    author_name: str
    author_role: str
    author_avatar: Optional[str] = None
    content: str
    likes_count: int
    is_instructor_answer: bool
    created_at: str
    has_liked: bool = False

    class Config:
        from_attributes = True

class ForumPostListItemResponse(BaseModel):
    id: int
    user_id: int
    author_name: str
    author_role: str
    author_avatar: Optional[str] = None
    category: str
    module_slug: Optional[str] = None
    title: str
    content: str
    likes_count: int
    replies_count: int
    is_pinned: bool
    is_solved: bool
    created_at: str
    has_liked: bool = False

    class Config:
        from_attributes = True

class ForumPostDetailResponse(BaseModel):
    post: ForumPostListItemResponse
    replies: list[ForumReplyResponse]

# ─── Avisos & Banner Global do Sistema ───
class SystemAnnouncementPayload(BaseModel):
    message: str
    link_url: Optional[str] = None
    link_text: Optional[str] = None
    type: str = "info" # "info", "warning", "success"
    is_active: bool = True

class SystemAnnouncementResponse(BaseModel):
    id: int
    message: str
    link_url: Optional[str] = None
    link_text: Optional[str] = None
    type: str
    is_active: bool
    updated_at: Optional[str] = None

    class Config:
        from_attributes = True






