import sys
import os

# Adiciona o diretório backend ao sys.path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "backend"))

from fastapi.testclient import TestClient
from main import app

def test_contact_form():
    print("=== Iniciando Teste do Formulário de Contato Institucional ===")
    client = TestClient(app)

    # 1. Enviar mensagem válida
    print("\n1. Enviando mensagem válida através do formulário (/api/contact)...")
    res = client.post(
        "/api/contact",
        json={
            "nome": "Enfermeira Juliana Santos",
            "email": "juliana.santos@hospital.ufpb.br",
            "categoria": "Dúvidas Acadêmicas",
            "assunto": "Dúvida sobre escala Edmonton ESAS no Módulo 3",
            "mensagem": "Olá Prof.ª Patrícia, gostaria de tirar uma dúvida sobre a periodicidade recomendada para reaplicação da escala ESAS no ambiente de internação hospitalar."
        }
    )
    assert res.status_code == 200, f"Falha no envio de contato: {res.text}"
    data = res.json()
    assert data["success"] is True
    print(f"Mensagem enviada com sucesso: {data['message']}")

    # 2. Testar rejeição de mensagem excessivamente curta (< 10 caracteres)
    print("\n2. Testando rejeição de mensagem com menos de 10 caracteres...")
    res_short = client.post(
        "/api/contact",
        json={
            "nome": "Aluno Teste",
            "email": "aluno@palieduca.org",
            "categoria": "Suporte Técnico",
            "assunto": "Ajuda",
            "mensagem": "Ola"
        }
    )
    assert res_short.status_code == 400, "Deveria ter rejeitado mensagem com menos de 10 caracteres!"
    print("Mensagem curta bloqueada corretamente com status 400!")

    # 3. Testar rejeição de e-mail com formato inválido
    print("\n3. Testando validação de e-mail inválido...")
    res_invalid_email = client.post(
        "/api/contact",
        json={
            "nome": "Aluno Teste",
            "email": "email_invalido_sem_arroba",
            "categoria": "Dúvidas",
            "assunto": "Teste de Email",
            "mensagem": "Esta é uma mensagem com tamanho suficiente para passar na validação de tamanho."
        }
    )
    assert res_invalid_email.status_code == 422, "Deveria ter rejeitado email inválido com status 422!"
    print("Email inválido bloqueado com sucesso (status 422)!")

    print("\n🎉 TODOS OS TESTES DO FORMULÁRIO DE CONTATO PASSARAM COM SUCESSO!")

if __name__ == "__main__":
    test_contact_form()
