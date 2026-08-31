from sqlalchemy import Column, Integer, String, Boolean, Text
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    senha_hash = Column(String, nullable=True)
    cargo = Column(String, default="aluno")  # 'dona', 'desenvolvedor', 'aluno'
    email_verified = Column(Boolean, default=False)
    verification_code = Column(String, nullable=True)
    reset_password_code = Column(String, nullable=True) # Código de 6 dígitos para redefinição de senha
    auth_provider = Column(String, default="local") # 'local', 'google'
    last_password_change = Column(String, nullable=True) # ISO string da data da última troca
    foto_url = Column(String, nullable=True) # URL da foto de perfil ou avatar customizado
    completion_email_sent = Column(Boolean, default=False) # Flag para evitar reenvio duplicado do e-mail de certificado
    telefone = Column(String, nullable=True) # WhatsApp com DDI e DDD (ex: +5583999999999)
    whatsapp_notifications_enabled = Column(Boolean, default=True) # Preferência do aluno
    last_active_at = Column(String, nullable=True) # Data/hora do último acesso à plataforma

class Module(Base):
    __tablename__ = "modules"

    id = Column(Integer, primary_key=True, index=True)
    slug_id = Column(String, unique=True, index=True) # Ex: "fundamentos"
    title = Column(String)
    description = Column(String)
    icon_name = Column(String) # Nome do ícone da lucide-react (ex: "Stethoscope")
    progress = Column(Integer, default=0)
    resources = Column(String) # Será uma string separada por vírgula "Vídeo, Quiz"
    image_url = Column(String)
    delay = Column(Integer, default=0) # Armazenaremos como inteiro (delay * 10) para facilitar, ou Float.

class PageContent(Base):
    __tablename__ = "page_content"
    
    id = Column(Integer, primary_key=True, index=True)
    page_name = Column(String, unique=True, index=True) # ex: "modulos", "biblioteca", "glossario"
    content = Column(String) # Texto rico / HTML longo (versão publicada)
    draft_content = Column(String, nullable=True) # Texto em rascunho
    meta_title = Column(String, nullable=True)
    meta_description = Column(String, nullable=True)
    slug = Column(String, nullable=True)

class PageRevision(Base):
    __tablename__ = "page_revisions"

    id = Column(Integer, primary_key=True, index=True)
    page_name = Column(String, index=True)
    content = Column(String)
    author_name = Column(String)
    created_at = Column(String)
    description = Column(String, nullable=True)

class MediaFile(Base):
    __tablename__ = "media_files"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, index=True)
    file_url = Column(String)
    uploaded_at = Column(String)

class InteractiveResource(Base):
    __tablename__ = "interactive_resources"

    id = Column(Integer, primary_key=True, index=True)
    module_slug = Column(String, index=True) # Ligado ao slug_id do Module
    type = Column(String) # 'quiz', 'flashcard', 'video', 'podcast'
    title = Column(String)
    content_json = Column(String) # Dados estruturados em JSON

class UserActivityProgress(Base):
    __tablename__ = "user_activity_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    module_slug = Column(String, index=True)
    activity_id = Column(String, index=True) # ID do bloco ou quiz
    completed = Column(Boolean, default=False)
    completed_at = Column(String, nullable=True) # Data ISO de conclusão

class GuestActivityProgress(Base):
    __tablename__ = "guest_activity_progress"

    id = Column(Integer, primary_key=True, index=True)
    guest_id = Column(String, index=True) # UUID do navegador / localStorage
    ip_address = Column(String, index=True) # IP do visitante (computador ou celular)
    user_agent = Column(String, nullable=True) # Navegador / aparelho
    module_slug = Column(String, index=True)
    activity_id = Column(String, index=True)
    completed = Column(Boolean, default=False)
    completed_at = Column(String, nullable=True)
    updated_at = Column(String, nullable=True)

class GuestQuizAnswer(Base):
    __tablename__ = "guest_quiz_answers"

    id = Column(Integer, primary_key=True, index=True)
    guest_id = Column(String, index=True)
    ip_address = Column(String, index=True)
    module_slug = Column(String, index=True, nullable=True)
    block_id = Column(String, index=True)
    question_index = Column(Integer)
    selected_option = Column(Integer)
    is_correct = Column(Boolean)
    answered_at = Column(String, nullable=True)

class UserQuizAnswer(Base):
    __tablename__ = "user_quiz_answers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    module_slug = Column(String, index=True, nullable=True)
    block_id = Column(String, index=True)
    question_index = Column(Integer)
    selected_option = Column(Integer)
    is_correct = Column(Boolean)
    answered_at = Column(String, nullable=True)

class ModuleComment(Base):
    __tablename__ = "module_comments"

    id = Column(Integer, primary_key=True, index=True)
    module_slug = Column(String, index=True)
    user_id = Column(Integer, index=True)
    author_name = Column(String)
    author_role = Column(String, default="aluno")
    author_avatar = Column(String, nullable=True)
    content = Column(Text)
    created_at = Column(String)
    is_pinned = Column(Boolean, default=False)
    likes_count = Column(Integer, default=0)
    parent_id = Column(Integer, index=True, nullable=True)

class UserSessionLog(Base):
    __tablename__ = "user_session_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=True)
    guest_id = Column(String, index=True, nullable=True)
    module_slug = Column(String, index=True, nullable=True)
    duration_seconds = Column(Integer, default=0)
    started_at = Column(String)
    last_ping_at = Column(String)

class NotificationLog(Base):
    __tablename__ = "notification_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=True)
    type = Column(String, default="whatsapp") # "whatsapp", "email"
    recipient = Column(String, index=True)
    title = Column(String, nullable=True)
    content = Column(Text)
    status = Column(String, default="sent") # "sent", "failed", "simulated"
    sent_at = Column(String)

class UserBadge(Base):
    __tablename__ = "user_badges"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=False)
    badge_key = Column(String, index=True, nullable=False) # "first_step", "module_1", "master_symptoms", etc.
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    icon = Column(String, default="Award") # Icon name
    category = Column(String, default="milestone") # "milestone", "knowledge", "engagement"
    xp_points = Column(Integer, default=50)
    unlocked_at = Column(String)

class ForumPost(Base):
    __tablename__ = "forum_posts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=False)
    author_name = Column(String, nullable=False)
    author_role = Column(String, default="aluno")
    author_avatar = Column(String, nullable=True)
    category = Column(String, default="casos_clinicos", index=True) # "casos_clinicos", "duvidas", "experiencias", "avisos"
    module_slug = Column(String, index=True, nullable=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    likes_count = Column(Integer, default=0)
    replies_count = Column(Integer, default=0)
    is_pinned = Column(Boolean, default=False)
    is_solved = Column(Boolean, default=False)
    created_at = Column(String, nullable=False)
    updated_at = Column(String, nullable=True)

class ForumReply(Base):
    __tablename__ = "forum_replies"

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, index=True, nullable=False)
    user_id = Column(Integer, index=True, nullable=False)
    author_name = Column(String, nullable=False)
    author_role = Column(String, default="aluno")
    author_avatar = Column(String, nullable=True)
    content = Column(Text, nullable=False)
    likes_count = Column(Integer, default=0)
    is_instructor_answer = Column(Boolean, default=False)
    created_at = Column(String, nullable=False)

class ForumPostLike(Base):
    __tablename__ = "forum_post_likes"

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, index=True, nullable=False)
    user_id = Column(Integer, index=True, nullable=False)

class ForumReplyLike(Base):
    __tablename__ = "forum_reply_likes"

    id = Column(Integer, primary_key=True, index=True)
    reply_id = Column(Integer, index=True, nullable=False)
    user_id = Column(Integer, index=True, nullable=False)

class SystemAnnouncement(Base):
    __tablename__ = "system_announcements"

    id = Column(Integer, primary_key=True, index=True)
    message = Column(Text, nullable=False)
    link_url = Column(String, nullable=True)
    link_text = Column(String, nullable=True)
    type = Column(String, default="info") # "info", "warning", "success"
    is_active = Column(Boolean, default=False)
    updated_at = Column(String, nullable=True)







