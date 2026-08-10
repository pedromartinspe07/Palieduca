from sqlalchemy import Column, Integer, String
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    senha_hash = Column(String)
    cargo = Column(String, default="aluno")  # 'dono', 'desenvolvedor', 'aluno'

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
    content = Column(String) # Texto rico / HTML longo
