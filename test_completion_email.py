import os
import sys

sys.path.append(os.path.abspath("backend"))

from fastapi.testclient import TestClient
from main import app
from database import get_db
import models
import auth

client = TestClient(app)

def test_completion_email_flow():
    print("\n=== Iniciando Teste do Envio de E-mail de Conclusão do Curso & Certificado ===")

    db = next(get_db())

    # 1. Garante um aluno de teste
    test_user = db.query(models.User).filter(models.User.email == "aluno_conclusao@palieduca.org").first()
    if not test_user:
        test_user = models.User(
            nome="Mariana Albuquerque",
            email="aluno_conclusao@palieduca.org",
            senha_hash=auth.get_password_hash("senha123"),
            cargo="aluno",
            email_verified=True,
            completion_email_sent=False
        )
        db.add(test_user)
        db.commit()
        db.refresh(test_user)
    else:
        test_user.completion_email_sent = False
        db.commit()

    token = auth.create_access_token(data={"sub": test_user.email})
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Testa requisição antes de concluir 100% (deve dar erro 400)
    print("\n1. Testando solicitação de certificado antes de concluir o curso...")
    # Limpa progressos anteriores se houver
    db.query(models.UserActivityProgress).filter(models.UserActivityProgress.user_id == test_user.id).delete()
    db.commit()

    res_early = client.post("/api/progress/send-certificate-email", headers=headers)
    assert res_early.status_code == 400, f"Deveria bloquear com 400 antes de 100%: {res_early.text}"
    print("Sucesso: Bloqueado corretamente antes de atingir 100% de conclusão!")

    # 3. Completa todas as atividades para o aluno de teste
    print("\n2. Simulando conclusão de todas as atividades do curso...")
    modules = db.query(models.Module).all()
    for m in modules:
        act = models.UserActivityProgress(
            user_id=test_user.id,
            module_slug=m.slug_id,
            activity_id=f"{m.slug_id}_intro",
            completed=True,
            completed_at="2026-08-30 19:00:00"
        )
        db.add(act)
    db.commit()

    # 4. Testa disparo automático ou manual do e-mail de certificado
    print("\n3. Solicitando envio do e-mail comemorativo (/api/progress/send-certificate-email)...")
    res_email = client.post("/api/progress/send-certificate-email", headers=headers)
    assert res_email.status_code == 200, f"Falha ao enviar e-mail: {res_email.text}"
    data = res_email.json()
    assert data["success"] is True
    assert "PALI-" in data["certificate_code"]
    print(f"Sucesso: E-mail comemorativo disparado com código {data['certificate_code']}!")

    # 5. Verifica se a flag completion_email_sent foi marcada como True no banco
    db.refresh(test_user)
    assert test_user.completion_email_sent is True
    print("Sucesso: Flag de envio do certificado registrada no banco de dados!")

    print("\n🎉 TODOS OS TESTES DE E-MAIL DE CONCLUSÃO PASSARAM COM 100% DE SUCESSO!")

if __name__ == "__main__":
    test_completion_email_flow()
