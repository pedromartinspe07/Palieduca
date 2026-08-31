import os
import sys

# Garante import do backend
sys.path.append(os.path.abspath("backend"))

from fastapi.testclient import TestClient
from main import app
from database import get_db, Base, engine
import models
import auth

client = TestClient(app)

def test_comments_and_moderation():
    print("\n=== Iniciando Teste de Comentários de Aula & Bot de Moderação ===")

    # 1. Login / usuário de teste no banco
    db = next(get_db())
    test_user = db.query(models.User).filter(models.User.email == "aluno_mod@palieduca.org").first()
    if not test_user:
        test_user = models.User(
            nome="Aluno Teste Moderação",
            email="aluno_mod@palieduca.org",
            senha_hash=auth.get_password_hash("password123"),
            cargo="aluno",
            email_verified=True
        )
        db.add(test_user)
        db.commit()
        db.refresh(test_user)

    token = auth.create_access_token(data={"sub": test_user.email})

    headers = {"Authorization": f"Bearer {token}"}
    module_slug = "fundamentos"

    # 2. Testar postagem de pergunta válida
    print("\n1. Enviando dúvida acadêmica respeitosa...")
    valid_payload = {
        "content": "Professora Patrícia, na abordagem da dor total, como podemos integrar melhor a equipe de enfermagem com a psicologia no ambiente hospitalar?"
    }
    res_valid = client.post(f"/api/modules/{module_slug}/comments", json=valid_payload, headers=headers)
    assert res_valid.status_code == 200, f"Falha ao enviar comentário válido: {res_valid.text}"
    comment_data = res_valid.json()["comment"]
    comment_id = comment_data["id"]
    print(f"Sucesso: Dúvida publicada com ID {comment_id}!")

    # 3. Testar bloqueio de palavrão direto pelo Bot
    print("\n2. Testando bloqueio de mensagem com palavrão explícito...")
    profane_payload = {
        "content": "Essa aula é uma porra, que caralho de assunto chato."
    }
    res_profane = client.post(f"/api/modules/{module_slug}/comments", json=profane_payload, headers=headers)
    assert res_profane.status_code == 400, f"Deveria ter sido bloqueado com 400, recebeu: {res_profane.status_code}"
    print(f"Bloqueado com sucesso pelo Bot: {res_profane.json()['detail']}")

    # 4. Testar bloqueio de mensagem com ofuscação (Leetspeak: p0rr@, c@r@lh0)
    print("\n3. Testando bloqueio de mensagem com leetspeak camuflado (p0rr@)...")
    leet_payload = {
        "content": "Que m3rd@ de modulo, vai tomar no c.u e p0rr@"
    }
    res_leet = client.post(f"/api/modules/{module_slug}/comments", json=leet_payload, headers=headers)
    assert res_leet.status_code == 400, f"Deveria ter sido bloqueado pelo bot, recebeu: {res_leet.status_code}"
    print(f"Bloqueado com sucesso pelo Bot: {res_leet.json()['detail']}")

    # 5. Testar envio de resposta (reply)
    print("\n4. Testando envio de resposta aninhada (reply)...")
    reply_payload = {
        "content": "Excelente pergunta! Na prática, as reuniões de alinhamento interdisciplinar semanais fortalecem esse cuidado integral.",
        "parent_id": comment_id
    }
    res_reply = client.post(f"/api/modules/{module_slug}/comments", json=reply_payload, headers=headers)
    assert res_reply.status_code == 200, f"Falha ao enviar resposta: {res_reply.text}"
    print("Sucesso: Resposta aninhada publicada com sucesso!")

    # 6. Testar listagem de comentários do módulo
    print("\n5. Listando comentários do módulo...")
    res_list = client.get(f"/api/modules/{module_slug}/comments")
    assert res_list.status_code == 200
    comments_list = res_list.json()
    assert len(comments_list) > 0
    # Verifica se a resposta foi aninhada
    found = False
    for c in comments_list:
        if c["id"] == comment_id:
            assert len(c["replies"]) >= 1
            found = True
            break
    assert found, "Comentário pai não encontrado na listagem"
    print(f"Sucesso: {len(comments_list)} tópico(s) recuperado(s) com respostas aninhadas!")

    # 7. Testar botão de like
    print("\n6. Testando curtida (like) no comentário...")
    res_like = client.post(f"/api/comments/{comment_id}/like")
    assert res_like.status_code == 200
    assert res_like.json()["likes_count"] >= 1
    print(f"Sucesso: Like registrado! Total de curtidas: {res_like.json()['likes_count']}")

    # 8. Testar exclusão
    print("\n7. Testando exclusão do comentário pelo autor...")
    res_del = client.delete(f"/api/comments/{comment_id}", headers=headers)
    assert res_del.status_code == 200
    print("Sucesso: Comentário excluído com sucesso!")

    print("\n🎉 TODOS OS TESTES DE COMENTÁRIOS E BOT DE MODERAÇÃO PASSARAM COM 100% DE SUCESSO!")

if __name__ == "__main__":
    test_comments_and_moderation()
