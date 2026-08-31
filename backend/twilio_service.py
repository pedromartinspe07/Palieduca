import os
import re
import httpx
from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session
import models

# ─── Configurações do Twilio ───
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_API_KEY_SID = os.getenv("TWILIO_API_KEY_SID")
TWILIO_API_KEY_SECRET = os.getenv("TWILIO_API_KEY_SECRET")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_WHATSAPP_FROM = os.getenv("TWILIO_WHATSAPP_FROM", "whatsapp:+14155238886")

def format_whatsapp_number(phone: str) -> str:
    """Formata número de telefone brasileiro ou internacional para padrão E.164 do WhatsApp"""
    clean_digits = re.sub(r'\D', '', phone)
    if not clean_digits:
        return ""
    
    # Se não tiver DDI (ex: 83999998888 ou 11999998888), adiciona 55 (Brasil)
    if len(clean_digits) in [10, 11]:
        clean_digits = f"55{clean_digits}"
    
    return f"whatsapp:+{clean_digits}"

def send_whatsapp_message(
    to_phone: str,
    message_text: str,
    title: Optional[str] = "Notificação PaliEduca",
    user_id: Optional[int] = None,
    db: Optional[Session] = None
) -> dict:
    """
    Envia mensagem de WhatsApp via Twilio REST API e registra log no banco de dados.
    """
    formatted_to = format_whatsapp_number(to_phone)
    if not formatted_to:
        return {"status": "error", "detail": "Número de telefone inválido"}

    now_iso = datetime.now().isoformat()
    status = "sent"
    detail = "Enviado com sucesso via Twilio"

    try:
        # Se as credenciais estiverem configuradas, faz o disparo HTTP real
        account_sid = TWILIO_ACCOUNT_SID
        auth_user = TWILIO_API_KEY_SID or account_sid
        auth_pass = TWILIO_API_KEY_SECRET or TWILIO_AUTH_TOKEN

        if account_sid and auth_pass:
            url = f"https://api.twilio.com/2010-04-01/Accounts/{account_sid}/Messages.json"
            
            data = {
                "From": TWILIO_WHATSAPP_FROM,
                "To": formatted_to,
                "Body": message_text
            }
            
            response = httpx.post(
                url,
                data=data,
                auth=(auth_user, auth_pass),
                timeout=10.0
            )

            if response.status_code not in [200, 201]:
                print(f"[Twilio Error] {response.status_code}: {response.text}")
                status = "simulated"
                detail = f"Twilio API Respondeu ({response.status_code}): Mensagem registrada em modo de homologação."
            else:
                detail = "Mensagem WhatsApp entregue à fila do Twilio."
        else:
            status = "simulated"
            detail = "Credenciais Twilio ausentes. Mensagem registrada em simulação."

    except Exception as err:
        print(f"[Twilio Exception] {err}")
        status = "simulated"
        detail = f"Disparo registrado (Fallback seguro): {str(err)}"

    # Salva log no banco de dados se a sessão DB foi fornecida
    if db:
        try:
            log_entry = models.NotificationLog(
                user_id=user_id,
                type="whatsapp",
                recipient=to_phone,
                title=title,
                content=message_text,
                status=status,
                sent_at=now_iso
            )
            db.add(log_entry)
            db.commit()
        except Exception as db_err:
            print(f"[Log Error] Falha ao registrar log de notificação: {db_err}")

    return {
        "status": status,
        "recipient": to_phone,
        "formatted_to": formatted_to,
        "detail": detail,
        "sent_at": now_iso
    }

# ─── Modelos de Mensagens Pedagógicas Prontas ───

def notify_module_completed(user: models.User, module_title: str, next_module_title: Optional[str], db: Session):
    """Dispara mensagem de celebração ao concluir um módulo"""
    if not user.telefone or not user.whatsapp_notifications_enabled:
        return None

    first_name = user.nome.split()[0] if user.nome else "Aluno(a)"
    
    msg = (
        f"🎉 *Parabéns, {first_name}!* 👏\n\n"
        f"Você concluiu com sucesso o *{module_title}* na plataforma *PaliEduca*!\n\n"
    )
    if next_module_title:
        msg += f"👉 Seu próximo passo na trilha é: *{next_module_title}*.\n"
    
    msg += "\nContinue avançando rumo ao seu Certificado Oficial da UFPB! 🦋\n🔗 Acesse: https://palieduca.onrender.com/modulos"

    return send_whatsapp_message(
        to_phone=user.telefone,
        message_text=msg,
        title=f"Módulo Concluído: {module_title}",
        user_id=user.id,
        db=db
    )

def notify_certificate_unlocked(user: models.User, certificate_code: str, verification_url: str, db: Session):
    """Dispara WhatsApp com o certificado oficial emitido"""
    if not user.telefone or not user.whatsapp_notifications_enabled:
        return None

    first_name = user.nome.split()[0] if user.nome else "Aluno(a)"
    
    msg = (
        f"🎓 *EXTRAORDINÁRIO, {first_name}! VOCÊ SE FORMOU!* 🌟\n\n"
        f"Você concluiu todos os 6 módulos do Curso de Extensão em *Cuidados Paliativos* da UFPB!\n\n"
        f"📜 *Código do Certificado:* `{certificate_code}`\n"
        f"🔗 *Validar e Baixar seu Certificado Oficial:* {verification_url}\n\n"
        f"A Prof.ª Patrícia e toda a equipe PaliEduca parabenizam você por essa conquista admirável na saúde humanizada! 💖"
    )

    return send_whatsapp_message(
        to_phone=user.telefone,
        message_text=msg,
        title="Certificado Oficial Disponível",
        user_id=user.id,
        db=db
    )

def notify_inactive_student(user: models.User, days_inactive: int, progress_pct: int, db: Session):
    """Dispara lembrete amigável de reengajamento"""
    if not user.telefone or not user.whatsapp_notifications_enabled:
        return None

    first_name = user.nome.split()[0] if user.nome else "Aluno(a)"
    
    msg = (
        f"👋 *Olá, {first_name}! Sentimos sua falta na PaliEduca.*\n\n"
        f"Você já completou *{progress_pct}%* da sua jornada em Cuidados Paliativos.\n"
        f"Que tal reservar 15 minutos hoje para avançar mais um passo?\n\n"
        f"🦋 Seus pacientes e sua equipe contam com esse aprendizado humanizado.\n"
        f"🔗 Continuar agora: https://palieduca.onrender.com/modulos"
    )

    return send_whatsapp_message(
        to_phone=user.telefone,
        message_text=msg,
        title=f"Lembrete de Reengajamento ({days_inactive} dias)",
        user_id=user.id,
        db=db
    )

# ─── BOT AUTOMÁTICO DE NOVIDADES & TUTOR INTELIGENTE WHATSAPP ───

def get_ai_tutor_response(user_query: str) -> str:
    """Gera resposta empática e fundamentada usando o modelo de IA do Groq"""
    groq_api_key = os.getenv("GROQ_API_KEY")
    if not groq_api_key:
        return "Desculpe, o serviço de IA está temporariamente indisponível. Tente novamente mais tarde."

    system_prompt = (
        "Você é a Professora Patrícia, tutora virtual e especialista em Cuidados Paliativos da UFPB "
        "na plataforma PaliEduca. Responda DIRETAMENTE ao aluno de forma empática, acolhedora, concisa e cientificamente fundamentada "
        "em português do Brasil. Como é no WhatsApp, use formatação clara com negritos (*) e emojis leves."
    )

    try:
        res = httpx.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {groq_api_key}"
            },
            json={
                "model": "openai/gpt-oss-20b",
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_query}
                ],
                "temperature": 0.6,
                "max_tokens": 500
            },
            timeout=15.0
        )
        if res.status_code == 200:
            data = res.json()
            raw_text = data["choices"][0]["message"]["content"]
            # Limpa eventuais tags <think>...</think> do modelo
            cleaned_text = re.sub(r'<think>.*?</think>', '', raw_text, flags=re.DOTALL).strip()
            return cleaned_text or raw_text
        else:
            return "Desculpe, não consegui processar sua dúvida no momento. Acesse a plataforma: https://palieduca.onrender.com"
    except Exception as e:
        print(f"[AI Tutor Error]: {e}")
        return "Olá! Para tirar dúvidas aprofundadas, você também pode acessar nosso chat interativo na plataforma: https://palieduca.onrender.com"

def handle_incoming_whatsapp_message(
    from_phone: str,
    incoming_text: str,
    db: Session
) -> str:
    """
    Processa mensagens recebidas no WhatsApp e responde automaticamente de acordo com o comando:
    - novidades: lista os módulos e aulas publicados
    - progresso: busca o avanço do aluno pelo telefone
    - certificado: verifica se o certificado está disponível
    - menu / ajuda / oi: exibe menu interativo
    - pergunta livre: responde via Tutor IA PaliEduca
    """
    text_clean = incoming_text.strip().lower()
    clean_digits = re.sub(r'\D', '', from_phone)

    # 1. Comando: Novidades / Aulas
    if any(cmd in text_clean for cmd in ["novidade", "novidades", "aula", "aulas", "modulo", "modulos", "1"]):
        modules = db.query(models.Module).order_by(models.Module.id.asc()).all()
        response_msg = "🦋 *AULAS & NOVIDADES PALIEDUCA* 🦋\n\nConfira os módulos disponíveis na plataforma oficial:\n\n"
        for i, m in enumerate(modules, start=1):
            response_msg += f"📌 *Módulo {i}: {m.title}*\n_{m.description[:90]}..._\n\n"
        
        response_msg += "🔗 *Acesse a Trilha Completa:* https://palieduca.onrender.com/modulos\n\n_Envie *Progresso* para ver seu avanço ou faça uma pergunta sobre cuidados paliativos!_"
        return response_msg

    # 2. Comando: Progresso
    if any(cmd in text_clean for cmd in ["progresso", "meu curso", "minha conta", "status", "2"]):
        # Busca usuário com telefone similar
        student = None
        all_users = db.query(models.User).all()
        for u in all_users:
            if u.telefone:
                u_digits = re.sub(r'\D', '', u.telefone)
                if u_digits and (clean_digits.endswith(u_digits) or u_digits.endswith(clean_digits[-8:])):
                    student = u
                    break

        if student:
            total_completed = db.query(models.UserActivityProgress).filter(
                models.UserActivityProgress.user_id == student.id,
                models.UserActivityProgress.completed == True
            ).count()
            
            first_name = student.nome.split()[0]
            pct = min(100, round((total_completed / 12) * 100)) if total_completed > 0 else 0
            
            response_msg = (
                f"📊 *SEU PROGRESSO NA PALIEDUCA*\n\n"
                f"Olá, *{first_name}*! 👋\n"
                f"📈 Conclusão Geral: *{pct}%*\n"
                f"✅ Atividades Concluídas: *{total_completed}*\n"
                f"🏆 Pontuação: *{total_completed * 10} pontos*\n\n"
            )
            if pct >= 100:
                response_msg += "🎓 *Parabéns! Seu Certificado Oficial da UFPB está liberado!* Envie *Certificado* para obter o link.\n"
            else:
                response_msg += "👉 Continue estudando para desbloquear seu Certificado Oficial da UFPB!\n🔗 https://palieduca.onrender.com/modulos"
            return response_msg
        else:
            return (
                "📱 Não encontrei uma conta vinculada a este número de WhatsApp.\n\n"
                "Para vincular seu WhatsApp:\n"
                "1. Acesse seu perfil: https://palieduca.onrender.com/perfil\n"
                "2. Salve seu número no card *WhatsApp & Notificações*.\n"
                "Depois envie *Progresso* novamente!"
            )

    # 3. Comando: Certificado
    if any(cmd in text_clean for cmd in ["certificado", "diploma", "declaracao", "3"]):
        student = None
        for u in db.query(models.User).all():
            if u.telefone:
                u_digits = re.sub(r'\D', '', u.telefone)
                if u_digits and (clean_digits.endswith(u_digits) or u_digits.endswith(clean_digits[-8:])):
                    student = u
                    break

        if student and (student.completion_email_sent or student.cargo in ['dona', 'desenvolvedor', 'professor']):
            year = datetime.now().year
            cert_code = f"PALI-{student.id:04d}-{year}-UFPB"
            return (
                f"🎓 *CERTIFICADO OFICIAL DISPONÍVEL* 📜\n\n"
                f"Aluno(a): *{student.nome}*\n"
                f"Código Autenticador: `{cert_code}`\n\n"
                f"🔗 *Validar e Baixar PDF:* https://palieduca.com.br/validar/{cert_code}\n\n"
                f"Parabéns por essa grande conquista na sua carreira profissional! 🦋"
            )
        else:
            return (
                "📜 Para emitir seu Certificado Oficial da UFPB, você precisa concluir 100% dos 6 módulos e seus questionários avaliativos.\n\n"
                "🔗 Acesse suas aulas: https://palieduca.onrender.com/modulos"
            )

    # 4. Comando: Menu / Ajuda / Oi
    if any(cmd in text_clean for cmd in ["oi", "ola", "olá", "menu", "ajuda", "help", "inicio", "início"]):
        return (
            "🦋 *BEM-VINDO(A) AO PALIEDUCA BOT (UFPB)* 🦋\n\n"
            "Eu sou o assistente virtual oficial de Cuidados Paliativos. Digite uma das opções abaixo:\n\n"
            "1️⃣ *Novidades* - Ver módulos e aulas disponíveis\n"
            "2️⃣ *Progresso* - Consultar seu avanço e pontuação\n"
            "3️⃣ *Certificado* - Verificar status do seu certificado\n\n"
            "💡 _Ou faça qualquer pergunta sobre controle de dor, comunicação difícil ou cuidados paliativos para tirar dúvidas pedagógicas comigo!_"
        )

    # 5. Dúvida livre -> Responde com IA da Prof.ª Patrícia
    ai_reply = get_ai_tutor_response(incoming_text)
    return (
        f"👩‍🏫 *Prof.ª Patrícia (Tutor IA):*\n\n{ai_reply}\n\n"
        f"🔗 _Aprofunde seus estudos na plataforma:_ https://palieduca.onrender.com"
    )

