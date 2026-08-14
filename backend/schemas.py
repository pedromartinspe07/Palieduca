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
