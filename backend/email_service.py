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
