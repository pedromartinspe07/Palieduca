from pydantic import BaseModel, EmailStr
from typing import Optional

class UserBase(BaseModel):
    email: EmailStr
    nome: str
    cargo: Optional[str] = "aluno"

class UserCreate(UserBase):
    senha: str

class UserLogin(BaseModel):
    email: EmailStr
    senha: str

class UserResponse(UserBase):
    id: int

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

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

class PageContentUpdate(BaseModel):
    content: str

class PageContentResponse(PageContentBase):
    id: int

    class Config:
        from_attributes = True
