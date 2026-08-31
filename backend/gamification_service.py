import re
from datetime import datetime
from typing import List, Dict, Any
from sqlalchemy.orm import Session
import models
import schemas

ALL_BADGES_CATALOG = [
    {
        "key": "first_step",
        "title": "Primeiro Passo",
        "description": "Concluiu sua primeira atividade na plataforma PaliEduca.",
        "icon": "Sparkles",
        "category": "milestone",
        "xp_points": 50
    },
    {
        "key": "compassionate_communicator",
        "title": "Comunicação Compassiva",
        "description": "Completou o módulo de Comunicação de Notícias Difíceis e Escuta Ativa.",
        "icon": "MessageSquareHeart",
        "category": "knowledge",
        "xp_points": 100
    },
    {
        "key": "symptom_master",
        "title": "Mestre em Controle de Sintomas",
        "description": "Dominou o módulo de Manejo da Dor e Controle de Sintomas.",
        "icon": "HeartPulse",
        "category": "knowledge",
        "xp_points": 150
    },
    {
        "key": "bioethics_champion",
        "title": "Defensor da Bioética",
        "description": "Completou o módulo de Bioética, Autonomia e Diretivas Antecipadas.",
        "icon": "Scale",
        "category": "knowledge",
        "xp_points": 100
    },
    {
        "key": "quiz_ace",
        "title": "Gabarito de Ouro",
        "description": "Respondeu questionários avaliativos com precisão.",
        "icon": "Target",
        "category": "achievement",
        "xp_points": 120
    },
    {
        "key": "marathoner",
        "title": "Maratonista Paliativo",
        "description": "Concluiu 3 ou mais atividades de estudo em um único dia.",
        "icon": "Zap",
        "category": "engagement",
        "xp_points": 100
    },
    {
        "key": "night_owl",
        "title": "Estudante Noturno",
        "description": "Dedicou-se aos cuidados paliativos durante o período noturno.",
        "icon": "Moon",
        "category": "engagement",
        "xp_points": 80
    },
    {
        "key": "pali_graduate",
        "title": "Especialista Formado UFPB",
        "description": "Concluiu 100% de todos os 6 módulos da formação oficial PaliEduca!",
        "icon": "GraduationCap",
        "category": "milestone",
        "xp_points": 300
    }
]

LEVELS = [
    {"level": 1, "title": "Iniciante em Cuidados Paliativos", "min_xp": 0, "next_xp": 150},
    {"level": 2, "title": "Estudante Compassivo", "min_xp": 150, "next_xp": 350},
    {"level": 3, "title": "Praticante Dedicado", "min_xp": 350, "next_xp": 650},
    {"level": 4, "title": "Paliativista Avançado", "min_xp": 650, "next_xp": 1000},
    {"level": 5, "title": "Mestre da Humanização UFPB", "min_xp": 1000, "next_xp": 1500}
]

def calculate_level(total_xp: int) -> tuple[int, str, int]:
    """Retorna (level_number, level_title, next_level_xp)"""
    current_level = 1
    level_title = LEVELS[0]["title"]
    next_xp = LEVELS[0]["next_xp"]

    for lvl in LEVELS:
        if total_xp >= lvl["min_xp"]:
            current_level = lvl["level"]
            level_title = lvl["title"]
            next_xp = lvl["next_xp"]

    return current_level, level_title, next_xp

def grant_badge_if_not_exists(user_id: int, badge_key: str, db: Session) -> bool:
    """Concede uma medalha ao usuário se ele ainda não a possui"""
    existing = db.query(models.UserBadge).filter(
        models.UserBadge.user_id == user_id,
        models.UserBadge.badge_key == badge_key
    ).first()

    if existing:
        return False

    badge_meta = next((b for b in ALL_BADGES_CATALOG if b["key"] == badge_key), None)
    if not badge_meta:
        return False

    new_badge = models.UserBadge(
        user_id=user_id,
        badge_key=badge_key,
        title=badge_meta["title"],
        description=badge_meta["description"],
        icon=badge_meta["icon"],
        category=badge_meta["category"],
        xp_points=badge_meta["xp_points"],
        unlocked_at=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    )
    db.add(new_badge)
    db.commit()
    return True

def evaluate_user_badges(user: models.User, db: Session) -> list[str]:
    """
    Avalia todo o progresso do usuário e concede automaticamente quaisquer medalhas elegíveis.
    Retorna lista das novas medalhas desbloqueadas.
    """
    newly_unlocked = []

    # 1. Total de atividades concluídas
    completed_activities = db.query(models.UserActivityProgress).filter(
        models.UserActivityProgress.user_id == user.id,
        models.UserActivityProgress.completed == True
    ).all()
    completed_count = len(completed_activities)

    # Regra: Primeiro Passo
    if completed_count >= 1:
        if grant_badge_if_not_exists(user.id, "first_step", db):
            newly_unlocked.append("first_step")

    # Regra: Módulos específicos
    modules_completed_slugs = set(a.module_slug for a in completed_activities if a.module_slug)
    
    if "comunicacao" in modules_completed_slugs or "modulo-2" in modules_completed_slugs:
        if grant_badge_if_not_exists(user.id, "compassionate_communicator", db):
            newly_unlocked.append("compassionate_communicator")

    if "sintomas" in modules_completed_slugs or "modulo-3" in modules_completed_slugs:
        if grant_badge_if_not_exists(user.id, "symptom_master", db):
            newly_unlocked.append("symptom_master")

    if "bioetica" in modules_completed_slugs or "modulo-6" in modules_completed_slugs:
        if grant_badge_if_not_exists(user.id, "bioethics_champion", db):
            newly_unlocked.append("bioethics_champion")

    # Regra: Gabarito de Ouro (respostas corretas de quiz)
    correct_answers = db.query(models.UserQuizAnswer).filter(
        models.UserQuizAnswer.user_id == user.id,
        models.UserQuizAnswer.is_correct == True
    ).count()
    if correct_answers >= 3:
        if grant_badge_if_not_exists(user.id, "quiz_ace", db):
            newly_unlocked.append("quiz_ace")

    # Regra: Maratonista (3 ou mais no mesmo dia)
    dates_grouped = {}
    for a in completed_activities:
        if a.completed_at:
            day = a.completed_at.split()[0]
            dates_grouped[day] = dates_grouped.get(day, 0) + 1
    if any(count >= 3 for count in dates_grouped.values()):
        if grant_badge_if_not_exists(user.id, "marathoner", db):
            newly_unlocked.append("marathoner")

    # Regra: Estudante Noturno (após as 20h)
    for a in completed_activities:
        if a.completed_at and len(a.completed_at.split()) > 1:
            try:
                hour = int(a.completed_at.split()[1].split(":")[0])
                if hour >= 20 or hour < 5:
                    if grant_badge_if_not_exists(user.id, "night_owl", db):
                        newly_unlocked.append("night_owl")
                    break
            except Exception:
                pass

    # Regra: Especialista Formado UFPB (100% de conclusão ou certificado emitido)
    if user.completion_email_sent or completed_count >= 12:
        if grant_badge_if_not_exists(user.id, "paligraduate", db) or grant_badge_if_not_exists(user.id, "pali_graduate", db):
            newly_unlocked.append("pali_graduate")

    return newly_unlocked

def get_user_gamification_profile(user: models.User, db: Session) -> schemas.UserGamificationProfileResponse:
    """Monta o perfil completo de gamificação do aluno"""
    # Avalia regras pendentes
    evaluate_user_badges(user, db)

    user_badges_db = db.query(models.UserBadge).filter(models.UserBadge.user_id == user.id).all()
    unlocked_keys = {b.badge_key: b.unlocked_at for b in user_badges_db}

    # Calcula XP de atividades (10 XP por atividade) + XP de medalhas
    completed_activities_count = db.query(models.UserActivityProgress).filter(
        models.UserActivityProgress.user_id == user.id,
        models.UserActivityProgress.completed == True
    ).count()

    badges_xp = sum(b.xp_points for b in user_badges_db)
    total_xp = (completed_activities_count * 10) + badges_xp

    current_level, level_title, next_level_xp = calculate_level(total_xp)

    badge_items = []
    for meta in ALL_BADGES_CATALOG:
        is_unlocked = meta["key"] in unlocked_keys
        badge_items.append(schemas.BadgeItemResponse(
            key=meta["key"],
            title=meta["title"],
            description=meta["description"],
            icon=meta["icon"],
            category=meta["category"],
            xp_points=meta["xp_points"],
            unlocked=is_unlocked,
            unlocked_at=unlocked_keys.get(meta["key"])
        ))

    pct = min(100, round((completed_activities_count / 12) * 100)) if completed_activities_count > 0 else 0

    return schemas.UserGamificationProfileResponse(
        total_xp=total_xp,
        current_level=current_level,
        level_title=level_title,
        next_level_xp=next_level_xp,
        badges_unlocked_count=len(user_badges_db),
        total_badges_count=len(ALL_BADGES_CATALOG),
        completion_percentage=pct,
        badges=badge_items
    )

def get_leaderboard(db: Session, current_user_id: int) -> list[schemas.LeaderboardItemResponse]:
    """Gera o ranking pedagógico geral da turma"""
    all_users = db.query(models.User).filter(models.User.cargo == "aluno").all()
    leaderboard = []

    for u in all_users:
        completed_count = db.query(models.UserActivityProgress).filter(
            models.UserActivityProgress.user_id == u.id,
            models.UserActivityProgress.completed == True
        ).count()
        
        badges = db.query(models.UserBadge).filter(models.UserBadge.user_id == u.id).all()
        xp = (completed_count * 10) + sum(b.xp_points for b in badges)
        _, title, _ = calculate_level(xp)

        leaderboard.append({
            "user_id": u.id,
            "nome": u.nome,
            "foto_url": u.foto_url,
            "total_xp": xp,
            "level_title": title,
            "badges_count": len(badges),
            "is_current_user": (u.id == current_user_id)
        })

    # Ordena por XP decrescente
    leaderboard.sort(key=lambda x: x["total_xp"], reverse=True)

    result = []
    for rank, item in enumerate(leaderboard[:15], start=1):
        result.append(schemas.LeaderboardItemResponse(
            rank=rank,
            user_id=item["user_id"],
            nome=item["nome"],
            foto_url=item["foto_url"],
            total_xp=item["total_xp"],
            level_title=item["level_title"],
            badges_count=item["badges_count"],
            is_current_user=item["is_current_user"]
        ))

    return result
