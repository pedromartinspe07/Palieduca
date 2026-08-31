import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import random
from dotenv import load_dotenv

load_dotenv()

# Configurações do Zoho Mail SMTP
ZOHO_SMTP_HOST = os.getenv("ZOHO_SMTP_HOST", "smtppro.zoho.com") # ou smtp.zoho.com
ZOHO_SMTP_PORT = int(os.getenv("ZOHO_SMTP_PORT", "465")) # 465 SSL ou 587 TLS
ZOHO_EMAIL_USER = os.getenv("ZOHO_EMAIL_USER", "patriciaandrade@palieduca.com.br")
ZOHO_EMAIL_PASSWORD = os.getenv("ZOHO_EMAIL_PASSWORD", "")

def generate_verification_code() -> str:
    """Gera um código de 6 dígitos numéricos para verificação"""
    return str(random.randint(100000, 999999))

def send_verification_email(to_email: str, user_name: str, code: str) -> bool:
    """
    Envia email de confirmação com código de 6 dígitos usando o Zoho Mail SMTP.
    Se as credenciais não estiverem configuradas, loga o código para desenvolvimento local.
    """
    load_dotenv()
    smtp_host = os.getenv("ZOHO_SMTP_HOST", "smtppro.zoho.com")
    smtp_port = int(os.getenv("ZOHO_SMTP_PORT", "465"))
    email_user = os.getenv("ZOHO_EMAIL_USER", "patriciaandrade@palieduca.com.br")
    email_password = os.getenv("ZOHO_EMAIL_PASSWORD", "").strip()

    if not email_password:
        print(f"\n=======================================================")
        print(f"📧 [DEV MODE - ZOHO SMTP NÃO CONFIGURADO NO .ENV]")
        print(f"Para: {to_email} ({user_name})")
        print(f"Código de Verificação: {code}")
        print(f"Remetente: {email_user}")
        print(f"=======================================================\n")
        return True

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"{code} é o seu código de confirmação - Palieduca"
        msg["From"] = f"Palieduca <{email_user}>"
        msg["To"] = to_email

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{ font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #fcfbf9; margin: 0; padding: 20px; color: #2c2523; }}
                .card {{ max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #ede8e3; padding: 40px 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.04); text-align: center; }}
                .logo {{ font-size: 26px; font-weight: 800; color: #059669; margin-bottom: 24px; letter-spacing: -0.5px; }}
                h1 {{ font-size: 20px; font-weight: 700; color: #1c1917; margin-bottom: 12px; }}
                p {{ font-size: 14px; line-height: 1.6; color: #57534e; margin-bottom: 24px; }}
                .code-box {{ background: #ecfdf5; border: 2px dashed #059669; border-radius: 16px; padding: 18px 24px; display: inline-block; margin: 10px 0 24px; }}
                .code {{ font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #065f46; font-family: monospace; }}
                .footer {{ font-size: 12px; color: #a8a29e; margin-top: 30px; border-top: 1px solid #f5f5f4; pt: 20px; }}
            </style>
        </head>
        <body>
            <div class="card">
                <div class="logo">🌿 Palieduca</div>
                <h1>Olá, {user_name}!</h1>
                <p>Seja muito bem-vindo(a) à plataforma de Cuidados Paliativos. Use o código abaixo para ativar a sua conta:</p>
                <div class="code-box">
                    <div class="code">{code}</div>
                </div>
                <p style="font-size: 13px; color: #78716c;">Este código expira em 30 minutos. Se você não solicitou este cadastro, por favor desconsidere esta mensagem.</p>
                <div class="footer">
                    Enviado com carinho por <strong>Prof.ª Patrícia Andrade</strong><br>
                    {email_user} &bull; Palieduca
                </div>
            </div>
        </body>
        </html>
        """

        msg.attach(MIMEText(html_content, "html", "utf-8"))

        if smtp_port == 465:
            with smtplib.SMTP_SSL(smtp_host, smtp_port, timeout=10) as server:
                server.login(email_user, email_password)
                server.sendmail(email_user, [to_email], msg.as_string())
        else:
            with smtplib.SMTP(smtp_host, smtp_port, timeout=10) as server:
                server.starttls()
                server.login(email_user, email_password)
                server.sendmail(email_user, [to_email], msg.as_string())

        return True
    except Exception as e:
        print(f"❌ Erro ao enviar e-mail via Zoho SMTP: {e}")
        return False

def send_password_reset_email(to_email: str, user_name: str, code: str) -> bool:
    """
    Envia e-mail de recuperação de senha com código de 6 dígitos.
    """
    load_dotenv()
    smtp_host = os.getenv("ZOHO_SMTP_HOST", "smtppro.zoho.com")
    smtp_port = int(os.getenv("ZOHO_SMTP_PORT", "465"))
    email_user = os.getenv("ZOHO_EMAIL_USER", "patriciaandrade@palieduca.com.br")
    email_password = os.getenv("ZOHO_EMAIL_PASSWORD", "").strip()

    if not email_password:
        print(f"\n=======================================================")
        print(f"🔑 [DEV MODE - RECUPERAÇÃO DE SENHA]")
        print(f"Para: {to_email} ({user_name})")
        print(f"Código de Recuperação: {code}")
        print(f"Remetente: {email_user}")
        print(f"=======================================================\n")
        return True

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"{code} é o seu código para redefinir sua senha - Palieduca"
        msg["From"] = f"Palieduca <{email_user}>"
        msg["To"] = to_email

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{ font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #fcfbf9; margin: 0; padding: 20px; color: #2c2523; }}
                .card {{ max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #ede8e3; padding: 40px 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.04); text-align: center; }}
                .logo {{ font-size: 26px; font-weight: 800; color: #0284c7; margin-bottom: 24px; letter-spacing: -0.5px; }}
                h1 {{ font-size: 20px; font-weight: 700; color: #1c1917; margin-bottom: 12px; }}
                p {{ font-size: 14px; line-height: 1.6; color: #57534e; margin-bottom: 24px; }}
                .code-box {{ background: #f0f9ff; border: 2px dashed #0284c7; border-radius: 16px; padding: 18px 24px; display: inline-block; margin: 10px 0 24px; }}
                .code {{ font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #0369a1; font-family: monospace; }}
                .footer {{ font-size: 12px; color: #a8a29e; margin-top: 30px; border-top: 1px solid #f5f5f4; pt: 20px; }}
            </style>
        </head>
        <body>
            <div class="card">
                <div class="logo">🔑 Palieduca &bull; Segurança</div>
                <h1>Olá, {user_name}!</h1>
                <p>Recebemos uma solicitação para redefinir a senha da sua conta. Utilize o código de 6 dígitos abaixo:</p>
                <div class="code-box">
                    <div class="code">{code}</div>
                </div>
                <p style="font-size: 13px; color: #78716c;">Este código é confidencial e expira em 30 minutos. Se você não solicitou a troca de senha, pode ignorar esta mensagem com segurança.</p>
                <div class="footer">
                    Plataforma Acadêmica de Cuidados Paliativos &bull; <strong>UFPB</strong><br>
                    {email_user}
                </div>
            </div>
        </body>
        </html>
        """

        msg.attach(MIMEText(html_content, "html", "utf-8"))

        if smtp_port == 465:
            with smtplib.SMTP_SSL(smtp_host, smtp_port, timeout=10) as server:
                server.login(email_user, email_password)
                server.sendmail(email_user, [to_email], msg.as_string())
        else:
            with smtplib.SMTP(smtp_host, smtp_port, timeout=10) as server:
                server.starttls()
                server.login(email_user, email_password)
                server.sendmail(email_user, [to_email], msg.as_string())

        return True
    except Exception as e:
        print(f"❌ Erro ao enviar e-mail de redefinição de senha: {e}")
        return False

def send_contact_form_email(nome: str, email: str, categoria: str, assunto: str, mensagem: str) -> bool:
    """
    Despacha notificação de mensagem enviada através do formulário de contato do Palieduca/UFPB.
    """
    load_dotenv()
    smtp_host = os.getenv("ZOHO_SMTP_HOST", "smtppro.zoho.com")
    smtp_port = int(os.getenv("ZOHO_SMTP_PORT", "465"))
    email_user = os.getenv("ZOHO_EMAIL_USER", "patriciaandrade@palieduca.com.br")
    email_password = os.getenv("ZOHO_EMAIL_PASSWORD", "").strip()

    if not email_password:
        print(f"\n=======================================================")
        print(f"📨 [DEV MODE - FORMULÁRIO DE CONTATO PALIEDUCA]")
        print(f"De: {nome} <{email}>")
        print(f"Categoria: {categoria}")
        print(f"Assunto: {assunto}")
        print(f"Mensagem:\n{mensagem}")
        print(f"Para: {email_user}")
        print(f"=======================================================\n")
        return True

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"[{categoria}] {assunto} - Mensagem de {nome}"
        msg["From"] = f"Palieduca Contato <{email_user}>"
        msg["To"] = email_user
        msg["Reply-To"] = email

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{ font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #fcfbf9; margin: 0; padding: 20px; color: #2c2523; }}
                .card {{ max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #ede8e3; padding: 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.04); }}
                .badge {{ display: inline-block; padding: 6px 12px; border-radius: 20px; background: #e0f2fe; color: #0369a1; font-weight: 700; font-size: 11px; text-transform: uppercase; margin-bottom: 15px; }}
                h2 {{ font-size: 18px; font-weight: 700; color: #1c1917; margin-bottom: 8px; }}
                .info-box {{ background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 15px; margin: 15px 0; font-size: 13px; }}
                .message-box {{ background: #fafaf9; border-left: 4px solid #059669; padding: 15px 20px; border-radius: 0 12px 12px 0; font-size: 14px; line-height: 1.6; white-space: pre-wrap; }}
                .footer {{ font-size: 11px; color: #94a3b8; margin-top: 25px; border-top: 1px solid #f1f5f9; padding-top: 15px; }}
            </style>
        </head>
        <body>
            <div class="card">
                <span class="badge">{categoria}</span>
                <h2>Nova Mensagem Recebida via Palieduca</h2>
                <div class="info-box">
                    <strong>Remetente:</strong> {nome} (<a href="mailto:{email}">{email}</a>)<br>
                    <strong>Assunto:</strong> {assunto}
                </div>
                <p style="font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; margin-bottom: 6px;">Conteúdo da Mensagem:</p>
                <div class="message-box">
{mensagem}
                </div>
                <div class="footer">
                    Você pode responder diretamente a este e-mail para contatar {nome}.<br>
                    Palieduca &bull; Departamento de Enfermagem &bull; UFPB
                </div>
            </div>
        </body>
        </html>
        """

        msg.attach(MIMEText(html_content, "html", "utf-8"))

        if smtp_port == 465:
            with smtplib.SMTP_SSL(smtp_host, smtp_port, timeout=10) as server:
                server.login(email_user, email_password)
                server.sendmail(email_user, [email_user], msg.as_string())
        else:
            with smtplib.SMTP(smtp_host, smtp_port, timeout=10) as server:
                server.starttls()
                server.login(email_user, email_password)
                server.sendmail(email_user, [email_user], msg.as_string())

        return True
    except Exception as e:
        print(f"❌ Erro ao enviar notificação de contato via Zoho SMTP: {e}")
        return False

def send_completion_congratulations_email(to_email: str, user_name: str, certificate_code: str, verification_url: str) -> bool:
    """
    Envia e-mail comemorativo de 100% de conclusão de curso com o código do Certificado Oficial UFPB.
    """
    load_dotenv()
    smtp_host = os.getenv("ZOHO_SMTP_HOST", "smtppro.zoho.com")
    smtp_port = int(os.getenv("ZOHO_SMTP_PORT", "465"))
    email_user = os.getenv("ZOHO_EMAIL_USER", "patriciaandrade@palieduca.com.br")
    email_password = os.getenv("ZOHO_EMAIL_PASSWORD", "").strip()

    if not email_password:
        print(f"\n=======================================================")
        print(f"🎓 [DEV MODE - E-MAIL DE CONCLUSÃO & CERTIFICADO UFPB]")
        print(f"Para: {to_email} ({user_name})")
        print(f"Código do Certificado: {certificate_code}")
        print(f"Link de Validação: {verification_url}")
        print(f"Remetente: {email_user}")
        print(f"=======================================================\n")
        return True

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"Parabéns pela Conclusão do Curso de Cuidados Paliativos - Certificado UFPB ({certificate_code})"
        msg["From"] = email_user
        msg["To"] = to_email

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{ font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #fbf9f5; margin: 0; padding: 25px; color: #2c2523; }}
                .card {{ max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 24px; border: 1px solid #ede8e3; padding: 40px 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); text-align: center; }}
                .badge {{ display: inline-block; padding: 6px 14px; border-radius: 20px; background: #ecfdf5; color: #065f46; font-weight: 800; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 18px; border: 1px solid #a7f3d0; }}
                h1 {{ font-size: 22px; font-weight: 800; color: #1c1917; margin-bottom: 12px; line-height: 1.3; }}
                p {{ font-size: 14px; line-height: 1.6; color: #57534e; margin-bottom: 20px; }}
                .cert-box {{ background: #fafaf9; border: 2px solid #e7e5e4; border-radius: 18px; padding: 22px; text-align: left; margin: 24px 0; font-size: 13px; }}
                .cert-row {{ margin-bottom: 8px; color: #44403c; }}
                .cert-row strong {{ color: #1c1917; }}
                .code-highlight {{ font-family: monospace; font-size: 15px; font-weight: 800; color: #0f766e; background: #f0fdfa; padding: 3px 8px; border-radius: 6px; border: 1px solid #ccfbf1; }}
                .btn {{ display: inline-block; background: linear-gradient(135deg, #0f766e, #047857); color: #ffffff !important; text-decoration: none; font-weight: 700; font-size: 14px; padding: 14px 28px; border-radius: 14px; margin: 15px 0; box-shadow: 0 4px 12px rgba(15,118,110,0.25); }}
                .footer {{ font-size: 12px; color: #a8a29e; margin-top: 30px; border-top: 1px solid #f5f5f4; padding-top: 20px; line-height: 1.5; }}
            </style>
        </head>
        <body>
            <div class="card">
                <span class="badge">🎓 Conclusão de Curso &bull; UFPB</span>
                <h1>Parabéns, {user_name}!</h1>
                <p>
                    É com imensa alegria e orgulho que parabenizamos você pela conclusão de <strong>100% de todas as atividades e módulos</strong> do curso <em>Cuidados Paliativos em Enfermagem</em>.
                </p>
                
                <div class="cert-box">
                    <div class="cert-row"><strong>Estudante:</strong> {user_name}</div>
                    <div class="cert-row"><strong>Curso:</strong> Cuidados Paliativos em Enfermagem</div>
                    <div class="cert-row"><strong>Carga Horária:</strong> 40 Horas Complementares</div>
                    <div class="cert-row"><strong>Código de Autenticidade:</strong> <span class="code-highlight">{certificate_code}</span></div>
                    <div class="cert-row"><strong>Instituição:</strong> Universidade Federal da Paraíba (UFPB)</div>
                    <div class="cert-row"><strong>Coordenação Docente:</strong> Prof.ª Dra. Patrícia Maria de Oliveira Andrade</div>
                </div>

                <a href="{verification_url}" class="btn" target="_blank">
                    🏅 Visualizar &amp; Validar Certificado Oficial
                </a>

                <p style="font-size: 12px; color: #78716c; margin-top: 15px;">
                    Você pode incluir este certificado no seu Currículo Lattes, LinkedIn ou apresentar na faculdade/hospital utilizando o código de validação acima.
                </p>

                <div class="footer">
                    Com votos de muito sucesso na sua trajetória de enfermagem humanizada,<br>
                    <strong>Prof.ª Dra. Patrícia Maria de Oliveira Andrade</strong><br>
                    Departamento de Enfermagem &bull; UFPB &bull; Palieduca
                </div>
            </div>
        </body>
        </html>
        """

        msg.attach(MIMEText(html_content, "html", "utf-8"))

        if smtp_port == 465:
            with smtplib.SMTP_SSL(smtp_host, smtp_port, timeout=10) as server:
                server.login(email_user, email_password)
                server.sendmail(email_user, [to_email], msg.as_string())
        else:
            with smtplib.SMTP(smtp_host, smtp_port, timeout=10) as server:
                server.starttls()
                server.login(email_user, email_password)
                server.sendmail(email_user, [to_email], msg.as_string())

        return True
    except Exception as e:
        print(f"❌ Erro ao enviar e-mail de conclusão via Zoho SMTP: {e}")
        return False



