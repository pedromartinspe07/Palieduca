import os
from database import SessionLocal, engine
import models
from auth import get_password_hash

def seed_users():
    db = SessionLocal()
    try:
        # 1. Garante que se o email oficial da Patrícia existir, o cargo seja "dona"
        patricia = db.query(models.User).filter(models.User.email == "patriciaandrade@palieduca.com.br").first()
        if patricia and patricia.cargo != "dona":
            patricia.cargo = "dona"
            patricia.email_verified = True
            db.commit()
            print("Cargo da Dona Patrícia atualizado para 'dona'.")

        # Verifica se já existem usuários no banco de dados
        if db.query(models.User).count() > 0:
            print("Usuários já foram criados no banco de dados.")
            return
            
        initial_pwd = os.getenv("INITIAL_ADMIN_PASSWORD", "palieduca_admin_init")

        usuarios_iniciais = [
            {
                "nome": "Prof.ª Patrícia Maria de Oliveira Andrade",
                "email": "patriciaandrade@palieduca.com.br",
                "senha": initial_pwd,
                "cargo": "dona"
            },
            {
                "nome": "Pedro Martins",
                "email": "pedro@palieduca.com.br",
                "senha": initial_pwd,
                "cargo": "desenvolvedor"
            },
            {
                "nome": "Carlos Eduardo",
                "email": "eduardo@palieduca.com.br",
                "senha": initial_pwd,
                "cargo": "desenvolvedor"
            }
        ]
        
        for u in usuarios_iniciais:
            novo_user = models.User(
                nome=u["nome"],
                email=u["email"],
                senha_hash=get_password_hash(u["senha"]),
                cargo=u["cargo"],
                email_verified=True,
                auth_provider="local"
            )
            db.add(novo_user)
            
        db.commit()
        print("Usuários iniciais (Patricia, Pedro e Eduardo) criados com sucesso!")
    finally:
        db.close()

def seed_modules():
    db = SessionLocal()
    try:
        if db.query(models.Module).count() > 0:
            print("Módulos já foram criados no banco de dados.")
            return
            
        # Dados extraídos do antigo siteContent.tsx
        modulos = [
            {"slug_id": "fundamentos", "title": "Módulo 1 - Fundamentos", "description": "Conceitos, História, Princípios, Elegibilidade, Mitos e verdades sobre os cuidados paliativos.", "icon_name": "Stethoscope", "progress": 100, "resources": "Vídeo, Infográfico, Quiz", "image_url": "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800", "delay": 1},
            {"slug_id": "comunicacao", "title": "Módulo 2 - Comunicação", "description": "Comunicação terapêutica, Escuta ativa, Notícias difíceis e Relação com a família do paciente.", "icon_name": "Users", "progress": 35, "resources": "Simulações, Casos, Feedback", "image_url": "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=800", "delay": 2},
            {"slug_id": "sintomas", "title": "Módulo 3 - Controle de Sintomas", "description": "Manejo da Dor, Dispneia, Náuseas, Delirium, Fadiga e outras complicações.", "icon_name": "HeartPulse", "progress": 0, "resources": "Fluxogramas, Flashcards", "image_url": "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800", "delay": 3},
            {"slug_id": "cuidados-enfermagem", "title": "Módulo 4 - Cuidados de Enfermagem", "description": "Processo de Enfermagem, Diagnósticos, Intervenções e Planejamento.", "icon_name": "Brain", "progress": 0, "resources": "Casos Clínicos, Simulações", "image_url": "https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&q=80&w=800", "delay": 4},
            {"slug_id": "familia-cuidador", "title": "Módulo 5 - Família e Cuidador", "description": "Sobrecarga, Apoio familiar, Educação em saúde e o Luto antecipatório.", "icon_name": "HeartHandshake", "progress": 0, "resources": "Podcasts, Vídeos", "image_url": "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&q=80&w=800", "delay": 5},
            {"slug_id": "bioetica", "title": "Módulo 6 - Bioética", "description": "Autonomia, Beneficência, Não maleficência, Justiça e Diretivas antecipadas.", "icon_name": "Scale", "progress": 0, "resources": "Casos Éticos, Reflexões", "image_url": "https://unifor.br/documents/392178/0/Banner-Desktop-Cuidados-Paliativos.png/8b1e42fd-2446-fdaf-cfca-566210970750?t=1722532725751", "delay": 6}
        ]
        
        for m in modulos:
            novo_modulo = models.Module(**m)
            db.add(novo_modulo)
            
        db.commit()
        print("Módulos iniciais criados com sucesso!")
    finally:
        db.close()

def seed_pages():
    db = SessionLocal()
    try:
        if db.query(models.PageContent).count() > 0:
            print("Páginas já foram criadas no banco de dados.")
            return
            
        paginas = [
            {"page_name": "modulos", "content": "<h1>Trilha de Aprendizagem</h1><p>Esta é a área dedicada aos módulos do Palieduca.</p>"},
            {"page_name": "biblioteca", "content": "<h1>Acervo Biblioteca</h1><p>Aqui ficarão armazenados os artigos científicos e referências importantes.</p>"},
            {"page_name": "glossario", "content": "<h1>Glossário Técnico</h1><p>Consulte aqui os termos técnicos mais utilizados em Cuidados Paliativos.</p>"}
        ]
        
        for p in paginas:
            nova_pagina = models.PageContent(**p)
            db.add(nova_pagina)
            
        db.commit()
        print("Páginas iniciais criadas com sucesso!")
    finally:
        db.close()

if __name__ == "__main__":
    seed_users()
    seed_modules()
    seed_pages()
