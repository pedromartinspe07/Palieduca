from sqlalchemy import Column, Integer, String, Boolean
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
    auth_provider = Column(String, default="local") # 'local', 'google'
    last_password_change = Column(String, nullable=True) # ISO string da data da última troca
    foto_url = Column(String, nullable=True) # URL da foto de perfil ou avatar customizado

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

