import sys
import os
import uuid

# Adiciona o diretório backend ao sys.path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "backend"))

from fastapi.testclient import TestClient
from database import SessionLocal
import models
from main import app

def test_password_recovery_flow():
    print("=== Iniciando Teste do Fluxo de Recuperação de Senha ===")
    client = TestClient(app)

    # 1. Criar um usuário de teste
    test_email = f"aluno_recuperacao_{uuid.uuid4().hex[:6]}@palieduca.org"
    initial_pwd = "SenhaInicial123@"
    new_pwd = "NovaSenhaForte456@"

    print(f"\n1. Registrando aluno de teste ({test_email})...")
    reg_res = client.post(
        "/api/auth/register",
        json={
            "nome": "Aluno Recuperação",
            "email": test_email,
            "senha": initial_pwd
        }
    )
    assert reg_res.status_code == 200, f"Falha no registro: {reg_res.text}"
    print("Aluno registrado com sucesso!")

    # 2. Solicitar código de recuperação de senha
    print("\n2. Solicitando código de recuperação de senha (/api/auth/forgot-password)...")
    forgot_res = client.post(
        "/api/auth/forgot-password",
        json={"email": test_email}
    )
    assert forgot_res.status_code == 200, f"Falha ao solicitar recuperação: {forgot_res.text}"
    print("Solicitação enviada com sucesso!")

    # 3. Recuperar o código gerado no banco de dados
    db = SessionLocal()
    user_db = db.query(models.User).filter(models.User.email == test_email).first()
    assert user_db is not None, "Usuário não encontrado no banco!"
    code = user_db.reset_password_code
    assert code is not None and len(code) == 6, f"Código inválido no banco: {code}"
    db.close()
    print(f"Código de recuperação gerado no banco: {code}")

    # 4. Tentar redefinir senha com código ERRADO
    print("\n4. Testando tentativa de redefinição com código incorreto (999999)...")
    wrong_res = client.post(
        "/api/auth/reset-password",
        json={
            "email": test_email,
            "code": "999999",
            "new_password": new_pwd
        }
    )
    assert wrong_res.status_code == 400, "Deveria ter retornado erro 400 para código incorreto!"
    print("Tentativa com código incorreto bloqueada com sucesso!")

    # 5. Redefinir senha com o código CORRETO
    print("\n5. Redefinindo senha com o código correto (/api/auth/reset-password)...")
    reset_res = client.post(
        "/api/auth/reset-password",
        json={
            "email": test_email,
            "code": code,
            "new_password": new_pwd
        }
    )
    assert reset_res.status_code == 200, f"Falha ao redefinir senha: {reset_res.text}"
    reset_data = reset_res.json()
    assert "access_token" in reset_data, "Token de acesso não retornado após redefinição!"
    print("Senha redefinida com sucesso e token JWT recebido!")

    # 6. Testar login com a NOVA SENHA
    print("\n6. Testando login tradicional (/api/auth/login) com a NOVA SENHA...")
    login_res = client.post(
        "/api/auth/login",
        data={
            "username": test_email,
            "password": new_pwd
        }
    )
    assert login_res.status_code == 200, f"Falha ao fazer login com nova senha: {login_res.text}"
    login_data = login_res.json()
    assert "access_token" in login_data
    print("Login com a nova senha autenticado com sucesso!")

    # 7. Confirmar que a senha ANTIGA não funciona mais
    print("\n7. Confirmando que a senha antiga é rejeitada...")
    old_login_res = client.post(
        "/api/auth/login",
        data={
            "username": test_email,
            "password": initial_pwd
        }
    )
    assert old_login_res.status_code == 401, "Senha antiga não deveria ter sido aceita!"
    print("Senha antiga devidamente invalidada!")

    print("\n🎉 TODOS OS TESTES DE RECUPERAÇÃO DE SENHA PASSARAM COM SUCESSO!")

if __name__ == "__main__":
    test_password_recovery_flow()
