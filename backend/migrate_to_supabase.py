"""
Script de Migração: SQLite Local (palieduca.db) -> PostgreSQL (Supabase / Produção)
Palieduca (UFPB)

Como usar:
1. Para migrar apontando para o Supabase:
   python migrate_to_supabase.py --target "postgresql://postgres.[REF]:[SENHA]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres"

   Ou simplesmente defina DATABASE_URL no backend/.env e execute:
   python migrate_to_supabase.py
"""

import sys
import os
import argparse
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Carrega variáveis do .env
load_dotenv()

import models

TABLES_TO_MIGRATE = [
    (models.User, "users", "email"),
    (models.Module, "modules", "slug_id"),
    (models.PageContent, "page_content", "page_name"),
    (models.PageRevision, "page_revisions", None),
    (models.MediaFile, "media_files", "filename"),
    (models.InteractiveResource, "interactive_resources", None),
    (models.UserActivityProgress, "user_activity_progress", None),
    (models.GuestActivityProgress, "guest_activity_progress", None),
    (models.GuestQuizAnswer, "guest_quiz_answers", None),
    (models.UserQuizAnswer, "user_quiz_answers", None),
    (models.ModuleComment, "module_comments", None),
]

def migrate(source_url: str, target_url: str):
    print("=" * 60)
    print("🚀 INICIANDO MIGRAÇÃO DO PALIEDUCA PARA O SUPABASE / POSTGRESQL")
    print("=" * 60)
    print(f"Origem  (SQLite):     {source_url}")
    print(f"Destino (PostgreSQL): {target_url.split('@')[-1] if '@' in target_url else target_url}")
    print("-" * 60)

    # Conexão de Origem
    src_engine = create_engine(source_url, connect_args={"check_same_thread": False})
    SrcSession = sessionmaker(bind=src_engine)
    src_db = SrcSession()

    # Conexão de Destino
    if target_url.startswith("postgres://"):
        target_url = target_url.replace("postgres://", "postgresql://", 1)

    tgt_engine = create_engine(target_url, pool_pre_ping=True)
    
    # 1. Cria todas as tabelas no destino se não existirem
    print("📦 1. Criando tabelas e schema no banco de dados de destino...")
    models.Base.metadata.create_all(bind=tgt_engine)
    print("✅ Schema criado com sucesso no Supabase!")

    TgtSession = sessionmaker(bind=tgt_engine)
    tgt_db = TgtSession()

    total_migrated = 0

    try:
        # 2. Migra cada tabela sequencialmente
        for model_class, table_name, unique_key in TABLES_TO_MIGRATE:
            print(f"\n⏳ Migrando tabela '{table_name}'...")
            src_records = src_db.query(model_class).all()
            print(f"   Encontrados {len(src_records)} registros no SQLite.")

            migrated_count = 0
            for record in src_records:
                # Converte o registro em dicionário de atributos
                data = {
                    c.name: getattr(record, c.name)
                    for c in record.__table__.columns
                }

                # Se houver chave única, verifica se já existe para evitar duplicatas
                if unique_key and data.get(unique_key):
                    existing = tgt_db.query(model_class).filter(
                        getattr(model_class, unique_key) == data[unique_key]
                    ).first()
                    if existing:
                        continue

                new_record = model_class(**data)
                tgt_db.merge(new_record)
                migrated_count += 1

            tgt_db.commit()
            print(f"   ✅ {migrated_count} registros gravados com sucesso na tabela '{table_name}'.")
            total_migrated += migrated_count

        print("\n" + "=" * 60)
        print(f"🎉 MIGRAÇÃO CONCLUÍDA COM SUCESSO! Total de {total_migrated} registros transferidos.")
        print("=" * 60)

    except Exception as e:
        tgt_db.rollback()
        print(f"\n❌ ERRO durante a migração: {e}")
        raise
    finally:
        src_db.close()
        tgt_db.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Migrador SQLite -> PostgreSQL Supabase")
    parser.add_argument("--source", default="sqlite:///./palieduca.db", help="URL do SQLite de origem")
    parser.add_argument("--target", default=os.getenv("DATABASE_URL"), help="URL de conexão do PostgreSQL de destino")

    args = parser.parse_args()

    target = args.target
    if not target or target.startswith("sqlite"):
        # Se não informou target específico, verifica variáveis do Supabase
        project_ref = os.getenv("SUPABASE_PROJECT_REF", "juhkoctyrmezvqnqugjd")
        print("ℹ️ DICA: Para conectar diretamente ao Supabase, use a string de conexão do painel do Supabase:")
        print(f"   postgresql://postgres:[SUA_SENHA]@db.{project_ref}.supabase.co:5432/postgres")
        print("\n   Exemplo:")
        print(f"   python migrate_to_supabase.py --target 'postgresql://postgres:SENHA@db.{project_ref}.supabase.co:5432/postgres'")
        sys.exit(0)

    migrate(args.source, target)
