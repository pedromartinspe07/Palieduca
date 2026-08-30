import sys
import os
import uuid

# Adiciona o diretório backend ao sys.path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "backend"))

from fastapi.testclient import TestClient
from database import SessionLocal
import models
from main import app

def test_guest_flow():
    print("=== Iniciando Teste de Fluxo Completo de Visitante com TestClient ===")
    client = TestClient(app)
    guest_id = f"test_guest_{uuid.uuid4().hex[:8]}"
    
    # 1. Health check
    print("\n1. Verificando API...")
    res = client.get("/api/health")
    assert res.status_code == 200, f"Health falhou: {res.text}"
    print("API Online!")

    # 2. Consultar progresso inicial como visitante
    print(f"\n2. Consultando progresso de visitante (guest_id: {guest_id})...")
    prog_res = client.get(f"/api/guest/progress?guest_id={guest_id}")
    assert prog_res.status_code == 200, f"Falha ao buscar progresso de visitante: {prog_res.text}"
    prog_data = prog_res.json()
    print(f"Progresso inicial de visitante: {prog_data['completed_activities']} ({prog_data['overall_percentage']}%)")

    # 3. Alternar atividade como visitante (marcar atividade concluída)
    print("\n3. Marcando atividade como concluída para o visitante...")
    toggle_res = client.post(
        "/api/guest/progress/toggle",
        json={
            "guest_id": guest_id,
            "module_slug": "fundamentos",
            "activity_id": "block-test-fundamentos-1",
            "completed": True
        }
    )
    assert toggle_res.status_code == 200, f"Falha ao marcar atividade: {toggle_res.text}"
    print("Atividade marcada com sucesso pelo visitante!")

    # 4. Verificar se progresso do visitante foi persistido
    print("\n4. Verificando persistência do progresso do visitante...")
    prog_res2 = client.get(f"/api/guest/progress?guest_id={guest_id}")
    assert prog_res2.status_code == 200
    prog_data2 = prog_res2.json()
    assert "block-test-fundamentos-1" in prog_data2["completed_activities"], "Atividade não foi encontrada no progresso do visitante!"
    print(f"Progresso atualizado do visitante: {prog_data2['completed_activities']}")

    # 5. Salvar resposta de quiz como visitante
    print("\n5. Enviando resposta de quiz como visitante...")
    quiz_res = client.post(
        "/api/guest/quiz/answer",
        json={
            "guest_id": guest_id,
            "module_slug": "fundamentos",
            "block_id": "block-quiz-1",
            "question_index": 0,
            "selected_option": 1,
            "is_correct": True
        }
    )
    assert quiz_res.status_code == 200, f"Falha ao salvar quiz: {quiz_res.text}"
    print("Resposta de quiz do visitante salva com sucesso!")

    # 6. Consultar respostas do quiz do visitante
    print("\n6. Consultando respostas de quiz do visitante...")
    get_quiz_res = client.get(f"/api/guest/quiz/answers?guest_id={guest_id}&block_id=block-quiz-1")
    assert get_quiz_res.status_code == 200
    quiz_answers = get_quiz_res.json()
    assert len(quiz_answers) > 0, "Nenhuma resposta de quiz encontrada!"
    assert quiz_answers[0]["selected_option"] == 1
    print(f"Respostas do visitante recuperadas com sucesso: {quiz_answers}")

    # 7. Criar uma nova conta de aluno e sincronizar os dados do visitante
    print("\n7. Registrando novo aluno para sincronização de visitante...")
    unique_email = f"aluno_visitante_{uuid.uuid4().hex[:6]}@palieduca.org"
    reg_res = client.post(
        "/api/auth/register",
        json={
            "nome": "Aluno Teste Visitante",
            "email": unique_email,
            "senha": "SenhaForte123@"
        }
    )
    assert reg_res.status_code == 200, f"Falha no registro: {reg_res.text}"
    
    # Recupera o código de verificação do banco para simular a confirmação de e-mail
    db = SessionLocal()
    user_in_db = db.query(models.User).filter(models.User.email == unique_email).first()
    assert user_in_db is not None
    verif_code = user_in_db.verification_code
    db.close()

    verify_res = client.post(
        "/api/auth/verify-email",
        json={
            "email": unique_email,
            "code": verif_code
        }
    )
    assert verify_res.status_code == 200, f"Falha na verificação de e-mail: {verify_res.text}"
    token = verify_res.json()["access_token"]
    print(f"Aluno registrado e autenticado com sucesso! E-mail: {unique_email}")

    # 8. Sincronizar progresso do visitante com a conta autenticada
    print("\n8. Sincronizando dados acumulados pelo visitante com a conta de aluno (/api/progress/sync-guest)...")
    sync_res = client.post(
        "/api/progress/sync-guest",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "guest_id": guest_id,
            "completed_activities": ["block-test-fundamentos-1"],
            "quiz_answers": [
                {
                    "block_id": "block-quiz-1",
                    "question_index": 0,
                    "selected_option": 1,
                    "is_correct": True
                }
            ]
        }
    )
    assert sync_res.status_code == 200, f"Falha na sincronização: {sync_res.text}"
    sync_data = sync_res.json()
    print(f"Sincronização concluída: {sync_data}")

    # 9. Verificar se o aluno logado agora tem as atividades e respostas
    print("\n9. Verificando progresso formal do aluno logado...")
    user_prog_res = client.get("/api/progress", headers={"Authorization": f"Bearer {token}"})
    assert user_prog_res.status_code == 200
    user_prog = user_prog_res.json()
    assert "block-test-fundamentos-1" in user_prog["completed_activities"], "Atividade do visitante não foi migrada para o aluno!"
    print(f"Progresso do aluno sincronizado: {user_prog['completed_activities']}")

    user_quiz_res = client.get("/api/quiz/answers?block_id=block-quiz-1", headers={"Authorization": f"Bearer {token}"})
    assert user_quiz_res.status_code == 200
    user_quizzes = user_quiz_res.json()
    assert len(user_quizzes) > 0, "Respostas de quiz não foram migradas para o aluno!"
    print(f"Respostas de quiz do aluno sincronizadas: {user_quizzes}")

    print("\n🎉 TODOS OS TESTES DO MODO VISITANTE PASSARAM COM SUCESSO!")

if __name__ == "__main__":
    test_guest_flow()
